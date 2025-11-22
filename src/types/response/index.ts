import { ReelVisibility } from "@/enums";

export interface UserBasicResponse {
  id: number;
  name: string;
  avatarUrl?: string;
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
}
