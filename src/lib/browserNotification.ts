// lib/browserNotification.ts
import { Notification as AppNotification } from "@/models/Notfication";
import { handleNotificationMsg } from "@/services/notificationService";

export function requestBrowserNotificationPermission() {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;

  if (Notification.permission === "default") {
    Notification.requestPermission().then((permission) => {
      console.log("Notification permission:", permission);
    });
  }
}

export function showBrowserNotification(
  n: AppNotification,
  t: (key: string) => string
) {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  const body = n.actorName + " " + handleNotificationMsg(n, t);

  new Notification("Bondy", {
    body,
    icon: "/images/logo/favicon.png", // nếu có
  });
}
