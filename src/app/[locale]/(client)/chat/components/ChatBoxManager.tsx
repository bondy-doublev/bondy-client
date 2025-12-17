"use client";

import React, { useState, useEffect, useRef } from "react";
import { ChatBoxPopup } from "./ChatBoxPopup";
import { useChat } from "@/app/providers/ChatProvider";
import { useAuthStore } from "@/store/authStore";
import { chatService } from "@/services/chatService";
import { userService } from "@/services/userService";

interface ChatBoxState {
  roomId: string;
  roomName: string;
  roomAvatar?: string;
  isMinimized: boolean;
}

const STORAGE_KEY = "chatBoxes";

export const ChatBoxManager: React.FC = () => {
  const { user } = useAuthStore();
  const { socket: chatSocket } = useChat();

  // ✅ Load from localStorage on mount
  const [openChatBoxes, setOpenChatBoxes] = useState<ChatBoxState[]>(() => {
    if (typeof window === "undefined") return [];

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed;
      }
    } catch (err) {
      console.error("Failed to load chat boxes from localStorage:", err);
    }
    return [];
  });

  const openChatBoxesRef = useRef<ChatBoxState[]>([]);
  const userRef = useRef(user);

  // ✅ Sync to localStorage whenever openChatBoxes changes
  useEffect(() => {
    if (openChatBoxes.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(openChatBoxes));
      } catch (err) {
        console.error("Failed to save chat boxes to localStorage:", err);
      }
    } else {
      // Clear localStorage if no boxes
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
      // Don't show if page is focused
      if (document.hasFocus()) return;

      const notification = new Notification(senderName, {
        body: message,
        icon: "/logo.png",
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
      return;
    }

    const s = chatSocket.socket;

    const handleNewMessage = async (msg: any) => {
      playNotificationSound();

      if (String(msg.senderId) === String(userRef.current?.id)) {
        return;
      }

      const exists = openChatBoxesRef.current.find(
        (box) => box.roomId === msg.roomId
      );

      if (exists) {
        if (exists.isMinimized) {
          setOpenChatBoxes((prev) =>
            prev.map((box) =>
              box.roomId === msg.roomId ? { ...box, isMinimized: false } : box
            )
          );
        }

        showBrowserNotification(exists.roomName, msg.content || "New message");
        return;
      }

      try {
        const roomInfo = await chatService.getRoomInformation(msg.roomId);

        let displayName = roomInfo.name || "Chat";
        let displayAvatar = roomInfo.avatar;

        if (!roomInfo.isGroup && roomInfo.members) {
          const sender = roomInfo.members.find(
            (m: any) => m.userId === msg.senderId
          );

          if (sender) {
            try {
              const profile = await userService.getBasicProfile(sender.userId);
              displayName =
                profile.data.fullName || profile.data.username || displayName;
              displayAvatar = profile.data.avatarUrl || displayAvatar;
            } catch (err) {
              console.error("❌ Failed to get sender profile:", err);
            }
          }
        }

        openChatBox(msg.roomId, displayName, displayAvatar);

        playNotificationSound();
        showBrowserNotification(displayName, msg.content || "New message");
      } catch (error) {
        console.error("❌ Failed to fetch room info:", error);
      }
    };

    s.on("newMessage", handleNewMessage);

    return () => {
      s.off("newMessage", handleNewMessage);
    };
  }, [chatSocket, user]);

  const openChatBox = (
    roomId: string,
    roomName: string,
    roomAvatar?: string
  ) => {
    setOpenChatBoxes((prev) => {
      const existing = prev.find((box) => box.roomId === roomId);
      if (existing) {
        return prev.map((box) =>
          box.roomId === roomId ? { ...box, isMinimized: false } : box
        );
      }

      const newBoxes = [
        ...prev,
        { roomId, roomName, roomAvatar, isMinimized: false },
      ];

      if (newBoxes.length > 3) {
        return newBoxes.slice(1);
      }

      return newBoxes;
    });
  };

  const closeChatBox = (roomId: string) => {
    setOpenChatBoxes((prev) => prev.filter((box) => box.roomId !== roomId));
  };

  const minimizeChatBox = (roomId: string) => {
    setOpenChatBoxes((prev) =>
      prev.map((box) =>
        box.roomId === roomId ? { ...box, isMinimized: !box.isMinimized } : box
      )
    );
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {openChatBoxes.map((box, index) => (
        <div
          key={box.roomId}
          style={{
            right: `${20 + index * 370}px`,
          }}
        >
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
    </>
  );
};
