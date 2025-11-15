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
  attachments?: { url: string; type: "image" | "file"; fileName?: string }[];
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

  async getRoomMessages(
    roomId: string,
    page = 1,
    limit = 10
  ): Promise<Message[]> {
    const res = await api.get(`${API_URL}/${roomId}/messages`, {
      params: { page, limit },
    });
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
  async getPrivateRooms(userId: number): Promise<ChatRoom[]> {
    const res: AxiosResponse = await api.get(`/chat/private-rooms/${userId}`);
    return res.data;
  },

  // Lấy các phòng chat nhóm/public của user
  async getPublicRooms(userId: number): Promise<ChatRoom[]> {
    const res: AxiosResponse = await api.get(`/chat/public-rooms/${userId}`);
    return res.data;
  },

  async getRoomInformation(roomId: string) {
    const res = await api.get(`${API_URL}/rooms/${roomId}/members`);
    return res.data;
  },

  async getUnreadCount(userId: number): Promise<number> {
    try {
      const res: AxiosResponse<{ total: number }> = await api.get(
        `${API_URL}/unread-count/${userId}`
      );
      return res.data.total || 0;
    } catch (error) {
      return 0; // fallback nếu lỗi
    }
  },

  async updateRoomInformation(
    roomId: string,
    payload: { name?: string; avatarUrl?: string }
  ): Promise<ChatRoom> {
    const res: AxiosResponse = await api.put(
      `${API_URL}/rooms/${roomId}`,
      payload
    );
    return res.data;
  },
};
