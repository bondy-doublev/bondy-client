// src/services/shareService.ts
import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

type CreateSharePayload = {
  postId: number;
  message?: string;
  isPublic?: boolean;
};

type SendAsMessagePayload = {
  postId: number;
  message?: string;
  receiverIds: number[];
};

export const shareService = {
  /**
   * Tạo một bài share-post mới (Post.sharedFrom != null)
   * -> POST /posts/{postId}/share
   * body: { content, isPublic }
   */
  async create({ postId, message = "", isPublic = true }: CreateSharePayload) {
    try {
      const proxyRes = await api.post(`${API_URL}/posts/${postId}/share`, {
        message: message, // khớp với DTO backend (content, isPublic)
        isPublic,
      });

      const res = proxyRes.data;
      Toast.success("Share post successfully");
      return res.data; // PostResponse
    } catch (error: any) {
      console.error("Error share post:", error);
      Toast.error(error?.response?.data?.message || "Failed to share post");
      return null;
    }
  },

  /**
   * Xoá một bài share-post (thực chất là xoá Post bình thường)
   * Nếu bạn muốn dùng riêng cho share thì truyền đúng postId của bài share.
   * -> DELETE /posts/{postId}
   */
  async delete({ postId }: { postId: number }) {
    try {
      const proxyRes = await api.delete(`${API_URL}/posts/${postId}`);
      const res = proxyRes.data;

      Toast.success("Delete shared post successfully");
      return res.data;
    } catch (error: any) {
      console.error("Error delete shared post:", error);
      Toast.error(error?.response?.data?.message || "Delete shared post fail");
      return null;
    }
  },

  /**
   * (Optional) Gửi bài viết dưới dạng tin nhắn cho bạn bè
   * tuỳ backend: ví dụ POST /messages/share-post
   */
  async sendAsMessage(payload: SendAsMessagePayload) {
    const { postId, message = "", receiverIds } = payload;
    try {
      const proxyRes = await api.post(`${API_URL}/messages/share-post`, {
        postId,
        message,
        receiverIds,
      });
      const res = proxyRes.data;
      Toast.success("Sent post via message");
      return res.data;
    } catch (error: any) {
      console.error("Error send shared post as message:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to send post via message"
      );
      return null;
    }
  },
};
