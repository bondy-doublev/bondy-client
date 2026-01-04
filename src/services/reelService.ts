import { api } from "@/lib/axios";
import { Toast } from "@/lib/toast";
import {
  CreateReelRequest,
  UpdateReelVisibilityRequest,
} from "@/types/request";
import { ReelResponse } from "@/types/response";

const BASE = `${process.env.NEXT_PUBLIC_API_URL}/reels`;

type AppApiResponse<T> = {
  code?: number;
  message?: string;
  data: T;
};

export const reelService = {
  // ---------------- CREATE REEL ----------------
  async create(req: CreateReelRequest): Promise<ReelResponse | null> {
    try {
      console.log("BASEEEEEEEEEEEEEEEEEEEEEEEEEE: ", BASE);
      const res = await api.post<AppApiResponse<ReelResponse>>(BASE, req);
      return res.data.data;
    } catch (error: any) {
      console.error("Create Reel Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to create reel");
      return null;
    }
  },

  // ---------------- DELETE REEL ----------------
  async delete(reelId: number, requesterId: number): Promise<boolean> {
    try {
      await api.delete(`${BASE}/${reelId}`, {
        params: { requesterId },
      });
      return true;
    } catch (error: any) {
      console.error("Delete Reel Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to delete reel");
      return false;
    }
  },

  // ---------------- UPDATE VISIBILITY ----------------
  async updateVisibility(
    req: UpdateReelVisibilityRequest
  ): Promise<ReelResponse | null> {
    try {
      const res = await api.put<AppApiResponse<ReelResponse>>(
        `${BASE}/visibility`,
        req
      );
      return res.data.data;
    } catch (error: any) {
      console.error("Update Visibility Error:", error);
      Toast.error(
        error?.response?.data?.message || "Failed to update visibility"
      );
      return null;
    }
  },

  // ---------------- GET VISIBLE REELS ----------------
  // async getVisible(
  //   viewerId: number,
  //   ownerId?: number
  // ): Promise<ReelResponse[] | null> {
  //   try {
  //     const res = await api.get<AppApiResponse<ReelResponse[]>>(
  //       `${BASE}/visible`,
  //       {
  //         params: { viewerId, ownerId },
  //       }
  //     );
  //     return res.data.data || res.data;
  //   } catch (error: any) {
  //     console.error("Get Visible Reels Error:", error);
  //     Toast.error(error?.response?.data?.message || "Failed to load reels");
  //     return null;
  //   }
  // },

  async getVisible(): Promise<ReelResponse[] | null> {
    try {
      const res = await api.get<AppApiResponse<ReelResponse[]>>(
        `${BASE}/visible`
      );
      return res.data.data || res.data;
    } catch (error: any) {
      console.error("Get Visible Reels Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to load reels");
      return null;
    }
  },

  // ---------------- MARK VIEWED ----------------
  async markViewed(reelId: number, viewerId: number): Promise<boolean> {
    try {
      await api.post(`${BASE}/${reelId}/view`, null, {
        params: { viewerId },
      });
      return true;
    } catch (error: any) {
      console.error("Mark Viewed Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to mark viewed");
      return false;
    }
  },

  // ---------------- RUN EXPIRE JOB (DEBUG) ----------------
  async expireNow(): Promise<string | null> {
    try {
      const res = await api.post<string>(`${BASE}/expire-run`);
      return res.data;
    } catch (error: any) {
      console.error("Expire Job Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to run job");
      return null;
    }
  },

  // ---------------- MARK READ ----------------
  async markRead(reelId: number, viewerId: number): Promise<boolean> {
    try {
      await api.post(`${BASE}/${reelId}/read`, null, {
        params: { viewerId },
      });
      return true;
    } catch (error: any) {
      console.error("Mark Read Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to mark read");
      return false;
    }
  },

  // ---------------- GET ALL REELS (IGNORE EXPIRATION) ----------------
  async getAllReels(
    requesterId: number,
    ownerId?: number
  ): Promise<ReelResponse[] | null> {
    try {
      const res = await api.get<AppApiResponse<ReelResponse[]>>(`${BASE}/all`, {
        params: { requesterId, ownerId },
      });
      return res.data.data || res.data;
    } catch (error: any) {
      console.error("Get All Reels Error:", error);
      Toast.error(error?.response?.data?.message || "Failed to load reels");
      return null;
    }
  },

  // ---------------- GET PUBLIC REELS (PAGINATED) ----------------
  async getPublicReels(
    page = 0,
    size = 20
  ): Promise<any> {
    try {
      const res = await api.get(
        `${BASE}/public`,
        {
          params: { page, size },
        }
      );

      return res.data.data || res.data;
    } catch (error: any) {
      console.error("Get Public Reels Error:", error);
      return null;
    }
  },
};
