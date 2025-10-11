import { api } from "@/lib/axios";
import { PaginationParams } from "@/types/PaginationParams";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/posts`;

export const commentService = {
  async getComments({
    postId,
    parentId,
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    sortBy = DEFAULT_PAGINATION.sortBy,
    direction = DEFAULT_PAGINATION.direction,
  }: {
    postId: number;
    parentId?: number | null;
    page?: number;
    size?: number;
    sortBy?: string;
    direction?: string;
  }) {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    if (parentId !== undefined && parentId !== null) {
      params.append("parentId", parentId.toString());
    }

    const proxyRes = await api.get(
      `${API_URL}/${postId}/comments?${params.toString()}`
    );

    const res = proxyRes.data;

    if (res.success) {
      return res.data.content;
    } else {
      Toast.error(res.data.message);
      return null;
    }
  },
};
