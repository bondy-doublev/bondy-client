"use client";
import { useState, useEffect, useRef } from "react";
import { chatService, ChatRoom, Message } from "@/services/chatService";
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
import { useChat } from "@/app/providers/ChatProvider";
import { useTranslations } from "use-intl";
import { toast } from "react-toastify";

export default function ChatPage() {
  const { user } = useAuthStore();
  const { socket: chatSocket } = useChat();

  // --- init tab and roomId from URL if present
  const getUrlParams = () => {
    const p = new URLSearchParams(window.location.search);
    return {
      tab: (p.get("tab") as "personal" | "group") || "personal",
      roomId: p.get("roomId") || null,
    };
  };

  const initial =
    typeof window !== "undefined"
      ? getUrlParams()
      : { tab: "personal", roomId: null };

  const [tab, setTab] = useState<"personal" | "group">(initial.tab);
  const [conversations, setConversations] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const [newMsg, setNewMsg] = useState("");
  const [replyingMessage, setReplyingMessage] = useState<Message | null>(null);
  const [friends, setFriends] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const tabRef = useRef(tab);
  const selectedRoomRef = useRef<ChatRoom | null>(selectedRoom);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const hasRoom = !!selectedRoom?.id;
  const shouldShowSidebarMobile = isMobile && !hasRoom && isSidebarOpen;
  const t = useTranslations("chat");

  // store desired roomId from URL on first load so we can open it after conversations fetched
  const initialRoomIdRef = useRef<string | null>(initial.roomId);

  // cập nhật ref
  useEffect(() => {
    selectedRoomRef.current = selectedRoom;
  }, [selectedRoom]);

  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  useEffect(() => {
    const openHandler = () => setIsSidebarOpen(true);
    window.addEventListener("openSidebar", openHandler);
    return () => window.removeEventListener("openSidebar", openHandler);
  }, []);

  // --- helper: update URL (pushState)
  const updateUrl = (
    newTab?: "personal" | "group",
    roomId?: string | null,
    replace = false
  ) => {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    if (newTab) params.set("tab", newTab);
    else if (!params.has("tab")) params.set("tab", tab);

    if (roomId) params.set("roomId", roomId);
    else params.delete("roomId");

    const newUrl = `${url.pathname}?${params.toString()}`;
    if (replace) window.history.replaceState({}, "", newUrl);
    else window.history.pushState({}, "", newUrl);
  };

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
      console.error(t("errorLoadingFriends"), err);
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
            const member = (room as any).members?.find(
              (m: any) => m.id !== user.id
            );
            let displayName = t("unknown");
            if (member) {
              try {
                const profile = await userService.getBasicProfile(member.id);
                displayName =
                  profile.data.fullName || profile.username || t("unknown");
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
      console.error(t("errorLoadingConversations"), err);
    }
  };

  // fetch conversations whenever tab or user changes
  useEffect(() => {
    fetchConversations(tabRef.current);
    // Also update URL tab (replace on first load to avoid polluting history)
    updateUrl(tabRef.current, selectedRoom?.id || null, true);
  }, [tab, user?.id]);

  // --- handle popstate (back/forward)
  useEffect(() => {
    const onPopState = () => {
      const p = new URLSearchParams(window.location.search);
      const urlTab = (p.get("tab") as "personal" | "group") || "personal";
      const urlRoomId = p.get("roomId") || null;

      // apply tab
      setTab(urlTab);

      // if there's a roomId and conversations already loaded, open it; else remember to open after conversations load
      if (urlRoomId) {
        const room = conversations.find((r) => r.id === urlRoomId);
        if (room) {
          loadRoomMessages(room);
        } else {
          initialRoomIdRef.current = urlRoomId;
        }
      } else {
        // no room in URL -> close selectedRoom
        setSelectedRoom(null);
        setMessages([]);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [conversations]);

  // --- Socket events (dùng socket từ ChatProvider)
  useEffect(() => {
    if (!user || !chatSocket) return;
    const s = chatSocket.socket;

    const handleNewMessage = (msg: Message) => {
      if (selectedRoomRef.current?.id === msg.roomId) {
        setMessages((prev) => [...prev, msg]);

        // Auto scroll to bottom
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

  // --- reset messages only when tab truly changes by user (not on reload)
  const prevTabRef = useRef(tab);
  useEffect(() => {
    if (prevTabRef.current !== tab) {
      // tab changed by user -> reset selection
      setMessages([]);
      setSelectedRoom(null);
      // update url (push new tab and clear roomId)
      updateUrl(tab, null);
    }
    prevTabRef.current = tab;
  }, [tab]);

  // --- Load room messages + pagination
  const loadRoomMessages = async (room: ChatRoom, reset = true) => {
    if (selectedRoom?.id === room.id && reset) {
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

        setMessages((prev) => [...msgs, ...prev]);
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

      // update URL (push roomId) when a room is opened
      updateUrl(tab, room.id);
    } catch (err) {
      console.error(t("errorLoadingMessages"), err);
    }
  };

  // --- Infinity scroll
  useEffect(() => {
    const container = messageContainerRef.current;
    if (!container) {
      // console.log(t("noContainerRef"));
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

      if (scrollTop < 50 && hasMore && !isLoadingMore && selectedRoom) {
        // console.log(t("triggeringLoadMore"));
        setIsLoadingMore(true);

        loadRoomMessages(selectedRoom, false).finally(() => {
          setTimeout(() => {
            // console.log(t("loadMoreCompleted"));
            setIsLoadingMore(false);
          }, 500);
        });
      }
    };

    container.addEventListener("scroll", handleScroll);
    // console.log("Scroll listener attached");

    return () => {
      container.removeEventListener("scroll", handleScroll);
      // console.log("Scroll listener removed");
    };
  }, [selectedRoom, hasMore, isLoadingMore, page]);

  // --- Send (unchanged)
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
      fetchConversations(tabRef.current);

      setTimeout(() => {
        const container = messageContainerRef.current;
        if (container) {
          container.scrollTop = container.scrollHeight;
        }
      }, 100);
    } catch (err) {
      console.error(err);
      toast.error(t("uploadFileFailed"));
    }
  };

  // --- Edit/Delete/Reply (unchanged)
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
    await fetchConversations(tabRef.current);
  };

  // --- Create room (unchanged)
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

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  // when conversations updated, if URL had a roomId to open -> open it
  useEffect(() => {
    if (conversations.length === 0) return;
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("roomId") || initialRoomIdRef.current;
    if (roomId) {
      const room = conversations.find((r) => r.id === roomId);
      if (room) {
        loadRoomMessages(room);
        // clear initial ref so we don't re-open repeatedly
        initialRoomIdRef.current = null;
      }
    }
  }, [conversations]);

  return (
    <div className="flex h-[90vh] flex-col md:flex-row">
      {shouldShowSidebarMobile && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR MOBILE (overlay) */}
      {isMobile && !hasRoom && isSidebarOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Sidebar
            className="bg-white w-11/12 max-w-sm h-5/6 shadow-lg rounded-lg p-4"
            tab={tab}
            setTab={(v) => {
              setTab(v);
              updateUrl(v, null);
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
        /* SIDEBAR DESKTOP */
        <Sidebar
          className="hidden md:block w-[300px]"
          tab={tab}
          setTab={(v) => {
            setTab(v);
            updateUrl(v, null);
          }}
          currentUserId={user?.id}
          conversations={conversations}
          selectedRoomId={selectedRoom?.id || null}
          onSelectRoom={(room) => {
            loadRoomMessages(room);
          }}
          onOpenDialog={() => setOpenDialog(true)}
        />
      )}

      <ChatArea
        isGroup={tab === "group"}
        selectedRoom={selectedRoom?.id || null}
        currentUserId={user?.id}
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
