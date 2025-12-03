import { api } from "@/lib/axios";
import { PaginationParams } from "@/types/PaginationParams";
import { DEFAULT_PAGINATION } from "@/constants/pagination";
import { Toast } from "@/lib/toast";
import { Feed } from "@/models/Post";
import { Notification, NotificationType, RefType } from "@/models/Notfication";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}`;

export const notificationService = {
  async getNotifications({
    page = DEFAULT_PAGINATION.page,
    size = DEFAULT_PAGINATION.size,
    sortBy = DEFAULT_PAGINATION.sortBy,
    direction = DEFAULT_PAGINATION.direction,
  }: PaginationParams = DEFAULT_PAGINATION): Promise<Notification[]> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sortBy,
      direction,
    });

    try {
      const proxyRes = await api.get(`${API_URL}/notifications/me?${params}`);
      const res = proxyRes.data;
      if (!res.data) return [];

      return res.data.content as Notification[];
    } catch (error: any) {
      console.error("Error:", error);
      Toast.error(error);
      return [];
    }
  },
  async markAllAsRead(): Promise<void> {
    try {
      await api.post(`${API_URL}/notifications/mark-read`);
    } catch (error: any) {
      Toast.error("Không thể đánh dấu đã đọc.");
    }
  },
};

export const handleNotificationMsg = (
  n: Notification,
  t: (key: string) => string
) => {
  const map: Record<string, string> = {
    [`${NotificationType.LIKE}_${RefType.POST}`]: "likedYourPost",
    [`${NotificationType.COMMENT}_${RefType.POST}`]: "commentedYourPost",
    [`${NotificationType.REPLY_COMMENT}_${RefType.COMMENT}`]:
      "repliedYourComment",
    [`${NotificationType.MENTION}_${RefType.COMMENT}`]: "mentionedYouInComment",
    [`${NotificationType.MENTION}_${RefType.POST}`]: "taggedYouInPost",
    [`${NotificationType.FRIEND_REQUEST}_${RefType.USER}`]:
      "sentYouFriendRequest",
    [`${NotificationType.FRIEND_ACCEPT}_${RefType.USER}`]:
      "acceptedYourFriendRequest",
  };

  const key = `${n.type}_${n.refType}`;
  return t(map[key] || "newNotification");
};
