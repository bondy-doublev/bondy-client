"use client";

import { useEffect, useState } from "react";
import { chatService, type ChatMessage } from "@/services/chatService";
import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import ChatBox from "./components/ChatBox";
import ClientChat from "./components/ClientChat";
import { friendService } from "@/services/friendService";
import { useRouter } from "next/navigation";
import { ConversationItem } from "@/models/ConversationItem";
import DefaultAvatar from "../home/components/user/DefaultAvatar";

export default function ChatPage() {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<
    (ConversationItem & { otherUser?: any })[]
  >([]);
  const [selectedConvId, setSelectedConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFriends, setShowFriends] = useState(false);
  const [friends, setFriends] = useState<any[]>([]);
  const router = useRouter();

  // Load danh sách hội thoại
  useEffect(() => {
    const loadConvs = async () => {
      setLoading(true);
      try {
        const data = await chatService.listConversations(0, 20);

        // Với mỗi cuộc trò chuyện, lấy thông tin người còn lại
        const withProfiles = await Promise.all(
          data.map(async (conv: ConversationItem) => {
            const otherUserId =
              conv.receiverId === user?.id
                ? conv.lastMessage?.senderId // mình là người nhận → người kia là sender
                : conv.receiverId; // mình là người gửi → người kia là receiver

            if (!otherUserId) return conv;

            try {
              const res = await userService.getBasicProfile(otherUserId);
              return { ...conv, otherUser: res.data || res }; // tuỳ backend có bọc data
            } catch {
              return conv;
            }
          })
        );

        setConversations(withProfiles);
        if (withProfiles.length > 0) setSelectedConvId(withProfiles[0].id);
      } catch (err) {
        console.error("Failed to load conversations", err);
      } finally {
        setLoading(false);
      }
    };
    loadConvs();
  }, [user?.id]);

  useEffect(() => {
    if (!showFriends || !user?.id) return;

    const loadFriends = async () => {
      try {
        const res = await friendService.getFriends(user.id);
        setFriends(res);
      } catch (err) {
        console.error("Failed to load friends", err);
      }
    };
    loadFriends();
  }, [showFriends, user?.id]);

  // Load tin nhắn của hội thoại đang chọn
  useEffect(() => {
    if (!selectedConvId) return;
    const loadMsgs = async () => {
      try {
        const data = await chatService.getHistory(selectedConvId, 0, 30);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages", err);
      }
    };
    loadMsgs();
  }, [selectedConvId]);

  const formatTime = (time?: string) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex h-[88vh] border border-gray-200 rounded-lg overflow-hidden bg-white shadow">
      {/* LEFT: List conversations */}
      <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-semibold text-gray-700">Chats</div>
          <button
            onClick={() => setShowFriends((prev) => !prev)}
            className="text-sm text-blue-600 hover:underline"
          >
            + New
          </button>
        </div>

        {loading && <div className="p-3 text-sm text-gray-500">Loading...</div>}

        {conversations.map((c) => {
          const lastMsg = c.lastMessage;
          const mine = lastMsg?.senderId === user?.id;
          const lastText =
            lastMsg?.type === "TEXT"
              ? lastMsg.content
              : lastMsg?.type === "IMAGE"
              ? "📷 Ảnh"
              : lastMsg?.type === "FILE"
              ? "📎 Tệp"
              : "";

          return (
            <div
              key={c.id}
              onClick={() => setSelectedConvId(c.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
                selectedConvId === c.id ? "bg-gray-100" : ""
              }`}
            >
              {/* Avatar */}
              {c.otherUser?.avatarUrl ? (
                <img
                  src={c.otherUser.avatarUrl}
                  alt="avatar"
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <DefaultAvatar
                  firstName={c.otherUser?.fullName?.split(" ")[0] ?? "?"}
                />
              )}

              {/* Info */}
              <div className="flex-1">
                <div className="font-medium text-gray-800">
                  {c.otherUser?.fullName || `User ${c.id}`}
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {lastMsg
                    ? mine
                      ? `Tôi: ${lastText}`
                      : `${
                          c.otherUser?.fullName?.split(" ")[0] || "Người kia"
                        }: ${lastText || ""}`
                    : "Chưa có tin nhắn"}
                </div>
              </div>

              {/* Time */}
              <div className="text-xs text-gray-400">
                {formatTime(lastMsg?.createdAt)}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT: Chat box */}
      <div className="flex-1 p-3">
        {selectedConvId ? (
          <ClientChat
            conversationId={selectedConvId}
            initialMessages={messages}
            selfUserId={user?.id ?? 0}
            user={{ id: user?.id ?? 0, role: user?.role, email: user?.email }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500">
            Chọn một cuộc trò chuyện để bắt đầu
          </div>
        )}
      </div>
      {showFriends && (
        <div className="absolute left-1/3 top-16 z-10 bg-white border border-gray-200 rounded-lg shadow-lg w-64 max-h-80 overflow-y-auto">
          <div className="p-3 font-medium text-gray-700 border-b">
            Chọn bạn để bắt đầu
          </div>

          {friends.length === 0 && (
            <div className="p-3 text-sm text-gray-500">Không có bạn nào</div>
          )}

          {friends.map((f) => {
            const friend =
              f.senderId === user?.id ? f.receiverInfo : f.senderInfo;
            return (
              <div
                key={friend.id}
                onClick={() => {
                  setShowFriends(false);
                  router.push(`/chat/${friend.id}`);
                }}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100"
              >
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.fullName}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <DefaultAvatar firstName={friend.fullName.split(" ")[0]} />
                )}
                <div className="text-gray-800">{friend.fullName}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
