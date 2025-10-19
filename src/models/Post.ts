import { UserBasic } from "@/models/User";

export interface MediaAttachment {
  id: number;
  createdAt: string;
  type: "IMAGE" | "VIDEO";
  url: string;
}

export interface Post {
  id: number;
  createdAt: string;
  owner: UserBasic;
  taggedUsers: UserBasic[];
  contentText: string;
  mediaCount: number;
  reactionCount: number;
  shareCount: number;
  commentCount: number;
  visibility: boolean;
  mediaAttachments: MediaAttachment[];
}
