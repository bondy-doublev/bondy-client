import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/books`;

export const bookService = {
  // ========== Book ==========
  async createBook(data: {
    title: string;
    author?: string;
    publisher?: string;
    category: string[];
    description?: string;
    releaseYear?: number;
    images?: { url: string; isMain?: boolean; order?: number }[];
    variants?: {
      rarity: "common" | "rare" | "limited";
      price: number;
      stock: number;
      isbn?: string;
    }[];
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  async getBooks(keySearch?: string) {
    const res: AxiosResponse = await api.get(API_URL, {
      params: { keySearch },
    });
    return res.data;
  },

  async getBook(id: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
    return res.data;
  },

  async updateBook(
    id: string,
    data: {
      title?: string;
      author?: string;
      publisher?: string;
      category?: string[];
      description?: string;
      releaseYear?: number;
      images?: { url: string; isMain?: boolean; order?: number }[];
      variants?: {
        rarity: "common" | "rare" | "limited";
        price: number;
        stock: number;
        isbn?: string;
      }[];
    }
  ) {
    const res: AxiosResponse = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  async removeBook(id: string) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
