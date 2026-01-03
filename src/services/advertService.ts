import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";
import {
  CreateAdvertRequest,
  UpdateAdvertRequestStatus,
} from "@/types/request";
import { AdvertRequestResponse } from "@/types/response";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/advert`;

type AppApiResponse<T> = {
  code?: number;
  message?: string;
  data: T;
};

export const advertService = {
  // ---------------- CREATE REQUEST ----------------
  async create(
    req: CreateAdvertRequest
  ): Promise<AdvertRequestResponse | null> {
    try {
      const res = await api.post(BASE, req);
      return res.data;
    } catch (error: any) {
      console.error("Create Advert Request Error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to create advert request"
      );
      return null;
    }
  },

  // ---------------- GET BY ID ----------------
  async getById(advertId: number): Promise<AdvertRequestResponse | null> {
    try {
      const res = await api.get<AppApiResponse<AdvertRequestResponse>>(
        `${BASE}/${advertId}`
      );

      // backend của bạn trả thẳng entity → không bọc data
      return (res.data as any).data ?? res.data;
    } catch (error: any) {
      console.error("Get Advert By ID Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to load advert");
      return null;
    }
  },

  // ---------------- GET MY REQUESTS ----------------
  async getMyRequests(userId: number): Promise<any> {
    try {
      const res = await api.get(`${BASE}/me?userId=${userId}`);
      return res.data || [];
    } catch (error: any) {
      console.error("Get My Advert Requests Error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to load advert requests"
      );
      return [];
    }
  },

  // ---------------- GET ALL REQUESTS (ADMIN) ----------------
  async getAllRequests(): Promise<any> {
    try {
      const res = await api.get(BASE);
      return res.data;
    } catch (error: any) {
      console.error("Get All Advert Requests Error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to load all advert requests"
      );
      return null;
    }
  },

  // ---------------- UPDATE STATUS (ADMIN) ----------------
  async updateStatus(
    advertId: number,
    status: UpdateAdvertRequestStatus
  ): Promise<AdvertRequestResponse | null> {
    try {
      const res = await api.patch<AppApiResponse<AdvertRequestResponse>>(
        `${BASE}/${advertId}/status`,
        { status }
      );
      return res.data.data;
    } catch (error: any) {
      console.error("Update Advert Status Error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to update advert status"
      );
      return null;
    }
  },

  async getActiveAdverts() {
    try {
      const response = await api.get(`${BASE}/active`);
      return response.data;
    } catch {
      throw new Error("Failed to fetch active adverts");
    }
  },
};
