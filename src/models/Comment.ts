import { UserBasic } from "@/models/User";

export interface ParentComment {
  parentId: number;
  userId: number;
  userName: string;
}

export interface Comment {
  id: number;
  postId: number;
  parentId: number | null;
  parentComment?: ParentComment;
  user: UserBasic;
  contentText: string;
  level: number;
  childCount: number;

  createdAt: string;
  updatedAt: string;

  replies?: Comment[];
}
