import { Client, IMessage } from "@stomp/stompjs";

function toWsUrl(baseHttpUrl: string) {
  return baseHttpUrl.replace(/^http/i, "ws");
}

const COMM_BASE = `${process.env.NEXT_PUBLIC_CHAT_URL}${
  process.env.NEXT_PUBLIC_COMM_PATH || ""
}`;
const WS_BROKER_URL = `${toWsUrl(COMM_BASE)}/ws`;

export type ChatSocket = {
  client: Client;
  sendMessage: (conversationId: number, content: string) => void;
  updateHeadersAndReconnect: (headers: Record<string, string>) => Promise<void>;
  isConnected: () => boolean;
};

export function createChatSocket(opts: {
  conversationId?: number;
  onMessage?: (msg: any) => void;
  xUser: { id: number; role?: string; email?: string }; // bắt buộc với BE hiện tại
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

    while (queue.length && client.connected) {
      const item = queue.shift()!;
      client.publish(item);
    }
  };

  client.onStompError = (frame) => {
    console.error("STOMP error:", frame.headers["message"], frame.body);
  };

  const publish = (destination: string, body: string) => {
    if (client.connected) client.publish({ destination, body });
    else queue.push({ destination, body });
  };

  const sendMessage = (conversationId: number, content: string) => {
    publish(
      "/app/chat.sendMessage",
      JSON.stringify({ conversationId, content })
    );
  };

  const updateHeadersAndReconnect = async (headers: Record<string, string>) => {
    await client.deactivate();
    client.connectHeaders = headers;
    client.activate();
  };

  return {
    client,
    sendMessage,
    updateHeadersAndReconnect,
    isConnected: () => client.connected,
  };
}
