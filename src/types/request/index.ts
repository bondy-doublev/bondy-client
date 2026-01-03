import { ReelVisibility } from "@/enums";

export interface CreateReelRequest {
  userId: number;
  videoUrl: string;
  visibilityType: ReelVisibility;
  customAllowedUserIds?: number[];
  ttlHours?: number;
}

export interface UpdateReelVisibilityRequest {
  reelId: number;
  requesterId: number;
  visibilityType: ReelVisibility;
  customAllowedUserIds?: number[];
}

export type AdvertMediaType = "IMAGE" | "VIDEO";

export interface AdvertMediaInput {
  url: string;
  type: AdvertMediaType;
}

export interface CreateAdvertRequest {
  userId: number; // id người tạo quảng cáo
  userAvatar?: string; // avatar người tạo quảng cáo
  accountName: string; // tên tài khoản
  title: string; // nội dung quảng cáo / title
  postId?: number; // nếu quảng cáo từ post
  totalDays: number; // số ngày chạy
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  media: AdvertMediaInput[]; // ảnh / video
  pricePerDay?: number; // nếu muốn override mặc định 20000
  totalPrice?: number; // tính sẵn từ client hoặc backend
}

export type UpdateAdvertRequestStatus =
  | "pending"
  | "waiting_payment"
  | "paid"
  | "running"
  | "done"
  | "rejected"
  | "cancelled";
