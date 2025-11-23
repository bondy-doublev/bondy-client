export enum NotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  MENTION = "MENTION",
  FRIEND_REQUEST = "FRIEND_REQUEST",
  ACCEPT = "ACCEPT",
  SHARE = "SHARE",
  REPLY_COMMENT = "REPLY_COMMENT",
  REPLY_MESSAGE = "REPLY_MESSAGE",
}

export enum RefType {
  FRIENDSHIP = "FRIENDSHIP",
  COMMENT = "COMMENT",
  REACTION = "REACTION",
  MESSAGE = "MESSAGE",
  USER = "USER",
  POST = "POST",
}

export type Notification = {
  id: number;
  userId: number;
  actorId: number;
  actorName: string;
  actorAvatarUrl?: string;
  type: NotificationType;
  refType: RefType;
  refId: number;
  isRead: boolean;
  createdAt: string;
  redirectId: number;
};
