export interface Room {
  id: string | number;
  name: string;
  description: string;
  host: string;
  participantCount: number;
  type: string;
  isLive: boolean;
  hasVideo: boolean;
  hasAudio: boolean;
  isStage?: boolean;
}

export interface Participant {
  id: string;
  name: string; // Made required by removing ?
  avatar?: string;
  isHost?: boolean;
  isModerator?: boolean;
  isMuted?: boolean;
  hasVideo?: boolean;
  volume?: number;
  isOnStage?: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}