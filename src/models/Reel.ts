import { ReelOwner } from "./ReelOwner";

export interface Reel {
  id: number;
  owner: ReelOwner;
  videoUrl: string;
  description: string;
  visibilityType: string;
  expiresAt: string;
  viewCount: number;
  visible: boolean;
  customAllowedUserIds: number[];
  createdAt: string;
  updatedAt: string;
}
