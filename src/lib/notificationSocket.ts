import { Client, IMessage, StompSubscription } from "@stomp/stompjs";

// 🌐 URL gateway WS (ví dụ ws://localhost:8080/ws/notify)
const WS_BASE = process.env.NEXT_PUBLIC_NOTIFICATION_WS_URL!;
const INTERNAL_API_KEY = process.env.NEXT_PUBLIC_INTERNAL_API_KEY;

let client: Client | null = null;

/**
 * 🧩 Tạo STOMP client
 */
function createClient(): Client {
  if (client) return client;

  // 🧠 Lấy access token từ localStorage (browser only)
  const accessToken =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  // 🧩 Thêm token & apikey vào query string
  const brokerURL = `${WS_BASE}?access_token=${encodeURIComponent(
    accessToken ?? ""
  )}`;

  client = new Client({
    brokerURL,
    reconnectDelay: 5000,
    debug: (msg: string) => console.log("[STOMP DEBUG]", msg),
  });

  return client;
}

/**
 * 🚀 Kết nối WebSocket notification service
 */
export function connectNotificationService(): Promise<void> {
  const c = createClient();

  return new Promise((resolve, reject) => {
    c.onConnect = (frame) => {
      console.log("✅ STOMP Connected:", frame.headers);
      resolve();
    };

    c.onStompError = (frame) => {
      console.error("❌ STOMP Error:", frame.headers["message"]);
      console.error(frame.body);
      reject(frame.body);
    };

    c.onWebSocketClose = (evt) => {
      console.error("❌ WebSocket closed:", evt.code, evt.reason);
    };

    c.activate();
  });
}

/**
 * 📩 Lắng nghe thông báo realtime
 */
export function subscribeToNotifications(
  onMessage: (body: any) => void
): StompSubscription {
  const c = createClient();

  return c.subscribe("/user/queue/notifications", (message: IMessage) => {
    try {
      const body = JSON.parse(message.body);
      onMessage(body);
    } catch {
      console.error("❌ Error parsing message:", message.body);
    }
  });
}

/**
 * 📨 Gửi message test
 */
export function sendTestMessage(content: string) {
  const c = createClient();

  c.publish({
    destination: "/app/test",
    body: JSON.stringify({ message: content }),
  });
}

export function markAllNotificationsAsRead() {
  const c = createClient();

  // Vì server chỉ cần userId từ session, không cần body
  c.publish({
    destination: "/app/notification.markRead",
    body: "{}", // hoặc để trống ""
  });

  console.log("📤 Sent markAllNotificationsAsRead");
}

/**
 * 🔌 Ngắt kết nối
 */
export function disconnectNotificationService() {
  const c = createClient();
  c.deactivate();
  console.log("🔌 STOMP disconnected");
}
