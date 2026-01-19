"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatBoxPopup } from "./ChatBoxPopup";
import { useChat } from "@/app/providers/ChatProvider";
import { useAuthStore } from "@/store/authStore";
import { chatService } from "@/services/chatService";
import { userService } from "@/services/userService";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface ChatBoxState {
  roomId: string;
  roomName: string;
  roomAvatar?: string;
  isMinimized: boolean;
}

const STORAGE_KEY = "chatBoxes";
const MAX_VISIBLE_BOXES = 2; // ✅ Maximum 2 visible boxes

export const ChatBoxManager: React.FC = () => {
  const { user } = useAuthStore();
  const { socket: chatSocket } = useChat();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  // ✅ Load from localStorage on mount
  const [openChatBoxes, setOpenChatBoxes] = useState<ChatBoxState[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("🔄 Restored chat boxes from localStorage:", parsed);
        return parsed;
      }
    } catch (err) {
      console.error("Failed to load chat boxes from localStorage:", err);
    }
    return [];
  });

  const openChatBoxesRef = useRef<ChatBoxState[]>([]);
  const userRef = useRef(user);

  // ✅ Detect if on chat page and current room
  const isOnChatPage = pathname?.includes("/chat");
  const currentRoomId = searchParams?.get("roomId");

  // ✅ Sync to localStorage whenever openChatBoxes changes
  useEffect(() => {
    if (openChatBoxes.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(openChatBoxes));
        console.log("💾 Saved chat boxes to localStorage:", openChatBoxes);
      } catch (err) {
        console.error("Failed to save chat boxes to localStorage:", err);
      }
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [openChatBoxes]);

  useEffect(() => {
    openChatBoxesRef.current = openChatBoxes;
  }, [openChatBoxes]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (senderName: string, message: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      if (document.hasFocus()) return;

      const notification = new Notification(senderName, {
        body: message,
        icon: "/images/logo/favicon.png",
        tag: "chat-notification",
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 5000);
    }
  };

  const playNotificationSound = () => {
    if (document.hasFocus()) return;

    try {
      const audio = new Audio("/audios/notification.mp3");
      audio.volume = 0.5;
      audio.play().catch((err) => console.log("Cannot play sound:", err));
    } catch (err) {
      console.log("Sound not available:", err);
    }
  };

  // ✅ Listen for manual open events
  useEffect(() => {
    const handleOpenChatBox = (event: CustomEvent) => {
      const { roomId, roomName, roomAvatar } = event.detail;
      console.log("🎯 Manual open chat box event:", { roomId, roomName });
      openChatBox(roomId, roomName, roomAvatar);
    };

    window.addEventListener(
      "openChatBox" as any,
      handleOpenChatBox as EventListener
    );

    return () => {
      window.removeEventListener(
        "openChatBox" as any,
        handleOpenChatBox as EventListener
      );
    };
  }, []);

  // ✅ AUTO POPUP khi nhận tin nhắn MỚI từ người khác
  useEffect(() => {
    if (!chatSocket?.socket || !user) {
      console.log("❌ No socket or user");
      return;
    }

    const s = chatSocket.socket;

    const handleNewMessage = async (msg: any) => {
      console.log("📨 [ChatBoxManager] New message received:", {
        roomId: msg.roomId,
        senderId: msg.senderId,
        currentUserId: userRef.current?.id,
        content: msg.content?.substring(0, 50),
        isOnChatPage,
        currentRoomId,
      });

      // ❌ Skip if message from self
      if (String(msg.senderId) === String(userRef.current?.id)) {
        console.log("⏭️ Message from me, skip popup");
        return;
      }

      // ✅ Skip popup if already viewing this room on chat page
      if (isOnChatPage && currentRoomId === msg.roomId) {
        console.log("👀 Already viewing this room on chat page, skip popup");
        playNotificationSound();
        showBrowserNotification(
          "New message",
          msg.content || "You have a new message"
        );
        return;
      }

      const exists = openChatBoxesRef.current.find(
        (box) => box.roomId === msg.roomId
      );

      if (exists) {
        console.log("📦 Box exists, is minimized:", exists.isMinimized);

        if (exists.isMinimized) {
          setOpenChatBoxes((prev) =>
            prev.map((box) =>
              box.roomId === msg.roomId ? { ...box, isMinimized: false } : box
            )
          );
          console.log("✅ Maximized existing box");
        }

        playNotificationSound();
        showBrowserNotification(exists.roomName, msg.content || "New message");
        return;
      }

      console.log("🆕 Creating new chat box for room:", msg.roomId);

      try {
        const roomInfo = await chatService.getRoomInformation(msg.roomId);
        console.log("📋 Room info fetched:", roomInfo);

        let displayName = roomInfo.name || "Chat";
        let displayAvatar = roomInfo.avatar;

        if (!roomInfo.isGroup && roomInfo.members) {
          const sender = roomInfo.members.find(
            (m: any) => m.userId === msg.senderId
          );

          if (sender) {
            console.log("👤 Found sender in members:", sender);

            try {
              const profile = await userService.getBasicProfile(sender.userId);
              displayName =
                profile.data.fullName || profile.data.username || displayName;
              displayAvatar = profile.data.avatarUrl || displayAvatar;

              console.log("✅ Got sender profile:", {
                displayName,
                displayAvatar,
              });
            } catch (err) {
              console.error("❌ Failed to get sender profile:", err);
            }
          }
        }

        console.log("🚀 Opening chat box:", {
          roomId: msg.roomId,
          displayName,
        });
        openChatBox(msg.roomId, displayName, displayAvatar);

        playNotificationSound();
        showBrowserNotification(displayName, msg.content || "New message");
      } catch (error) {
        console.error("❌ Failed to fetch room info:", error);
      }
    };

    console.log("👂 Registering newMessage listener");
    s.on("newMessage", handleNewMessage);

    return () => {
      console.log("🔇 Removing newMessage listener");
      s.off("newMessage", handleNewMessage);
    };
  }, [chatSocket, user, isOnChatPage, currentRoomId]);

  const openChatBox = (
    roomId: string,
    roomName: string,
    roomAvatar?: string
  ) => {
    console.log("📦 openChatBox called:", { roomId, roomName, roomAvatar });

    // ✅ Don't open popup if already viewing this room
    if (isOnChatPage && currentRoomId === roomId) {
      console.log("👀 Already on chat page with this room, skip popup");
      return;
    }

    setOpenChatBoxes((prev) => {
      console.log("Current boxes count:", prev.length);

      const existing = prev.find((box) => box.roomId === roomId);
      if (existing) {
        console.log("Box already exists, maximizing");
        // Move to end (make it newest)
        const filtered = prev.filter((box) => box.roomId !== roomId);
        return [...filtered, { ...existing, isMinimized: false }];
      }

      // ✅ Add new box at the end (newest on right)
      const newBoxes = [
        ...prev,
        { roomId, roomName, roomAvatar, isMinimized: false },
      ];

      console.log("New boxes count:", newBoxes.length);

      return newBoxes;
    });
  };

  const closeChatBox = (roomId: string) => {
    console.log("❌ Closing chat box:", roomId);
    setOpenChatBoxes((prev) => prev.filter((box) => box.roomId !== roomId));
  };

  const minimizeChatBox = (roomId: string) => {
    console.log("➖ Toggling minimize:", roomId);
    setOpenChatBoxes((prev) =>
      prev.map((box) =>
        box.roomId === roomId ? { ...box, isMinimized: !box.isMinimized } : box
      )
    );
  };

  const handleViewAll = () => {
    const locale = pathname?.split("/")[1] || "en";
    router.push(`/${locale}/chat`);
  };

  if (!user) {
    console.log("❌ No user, not rendering");
    return null;
  }

  // ✅ Filter out boxes for current room if on chat page
  const allBoxes = openChatBoxes.filter((box) => {
    if (isOnChatPage && currentRoomId === box.roomId) {
      console.log("🚫 Hiding popup for current room:", box.roomId);
      return false;
    }
    return true;
  });

  // ✅ Show only last 2 boxes (newest on right)
  const visibleBoxes = allBoxes.slice(-MAX_VISIBLE_BOXES);
  const hiddenCount = allBoxes.length - MAX_VISIBLE_BOXES;

  console.log(
    "🎨 Rendering",
    visibleBoxes.length,
    "visible boxes,",
    hiddenCount,
    "hidden"
  );

  return (
    <div className="fixed bottom-0 right-4 flex items-end gap-3 z-[9999] pointer-events-none">
      {/* ✅ View All Button (if more than MAX_VISIBLE_BOXES) */}
      {hiddenCount > 0 && (
        <div className="pointer-events-auto">
          <button
            onClick={handleViewAll}
            className="bg-green-600 hover:bg-green-700 text-white rounded-t-lg px-4 py-3 shadow-2xl flex items-center gap-2 transition-all hover:scale-105 font-medium text-sm border-2 border-white"
            title={`View ${hiddenCount} more conversation${
              hiddenCount > 1 ? "s" : ""
            }`}
          >
            <MessageCircle size={18} />
            <span>+{hiddenCount}</span>
          </button>
        </div>
      )}

      {/* ✅ Chat boxes (horizontal, newest on right) */}
      {visibleBoxes.map((box) => (
        <div key={box.roomId} className="pointer-events-auto">
          <ChatBoxPopup
            roomId={box.roomId}
            roomName={box.roomName}
            roomAvatar={box.roomAvatar}
            currentUserId={user.id}
            onClose={() => closeChatBox(box.roomId)}
            onMinimize={() => minimizeChatBox(box.roomId)}
            isMinimized={box.isMinimized}
          />
        </div>
      ))}
    </div>
  );
};
