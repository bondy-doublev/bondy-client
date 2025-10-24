"use client";

import { useChat } from "@/hooks/useChat";
import { ChatMessage } from "@/services/chatService";
import ChatBox from "../components/ChatBox";

export default function ClientChat({
  conversationId,
  initialMessages,
  selfUserId,
  user,
}: {
  conversationId: number;
  initialMessages: ChatMessage[];
  selfUserId: number;
  user: { id: number; role?: string; email?: string };
}) {
  const { messages, send } = useChat({
    conversationId,
    xUser: user, // gửi X-User-* qua STOMP CONNECT
    initialMessages,
  });

  return <ChatBox selfUserId={selfUserId} messages={messages} onSend={send} />;
}
