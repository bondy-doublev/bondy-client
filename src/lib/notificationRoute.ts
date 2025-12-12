// lib/notificationRoute.ts
import { Notification, RefType } from "@/models/Notfication";

export function getNotificationRedirectPath(n: Notification): string | null {
  if (n.redirectId == null) return null;

  switch (n.refType) {
    case RefType.POST:
      return `/post/${n.redirectId}/detail`;

    case RefType.COMMENT:
      return `/post/${n.redirectId}/detail`;

    case RefType.USER:
      return `/user/${n.redirectId}`;

    default:
      return null;
  }
}
