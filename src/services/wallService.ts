import { api } from "@/lib/axios";
import { PaginationParams } from "@/types/PaginationParams";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";
import { MediaAttachment, Post } from "@/models/Post";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/wall`;

export const wallService = {
  async getWallFeeds({
    userId,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    sortBy = DEFAULT_PAGINATION.sortBy,
    direction = DEFAULT_PAGINATION.direction,
  }: PaginationParams & { userId: number }): Promise<Post[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    try {
      const proxyRes = await api.get(`${API_URL}/${userId}/feeds?${params}`);
      const res = proxyRes.data;
      if (!res.data) return [];

      return res.data.content as Post[];
    } catch (error: any) {
      console.error("Error:", error);
      return [];
    }
  },

  async getWallMedias({
    userId,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    sortBy = DEFAULT_PAGINATION.sortBy,
    direction = DEFAULT_PAGINATION.direction,
  }: PaginationParams & { userId: number }): Promise<MediaAttachment[]> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        sortBy,
        direction,
      });

      const proxyRes = await api.get(`${API_URL}/${userId}/medias?${params}`);
      const res = proxyRes.data;
      if (!res.data) return [];

      return res.data as MediaAttachment[];
    } catch (error: any) {
      console.error("Error:", error);
      return [];
    }
  },
};
