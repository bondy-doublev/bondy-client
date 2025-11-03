import { useEffect, useRef, useState } from "react";
import { createChatSocket } from "@/lib/chatSocket";
import { chatService } from "@/services/chatService";

export function useUnreadSummary(
  xUser: { id: number; role?: string; email?: string } | null
) {
  const [summary, setSummary] = useState<any>(null);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    if (!xUser?.id) return;

    // 1. Tạo socket và tự động nhận unread summary
    const s = createChatSocket({
      xUser,
      onUnreadSummary: (summary) => {
        console.log("[WS] unread summary:", summary);
        setSummary(summary);
      },
    });

    s.client.activate();
    socketRef.current = s;

    console.log("Socket created", s);

    // 2. Fallback: Gọi API khi mới vào
    chatService
      .getChatSummary()
      .then(setSummary)
      .catch(() => {});

    return () => {
      s.client.deactivate();
      socketRef.current = null;
    };
  }, [xUser?.id, xUser?.role, xUser?.email]);

  return summary;
}
