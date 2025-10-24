import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const COMM_BASE = `${process.env.NEXT_PUBLIC_API_URL}${
  process.env.NEXT_PUBLIC_COMM_PATH || ""
}`;
const API_URL = `${COMM_BASE}/chat`;

export type Attachment = {
  id?: number;
  url: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  width?: number;
  height?: number;
};

export type ChatMessage = {
  id: number;
  conversationId: number;
  senderId: number;
  type: "TEXT" | "IMAGE" | "FILE";
  content: string | null;
  attachments: Attachment[];
  createdAt: string;
  edited: boolean;
  editedAt?: string;
  deleted: boolean;
  deletedAt?: string;
};

export type ConversationResponse = {
  id: number;
  type: "PRIVATE";
  participantIds: number[];
};

export type SendMessagePayload = {
  conversationId: number;
  type: "TEXT" | "IMAGE" | "FILE";
  content?: string | null;
  attachments?: Attachment[];
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
      { params: { page, size } }
    );
    return res.data.data as ChatMessage[];
  },

  // REST gửi tin (fallback khi WS chưa sẵn sàng)
  async sendMessage(payload: SendMessagePayload) {
    const res: AxiosResponse = await api.post(`${API_URL}/messages`, payload);
    return res.data.data as ChatMessage;
  },

  // REST sửa tin (TEXT only)
  async editMessage(messageId: number, content: string) {
    const res: AxiosResponse = await api.put(
      `${API_URL}/messages/${messageId}`,
      { messageId, content }
    );
    return res.data.data as ChatMessage;
  },

  // REST xoá (soft-delete)
  async deleteMessage(messageId: number) {
    const res: AxiosResponse = await api.delete(
      `${API_URL}/messages/${messageId}`
    );
    return res.data.data as ChatMessage;
  },

  async listConversations(page = 0, size = 10) {
    const res: AxiosResponse = await api.get(`${API_URL}/conversations`, {
      params: { page, size },
    });
    return res.data.data as {
      id: number;
      type: "PRIVATE";
      lastMessage?: {
        id: number;
        senderId: number;
        type: "TEXT" | "IMAGE" | "FILE";
        content: string;
        createdAt: string;
      };
    }[];
  },
};
