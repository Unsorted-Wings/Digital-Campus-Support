export type Chat = {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  roomId: string;
  type: 'message' | 'poll';
  readBy: string[];
  reaction: {
    [emoji: string]: string[];
  };
  timestamp: string;
  createdAt: string;
  updatedAt: string;

  pollOptions?: {
    id: string;       
    text: string;     
    votes: string[];  
  }[];
  allowsMultipleVotes?: boolean;
};
