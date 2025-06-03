export interface JoinRoomPayload {
  roomId: string;
  username: string;  // Changed from username to username for consistency
  userId: string;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface MessagePayload {
  id: string;
  roomId: string;
  userId: string;
  username: string;
  content: string;
  timestamp: Date;
}

export interface ParticipantUpdatePayload {
  roomId: string;
  userId: string;
  username: string;  // Changed from username to username for consistency
  updates: {
    isMuted?: boolean;
    hasVideo?: boolean;
    isOnStage?: boolean;
  };
}