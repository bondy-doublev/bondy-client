import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const COMM_BASE = `${process.env.NEXT_PUBLIC_API_URL}${
  process.env.NEXT_PUBLIC_COMM_PATH || ""
}`;
const API_URL = `${COMM_BASE}/chat`;

export type ConversationResponse = {
  id: number;
  type: "PRIVATE";
  participantIds: number[];
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt: string;
};

export const chatService = {
  // Tạo hoặc lấy lại conversation 1-1 với user khác
  async getOrCreatePrivate(otherUserId: number) {
    const res: AxiosResponse = await api.post(
      `${API_URL}/private/${otherUserId}`
    );
    return res.data.data as ConversationResponse;
  },

  // Lấy history theo conversationId (desc ở backend)
  async getHistory(conversationId: number, page = 0, size = 20) {
    const res: AxiosResponse = await api.get(
      `${API_URL}/history/${conversationId}`,
      {
        params: { page, size },
      }
    );
    return res.data.data as ChatMessage[];
  },
};
