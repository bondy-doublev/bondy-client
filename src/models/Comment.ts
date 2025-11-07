import { UserBasic } from "@/models/User";

export interface Comment {
  id: number;
  postId: number;
  parentId: number | null;
  mentions: UserBasic[];
  user: UserBasic;
  contentText: string;
  level: number;
  childCount: number;

  createdAt: string;
  updatedAt: string;

  replies?: Comment[];
}
