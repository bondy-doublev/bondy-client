"use client";

import { ReelVisibility } from "@/enums";
import { reelService } from "@/services/reelService";
import { UpdateReelVisibilityRequest } from "@/types/request";
import { useState, useMemo, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import {
  X,
  Globe,
  Lock,
  Trash2,
  AlertCircle,
  Users,
  Search,
  Check,
  Video,
} from "lucide-react";
import User from "@/models/User";
import { useTranslations } from "use-intl";
import { Toast } from "@/lib/toast";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { resolveFileUrl } from "@/utils/fileUrl";

interface ReelEditModalProps {
  reel: {
    id: number;
    videoUrl: string;
    visibilityType: ReelVisibility;
    customAllowedUserIds?: number[];
    owner: {
      id: number;
      fullName: string;
      avatarUrl?: string;
    };
  };
  currentUserId: number;
  open: boolean;
  onClose: () => void;
  onUpdated?: () => void;
  onDeleted?: () => void;
}

export default function ReelEditModal({
  reel,
  currentUserId,
  open,
  onClose,
  onUpdated,
  onDeleted,
}: ReelEditModalProps) {
  const [visibility, setVisibility] = useState<ReelVisibility>(
    reel.visibilityType
  );
  const [customAllowedUsers, setCustomAllowedUsers] = useState<number[]>(
    reel.customAllowedUserIds || []
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("reel");

  const isOwner = reel.owner.id === currentUserId;

  const { friendUsers } = useMyFriends(currentUserId, {
    getAll: true,
    enabled: true,
  });

  // Filter friends based on search
  const filteredFriends = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return friendUsers;
    return friendUsers.filter((f) =>
      f.fullName?.toLowerCase().includes(keyword)
    );
  }, [friendUsers, searchQuery]);

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 24;

    if (isNearBottom && visibleCount < filteredFriends.length) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredFriends.length));
    }
  };

  const handleUpdateVisibility = async () => {
    if (!isOwner) return;

    try {
      setIsUpdating(true);
      const payload: UpdateReelVisibilityRequest = {
        reelId: reel.id,
        requesterId: currentUserId,
        visibilityType: visibility,
        customAllowedUserIds:
          visibility === ReelVisibility.CUSTOM ? customAllowedUsers : [],
      };

      await reelService.updateVisibility(payload);
      Toast.success(t("updateSuccess") || "Reel updated successfully!");
      onClose();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      Toast.error(t("updateError") || "Failed to update reel");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    try {
      setIsDeleting(true);
      await reelService.delete(reel.id, currentUserId);
      Toast.success(t("deleteSuccess") || "Reel deleted successfully!");
      setShowDeleteConfirm(false);
      onClose();
      onDeleted?.();
    } catch (err) {
      console.error(err);
      Toast.error(t("deleteError") || "Failed to delete reel");
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleUser = (id: number) => {
    setCustomAllowedUsers((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  const handleReset = () => {
    setSearchQuery("");
    setVisibleCount(20);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
        <DialogContent className="w-[95%] md:max-w-lg bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70] max-h-[90vh] flex flex-col">
          {/* Header */}
          <DialogHeader className="flex items-center justify-center h-14 border-b bg-gradient-to-r from-green-50 to-white z-10 relative shrink-0">
            <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none flex items-center gap-2">
              <Video className="w-4 h-4 text-green-600" />
              {t("editReel")}
            </DialogTitle>
            <DialogClose asChild>
              <button
                className="absolute right-4 p-1. 5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
                aria-label="Close"
                onClick={handleClose}
                disabled={isUpdating || isDeleting}
              >
                <X size={18} />
              </button>
            </DialogClose>
          </DialogHeader>

          {/* Body */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto scroll-custom">
            {/* Owner Info */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-100">
              {reel.owner.avatarUrl ? (
                <img
                  src={resolveFileUrl(reel.owner.avatarUrl)}
                  alt={reel.owner.fullName}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                  {reel.owner.fullName[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm text-gray-900">
                  {reel.owner.fullName}
                </p>
                <p className="text-xs text-gray-600 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {t("owner")}
                </p>
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative rounded-lg overflow-hidden bg-black shadow-lg">
              <video
                src={resolveFileUrl(reel.videoUrl)}
                controls
                className="w-full max-h-[300px] object-contain"
              />
            </div>

            {isOwner ? (
              <>
                {/* Visibility Settings */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Users className="w-4 h-4 text-green-600" />
                    {t("chooseAudience")}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setVisibility(ReelVisibility.PUBLIC)}
                      disabled={isUpdating}
                      className={`flex flex-col items-center gap-1. 5 p-3 rounded-lg border-2 transition-all ${
                        visibility === ReelVisibility.PUBLIC
                          ? "bg-green-50 border-green-600 text-green-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Globe className="w-5 h-5" />
                      <span className="text-xs font-medium">{t("public")}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility(ReelVisibility.PRIVATE)}
                      disabled={isUpdating}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                        visibility === ReelVisibility.PRIVATE
                          ? "bg-green-50 border-green-600 text-green-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Lock className="w-5 h-5" />
                      <span className="text-xs font-medium">
                        {t("private")}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setVisibility(ReelVisibility.CUSTOM)}
                      disabled={isUpdating}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                        visibility === ReelVisibility.CUSTOM
                          ? "bg-green-50 border-green-600 text-green-700"
                          : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      <Users className="w-5 h-5" />
                      <span className="text-xs font-medium">{t("custom")}</span>
                    </button>
                  </div>
                </div>

                {/* Custom User Selection */}
                {visibility === ReelVisibility.CUSTOM && (
                  <div className="space-y-2">
                    {/* Selected Counter */}
                    {customAllowedUsers.length > 0 && (
                      <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                        <span className="text-sm font-medium text-green-800">
                          {t("selected")}: {customAllowedUsers.length}
                        </span>
                        <button
                          onClick={() => setCustomAllowedUsers([])}
                          disabled={isUpdating}
                          className="text-xs text-green-600 hover:text-green-800 font-medium underline"
                        >
                          {t("clearAll")}
                        </button>
                      </div>
                    )}

                    {/* Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("searchFriends")}
                        disabled={isUpdating}
                        className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery("")}
                          disabled={isUpdating}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Friends List */}
                    <div
                      ref={scrollRef}
                      onScroll={handleScroll}
                      className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100 scroll-custom bg-white"
                    >
                      {filteredFriends.length === 0 ? (
                        <div className="p-8 text-center">
                          <Search className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            {searchQuery ? t("noFriendsFound") : t("noFriends")}
                          </p>
                        </div>
                      ) : (
                        <>
                          {filteredFriends.slice(0, visibleCount).map((f) => {
                            const isSelected = customAllowedUsers.includes(
                              f.id
                            );
                            const fallbackLetter =
                              f.fullName?.[0]?.toUpperCase() || "?";

                            return (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => toggleUser(f.id)}
                                disabled={isUpdating}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                                  isSelected
                                    ? "bg-green-50 hover:bg-green-100"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                {/* Avatar */}
                                <div className="relative flex-shrink-0">
                                  {f.avatarUrl ? (
                                    <img
                                      src={resolveFileUrl(f.avatarUrl)}
                                      alt={f.fullName}
                                      className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold shadow-sm">
                                      {fallbackLetter}
                                    </div>
                                  )}
                                </div>

                                {/* Name */}
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-sm text-gray-800 truncate">
                                    {f.fullName}
                                  </div>
                                </div>

                                {/* Checkbox */}
                                <div
                                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                    isSelected
                                      ? "bg-green-600 border-green-600"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <Check
                                      className="w-3. 5 h-3.5 text-white"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                              </button>
                            );
                          })}

                          {/* Loading More */}
                          {visibleCount < filteredFriends.length && (
                            <div className="p-3 text-center bg-gray-50">
                              <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                                <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                {t("loadingMore")}
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <button
                    onClick={handleUpdateVisibility}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isUpdating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t("updating")}
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        {t("updateVisibility")}
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting || isUpdating}
                    className="w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    {t("deleteReel")}
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    {t("noPermission")}
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {t("noPermissionDescription")}
                  </p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogOverlay className="fixed inset-0 bg-black/50 z-[80]" />
        <DialogContent className="w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl p-0 overflow-hidden z-[90]">
          <DialogHeader className="p-5 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-gray-900">
                  {t("deleteConfirmTitle")}
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  {t("deleteConfirmSubtitle")}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 pb-5 space-y-3">
            <p className="text-sm text-gray-600">
              {t("deleteConfirmDescription")}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("deleting")}
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    {t("delete")}
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
