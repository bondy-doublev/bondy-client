import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";
import {
  CreateAdvertRequest,
  UpdateAdvertRequestStatus,
} from "@/types/request";
import { AdvertRequestResponse } from "@/types/response";

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
      const res = await api.post("/advert", req);
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
        `/advert/${advertId}`
      );

      // backend có thể trả bọc hoặc không bọc data
      return (res.data as any).data ?? (res.data as any);
    } catch (error: any) {
      console.error("Get Advert By ID Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to load advert");
      return null;
    }
  },

  // ---------------- GET MY REQUESTS ----------------
  async getMyRequests(userId: number): Promise<any[]> {
    try {
      const res = await api.get(`/advert/me`, {
        params: { userId },
      });
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
      const res = await api.get("/advert");
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
        `/advert/${advertId}/status`,
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

  // ---------------- GET ACTIVE ADVERTS ----------------
  async getActiveAdverts(): Promise<any[]> {
    try {
      const res = await api.get("/advert/active");
      return res.data || [];
    } catch (error: any) {
      console.error("Get Active Adverts Error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to load active adverts"
      );
      return [];
    }
  },
};
