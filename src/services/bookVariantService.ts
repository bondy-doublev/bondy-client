import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/books`;

export const bookVariantService = {
  // Thêm biến thể
  async addVariant(
    bookId: string,
    data: {
      rarity: string;
      price: number;
      stock: number;
      isbn?: string;
    }
  ) {
    const res: AxiosResponse = await api.post(
      `${API_URL}/${bookId}/variants`,
      data
    );
    return res.data;
  },

  // Cập nhật biến thể theo index
  async updateVariant(
    bookId: string,
    index: number,
    data: {
      rarity?: "common" | "rare" | "limited";
      price?: number;
      stock?: number;
      isbn?: string;
    }
  ) {
    const res: AxiosResponse = await api.put(
      `${API_URL}/${bookId}/variants/${index}`,
      data
    );
    return res.data;
  },

  // Xóa biến thể theo index
  async removeVariant(bookId: string, index: number) {
    const res: AxiosResponse = await api.delete(
      `${API_URL}/${bookId}/variants/${index}`
    );
    return res.data;
  },
};
