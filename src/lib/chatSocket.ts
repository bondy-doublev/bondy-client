import { Client, IMessage } from "@stomp/stompjs";
import type { ChatMessage, SendMessagePayload } from "@/services/chatService";

function toWsUrl(baseHttpUrl: string) {
  return baseHttpUrl.replace(/^http/i, "ws");
}

const COMM_BASE = `${process.env.NEXT_PUBLIC_CHAT_URL}${
  process.env.NEXT_PUBLIC_COMM_PATH || ""
}`;
const WS_BROKER_URL = `${toWsUrl(COMM_BASE)}/ws`;

export type ChatSocket = {
  client: Client;
  isConnected: () => boolean;
  sendMessage: (payload: SendMessagePayload) => void;
  updateMessage: (messageId: number, content: string) => void;
  deleteMessage: (messageId: number) => void;
  updateHeadersAndReconnect: (headers: Record<string, string>) => Promise<void>;
};

export function createChatSocket(opts: {
  conversationId?: number;
  onMessage?: (msg: ChatMessage) => void;
  onConnected?: () => void; // NEW: callback sau khi CONNECT
  xUser: { id: number; role?: string; email?: string };
  debug?: boolean;
}): ChatSocket {
  const connectHeaders: Record<string, string> = {
    "X-User-Id": String(opts.xUser.id),
  };
  if (opts.xUser.role) connectHeaders["X-User-Role"] = opts.xUser.role;
  if (opts.xUser.email) connectHeaders["X-Email"] = opts.xUser.email;

  const client = new Client({
    brokerURL: WS_BROKER_URL,
    connectHeaders,
    debug: opts.debug ? (s) => console.log("[STOMP]", s) : () => {},
    reconnectDelay: 5000,
    heartbeatIncoming: 10000, // keep-alive
    heartbeatOutgoing: 10000,
  });

  const queue: Array<{ destination: string; body: string }> = [];

  client.onConnect = () => {
    if (opts.conversationId) {
      client.subscribe(
        `/topic/conversations.${opts.conversationId}`,
        (msg: IMessage) => {
          opts.onMessage?.(JSON.parse(msg.body));
        }
      );
    }
    client.subscribe("/user/queue/messages", (msg: IMessage) => {
      opts.onMessage?.(JSON.parse(msg.body));
    });

    // Flush queued frames (nếu publish trước CONNECT)
    while (queue.length && client.connected) {
      const item = queue.shift()!;
      client.publish(item);
    }

    // Gọi callback để FE reload history một lần cho chắc
    opts.onConnected?.();
  };

  client.onStompError = (frame) => {
    console.error("STOMP error:", frame.headers["message"], frame.body);
  };
  client.onWebSocketError = (e) => {
    console.error("WS error:", e);
  };

  const publish = (destination: string, body: string) => {
    if (client.connected) client.publish({ destination, body });
    else queue.push({ destination, body });
  };

  const sendMessage = (payload: SendMessagePayload) => {
    publish("/app/chat.sendMessage", JSON.stringify(payload));
  };

  const updateMessage = (messageId: number, content: string) => {
    publish("/app/chat.updateMessage", JSON.stringify({ messageId, content }));
  };

  const deleteMessage = (messageId: number) => {
    publish("/app/chat.deleteMessage", JSON.stringify(messageId));
  };

  const updateHeadersAndReconnect = async (headers: Record<string, string>) => {
    await client.deactivate();
    client.connectHeaders = headers;
    client.activate();
  };

  return {
    client,
    isConnected: () => client.connected,
    sendMessage,
    updateMessage,
    deleteMessage,
    updateHeadersAndReconnect,
  };
}
