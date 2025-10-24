export interface ConversationItem {
  id: number;
  receiverId?: number;
  type: "PRIVATE";
  participantIds?: number[];
  lastMessage?: {
    id: number;
    senderId: number;
    type: "TEXT" | "IMAGE" | "FILE";
    content: string;
    createdAt: string;
  };
}
