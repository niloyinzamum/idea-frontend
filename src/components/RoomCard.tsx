import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Crown, Users, Mic, Video } from "lucide-react";
import type { Room } from "@/interfaces/room.interface";

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string) => void;
}

const RoomCard = ({ room, onJoin }: RoomCardProps) => {
  const getTypeColor = (type: string) => {
    const colors = {
      discussion: "bg-blue-500/20 text-blue-300 border-blue-500/30",
      creative: "bg-purple-500/20 text-purple-300 border-purple-500/30",
      literature: "bg-green-500/20 text-green-300 border-green-500/30",
      business: "bg-orange-500/20 text-orange-300 border-orange-500/30",
      gaming: "bg-red-500/20 text-red-300 border-red-500/30",
      education: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
    };
    return colors[type as keyof typeof colors] || "bg-gray-500/20 text-gray-300 border-gray-500/30";
  };

  return (
    <Card className="group hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white/10 backdrop-blur-lg border border-white/20">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors">
              {room.name}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2 flex-wrap gap-2">
              <Badge className={getTypeColor(room.type)}>
                {room.type}
              </Badge>
              {room.isLive && (
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  Live
                </Badge>
              )}
              {room.isStage && (
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                  <Crown className="w-3 h-3 mr-1" />
                  Stage
                </Badge>
              )}
            </div>
          </div>
          <div className="flex space-x-1 text-white/60">
            {room.hasAudio && <Mic className="w-4 h-4" />}
            {room.hasVideo && <Video className="w-4 h-4" />}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-white/60 leading-relaxed">
          {room.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-white/50">
            <div className="flex items-center space-x-1">
              <Crown className="w-4 h-4" />
              <span>{room.host}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{room.participantCount}</span>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => onJoin(String(room.id))}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform group-hover:scale-105"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Join Room
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoomCard;
