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
