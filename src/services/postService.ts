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

      console.log(mediaFiles.length);
      mediaFiles.forEach((f) => {
        console.log(f);
        formData.append("mediaFiles", f);
      });

      console.log(formData);

      const res = await api.post(API_URL, formData, {});

      return res.data.data;
    } catch (error: any) {
      console.error("Error createPost:", error);
      throw error;
    }
  },
};
