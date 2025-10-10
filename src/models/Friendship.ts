import { FriendshipStatus } from "@/enums";
import User from "./User";

export interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  senderId: number; // userId trên backend
  receiverId: number; // friendId trên backend
  status: FriendshipStatus;
  requestedAt: string;
  respondedAt?: string;
  senderInfo: User;
  receiverInfo: User;
}

export interface FriendSuggest {
  userId: number;
  fullName: string;
  avatarUrl?: string;
  mutualFriends: number;
  nearBy: boolean;
  isPending?: boolean;
}
