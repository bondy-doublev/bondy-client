import { api } from "@/lib/axios";

import { Toast } from "@/lib/toast";
import { Post } from "@/models/Post";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/posts`;

export const postService = {
  async getPost(postId: number) {
    try {
      const proxyRes = await api.get(`${API_URL}/${postId}`);
      const res = proxyRes.data;
      console.log("api: ", res);
      return res.data as Post;
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error);
      return null;
    }
  },

  async createPost({
    content,
    tagUserIds = [],
    mediaFiles = [],
    visibility = true,
    originalPostId,
  }: {
    content?: string;
    tagUserIds?: number[];
    mediaFiles?: File[];
    visibility: boolean;
    originalPostId?: number;
  }) {
    try {
      const formData = new FormData();

      if (content) formData.append("content", content);

      formData.append("isPublic", visibility.toString());

      tagUserIds.forEach((id) => formData.append("tagUserIds", id.toString()));

      mediaFiles.forEach((f) => {
        formData.append("mediaFiles", f);
      });

      if (originalPostId)
        formData.append("originalPostId", originalPostId.toString());

      const res = await api.post(API_URL, formData, {});
      return res.data.data;
    } catch (error: any) {
      console.error("Error createPost:", error);
      Toast.error(error);
      throw error;
    }
  },

  async update({
    postId,
    content,
    isPublic,
    tagUserIds,
    removeAttachmentIds,
    newMediaFiles = [],
  }: {
    postId: number;
    content?: string;
    isPublic?: boolean;
    tagUserIds?: number[];
    removeAttachmentIds?: number[];
    newMediaFiles?: File[];
  }) {
    try {
      // Gửi multipart/form-data để kèm file mới
      const form = new FormData();

      if (content !== undefined) form.append("content", content);
      if (isPublic !== undefined) form.append("isPublic", String(isPublic));

      (tagUserIds ?? []).forEach((id) => form.append("tagUserIds", String(id)));
      (removeAttachmentIds ?? []).forEach((id) =>
        form.append("removeAttachmentIds", String(id))
      );
      (newMediaFiles ?? []).forEach((file) =>
        form.append("newMediaFiles", file)
      );

      const res = await api.put(`${API_URL}/${postId}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Toast.success("Updated post successfully");
      return res.data;
    } catch (error: any) {
      console.error("Error update post:", error);
      Toast.error(error);
      throw error;
    }
  },

  async deletePost({ postId }: { postId: number }) {
    try {
      const res = await api.delete(`${API_URL}/${postId}`);
      Toast.success("Delete post successfully");
      return res.data.data;
    } catch (error: any) {
      console.error("Error delete:", error);
      Toast.error(error);
      throw error;
    }
  },
};
