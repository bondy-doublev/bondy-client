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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [newMsg, setNewMsg] = useState("");
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const tabRef = useRef(tab);
  const selectedRoomRef = useRef<ChatRoom | null>(selectedRoom);

  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  // --- Load friends
  const handleGetFriends = async () => {
    if (!user?.id) return;
    try {
      const res = await friendService.getFriends(user.id);
      const friendList = res.map((f: any) =>
        f.senderId === user.id ? f.receiverInfo : f.senderInfo
      );
      setFriends(friendList);
    } catch (err) {
      console.error("Error loading friends:", err);
    }
  };

  useEffect(() => {
    handleGetFriends();
  }, [user?.id]);

  // --- Load conversations
  const fetchConversations = async (currentTab: "personal" | "group") => {
    if (!user?.id) return;
    try {
      if (currentTab === "personal") {
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
    } catch (err) {
      console.error("Error loading conversations:", err);
    }
  };

  useEffect(() => {
    fetchConversations(tabRef.current);
  }, [tab, user?.id]);

  // --- Socket
  useEffect(() => {
    if (!user) return;
    const s = io(`${process.env.NEXT_PUBLIC_CHAT_URL}`);
    setSocket(s);

    s.on("newMessage", (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => [...prev, msg]);

        // Auto scroll to bottom khi nhận tin nhắn mới
        setTimeout(() => {
          const container = messageContainerRef.current;
          if (container) {
            const isNearBottom =
              container.scrollHeight -
                container.scrollTop -
                container.clientHeight <
              150;
            if (isNearBottom) {
              container.scrollTop = container.scrollHeight;
            }
          }
        }, 100);
      }
      fetchConversations(tabRef.current);
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

  // --- Load room messages + pagination
  const loadRoomMessages = async (room: ChatRoom, reset = true) => {
    setSelectedRoom(room);
    const pageToLoad = reset ? 1 : page;

    try {
      const msgs = await chatService.getRoomMessages(room.id, pageToLoad, 10);
      console.log("Loaded messages:", msgs.length);

      if (reset) {
        // Load phòng mới
        setMessages(msgs);
        setPage(2);
        setHasMore(msgs.length === 10);

        // Scroll to bottom
        setTimeout(() => {
          const container = messageContainerRef.current;
          if (container) {
            container.scrollTop = container.scrollHeight;
          }
        }, 100);
      } else {
        // Load more - giữ scroll position
        const container = messageContainerRef.current;
        if (!container) return;

        const scrollHeightBefore = container.scrollHeight;
        const scrollTopBefore = container.scrollTop;

        setMessages((prev) => [...msgs, ...prev]);
        setPage((prev) => prev + 1);
        setHasMore(msgs.length === 10);

        // Khôi phục scroll position sau khi DOM update
        setTimeout(() => {
          if (container) {
            const scrollHeightAfter = container.scrollHeight;
            const scrollDiff = scrollHeightAfter - scrollHeightBefore;
            container.scrollTop = scrollTopBefore + scrollDiff;
          }
        }, 50);
      }

      // join socket
      if (socket && user) {
        socket.emit("joinRoom", { roomId: room.id, userId: user.id });
        socket.emit("openRoom", { userId: user.id, roomId: room.id });
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    }
  };

  // --- Infinity scroll - FIXED
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) {
      console.log("No container ref");
      return;
    }

    const handleScroll = () => {
      const scrollTop = container.scrollTop;

      console.log({
        scrollTop,
        hasMore,
        isLoadingMore,
        selectedRoom: selectedRoom?.id,
        page,
      });

      // Kiểm tra scroll gần đầu (trong vòng 50px từ top)
      if (scrollTop < 50 && hasMore && !isLoadingMore && selectedRoom) {
        console.log("Triggering load more...");
        setIsLoadingMore(true);

        loadRoomMessages(selectedRoom, false).finally(() => {
          setTimeout(() => {
            console.log("Load more completed");
            setIsLoadingMore(false);
          }, 500);
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    console.log("Scroll listener attached");

    return () => {
      container.removeEventListener("scroll", handleScroll);
      console.log("Scroll listener removed");
    };
  }, [selectedRoom, hasMore, isLoadingMore, page]);

  // --- Send
  const handleSend = async () => {
    if (!selectedRoom || !socket || !user) return;
    if (!newMsg.trim() && attachments.length === 0) return;

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
        replyToMessageId: replyingMessage?.id,
        fileUrl: fileUrl.length > 0 ? fileUrl : undefined,
        imageUrl: fileUrl.length > 0 ? fileUrl : undefined,
        attachments: uploadedAttachments.length
          ? uploadedAttachments
          : undefined,
      });

      setNewMsg("");
      setAttachments([]);
      setReplyingMessage(null);
      fetchConversations(tabRef.current);

      // Auto scroll to bottom khi gửi
      setTimeout(() => {
        const container = messageContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error(err);
      alert("Upload file thất bại");
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

  // --- Create room
  const handleCreateRoom = async (
    groupName?: string,
    personalFriendId?: string
  ) => {
    if (!user) return;

    try {
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
    } catch (err) {
      console.error("Error creating room:", err);
      alert("Không thể tạo phòng chat");
    }
  };

  return (
    <div className="flex h-[90vh]">
      <Sidebar
        tab={tab}
        setTab={setTab}
        currentUserId={user?.id}
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
        messageEndRef={useRef<HTMLDivElement>(null)}
        attachments={attachments}
        setAttachments={setAttachments}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onReplyMessage={handleReplyMessage}
        replyingMessage={replyingMessage}
        messageContainerRef={messageContainerRef}
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

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          Đang tải tin nhắn cũ...
        </div>
      )}
    </div>
  );
}
