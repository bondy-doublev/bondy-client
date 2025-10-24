import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/posts`;

export const shareService = {
  async create({ postId }: { postId: number }) {
    try {
      const proxyRes = await api.post(`${API_URL}/${postId}/share`);
      const res = proxyRes.data;

      Toast.success("Success to share post");
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to share post");
      return null;
    }
  },
  async delete({ postId }: { postId: number }) {
    try {
      const proxyRes = await api.delete(`${API_URL}/${postId}/share`);
      const res = proxyRes.data;
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to post comment");
      return null;
    }
  },
};
