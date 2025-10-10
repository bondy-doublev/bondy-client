import { api } from "@/lib/axios";
import { PaginationParams } from "@/types/PaginationParams";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/posts`;

export const postService = {
  async getNewfeed({
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    sortBy = DEFAULT_PAGINATION.sortBy,
    direction = DEFAULT_PAGINATION.direction,
  }: PaginationParams = DEFAULT_PAGINATION) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    const proxyRes = await api.get(`${API_URL}/new-feed?${params}`);
    const res = proxyRes.data;

    if (res.success) {
      return res.data.content;
    } else {
      Toast.error(res.data.message);
      return null;
    }
  },
};
