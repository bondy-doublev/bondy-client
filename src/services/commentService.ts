import { api } from "@/lib/axios";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";
import { Comment } from "@/models/Comment";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

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
  }): Promise<Comment[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    if (parentId !== undefined && parentId !== null) {
      params.append("parentId", parentId.toString());
    }

    try {
      const proxyRes = await api.get(
        `${API_URL}/posts/${postId}/comments?${params.toString()}`
      );

      const res = proxyRes.data;
      return res.data.content as Comment[];
    } catch (error: any) {
      console.log("Error: ", error);
      Toast.error(error);
      return [];
    }
  },

  async createComment({
    postId,
    parentId,
    content,
    mentionUserIds,
  }: {
    postId: number;
    parentId?: number;
    content: string;
    mentionUserIds?: number[];
  }): Promise<Comment> {
    try {
      const body = {
        parentId: parentId ?? null,
        content,
        mentionUserIds: mentionUserIds ?? null,
      };

      const proxyRes = await api.post(
        `${API_URL}/posts/${postId}/comments`,
        body
      );
      const res = proxyRes.data;
      return res.data as Comment;
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to post comment");
      throw error;
    }
  },

  async deleteComment({ commentId }: { commentId: number }) {
    try {
      await api.delete(`${API_URL}/comments/${commentId}`);
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to delete comment");
    }
  },
};
