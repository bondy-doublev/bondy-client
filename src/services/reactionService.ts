import { api } from "@/lib/axios";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";
import { Comment } from "@/models/Comment";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/posts`;

export const reactionService = {
  async toggleReaction({ postId }: { postId: number }) {
    try {
      const proxyRes = await api.put(`${API_URL}/${postId}/reaction`);
      const res = proxyRes.data;
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to post comment");
      return null;
    }
  },
};
