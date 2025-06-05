import { useState } from "react";
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
import type { Room } from "@/interfaces/room.interface";

interface ChatRoomProps {
  room: Room;
  onLeave: () => void;
}

const ChatRoom = ({ room, onLeave }: ChatRoomProps) => {
  const [isMuted, setIsMuted] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [newMessage, setNewMessage] = useState("");

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Room Header */}
      <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">{room.name}</h1>
              <p className="text-white/70">{room.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                Live
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                <Users className="w-3 h-3 mr-1" />
                {room.participantCount}
              </Badge>
              <Button
                onClick={onLeave}
                variant="destructive"
                size="sm"
              >
                Leave Room
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 flex-1">
        {/* Main Content */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* Video Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Video components will go here */}
          </div>

          {/* Control Bar */}
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-center gap-4">
                <Button
                  onClick={() => setIsMuted(!isMuted)}
                  className={`h-12 w-12 rounded-full ${
                    isMuted 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </Button>
                
                <Button
                  onClick={() => setHasVideo(!hasVideo)}
                  className={`h-12 w-12 rounded-full ${
                    hasVideo 
                      ? 'bg-blue-500 hover:bg-blue-600' 
                      : 'bg-gray-500 hover:bg-gray-600'
                  }`}
                >
                  {hasVideo ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
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

        {/* Chat Sidebar */}
        {showChat && (
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-xl h-full flex flex-col">
              <CardContent className="p-0 flex-1 flex flex-col">
                <div className="p-4 border-b border-white/20">
                  <h3 className="text-white font-semibold">Chat</h3>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  {/* Messages will go here */}
                </div>

                <div className="p-4 border-t border-white/20">
                  <div className="flex gap-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/50 resize-none"
                      rows={2}
                    />
                    <Button 
                      className="bg-blue-500 hover:bg-blue-600 self-end"
                      onClick={() => {
                        if (newMessage.trim()) {
                          // Handle sending message
                          setNewMessage("");
                        }
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatRoom;
