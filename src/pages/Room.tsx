import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Volume2, 
  MessageSquare, 
  Users, 
  Settings,
  Crown,
  Shield,
  UserX,
  Send,
  Phone,
  PhoneOff
} from "lucide-react";
import { socketService } from "@/services/socket.service";
import type { Room as RoomType } from "@/interfaces/room.interface";
import type { Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";
import { MessagePayload, ParticipantUpdatePayload } from "@/interfaces/room-events.interface";

// Define JoinRoomResponse type if not already imported
interface JoinRoomResponse {
  success: boolean;
  room: {
    id: string;
    name: string;
    description: string;
    host: string;
    participants: ServerParticipant[];
  };
}

interface Participant {
  id: string;
  username: string;
  isHost: boolean;
  avatar?: string;
  isModerator?: boolean;
  isMuted?: boolean;
  hasVideo?: boolean;
  volume?: number;
  isOnStage?: boolean;
  stream?: MediaStream;
}

// Helper to ensure default values for Participant
export const getParticipantWithDefaults = (p: Partial<Participant>): Participant => ({
  id: p.id ?? '',
  username: p.username ?? '',
  isHost: p.isHost ?? false,
  avatar: p.avatar ?? '👤',
  isModerator: p.isModerator ?? false,
  isMuted: p.isMuted ?? true,
  hasVideo: p.hasVideo ?? false,
  volume: p.volume ?? 100,
  isOnStage: p.isOnStage ?? false,
  stream: p.stream,
});

interface Message {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

interface MediaDeviceError extends Error {
  name: 'NotFoundError' | 'NotAllowedError' | 'NotReadableError' | 'OverconstrainedError' | string;
}

interface ServerParticipant {
  id: string;
  username: string;
  isHost: boolean;
}

// (Removed erroneous top-level socket.on handler. All socket event handlers are registered inside the Room component.)

const Room = () => {
  // Helper function to deduplicate participants
  const deduplicateParticipants = (participants: Participant[]): Participant[] => {
    const seen = new Set<string>();
    return participants.filter(p => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  };

  const { roomId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId] = useState(crypto.randomUUID());
  const [username] = useState(localStorage.getItem('username') || '');
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Record<string, RTCPeerConnection>>({});
  const mediaSetupAttempted = useRef(false);

  // Add effect to monitor participants
  useEffect(() => {
    if (participants.length > 1) { // More than just the current user
      const otherParticipants = participants.filter(p => p.id !== userId);
      console.log('Current participants in room (excluding self):', 
        otherParticipants.map(p => ({
          id: p.id,
          name: p.username,
          isMuted: p.isMuted,
          hasVideo: p.hasVideo
        }))
      );
    }
  }, [participants, userId]);

  // Add debug effect to monitor participants state
  useEffect(() => {
    console.log('Current participants:', participants.map(p => ({
      id: p.id,
      name: p.username,
      isMuted: p.isMuted,
      hasVideo: p.hasVideo,
      isCurrentUser: p.id === userId
    })));
  }, [participants, userId]);

  // Add monitoring for participant state changes
  useEffect(() => {
    console.log('Participants state updated - Full data:', JSON.stringify(participants, null, 2));
    console.log('Participants summary:', participants.map(p => ({
      id: p.id,
      name: p.username,
      isMuted: p.isMuted,
      hasVideo: p.hasVideo,
      isCurrentUser: p.id === userId,
      isOnStage: p.isOnStage,
      stream: p.stream ? 'Has stream' : 'No stream'
    })));
  }, [participants, userId]);

  const createPeerConnection = useCallback((peerId: string) => {
    if (!peerId) {
      console.error('Cannot create peer connection: Invalid peer ID');
      return null;
    }

    try {
      console.log(`Creating peer connection for peer: ${peerId}`);
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ]
      });

      // Add local tracks to the connection
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          if (localStreamRef.current) {
            console.log(`Adding ${track.kind} track to peer connection`);
            peerConnection.addTrack(track, localStreamRef.current);
          }
        });
      }

      // ICE candidate handling
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          console.log(`Sending ICE candidate for peer: ${peerId}`);
          socket?.emit('iceCandidate', {
            candidate: event.candidate,
            peerId
          });
        }
      };

      // Remote track handling with error checking
      peerConnection.ontrack = event => {
        console.log(`Received remote track from peer: ${peerId}`);
        const [stream] = event.streams;
        if (stream) {
          setParticipants(prev => prev.map(p => 
            p.id === peerId ? { ...p, stream } : p
          ));
        }
      };

      // Connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log(`Peer connection state changed to: ${peerConnection.connectionState}`);
        if (peerConnection.connectionState === 'failed') {
          console.log(`Peer connection failed for peer: ${peerId}`);
          toast({
            title: "Connection Issue",
            description: "Lost connection to a participant. Attempting to reconnect...",
            variant: "destructive"
          });
          // Cleanup failed connection
          peerConnection.close();
          delete peerConnectionsRef.current[peerId];
          // Could trigger a reconnection here if desired
        }
      };

      peerConnectionsRef.current[peerId] = peerConnection;
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      toast({
        title: "Connection Error",
        description: "Failed to establish peer connection. Please try reconnecting.",
        variant: "destructive"
      });
      return null;
    }
  }, [socket, toast]);

  const cleanupMediaDevices = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    Object.values(peerConnectionsRef.current).forEach(pc => pc.close());
    peerConnectionsRef.current = {};
    setIsConnected(false);
  }, []);

  const setupMediaDevices = useCallback(async () => {
    if (mediaSetupAttempted.current) return;
    mediaSetupAttempted.current = true;

    try {
      console.log('Starting media device setup');
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudioDevice = devices.some(device => device.kind === 'audioinput');
      const hasVideoDevice = devices.some(device => device.kind === 'videoinput');

      console.log('Available devices:', {
        audio: hasAudioDevice,
        video: hasVideoDevice
      });

      if (!hasAudioDevice && !hasVideoDevice) {
        throw new Error('No media devices found');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: hasAudioDevice ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : false,
        video: hasVideoDevice ? {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        } : false
      });
      
      localStreamRef.current = stream;
      
      // Initialize tracks with default states
      if (hasAudioDevice) {
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = !isMuted;
          console.log('Audio track initialized:', {
            enabled: audioTrack.enabled,
            label: audioTrack.label
          });
        }
      }

      if (hasVideoDevice) {
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false; // Always start with video off
          setHasVideo(false);
          console.log('Video track initialized:', {
            enabled: videoTrack.enabled,
            label: videoTrack.label
          });
        }
      }

      setIsConnected(true);
      console.log('Media devices setup completed successfully');

    } catch (error) {
      const mediaError = error as MediaDeviceError;
      console.error('Media device setup error:', {
        name: mediaError.name,
        message: mediaError.message
      });
      
      let errorMessage = "Unable to access media devices";
      let actionNeeded = "";

      switch (mediaError.name) {
        case "NotFoundError":
          errorMessage = "No camera or microphone found";
          actionNeeded = "You can still join without devices";
          break;
        case "NotAllowedError":
          errorMessage = "Media access denied";
          actionNeeded = "Please grant permission to use your camera/microphone";
          break;
        case "NotReadableError":
          errorMessage = "Media device is in use by another application";
          actionNeeded = "Please close other apps using your camera/microphone";
          break;
        case "OverconstrainedError":
          errorMessage = "Media device constraints not satisfied";
          actionNeeded = "Trying with different device settings";
          break;
      }
      
      toast({
        title: "Media Device Notice",
        description: `${errorMessage}. ${actionNeeded}`,
        variant: "default"
      });
      
      // Allow joining with fallback options
      setIsConnected(true);
      setIsMuted(true);
      setHasVideo(false);
    }
  }, [toast, isMuted]);

  // Effect to handle peer connections
  useEffect(() => {
    if (!isConnected || !localStreamRef.current) return;
    console.log('------------------------')
    // Setup peer connections for existing participants
    participants.forEach(participant => {
      if (participant.id !== userId && !peerConnectionsRef.current[participant.id]) {
        createPeerConnection(participant.id);
      }
    });
  }, [isConnected, participants, userId, createPeerConnection]);

  // Ref to track if the page is refreshing
  const isPageRefreshing = useRef(false);

  // Main effect for room initialization
  useEffect(() => {
    if (!roomId || !username) {
      console.error('Missing required room parameters');
      navigate('/');
      return;
    }

    console.log('Initializing room:', { roomId, username });
    console.log('--------------------------------------');
    
    const socket = socketService.getSocket();
    setSocket(socket);

    // Add current user to participants
    const currentUser = {
      id: userId,
      username: username,
      avatar: '👤',
      isHost: false,
      isModerator: false,
      isMuted: true,
      hasVideo: false,
      volume: 100
    };

    // Join room and request existing participants
    socket.emit('joinRoom', {
      roomId,
      username,
      userId
    }, (response: JoinRoomResponse) => {
      console.log('Raw join room response:', JSON.stringify(response, null, 2));

      const participantMap = new Map<string, Participant>();

      // Add current user first
      participantMap.set(userId, {
        id: userId,
        username: username,
        isHost: false,
        avatar: '👤',
        isModerator: false,
        isMuted: true,
        hasVideo: false,
        volume: 100
      });

      // Process participants array from server - now checking room.participants
      if (response?.room?.participants && Array.isArray(response.room.participants)) {
        console.log('Processing server participants:', response.room.participants);
        
        // Use Set to track unique IDs
        const uniqueIds = new Set<string>();
        
        response.room.participants.forEach((p: ServerParticipant) => {
          // Only add if we haven't seen this ID before and it's not the current user
          if (p.id && !uniqueIds.has(p.id) && p.id !== userId) {
            uniqueIds.add(p.id);
            participantMap.set(p.id, {
              id: p.id,
              username: p.username,
              isHost: p.isHost,
              avatar: '👤',
              isModerator: false,
              isMuted: true,
              hasVideo: false,
              volume: 100
            });
          }
        });

        console.log('Participant map after processing:', 
          Array.from(participantMap.values()));
      } else {
        console.log('No room.participants array in response:', response);
      }

      // Convert to array with current user first
      const currentUser = participantMap.get(userId);
      const others = Array.from(participantMap.values()).filter(p => p.id !== userId);
      const participantsList = currentUser ? [currentUser, ...others] : others;

      console.log('Final participants list:', participantsList);
      setParticipants(participantsList);
    });

    // Handle new participant joining
    socket.on('participantJoined', (data: { participant: ServerParticipant, participants: ServerParticipant[] }) => {
      console.log('New participant joined - Raw data:', data);
      
      setParticipants(prev => {
        const participantMap = new Map(prev.map(p => [p.id, p]));
        
        // Add new participant with only the fields server provides
        if (data.participant?.id && !participantMap.has(data.participant.id)) {
          participantMap.set(data.participant.id, {
            id: data.participant.id,
            username: data.participant.username,
            isHost: data.participant.isHost,
            // Set default values for required UI fields
            avatar: '👤',
            isModerator: false,
            isMuted: true,
            hasVideo: false,
            volume: 100
          });
        }

        // Update participant list with only fields server provides
        if (data.participants?.length > 0) {
          data.participants.forEach(p => {
            if (p.id && !participantMap.has(p.id)) {
              participantMap.set(p.id, {
                id: p.id,
                username: p.username,
                isHost: p.isHost,
                // Set default values for required UI fields
                avatar: '👤',
                isModerator: false,
                isMuted: true,
                hasVideo: false,
                volume: 100
              });
            }
          });
        }

        const values = Array.from(participantMap.values());
        const currentUser = values.find(p => p.id === userId);
        const others = values.filter(p => p.id !== userId);

        return currentUser ? [currentUser, ...others] : others;
      });

      // Show toast with username
      toast({
        title: "New Participant",
        description: `${data.participant.username} joined the room`,
      });
    });

    // Handle participant leaving
    socket.on('participantLeft', (participantId: string) => {
      console.log('Participant leaving:', participantId);
      
      // Remove from participants list
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      
      // Cleanup peer connection
      const peerConnection = peerConnectionsRef.current[participantId];
      if (peerConnection) {
        console.log('Cleaning up peer connection for:', participantId);
        peerConnection.close();
        delete peerConnectionsRef.current[participantId];
      }
    });

    // Handle participant updates
    socket.on('participantUpdate', (update: ParticipantUpdatePayload) => {
      console.log('Received participant update - Raw data:', JSON.stringify(update, null, 2));
      setParticipants(prev => {
        console.log('Current participants before update:', JSON.stringify(prev, null, 2));
        const updated = prev.map(p => {
          if (p.id === update.userId) {
            const updatedParticipant = {
              ...p,
              ...update.updates,
              name: update.username
            };
            console.log('Updated participant:', JSON.stringify(updatedParticipant, null, 2));
            return updatedParticipant;
          }
          return p;
        });
        console.log('Updated participants list:', JSON.stringify(updated, null, 2));
        return updated;
      });
    });

    // Handle messages
    socket.on('message', (message: MessagePayload) => {
      setMessages(prev => [...prev, {
        id: message.id,
        userId: message.userId,
        username: message.username,
        content: message.content,
        timestamp: new Date(message.timestamp)
      }]);
    });

    // Handle connection errors
    socket.on('connect_error', (error: Error) => {
      console.error('Socket connection error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to the room. Attempting to reconnect...",
        variant: "destructive"
      });
    });

    // Initialize WebRTC
    setupMediaDevices().catch((error) => {
      // You can handle the error here if needed
      console.error('Error setting up media devices:', error);
    });

    // Add this function to handle refresh detection
    window.addEventListener('beforeunload', () => {
      isPageRefreshing.current = true;
    });
    window.addEventListener('beforeunload', () => {
      isPageRefreshing.current = true;
    });

    // Cleanup function
    return () => {
      if (!isPageRefreshing.current) {
        // Only emit leaveRoom if not refreshing
        socket.emit('leaveRoom', { roomId });
      }
      
      cleanupMediaDevices();
      mediaSetupAttempted.current = false;
      
      // Cleanup socket listeners
      socket.off('participantJoined');
      socket.off('participantLeft');
      socket.off('participantUpdate');
      socket.off('message');
      socket.off('connect_error');
    };
  }, [roomId, userId, username, navigate, cleanupMediaDevices, setupMediaDevices, toast]);

  // Add this effect to handle reconnection after refresh
  useEffect(() => {
    if (socket && roomId) {
      // Request current room state
      socket.emit('getRoomState', { roomId }, ( response: { participants: ServerParticipant[] }) => {
        console.log('Room state after refresh:', response);
        
        if (response?.participants) {
          const participantMap = new Map<string, Participant>();
          
          // Add current user first
          participantMap.set(userId, {
            id: userId,
            username: username,
            isHost: false,
            avatar: '👤',
            isModerator: false,
            isMuted: true,
            hasVideo: false,
            volume: 100
          });
          
          // Add all other participants
          response.participants.forEach(p => {
            if (p.id && !participantMap.has(p.id)) {
              participantMap.set(p.id, {
                id: p.id,
                username: p.username,
                isHost: p.isHost,
                avatar: '👤',
                isModerator: false,
                isMuted: true,
                hasVideo: false,
                volume: 100
              });
            }
          });
          
          setParticipants(Array.from(participantMap.values()));
        }
      });
    }
  }, [socket, roomId, userId, username]);

  const sendMessage = () => {
    if (!socket || !roomId) {
      toast({
        title: "Connection Error",
        description: "Not connected to room. Please try reconnecting.",
        variant: "destructive"
      });
      return;
    }

    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage) {
      return;
    }

    try {
      const messagePayload: MessagePayload = {
        id: crypto.randomUUID(),
        roomId,
        userId,
        username,
        content: trimmedMessage,
        timestamp: new Date()
      };

      socket.emit('message', messagePayload, (error: Error | null) => {
        if (error) {
          console.error('Failed to send message:', error);
          toast({
            title: "Message Error",
            description: "Failed to send message. Please try again.",
            variant: "destructive"
          });
          return;
        }
        setNewMessage("");
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Message Error",
        description: "An error occurred while sending your message.",
        variant: "destructive"
      });
    }
  };

  const toggleMute = useCallback(() => {
    if (!localStreamRef.current) {
      console.warn('No local stream available');
      return;
    }

    try {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (!audioTrack) {
        console.warn('No audio track available');
        return;
      }

      const newMutedState = !audioTrack.enabled;
      audioTrack.enabled = !newMutedState;
      setIsMuted(newMutedState);
      
      // Update our local participant state first
      setParticipants(prev => prev.map(p => 
        p.id === userId
          ? { ...p, isMuted: newMutedState }
          : p
      ));
      
      // Then emit the update to others
      socket?.emit('participantUpdate', {
        roomId,
        userId,
        username,
        updates: { isMuted: newMutedState }
      });

      console.log('Audio track state updated:', {
        enabled: audioTrack.enabled,
        label: audioTrack.label
      });
    } catch (error) {
      console.error('Error toggling mute:', error);
      toast({
        title: "Audio Error",
        description: "Failed to update audio state. Please try again.",
        variant: "destructive"
      });
    }
  }, [roomId, socket, toast, userId, username]);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) {
      console.warn('No local stream available');
      return;
    }

    try {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (!videoTrack) {
        console.warn('No video track available');
        return;
      }

      videoTrack.enabled = !videoTrack.enabled;
      setHasVideo(videoTrack.enabled);
      
      socket?.emit('participantUpdate', {
        roomId,
        userId,
        username,
        updates: { hasVideo: videoTrack.enabled }
      });

      console.log('Video track state updated:', {
        enabled: videoTrack.enabled,
        label: videoTrack.label
      });
    } catch (error) {
      console.error('Error toggling video:', error);
      toast({
        title: "Video Error",
        description: "Failed to update video state. Please try again.",
        variant: "destructive"
      });
    }
  }, [roomId, socket, toast, userId, username]);

  const toggleConnection = useCallback(() => {
    if (isConnected) {
      cleanupMediaDevices();
      setIsConnected(false);
      toast({
        title: "Disconnected",
        description: "Media devices have been turned off",
      });
    } else {
      setupMediaDevices()
        .then(() => {
          setIsConnected(true);
          toast({
            title: "Connected",
            description: "Media devices are now active",
          });
        })
        .catch(error => {
          console.error('Failed to setup media devices:', error);
          toast({
            title: "Connection Error",
            description: "Failed to initialize media devices. Please check your settings.",
            variant: "destructive"
          });
        });
    }
  }, [isConnected, cleanupMediaDevices, setupMediaDevices, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="pt-20 p-4 h-screen flex flex-col">
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Main Video Area */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Room Header */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-white">Tech Talk Tuesday</h1>
                    <p className="text-white/70">Weekly discussion about technology and programming</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                      Live
                    </Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                      <Users className="w-3 h-3 mr-1" />
                      {participants.length}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Video Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              {participants.map((participant) => (
                <Card 
                  key={participant.id} 
                  className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl relative overflow-hidden group"
                >
                  <CardContent className="p-0 aspect-video relative">
                    {participant.hasVideo ? (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                        <div className="text-6xl">{participant.avatar}</div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-slate-800/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">{participant.avatar}</div>
                          <VideoOff className="w-8 h-8 text-white/50 mx-auto" />
                        </div>
                      </div>
                    )}
                    
                    {/* Participant Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-medium">{participant.username}</span>
                          {participant.isHost && <Crown className="w-4 h-4 text-yellow-400" />}
                          {participant.isModerator && <Shield className="w-4 h-4 text-blue-400" />}
                          {participant.isOnStage && (
                            <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                              On Stage
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {participant.isMuted ? (
                            <MicOff className="w-4 h-4 text-red-400" />
                          ) : (
                            <Mic className="w-4 h-4 text-green-400" />
                          )}
                          {!participant.hasVideo && <VideoOff className="w-4 h-4 text-white/50" />}
                        </div>
                      </div>
                    </div>

                    {/* Controls for other participants (visible on hover) */}
                    {participant.id !== userId && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex gap-1">
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm border-white/30">
                            <Volume2 className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/20 backdrop-blur-sm border-white/30">
                            <UserX className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Control Bar */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-4">
                  <Button
                    onClick={toggleMute}
                    className={`h-12 w-12 rounded-full ${
                      isMuted 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>
                  
                  <Button
                    onClick={toggleVideo}
                    className={`h-12 w-12 rounded-full ${
                      hasVideo 
                        ? 'bg-blue-500 hover:bg-blue-600' 
                        : 'bg-gray-500 hover:bg-gray-600'
                    }`}
                  >
                    {hasVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={toggleConnection}
                    className={`h-12 w-12 rounded-full ${
                      isConnected 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-green-500 hover:bg-green-600'
                    }`}
                  >
                    {isConnected ? <PhoneOff className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </Button>

                  <Button
                    onClick={() => setShowChat(!showChat)}
                    variant="secondary"
                    className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border-white/30"
                  >
                    <MessageSquare className="w-5 h-5" />
                  </Button>

                  <Button
                    variant="secondary"
                    className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm border-white/30"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className={`lg:col-span-1 ${showChat ? 'block' : 'hidden lg:block'}`}>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl h-full flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                {/* Chat Header */}
                <div className="p-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-white font-semibold">Chat</h3>
                    <Button
                      onClick={() => setShowChat(false)}
                      variant="ghost"
                      size="sm"
                      className="lg:hidden text-white"
                    >
                      ×
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">
                          {message.username}
                        </span>
                        <span className="text-xs text-white/50">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm text-white/80">{message.content}</p>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-white/20">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                      rows={2}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <Button 
                      onClick={sendMessage}
                      className="bg-blue-500 hover:bg-blue-600 self-end"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
