import { api } from "@/lib/axios";

import { Toast } from "@/lib/toast";
import { Post } from "@/models/Post";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/medias`;

export const mediaService = {
  async delete({ mediaId }: { mediaId: number }) {
    try {
      const res = await api.delete(`${API_URL}/${mediaId}`);
      Toast.success("Delete post successfully");
      return res.data.data;
    } catch (error: any) {
      console.error("Error delete:", error);
      Toast.error(error);
      throw error;
    }
  },
};
