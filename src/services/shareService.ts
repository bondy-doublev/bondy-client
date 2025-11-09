import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const shareService = {
  async create({ postId }: { postId: number }) {
    try {
      const proxyRes = await api.post(`${API_URL}/posts/${postId}/shares`);
      const res = proxyRes.data;

      Toast.success("Success to share post");
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to share post");
      return null;
    }
  },
  async delete({ shareId }: { shareId: number }) {
    try {
      const proxyRes = await api.delete(`${API_URL}/shares/${shareId}`);
      const res = proxyRes.data;
      Toast.success("Delete share post successfully");
      return res.data;
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error("Delete share post fail");
      return null;
    }
  },
};
