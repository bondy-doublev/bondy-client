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

export const ChatBoxManager: React.FC = () => {
  const { user } = useAuthStore();
  const { socket: chatSocket } = useChat();
  const [openChatBoxes, setOpenChatBoxes] = useState<ChatBoxState[]>([]);

  // ✅ Use ref to avoid stale closure
  const openChatBoxesRef = useRef<ChatBoxState[]>([]);
  const userRef = useRef(user);

  // ✅ Sync refs
  useEffect(() => {
    openChatBoxesRef.current = openChatBoxes;
  }, [openChatBoxes]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ✅ Request notification permission
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  const showBrowserNotification = (senderName: string, message: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(senderName, {
        body: message,
        icon: "/logo.png",
        tag: "chat-notification",
      });
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio("/sounds/notification.mp3");
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
  }, []); // ✅ Empty deps - only setup once

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
      });

      // ❌ Nếu tin nhắn từ CHÍNH MÌNH → Không popup
      if (String(msg.senderId) === String(userRef.current?.id)) {
        console.log("⏭️ Message from me, skip popup");
        return;
      }

      // ✅ Nếu từ NGƯỜI KHÁC → Auto popup
      console.log("🎉 Message from others, processing.. .");

      // ✅ Use ref to get latest state
      const exists = openChatBoxesRef.current.find(
        (box) => box.roomId === msg.roomId
      );

      if (exists) {
        console.log("📦 Box exists, is minimized:", exists.isMinimized);

        // Nếu đang minimize → bật lên
        if (exists.isMinimized) {
          setOpenChatBoxes((prev) =>
            prev.map((box) =>
              box.roomId === msg.roomId ? { ...box, isMinimized: false } : box
            )
          );
          console.log("✅ Maximized existing box");
        }

        // Play sound & notification
        playNotificationSound();
        showBrowserNotification(exists.roomName, msg.content || "New message");
        return;
      }

      console.log("🆕 Creating new chat box for room:", msg.roomId);

      // Fetch room info để lấy tên + avatar
      try {
        const roomInfo = await chatService.getRoomInformation(msg.roomId);
        console.log("📋 Room info fetched:", roomInfo);

        let displayName = roomInfo.name || "Chat";
        let displayAvatar = roomInfo.avatar;

        // Nếu là chat 1-1, lấy thông tin người gửi
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

        // ✅ Auto open chat box
        console.log("🚀 Opening chat box:", {
          roomId: msg.roomId,
          displayName,
        });
        openChatBox(msg.roomId, displayName, displayAvatar);

        // Play sound & notification
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
  }, [chatSocket, user]); // ✅ Only re-register when socket/user changes

  const openChatBox = (
    roomId: string,
    roomName: string,
    roomAvatar?: string
  ) => {
    console.log("📦 openChatBox called:", { roomId, roomName, roomAvatar });

    setOpenChatBoxes((prev) => {
      console.log("Current boxes count:", prev.length);

      // Nếu đã tồn tại, maximize it
      const existing = prev.find((box) => box.roomId === roomId);
      if (existing) {
        console.log("Box already exists, maximizing");
        return prev.map((box) =>
          box.roomId === roomId ? { ...box, isMinimized: false } : box
        );
      }

      // ✅ Giới hạn tối đa 3 chat boxes
      const newBoxes = [
        ...prev,
        { roomId, roomName, roomAvatar, isMinimized: false },
      ];

      console.log("New boxes count:", newBoxes.length);

      if (newBoxes.length > 3) {
        console.log("Removing oldest box");
        return newBoxes.slice(1); // Xóa box cũ nhất
      }

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

  if (!user) {
    console.log("❌ No user, not rendering");
    return null;
  }

  console.log("🎨 Rendering", openChatBoxes.length, "chat boxes");

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
