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
import {
  uploadCloudinaryMultiple,
  uploadCloudinarySingle,
} from "@/services/uploadService";

export default function ChatPage() {
  const { user } = useAuthStore();

  const [tab, setTab] = useState<"personal" | "group">("personal");
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);

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
    if (!selectedRoom || !socket || !user) return;

    let fileUrl: string = "";
    let uploadedAttachments: {
      url: string;
      type: "image" | "file";
      fileName?: string;
    }[] = [];

    try {
      if (attachments.length === 1) {
        const uploaded = await uploadCloudinarySingle(attachments[0]);
        fileUrl = uploaded;
      }

      if (attachments.length > 1) {
        const uploadedUrls = await uploadCloudinaryMultiple(attachments);
        uploadedAttachments = uploadedUrls.map((url, i) => ({
          url,
          fileName: attachments[i].name,
          type: attachments[i].type.startsWith("image") ? "image" : "file",
        }));
      }

      socket.emit("sendMessage", {
        senderId: user.id,
        roomId: selectedRoom.id,
        content: newMsg,
        replyToMessageId: replyingMessage?.id, // <-- thêm dòng này
        fileUrl: fileUrl.length === 1 ? fileUrl : undefined,
        imageUrl: fileUrl.length > 1 ? fileUrl : undefined,
        attachments: uploadedAttachments.length
          ? uploadedAttachments
          : undefined,
      });

      setNewMsg("");
      setAttachments([]);
      setReplyingMessage(null); // reset reply
    } catch (err) {
      console.error(err);
      alert("Upload file thất bại");
    }
  };

  // --- Create room
  const handleCreateRoom = async (
    groupName?: string,
    personalFriendId?: string
  ) => {
    if (!user) return;

    if (tab === "personal") {
      if (!personalFriendId) return;
      const room = await chatService.createRoom("Chat cá nhân", false, [
        user.id,
        personalFriendId,
      ]);
      setConversations((prev) => [...prev, room]);
      setOpenDialog(false);
      loadRoomMessages(room);
    } else {
      if (!groupName || selectedFriends.length < 2) {
        alert("Chọn ít nhất 2 bạn và nhập tên nhóm");
        return;
      }
      const memberIds = [user.id, ...selectedFriends];
      const room = await chatService.createRoom(groupName, true, memberIds);
      setConversations((prev) => [...prev, room]);
      setOpenDialog(false);
      setSelectedFriends([]);
      loadRoomMessages(room);
    }
  };

  // --- Edit/Delete/Reply
  const handleEditMessage = async (msg: Message, newContent: string) => {
    if (!socket || !user) return;
    try {
      const updated = await chatService.editMessage(
        msg.id,
        newContent,
        user.id
      );
      socket.emit("editMessage", updated);
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
    setReplyingMessage(msg);
  };

  return (
    <div className="flex h-[90vh]">
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
        attachments={attachments}
        setAttachments={setAttachments}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onReplyMessage={handleReplyMessage}
        replyingMessage={replyingMessage} // <-- thêm đây
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
          onCreate={(arg?: string | string[]) => {
            if (tab === "personal") {
              handleCreateRoom(undefined, arg as string);
            } else {
              handleCreateRoom(arg as string);
            }
          }}
          tab={tab}
        />
      )}
    </div>
  );
}
