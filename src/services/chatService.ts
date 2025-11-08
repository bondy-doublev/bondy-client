import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

export type ChatRoom = {
  id: string;
  name: string;
  isGroup: boolean;
  createdAt: string;
};

export type Message = {
  id: string;
  roomId: string;
  senderId: string;
  content?: string;
  fileUrl?: string;
  imageUrl?: string;
  replyToMessageId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  readBy: string[];
  createdAt: string;
  updatedAt: string;
};

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/chat`;

export const chatService = {
  // Tạo phòng (1-1 hoặc nhóm)
  async createRoom(
    name: string,
    isGroup: boolean,
    memberIds: string[]
  ): Promise<ChatRoom> {
    const res: AxiosResponse = await api.post(`${API_URL}/create-room`, {
      name,
      isGroup,
      memberIds,
    });
    return res.data;
  },

  // Lấy tin nhắn của phòng
  async getRoomMessages(roomId: string): Promise<Message[]> {
    const res: AxiosResponse = await api.get(`${API_URL}/${roomId}/messages`);
    return res.data;
  },

  // REST gửi tin nhắn (fallback)
  async sendMessage(payload: {
    senderId: string;
    roomId: string;
    content?: string;
    fileUrl?: string;
    imageUrl?: string;
    replyToMessageId?: string;
  }): Promise<Message> {
    const res: AxiosResponse = await api.post(`${API_URL}/messages`, payload);
    return res.data;
  },

  // REST sửa tin nhắn
  async editMessage(messageId: string, content: string, userId: number) {
    const res: AxiosResponse = await api.put(
      `${API_URL}/messages/${messageId}`,
      {
        messageId,
        userId,
        content,
      }
    );
    return res.data;
  },

  // REST xoá tin nhắn (soft delete)
  async deleteMessage(messageId: string, userId: number) {
    const res: AxiosResponse = await api.delete(
      `${API_URL}/messages/${messageId}`,
      {
        data: { userId }, // axios delete gửi body phải để trong data
      }
    );
    return res.data;
  },

  // Lấy các phòng chat cá nhân của user
  async getPrivateRooms(userId: string): Promise<ChatRoom[]> {
    const res: AxiosResponse = await api.get(`/chat/private-rooms/${userId}`);
    return res.data;
  },

  // Lấy các phòng chat nhóm/public của user
  async getPublicRooms(userId: string): Promise<ChatRoom[]> {
    const res: AxiosResponse = await api.get(`/chat/public-rooms/${userId}`);
    return res.data;
  },
};
