/* src/services/friendService.ts */
import { api } from "@/lib/axios";
import { Friendship } from "@/models/Friendship";
import User from "@/models/User";
import axios, { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/friendships`;

export const friendService = {
  // 2️⃣ Gửi yêu cầu kết bạn từ sender -> receiver
  async sendFriendRequest(
    senderId: number,
    receiverId: number
  ): Promise<Friendship> {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/request`,
        null,
        { params: { senderId, receiverId } }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to send friend request");
    }
  },

  // 3️⃣ Lấy danh sách bạn bè đã accept
  async getFriends(userId: number): Promise<User[]> {
    try {
      const response: AxiosResponse = await api.get(
        `${API_URL}/friends/${userId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get friends");
    }
  },

  // 4️⃣ Lấy danh sách request pending gửi tới user
  async getPendingRequests(userId: number): Promise<Friendship[]> {
    try {
      const response: AxiosResponse = await api.get(
        `${API_URL}/pending/${userId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get pending requests");
    }
  },

  // 5️⃣ Chấp nhận yêu cầu kết bạn (receiver accept sender)
  async acceptFriendRequest(
    receiverId: number,
    senderId: number
  ): Promise<Friendship> {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/accept`,
        null,
        { params: { receiverId, senderId } }
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to accept friend request");
    }
  },

  // 6️⃣ Từ chối yêu cầu kết bạn (receiver reject sender)
  async rejectFriendRequest(
    receiverId: number,
    senderId: number
  ): Promise<void> {
    try {
      await api.post(`${API_URL}/reject`, null, {
        params: { receiverId, senderId },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Failed to reject friend request");
    }
  },

  async suggestFriends(userId: number) {
    const response: AxiosResponse = await api.get(
      `${API_URL}/suggest/${userId}`
    );
    return response.data;
  },

  // 7️⃣ Lấy tất cả request mà mình đã gửi nhưng chưa được accept
  async getPendingSentRequests(userId: number): Promise<Friendship[]> {
    try {
      const response: AxiosResponse = await api.get(
        `${API_URL}/pending-sent/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get pending sent requests");
    }
  },
};
