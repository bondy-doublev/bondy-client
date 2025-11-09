import { api } from "@/lib/axios";
import { PaginationParams } from "@/types/PaginationParams";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";
import { Post } from "@/models/Post";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/posts`;

export const postService = {
  async getNewfeed({
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
      const proxyRes = await api.get(`${API_URL}/new-feed?${params}`);
      const res = proxyRes.data;
      return res.data.content as Post[];
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error);
      return []; // 👈 thêm dòng này
    }
  },

  async createPost({
    content,
    tagUserIds = [],
    mediaFiles = [],
    visibility = true,
  }: {
    content?: string;
    tagUserIds?: number[];
    mediaFiles?: File[];
    visibility: boolean;
  }) {
    try {
      const formData = new FormData();

      if (content) formData.append("content", content);

      formData.append("isPublic", visibility.toString());

      tagUserIds.forEach((id) => formData.append("tagUserIds", id.toString()));

      mediaFiles.forEach((f) => {
        console.log(f);
        formData.append("mediaFiles", f);
      });

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
  }: {
    postId: number;
    content?: string;
    isPublic?: boolean;
    tagUserIds?: number[];
    removeAttachmentIds?: number[];
  }) {
    try {
      const body: any = {};
      if (content !== undefined) body.content = content;
      if (isPublic !== undefined) body.isPublic = isPublic;
      if (tagUserIds !== undefined) body.tagUserIds = tagUserIds;
      if (removeAttachmentIds && removeAttachmentIds.length > 0) {
        body.removeAttachmentIds = removeAttachmentIds;
      }

      const res = await api.put(`${API_URL}/${postId}`, body);
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
