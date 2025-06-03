import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Navbar } from "@/components/Navbar";
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
import type { Socket } from "socket.io-client";
import { useToast } from "@/components/ui/use-toast";
import { generateRandomName } from "@/lib/utils";
import { MessagePayload, ParticipantUpdatePayload } from "@/interfaces/room-events.interface";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  isModerator: boolean;
  isMuted: boolean;
  hasVideo: boolean;
  volume: number;
  isOnStage?: boolean;
  stream?: MediaStream;
}

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

const Room = () => {
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
  const [userName] = useState(generateRandomName());
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
          name: p.name,
          isMuted: p.isMuted,
          hasVideo: p.hasVideo
        }))
      );
    }
  }, [participants, userId]);

  const createPeerConnection = useCallback((peerId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    });

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          peerConnection.addTrack(track, localStreamRef.current);
        }
      });
    }

    peerConnection.onicecandidate = event => {
      if (event.candidate) {
        socket?.emit('iceCandidate', {
          candidate: event.candidate,
          peerId
        });
      }
    };

    peerConnection.ontrack = event => {
      const [stream] = event.streams;
      setParticipants(prev => prev.map(p => 
        p.id === peerId
          ? { ...p, stream }
          : p
      ));
    };

    peerConnectionsRef.current[peerId] = peerConnection;
    return peerConnection;
  }, [socket]);

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
      // First check if media devices are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasAudio = devices.some(device => device.kind === 'audioinput');
      const hasVideo = devices.some(device => device.kind === 'videoinput');

      if (!hasAudio && !hasVideo) {
        throw new Error('No audio or video devices found');
      }

      // Request only available devices
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: hasAudio ? true : false,
        video: hasVideo ? true : false
      });
      
      localStreamRef.current = stream;
      setIsConnected(true);
      
      // Initialize with devices in their default state
      if (hasAudio) {
        stream.getAudioTracks().forEach(track => {
          track.enabled = !isMuted;
        });
      }
      if (hasVideo) {
        stream.getVideoTracks().forEach(track => {
          track.enabled = hasVideo;
        });
      }
    } catch (error) {
      const mediaError = error as MediaDeviceError;
      console.error('Error accessing media devices:', mediaError);
      
      let errorMessage = "No media devices available";
      if (mediaError.name === "NotFoundError") {
        errorMessage = "No camera or microphone found. You can still join without devices.";
      } else if (mediaError.name === "NotAllowedError") {
        errorMessage = "Media access denied. You can still join without audio/video.";
      }
      
      toast({
        title: "Media Device Notice",
        description: errorMessage,
        variant: "default"
      });
      
      // Allow joining without devices
      setIsConnected(true);
      setIsMuted(true);
      setHasVideo(false);
    }
  }, [toast, isMuted]);

  // Effect to handle peer connections
  useEffect(() => {
    if (!isConnected || !localStreamRef.current) return;
    
    // Setup peer connections for existing participants
    participants.forEach(participant => {
      if (participant.id !== userId && !peerConnectionsRef.current[participant.id]) {
        createPeerConnection(participant.id);
      }
    });
  }, [isConnected, participants, userId, createPeerConnection]);

  // Main effect for room initialization
  useEffect(() => {
    if (!roomId) return; // Don't initialize if no roomId

    console.log('Current Room ID:', roomId);  // Added logging

    const socket = socketService.getSocket();
    setSocket(socket);

    // Add the current user to participants first
    setParticipants([{
      id: userId,
      name: userName,
      avatar: '👤',
      isHost: false,
      isModerator: false,
      isMuted: true,
      hasVideo: false,
      volume: 100
    }]);

    socket.emit('joinRoom', {
      roomId,
      username: userName,  // Using userName but keeping username in the interface
      userId
    });

    socket.on('participantJoined', (participant: Participant) => {
      if (!participant.name) return; // Skip if no name is provided
      setParticipants(prev => {
        const newParticipants = [...prev, participant];
        // Log other participants (excluding self)
        console.log('Other participants in room:', 
          newParticipants.filter(p => p.id !== userId)
            .map(p => ({ id: p.id, name: p.name }))
        );
        return newParticipants;
      });
      toast({
        title: "New participant joined",
        description: `${participant.name} has joined the room`,
      });
    });

    socket.on('participantLeft', (participantId: string) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
      if (peerConnectionsRef.current[participantId]) {
        peerConnectionsRef.current[participantId].close();
        delete peerConnectionsRef.current[participantId];
      }
    });

    socket.on('message', (message: MessagePayload) => {
      setMessages(prev => [...prev, {
        id: message.id,
        userId: message.userId,
        username: message.username,
        content: message.content,
        timestamp: new Date(message.timestamp)
      }]);
    });

    socket.on('participantUpdate', (update: ParticipantUpdatePayload) => {
      setParticipants(prev => prev.map(p => 
        p.id === update.userId
          ? { ...p, ...update.updates, name: update.username }  // Added name update
          : p
      ));
    });

    // Initialize WebRTC
    setupMediaDevices();

    return () => {
      socket.emit('leaveRoom', { roomId });
      cleanupMediaDevices();
      mediaSetupAttempted.current = false; // Reset the flag on cleanup
      socket.off('participantJoined');
      socket.off('participantLeft');
      socket.off('message');
      socket.off('participantUpdate');
    };
  }, [roomId, userId, cleanupMediaDevices, setupMediaDevices, toast]);

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      const messagePayload: MessagePayload = {
        id: crypto.randomUUID(),
        roomId: roomId!,
        userId,  // Changed from username to userId
        username,  // This is correct as username
        content: newMessage.trim(),
        timestamp: new Date()
      };
      socket.emit('message', messagePayload);
      setNewMessage("");
    }
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
        socket?.emit('participantUpdate', {
          roomId,
          username: userName,
          updates: { isMuted: !audioTrack.enabled }
        });
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setHasVideo(videoTrack.enabled);
        socket?.emit('participantUpdate', {
          roomId,
          username: userName,
          updates: { hasVideo: videoTrack.enabled }
        });
      }
    }
  };

  const toggleConnection = () => {
    if (isConnected) {
      cleanupMediaDevices();
    } else {
      setupMediaDevices();
    }
    setIsConnected(!isConnected);
  };

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
                          <span className="text-white font-medium">{participant.name}</span>
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
