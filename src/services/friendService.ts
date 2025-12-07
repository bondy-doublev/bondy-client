/* src/services/friendService.ts */
import { api } from "@/lib/axios";
import { Friendship, FriendSuggest } from "@/models/Friendship";
import { AxiosResponse } from "axios";
import { PaginationParams } from "@/types/PaginationParams";
import { DEFAULT_PAGINATION } from "@/constants/pagination";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/friendships`;

function buildPaginationQuery(
  pagination: PaginationParams = DEFAULT_PAGINATION
): string {
  const {
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    sortBy = DEFAULT_PAGINATION.sortBy,
    direction = DEFAULT_PAGINATION.direction,
  } = pagination;

  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    direction,
  });

  return params.toString();
}

export const friendService = {
  // Gửi yêu cầu kết bạn từ sender -> receiver
  async sendFriendRequest(senderId: number, receiverId: number): Promise<any> {
    try {
      const response: AxiosResponse = await api.post(
        `${API_URL}/request`,
        null,
        { params: { senderId, receiverId } }
      );
      return response.data; // AppApiResponse
    } catch (error) {
      console.error(error);
      throw new Error("Failed to send friend request");
    }
  },

  // Lấy danh sách bạn bè (đã accept) có phân trang
  async getFriends(
    userId: number,
    pagination?: PaginationParams
  ): Promise<Friendship[]> {
    try {
      const query = buildPaginationQuery(pagination);
      const proxyRes: AxiosResponse = await api.get(
        `${API_URL}/friends/${userId}?${query}`
      );
      const res = proxyRes.data; // AppApiResponse
      // pageable -> res.data.content
      return (res?.data?.content ?? []) as Friendship[];
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get friends");
    }
  },

  // Lấy danh sách request pending gửi tới user (phân trang)
  async getPendingRequests(
    userId: number,
    pagination?: PaginationParams
  ): Promise<Friendship[]> {
    try {
      const query = buildPaginationQuery(pagination);
      const proxyRes: AxiosResponse = await api.get(
        `${API_URL}/pending/${userId}?${query}`
      );
      const res = proxyRes.data; // AppApiResponse
      return (res?.data?.content ?? []) as Friendship[];
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get pending requests");
    }
  },

  // Chấp nhận yêu cầu kết bạn (receiver accept sender)
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
      return response.data?.data as Friendship; // AppApiResponse
    } catch (error) {
      console.error(error);
      throw new Error("Failed to accept friend request");
    }
  },

  // Gợi ý kết bạn (BE không dùng pageable / Page mà trả List)
  async suggestFriends(
    userId: number,
    pagination?: PaginationParams
  ): Promise<FriendSuggest[]> {
    try {
      // backend hiện chỉ dùng ?page=, các param khác có cũng không sao
      const query = buildPaginationQuery(pagination);
      const proxyRes: AxiosResponse = await api.get(
        `${API_URL}/suggest/${userId}?${query}`
      );
      const res = proxyRes.data; // AppApiResponse
      // không pageable -> res.data là List<FriendSuggestResponse>
      return (res?.data ?? []) as FriendSuggest[];
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get friend suggestions");
    }
  },

  // Lấy tất cả request mà mình đã gửi nhưng chưa được accept (phân trang)
  async getPendingSentRequests(
    userId: number,
    pagination?: PaginationParams
  ): Promise<Friendship[]> {
    try {
      const query = buildPaginationQuery(pagination);
      const proxyRes: AxiosResponse = await api.get(
        `${API_URL}/pending-sent/${userId}?${query}`
      );
      const res = proxyRes.data; // AppApiResponse
      return (res?.data?.content ?? []) as Friendship[];
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get pending sent requests");
    }
  },

  async getFriendshipStatus(userId: number): Promise<Friendship | null> {
    try {
      const response: AxiosResponse = await api.get(
        `${API_URL}/status/${userId}`
      );
      // AppApiResponse(status) -> status ở field data
      return (response.data?.data as Friendship) ?? null;
    } catch (error) {
      console.error(error);
      throw new Error("Failed to get friendship status");
    }
  },

  // Unfriend
  async unFriend(userId: number): Promise<void> {
    try {
      await api.post(`${API_URL}/unfriend`, { userId });
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unfriend");
    }
  },
};
