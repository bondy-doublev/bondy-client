"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  chatService,
  ConversationResponse,
  ChatMessage,
} from "@/services/chatService";
import ClientChat from "../components/ClientChat";
import { useAuthStore } from "@/store/authStore";

export default function ChatPage() {
  const params = useParams<{ locale: string; otherUserId: string }>();
  const router = useRouter();
  const otherUserId = Number(params?.otherUserId);
  const { user } = useAuthStore();

  const [conversation, setConversation] = useState<ConversationResponse | null>(
    null
  );
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!otherUserId) return;

    let cancelled = false;
    (async () => {
      try {
        const conv = await chatService.getOrCreatePrivate(otherUserId);
        if (cancelled) return;
        setConversation(conv);

        const data = await chatService.getHistory(conv.id, 0, 20);
        if (cancelled) return;
        setHistory(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [otherUserId, router, user?.id]);

  if (loading) return <div>Loading...</div>;
  if (!conversation) return <div>Conversation not found</div>;

  const selfUserId = user!.id;

  return (
    <ClientChat
      conversationId={conversation.id}
      initialMessages={history}
      selfUserId={selfUserId}
      user={{ id: selfUserId, role: user?.role, email: user?.email }}
    />
  );
} 
