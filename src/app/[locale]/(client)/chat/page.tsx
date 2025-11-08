"use client";
import { useState, useEffect, useRef } from "react";
import { chatService, ChatRoom, Message } from "@/services/chatService";
import io, { Socket } from "socket.io-client";
import { useAuthStore } from "@/store/authStore";
import { friendService } from "@/services/friendService";
import { userService } from "@/services/userService";

import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { CreateRoomDialog } from "./components/CreateRoomDialog";

export default function ChatPage() {
  const { user } = useAuthStore();

  const [tab, setTab] = useState<"personal" | "group">("personal");
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);

  const messageEndRef = useRef<HTMLDivElement>(null);
  const selectedRoomRef = useRef<ChatRoom | null>(selectedRoom);
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  // --- Load friends
  const handleGetFriends = async () => {
    if (!user?.id) return;
    const res = await friendService.getFriends(user.id);
    const friendList = res.map((f: any) =>
      f.senderId === user.id ? f.receiverInfo : f.senderInfo
    );
    setFriends(friendList);
  };
  useEffect(() => {
    handleGetFriends();
  }, [user?.id]);

  // --- Load conversations
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.id) return;
      if (tab === "personal") {
        const rooms = await chatService.getPrivateRooms(user.id);
        const roomsWithNames = await Promise.all(
          rooms.map(async (room) => {
            const member = room.members.find((m: any) => m.id !== user.id);
            let displayName = "Unknown";
            if (member) {
              try {
                const profile = await userService.getBasicProfile(member.id);
                displayName =
                  profile.data.fullName || profile.username || "Unknown";
              } catch {}
            }
            return { ...room, displayName };
          })
        );
        setConversations(roomsWithNames);
      } else {
        const rooms = await chatService.getPublicRooms(user.id);
        setConversations(rooms);
      }
    };
    fetchConversations();
  }, [tab, user?.id]);

  // --- Socket
  useEffect(() => {
    if (!user) return;
    const s = io(`${process.env.NEXT_PUBLIC_CHAT_URL}`);
    setSocket(s);

    s.on("newMessage", (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    s.on("messageEdited", (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      }
    });

    s.on("messageDeleted", (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      }
    });

    return () => s.disconnect();
  }, [user]);

  // --- Scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- Load room messages
  const loadRoomMessages = async (room: ChatRoom) => {
    setSelectedRoom(room);
    const msgs = await chatService.getRoomMessages(room.id);
    setMessages(msgs);

    if (socket && user) {
      socket.emit("joinRoom", { roomId: room.id, userId: user.id });
    }
  };

  // --- Send
  const handleSend = async () => {
    if (!newMsg || !selectedRoom || !socket || !user) return;
    socket.emit("sendMessage", {
      senderId: user.id,
      roomId: selectedRoom.id,
      content: newMsg,
    });
    setNewMsg("");
  };

  // --- Create room
  const handleCreateRoom = async () => {
    if (!user) return;
    if (
      (tab === "personal" && selectedFriends.length !== 1) ||
      (tab === "group" && selectedFriends.length < 2)
    ) {
      alert("Chọn đúng số bạn bè theo loại phòng");
      return;
    }
    const memberIds = [user.id, ...selectedFriends];
    const name = tab === "personal" ? "Chat cá nhân" : "Chat nhóm";
    const room = await chatService.createRoom(name, tab === "group", memberIds);

    setConversations((prev) => [...prev, room]);
    setOpenDialog(false);
    setSelectedFriends([]);
    loadRoomMessages(room);
  };

  // Trong ChatPage, thêm các hàm xử lý edit/delete/reply
  const handleEditMessage = async (msg: Message, newContent: string) => {
    if (!socket || !user) return;
    try {
      const updated = await chatService.editMessage(
        msg.id,
        newContent,
        user.id
      );
      socket.emit("editMessage", updated); // gửi socket
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    } catch (err) {
      console.error(err);
      alert("Không thể chỉnh sửa tin nhắn");
    }
  };

  const handleDeleteMessage = async (msg: Message) => {
    if (!socket || !user) return;
    try {
      const deleted = await chatService.deleteMessage(msg.id, user.id);
      socket.emit("deleteMessage", deleted);
      setMessages((prev) =>
        prev.map((m) => (m.id === deleted.id ? deleted : m))
      );
    } catch (err) {
      console.error(err);
      alert("Không thể xóa tin nhắn");
    }
  };

  const handleReplyMessage = (msg: Message) => {
    setNewMsg(`@${msg.senderId} `); // hoặc tùy chỉnh hiển thị mention
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        tab={tab}
        setTab={setTab}
        conversations={conversations}
        selectedRoomId={selectedRoom?.id || null}
        onSelectRoom={loadRoomMessages}
        onOpenDialog={() => setOpenDialog(true)}
      />
      <ChatArea
        messages={messages}
        newMsg={newMsg}
        setNewMsg={setNewMsg}
        onSend={handleSend}
        messageEndRef={messageEndRef}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onReplyMessage={handleReplyMessage}
      />

      {openDialog && (
        <CreateRoomDialog
          friends={friends}
          selectedFriends={selectedFriends}
          onClose={() => setOpenDialog(false)}
          onSelectFriend={(id, checked) => {
            if (checked) setSelectedFriends((prev) => [...prev, id]);
            else setSelectedFriends((prev) => prev.filter((x) => x !== id));
          }}
          onCreate={handleCreateRoom}
          tab={tab}
        />
      )}
    </div>
  );
}
