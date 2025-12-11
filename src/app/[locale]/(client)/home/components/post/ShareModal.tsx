"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Globe, Lock, Users, MessageCircle, Search } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useMyFriends } from "@/app/hooks/useMyFriends";

type ShareMode = "feed" | "message";

type ShareModalProps = {
  t: (key: string) => string;
  open: boolean;
  onClose: () => void;

  /** Preview bài gốc (card bài post, text, media…) */
  originalPostPreview: React.ReactNode;

  /** Callback khi chia sẻ lên tường */
  onShareToFeed: (payload: {
    message: string;
    isPublic: boolean;
  }) => Promise<void> | void;

  /** Callback khi gửi tin nhắn cho bạn bè */
  onSendAsMessage: (payload: {
    message: string;
    friendIds: number[];
  }) => Promise<void> | void;
};

export default function ShareModal({
  t,
  open,
  onClose,
  originalPostPreview,
  onShareToFeed,
  onSendAsMessage,
}: ShareModalProps) {
  const [mode, setMode] = useState<ShareMode>("feed");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [searchFriend, setSearchFriend] = useState("");
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<number>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);

  // 👇 số lượng friend hiển thị hiện tại (infinite scroll)
  const [visibleCount, setVisibleCount] = useState(20);
  const friendListRef = useRef<HTMLDivElement | null>(null);

  const { user } = useAuthStore();

  const currentUserId = user?.id ?? 0;
  const { friendUsers } = useMyFriends(currentUserId);

  const filteredFriends = useMemo(() => {
    const keyword = searchFriend.trim().toLowerCase();
    if (!keyword) return friendUsers;
    return friendUsers.filter((f) =>
      f.fullName!.toLowerCase().includes(keyword)
    );
  }, [friendUsers, searchFriend]);

  // Reset visibleCount khi search / mode / danh sách friends đổi
  useEffect(() => {
    setVisibleCount(20);
  }, [searchFriend, mode, friendUsers.length]);

  const toggleFriend = (id: number) => {
    setSelectedFriendIds((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const resetState = () => {
    setMode("feed");
    setMessage("");
    setIsPublic(true);
    setSearchFriend("");
    setSelectedFriendIds(new Set());
    setLoading(false);
    setVisibleCount(20);
  };

  const handleClose = () => {
    if (loading) return;
    resetState();
    onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;

    try {
      setLoading(true);

      if (mode === "feed") {
        await onShareToFeed({
          message: message.trim(),
          isPublic,
        });
      } else {
        const friendIds = Array.from(selectedFriendIds);
        if (friendIds.length === 0) {
          alert(
            t("share.selectAtLeastOneFriend") ||
              "Vui lòng chọn ít nhất 1 người bạn"
          );
          setLoading(false);
          return;
        }
        await onSendAsMessage({
          message: message.trim(),
          friendIds,
        });
      }

      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const canSubmit = useMemo(() => {
    if (mode === "feed") return true;
    return selectedFriendIds.size > 0;
  }, [mode, selectedFriendIds.size]);

  // 👇 handler cho infinite scroll list bạn bè
  const handleFriendListScroll = (
    e: React.UIEvent<HTMLDivElement, UIEvent>
  ) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;

    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (isNearBottom && visibleCount < filteredFriends.length) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredFriends.length));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
      <DialogContent
        className="
          w-[95%] md:max-w-xl
          bg-white rounded-2xl shadow-xl
          p-0 overflow-hidden z-[70]
          max-h-[90vh] flex flex-col
        "
      >
        {/* Header giống EditPostModal */}
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10 relative shrink-0">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("share.title") || "Chia sẻ"}
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
              aria-label="Close"
              onClick={handleClose}
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Body scroll được, footer dính dưới */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scroll-custom">
          {/* Mode switch */}
          <div className="flex items-center bg-gray-100 rounded-full p-1 text-xs font-medium">
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full transition ${
                mode === "feed"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-600"
              }`}
              onClick={() => setMode("feed")}
            >
              <Users size={14} />
              <span>{t("share.shareToFeed") || "Chia sẻ lên tường"}</span>
            </button>
            <button
              type="button"
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full transition ${
                mode === "message"
                  ? "bg-white shadow text-gray-900"
                  : "text-gray-600"
              }`}
              onClick={() => setMode("message")}
            >
              <MessageCircle size={14} />
              <span>{t("share.sendAsMessage") || "Gửi tin nhắn"}</span>
            </button>
          </div>

          {/* audience cho share lên tường */}
          {mode === "feed" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">
                {t("share.audience") || "Đối tượng:"}
              </span>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                  isPublic
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700"
                }`}
              >
                <Globe size={14} />
                {t("public") || "Công khai"}
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                  !isPublic
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700"
                }`}
              >
                <Lock size={14} />
                {t("private") || "Chỉ mình tôi"}
              </button>
            </div>
          )}

          {/* chọn bạn khi gửi message */}
          {mode === "message" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-800">
                  {t("share.chooseFriends") || "Chọn bạn bè"}
                </span>
                {selectedFriendIds.size > 0 && (
                  <span className="text-xs text-green-600">
                    {selectedFriendIds.size} {t("share.selected") || "đã chọn"}
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchFriend}
                  onChange={(e) => setSearchFriend(e.target.value)}
                  placeholder={t("share.searchFriends") || "Tìm kiếm bạn bè..."}
                  className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Danh sách bạn bè + infinite scroll */}
              <div
                ref={friendListRef}
                onScroll={handleFriendListScroll}
                className="max-h-48 overflow-y-auto border rounded-lg divide-y scroll-custom"
              >
                {filteredFriends.length === 0 ? (
                  <div className="p-3 text-xs text-gray-500">
                    {t("share.noFriendsFound") || "Không tìm thấy bạn nào."}
                  </div>
                ) : (
                  filteredFriends.slice(0, visibleCount).map((f) => {
                    const checked = selectedFriendIds.has(f.id);
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => toggleFriend(f.id)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                          checked ? "bg-green-50" : ""
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-semibold text-gray-700">
                          {f.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={f.avatarUrl}
                              alt={f.fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{f.fullName!.charAt(0).toUpperCase()}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-gray-800">
                            {f.fullName}
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 border rounded-sm flex items-center justify-center ${
                            checked
                              ? "bg-green-600 border-green-600"
                              : "border-gray-300"
                          }`}
                        >
                          {checked && (
                            <div className="w-2 h-2 bg-white rounded-sm" />
                          )}
                        </div>
                      </button>
                    );
                  })
                )}

                {visibleCount < filteredFriends.length && (
                  <div className="p-2 text-[11px] text-center text-gray-400">
                    {t("share.loadingMore") || "Đang tải thêm bạn..."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ô nhập nội dung chia sẻ */}
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full min-h-24 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={
              mode === "feed"
                ? t("share.saySomething") || "Nói gì đó về nội dung này..."
                : t("share.saySomethingMessage") ||
                  "Viết gì đó kèm liên kết này..."
            }
          />

          {/* Preview bài gốc */}
          <div className="border rounded-xl bg-gray-50 p-2">
            <div className="text-[11px] uppercase tracking-wide font-semibold text-gray-500 mb-1">
              {t("share.originalPost") || "Bài viết gốc"}
            </div>
            <div className="bg-white border rounded-lg overflow-hidden">
              {originalPostPreview}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-1 border-t flex justify-end gap-2 shrink-0 bg-white">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="px-3 text-sm"
          >
            {t("cancel") || "Hủy"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            className="px-4 text-sm bg-green-600 hover:bg-green-700"
          >
            {loading
              ? t("loading") || "Đang xử lý..."
              : mode === "feed"
              ? t("share.shareNow") || "Chia sẻ ngay"
              : t("share.send") || "Gửi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
