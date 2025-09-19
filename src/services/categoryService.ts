import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/categories`;

export const categoryService = {
  // Category
  async createCategory(data: {
    name: string;
    description?: string;
    ageRange?: string;
  }) {
    const res: AxiosResponse = await api.post(API_URL, data);
    return res.data;
  },

  async getCategories(keySearch?: string) {
    const res: AxiosResponse = await api.get(API_URL, {
      params: { keySearch },
    });
    return res.data;
  },

  async getCategory(id: string) {
    const res: AxiosResponse = await api.get(`${API_URL}/${id}`);
    return res.data;
  },

  async updateCategory(
    id: string,
    data: { name: string; description?: string; ageRange?: string }
  ) {
    const res: AxiosResponse = await api.put(`${API_URL}/${id}`, data);
    return res.data;
  },

  async removeCategory(id: string) {
    const res: AxiosResponse = await api.delete(`${API_URL}/${id}`);
    return res.data;
  },
};
