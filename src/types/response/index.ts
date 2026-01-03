import { ReelVisibility } from "@/enums";

export interface UserBasicResponse {
  id: number;
  name: string;
  avatarUrl?: string;
  fullName: string;
}

export interface ReelResponse {
  id: number;
  owner: UserBasicResponse;
  videoUrl: string;
  visibilityType: ReelVisibility;
  expiresAt: string;
  viewCount: number;
  visible: boolean;
  customAllowedUserIds: number[];
  createdAt: string;
  updatedAt: string;
  isRead: boolean;
  readUsers: UserBasicResponse[];
}

export type AdvertMediaType = "IMAGE" | "VIDEO";

export interface AdvertMediaResponse {
  id: number;
  advertId: number;
  url: string;
  type: AdvertMediaType;
}

export type AdvertRequestStatus =
  | "pending"
  | "running"
  | "done"
  | "rejected"
  | "cancelled"
  | "accepted";

export interface AdvertRequestResponse {
  id: number;
  userEmail?: string;
  userId: number;
  userAvatar?: string;
  accountName: string;
  title: string;
  postId?: number;
  pricePerDay: number;
  totalDays: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: AdvertRequestStatus;
  media: AdvertMediaResponse[];
  createdAt: string; // ISO string
}
