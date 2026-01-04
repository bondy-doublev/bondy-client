"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { chatService, ChatRoom, Message } from "@/services/chatService";
import { useAuthStore } from "@/store/authStore";
import { friendService } from "@/services/friendService";
import { userService } from "@/services/userService";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import { Sidebar } from "./components/Sidebar";
import { ChatArea } from "./components/ChatArea";
import { CreateRoomDialog } from "./components/CreateRoomDialog";
import {
  uploadLocalMultiple,
  uploadLocalSingle,
} from "@/services/uploadService";
import { useChat } from "@/app/providers/ChatProvider";
import { useTranslations } from "use-intl";
import { toast } from "react-toastify";

export default function ChatPage() {
  const { user } = useAuthStore();
  const { socket: chatSocket } = useChat();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("chat");

  // ✅ Lấy params từ URL với fallback
  const tabFromUrl =
    (searchParams.get("tab") as "personal" | "group") || "personal";
  const roomIdFromUrl = searchParams.get("roomId");

  // State
  const [tab, setTab] = useState<"personal" | "group">(tabFromUrl);
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newMsg, setNewMsg] = useState("");
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const tabRef = useRef(tab);
  const selectedRoomRef = useRef<ChatRoom | null>(selectedRoom);
  const isUpdatingUrlRef = useRef(false);
  const pendingRoomIdRef = useRef<string | null>(roomIdFromUrl);

  // Constants
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const hasRoom = !!selectedRoom?.id;
  const shouldShowSidebarMobile = isMobile && !hasRoom && isSidebarOpen;

  // ✅ Sync refs
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  // ✅ Helper:  Build URL with params
  const buildUrl = (newTab?: string, newRoomId?: string | null) => {
    const params = new URLSearchParams();

    const finalTab = newTab || tab;
    const finalRoomId =
      newRoomId === undefined ? selectedRoom?.id || null : newRoomId;

    params.set("tab", finalTab);
    if (finalRoomId) {
      params.set("roomId", finalRoomId);
    }

    return `${pathname}?${params.toString()}`;
  };

  // ✅ Update URL (with debounce protection)
  const updateUrl = useCallback(
    (newTab?: string, newRoomId?: string | null, replace = false) => {
      if (isUpdatingUrlRef.current) return;

      isUpdatingUrlRef.current = true;
      const url = buildUrl(newTab, newRoomId);

      console.log("🔗 UPDATE URL:", { newTab, newRoomId, url, replace });

      if (replace) {
        router.replace(url, { scroll: false });
      } else {
        router.push(url, { scroll: false });
      }

      setTimeout(() => {
        isUpdatingUrlRef.current = false;
      }, 100);
    },
    [router, pathname, tab, selectedRoom, buildUrl]
  );

  // ✅ Load friends
  const handleGetFriends = async () => {
    if (!user?.id) return;
    try {
      const res = await friendService.getFriends(user.id);
      const friendList = res.map((f: any) =>
        f.senderId === user.id ? f.receiverInfo : f.senderInfo
      );
      setFriends(friendList);
    } catch (err) {
      console.error(t("errorLoadingFriends"), err);
    }
  };

  useEffect(() => {
    handleGetFriends();
  }, [user?.id]);

  // ✅ Fetch conversations với preserve selected room
  const fetchConversations = async (
    currentTab: "personal" | "group",
    options: { preserveSelected?: boolean; silent?: boolean } = {}
  ) => {
    if (!user?.id) return;

    const { preserveSelected = false, silent = false } = options;

    if (!silent)
      console.log("📋 FETCH CONVERSATIONS:", { currentTab, preserveSelected });

    try {
      let rooms: ChatRoom[] = [];

      if (currentTab === "personal") {
        rooms = await chatService.getPrivateRooms(user.id);
        const roomsWithNames = await Promise.all(
          rooms.map(async (room) => {
            const member = (room as any).members?.find(
              (m: any) => m.id !== user.id
            );
            let displayName = t("unknown");
            let avatarUrl = null;

            if (member) {
              try {
                const profile = await userService.getBasicProfile(member.id);
                displayName =
                  profile.data.fullName ||
                  profile.data.username ||
                  t("unknown");
                avatarUrl = profile.data.avatarUrl;
              } catch {}
            }
            return { ...room, displayName, avatarUrl };
          })
        );
        rooms = roomsWithNames;
      } else {
        rooms = await chatService.getPublicRooms(user.id);
      }

      setConversations(rooms);

      // ✅ Preserve selected room nếu cần
      if (preserveSelected && selectedRoom) {
        const stillExists = rooms.find((r) => r.id === selectedRoom.id);
        if (stillExists) {
          setSelectedRoom(stillExists);
          console.log("✅ Preserved selected room:", stillExists.id);
        } else {
          console.log("⚠️ Selected room no longer exists");
          setSelectedRoom(null);
          setMessages([]);
          updateUrl(currentTab, null, true);
        }
      }

      // ✅ Auto-open pending room
      if (pendingRoomIdRef.current && rooms.length > 0) {
        const roomToOpen = rooms.find((r) => r.id === pendingRoomIdRef.current);
        if (roomToOpen) {
          console.log("🚀 Auto-opening pending room:", roomToOpen.id);
          await loadRoomMessages(roomToOpen, true, false);
          pendingRoomIdRef.current = null;
        }
      }

      if (!silent) console.log("✅ Conversations loaded:", rooms.length);
    } catch (err) {
      console.error(t("errorLoadingConversations"), err);
    }
  };

  // ✅ Load room messages
  const loadRoomMessages = async (
    room: ChatRoom,
    reset = true,
    shouldUpdateUrl = true
  ) => {
    console.log("💬 LOAD ROOM MESSAGES:", {
      roomId: room.id,
      roomName: room.name || (room as any).displayName,
      reset,
      shouldUpdateUrl,
    });

    if (selectedRoom?.id === room.id && reset) {
      console.log("⏭️ Room already selected");
      return;
    }

    setSelectedRoom(room);
    const pageToLoad = reset ? 1 : page;

    try {
      const msgs = await chatService.getRoomMessages(room.id, pageToLoad, 10);

      if (reset) {
        setMessages(msgs.reverse());
        setPage(2);
        setHasMore(msgs.length === 10);

        setTimeout(() => {
          const container = messageContainerRef.current;
          if (container) container.scrollTop = container.scrollHeight;
        }, 100);
      } else {
        const container = messageContainerRef.current;
        if (!container) return;

        const scrollHeightBefore = container.scrollHeight;
        const scrollTopBefore = container.scrollTop;

        setMessages((prev) => [...msgs.reverse(), ...prev]);
        setPage((prev) => prev + 1);
        setHasMore(msgs.length === 10);

        setTimeout(() => {
          const scrollHeightAfter = container.scrollHeight;
          const diff = scrollHeightAfter - scrollHeightBefore;
          container.scrollTop = scrollTopBefore + diff;
        }, 50);
      }

      if (chatSocket && user) {
        chatSocket.socket.emit("joinRoom", {
          roomId: room.id,
          userId: user.id,
        });
        chatSocket.socket.emit("openRoom", {
          roomId: room.id,
          userId: user.id,
        });
      }

      // ✅ Update URL nếu cần
      if (shouldUpdateUrl) {
        updateUrl(tab, room.id);
      }

      console.log("✅ Room messages loaded");
    } catch (err) {
      console.error(t("errorLoadingMessages"), err);
    }
  };

  // ✅ Initial load
  useEffect(() => {
    if (!user?.id || isInitialized) return;

    console.log("🎬 INITIAL LOAD:", { tab: tabFromUrl, roomId: roomIdFromUrl });

    setTab(tabFromUrl);
    pendingRoomIdRef.current = roomIdFromUrl;

    fetchConversations(tabFromUrl, { preserveSelected: false }).then(() => {
      setIsInitialized(true);
    });
  }, [user?.id]);

  // ✅ Sync URL params changes (navigation from elsewhere)
  useEffect(() => {
    if (!isInitialized) return;

    const urlTab =
      (searchParams.get("tab") as "personal" | "group") || "personal";
    const urlRoomId = searchParams.get("roomId");

    console.log("🔄 URL PARAMS CHANGED:", { urlTab, urlRoomId });

    // Tab changed
    if (urlTab !== tab) {
      console.log("📑 Tab changed via URL");
      setTab(urlTab);
      setSelectedRoom(null);
      setMessages([]);
      pendingRoomIdRef.current = urlRoomId;
      fetchConversations(urlTab, { preserveSelected: false });
      return;
    }

    // Room changed
    if (urlRoomId !== selectedRoom?.id) {
      if (urlRoomId) {
        console.log("🏠 Room changed via URL");
        const room = conversations.find((r) => r.id === urlRoomId);
        if (room) {
          loadRoomMessages(room, true, false);
        } else {
          pendingRoomIdRef.current = urlRoomId;
          fetchConversations(urlTab, { preserveSelected: false });
        }
      } else {
        console.log("🚪 Room closed via URL");
        setSelectedRoom(null);
        setMessages([]);
      }
    }
  }, [searchParams, isInitialized]);

  // ✅ Socket events
  useEffect(() => {
    if (!user || !chatSocket) return;
    const s = chatSocket.socket;

    const handleNewMessage = (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => [...prev, msg]);

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
      fetchConversations(tabRef.current, {
        preserveSelected: true,
        silent: true,
      });
    };

    const handleEdited = (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      }
    };

    const handleDeleted = (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? msg : m)));
      }
    };

    s.on("newMessage", handleNewMessage);
    s.on("messageEdited", handleEdited);
    s.on("messageDeleted", handleDeleted);

    return () => {
      s.off("newMessage", handleNewMessage);
      s.off("messageEdited", handleEdited);
      s.off("messageDeleted", handleDeleted);
    };
  }, [user, chatSocket]);

  // ✅ Infinity scroll
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;

      if (scrollTop < 50 && hasMore && !isLoadingMore && selectedRoom) {
        setIsLoadingMore(true);
        loadRoomMessages(selectedRoom, false, false).finally(() => {
          setTimeout(() => setIsLoadingMore(false), 500);
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [selectedRoom, hasMore, isLoadingMore, page]);

  // ✅ Send message
  const handleSend = async () => {
    if (!selectedRoom || !chatSocket || !user) return;
    if (!newMsg.trim() && attachments.length === 0) return;

    let fileUrl: string = "";
    let uploadedAttachments: {
      url: string;
      type: "image" | "file";
      fileName?: string;
    }[] = [];

    try {
      if (attachments.length === 1) {
        const uploaded = await uploadLocalSingle(attachments[0]);
        fileUrl = uploaded;
      }

      if (attachments.length > 1) {
        const uploadedUrls = await uploadLocalMultiple(attachments);
        uploadedAttachments = uploadedUrls.map((url, i) => ({
          url,
          fileName: attachments[i].name,
          type: attachments[i].type.startsWith("image") ? "image" : "file",
        }));
      }

      chatSocket.sendMessage({
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
      fetchConversations(tabRef.current, {
        preserveSelected: true,
        silent: true,
      });

      setTimeout(() => {
        const container = messageContainerRef.current;
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error(t("uploadFileFailed"));
    }
  };

  // Edit/Delete/Reply handlers
  const handleEditMessage = async (msg: Message, newContent: string) => {
    if (!chatSocket || !user) return;
    try {
      const updated = await chatService.editMessage(
        msg.id,
        newContent,
        user.id
      );
      chatSocket.updateMessage(msg.id as any, newContent);
      setMessages((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
    } catch (err) {
      console.error(err);
      toast.error(t("editMessageFailed"));
    }
  };

  const handleDeleteMessage = async (msg: Message) => {
    if (!chatSocket || !user) return;
    try {
      const deleted = await chatService.deleteMessage(msg.id, user.id);
      chatSocket.deleteMessage(msg.id as any);
      setMessages((prev) =>
        prev.map((m) => (m.id === deleted.id ? deleted : m))
      );
    } catch (err) {
      console.error(err);
      toast.error(t("deleteMessageFailed"));
    }
  };

  const handleReplyMessage = (msg: Message) => {
    setReplyingMessage(msg);
  };

  const reloadConversations = async () => {
    await fetchConversations(tabRef.current, { preserveSelected: true });
  };

  // Create room
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
          toast.error(t("selectAtLeastTwoFriendsAndEnterGroupName"));
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
      toast.error(t("errorCreatingRoom"));
    }
  };

  // Sidebar handler
  useEffect(() => {
    const openHandler = () => setIsSidebarOpen(true);
    window.addEventListener("openSidebar", openHandler);
    return () => window.removeEventListener("openSidebar", openHandler);
  }, []);

  useEffect(() => {
    if (isMobile) setIsSidebarOpen(true);
  }, [isMobile]);

  return (
    <div className="flex h-[90vh] flex-col md:flex-row">
      {shouldShowSidebarMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {isMobile && !hasRoom && isSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Sidebar
            className="bg-white w-11/12 max-w-sm h-5/6 shadow-lg rounded-lg p-4"
            tab={tab}
            setTab={(v) => {
              setTab(v);
              setSelectedRoom(null);
              setMessages([]);
              pendingRoomIdRef.current = null;
              updateUrl(v, null);
              fetchConversations(v, { preserveSelected: false });
            }}
            currentUserId={user?.id}
            conversations={conversations}
            selectedRoomId={selectedRoom?.id || null}
            onSelectRoom={(room) => {
              loadRoomMessages(room);
              setIsSidebarOpen(false);
            }}
            onOpenDialog={() => setOpenDialog(true)}
          />
        </div>
      ) : (
        <Sidebar
          className="hidden md:block w-[300px]"
          tab={tab}
          setTab={(v) => {
            setTab(v);
            setSelectedRoom(null);
            setMessages([]);
            pendingRoomIdRef.current = null;
            updateUrl(v, null);
            fetchConversations(v, { preserveSelected: false });
          }}
          currentUserId={user?.id}
          conversations={conversations}
          selectedRoomId={selectedRoom?.id || null}
          onSelectRoom={(room) => loadRoomMessages(room)}
          onOpenDialog={() => setOpenDialog(true)}
        />
      )}

      <ChatArea
        isGroup={tab === "group"}
        selectedRoom={selectedRoom?.id || null}
        currentUserId={user?.id || 0}
        messages={messages}
        newMsg={newMsg}
        setNewMsg={setNewMsg}
        onSend={handleSend}
        messageEndRef={useRef<HTMLDivElement>(null)}
        messageContainerRef={messageContainerRef}
        attachments={attachments}
        setAttachments={setAttachments}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onReplyMessage={handleReplyMessage}
        replyingMessage={replyingMessage}
        onRoomUpdated={reloadConversations}
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

      {isLoadingMore && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-full shadow-lg z-50 flex items-center gap-2">
          <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
          {t("loadingMore")}
        </div>
      )}
    </div>
  );
}
