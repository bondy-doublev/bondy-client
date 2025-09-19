import { api } from "../lib/axios";
import { AxiosResponse } from "axios";

const SLIDER_URL = `${process.env.NEXT_PUBLIC_API_URL}/sliders`;
const COLLECTION_URL = `${process.env.NEXT_PUBLIC_API_URL}/slider-collections`;

export const sliderService = {
  // Slider
  async createSlider(data: {
    title: string;
    image: string;
    description?: string;
    collection: string;
  }) {
    const res: AxiosResponse = await api.post(SLIDER_URL, data);
    return res.data;
  },

  async getSliders() {
    const res: AxiosResponse = await api.get(SLIDER_URL);
    return res.data;
  },

  async getSlider(id: string) {
    const res: AxiosResponse = await api.get(`${SLIDER_URL}/${id}`);
    return res.data;
  },

  async removeSlider(id: string) {
    const res: AxiosResponse = await api.delete(`${SLIDER_URL}/${id}`);
    return res.data;
  },

  // Slider Collection
  async createCollection(data: { name: string }) {
    const res: AxiosResponse = await api.post(COLLECTION_URL, data);
    return res.data;
  },

  async getCollections() {
    const res: AxiosResponse = await api.get(COLLECTION_URL);
    return res.data;
  },

  async getActiveCollection() {
    const res: AxiosResponse = await api.get(`${COLLECTION_URL}/active`);
    return res.data;
  },

  async getCollection(id: string) {
    const res: AxiosResponse = await api.get(`${COLLECTION_URL}/${id}`);
    return res.data;
  },

  async removeCollection(id: string) {
    const res: AxiosResponse = await api.delete(`${COLLECTION_URL}/${id}`);
    return res.data;
  },
};
