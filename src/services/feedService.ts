import { api } from "@/lib/axios";
import { PaginationParams } from "@/types/PaginationParams";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";
import { Post } from "@/models/Post";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const feedService = {
  async getFeeds({
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    sortBy = DEFAULT_PAGINATION.sortBy,
    direction = DEFAULT_PAGINATION.direction,
  }: PaginationParams = DEFAULT_PAGINATION): Promise<Post[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    try {
      const proxyRes = await api.get(`${API_URL}/feeds?${params}`);
      const res = proxyRes.data;
      if (!res.data) return [];

      return res.data.content as Post[];
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error);
      return [];
    }
  },
};
