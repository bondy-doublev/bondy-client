import { UserBasic } from "@/models/User";

export interface MediaAttachment {
  id: number;
  createdAt: string;
  type: "IMAGE" | "VIDEO";
  url: string;
}

// PostResponse từ backend
export interface Post {
  id: number;
  createdAt: string;
  updatedAt?: string | null;

  owner: UserBasic;
  taggedUsers: UserBasic[];

  contentText: string;
  mediaCount: number;

  reactionCount: number;
  shareCount: number;
  commentCount: number;

  visibility: boolean;
  reacted: boolean;

  mediaAttachments: MediaAttachment[];

  // Nếu là bài share => sharedFrom là bài gốc
  sharedFrom?: Post | null;
}
