import { Notification } from "@/models/Notfication";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

const WS_BASE = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL!;

let client: Client | null = null;
let subscription: StompSubscription | null = null;
let currentToken: string | null = null;

function getClient(accessToken: string | null): Client {
  // Trường hợp 1: đã có client + token không đổi + đang active → dùng lại
  if (
    client &&
    currentToken === accessToken && // so sánh trực tiếp token gốc
    (client.active || client.connected) // đang hoạt động hoặc đã connect
  ) {
    console.log("[STOMP] Reusing existing client");
    return client;
  }

  // Nếu tới đây → cần tạo mới hoặc reset
  console.log("[STOMP] Creating/Recreating client", {
    reason: !client ? "first time" : "token changed or inactive",
    oldToken: currentToken?.slice(0, 8) + (currentToken ? "..." : "null"),
    newToken: accessToken?.slice(0, 8) + (accessToken ? "..." : "null"),
  });

  // Dọn dẹp client cũ nếu tồn tại
  if (client) {
    client.deactivate().catch(() => {}); // tránh lỗi nếu đã deactivate rồi
    console.log("🔴 Old STOMP client deactivated");
  }

  const brokerURL = `${WS_BASE}?access_token=${encodeURIComponent(
    accessToken ?? ""
  )}`;

  client = new Client({
    brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => console.log("[STOMP DEBUG]", str),
    onConnect: () => {
      console.log("✅ STOMP Connected with latest token");
    },
    onStompError: (frame) => {
      console.error("❌ STOMP Error:", frame);
    },
    onWebSocketClose: (evt) => {
      console.warn("🔴 WebSocket closed:", evt.code, evt.reason);
    },
    onWebSocketError: (evt) => {
      console.error("🔴 WebSocket error:", evt);
    },
  });

  currentToken = accessToken; // cập nhật token mới

  return client;
}

/**
 * Kết nối (gọi khi có user/token)
 */
export async function connectNotificationService(
  accessToken: string
): Promise<void> {
  const c = getClient(accessToken);
  if (c.active) return; // đang connect/reconnect rồi

  return new Promise((resolve, reject) => {
    c.onConnect = () => resolve();
    c.onStompError = (frame) => reject(frame.body);
    c.activate();
  });
}

/**
 * Subscribe (gọi lại sau mỗi reconnect thành công)
 */
export function subscribeToNotifications(
  onMessage: (body: Notification) => void
): StompSubscription | null {
  if (!client) return null;

  // Unsubscribe cũ nếu có
  subscription?.unsubscribe();

  subscription = client.subscribe(
    "/user/queue/notifications",
    (message: IMessage) => {
      try {
        const body = JSON.parse(message.body);
        onMessage(body);
      } catch (err) {
        console.error("❌ Parse notification failed:", message.body);
      }
    }
  );

  return subscription;
}

/**
 * Disconnect toàn bộ (logout)
 */
export async function disconnectNotificationService() {
  if (client) {
    await client.deactivate();
    client = null;
    subscription = null;
    console.log("🔌 STOMP fully disconnected");
  }
}

export function markAllNotificationsAsRead() {
  if (!client || !client.connected) {
    console.warn("⚠️ Cannot mark all as read: STOMP client not connected");
    return;
  }

  client.publish({
    destination: "/app/notification.markRead",
    body: "{}", // server chỉ cần biết user nào gửi, không cần body phức tạp
  });

  console.log("📤 Sent markAllNotificationsAsRead");
}
