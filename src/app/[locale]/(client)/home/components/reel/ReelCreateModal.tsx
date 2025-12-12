"use client";

import { ReelVisibility } from "@/enums";
import { reelService } from "@/services/reelService";
import { uploadCloudinaryVideoSingle } from "@/services/uploadService";
import { CreateReelRequest } from "@/types/request";
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
  Users,
  Upload,
  Video,
  Search,
  Clock,
  Check,
} from "lucide-react";
import User from "@/models/User";
import { useTranslations } from "use-intl";
import { Toast } from "@/lib/toast";

interface ReelCreateModalProps {
  userId:  number;
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  friends?: User[];
}

export default function ReelCreateModal({
  userId,
  open,
  onClose,
  onCreated,
  friends = [],
}: ReelCreateModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ReelVisibility>(
    ReelVisibility.PUBLIC
  );
  const [customAllowedUsers, setCustomAllowedUsers] = useState<number[]>([]);
  const [ttlHours, setTtlHours] = useState<number>(24);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(20);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const t = useTranslations("reel");

  // Filter friends based on search
  const filteredFriends = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return friends;
    return friends.filter((f) =>
      f.fullName?. toLowerCase().includes(keyword)
    );
  }, [friends, searchQuery]);

  // Reset state khi đóng modal
  const handleClose = () => {
    setFile(null);
    setVideoPreview(null);
    setVisibility(ReelVisibility.PUBLIC);
    setCustomAllowedUsers([]);
    setTtlHours(24);
    setIsUploading(false);
    setSearchQuery("");
    setVisibleCount(20);
    onClose();
  };

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setVideoPreview(URL.createObjectURL(f));
    }
  };

  const handleCreateReel = async () => {
    if (!file) return Toast.error(t("chooseVideoFirst"));

    try {
      setIsUploading(true);
      const videoUrl = await uploadCloudinaryVideoSingle(file);

      const payload:  CreateReelRequest = {
        userId,
        videoUrl,
        visibilityType: visibility,
        customAllowedUserIds:
          visibility === ReelVisibility.CUSTOM ? customAllowedUsers : [],
        ttlHours,
      };

      await reelService.create(payload);
      Toast.success(t("createReelSuccess") || "Reel created successfully!");
      handleClose();
      onCreated?.();
    } catch (err) {
      console.error(err);
      Toast.error(t("createReelError"));
    } finally {
      setIsUploading(false);
    }
  };

  const toggleUser = (id: number) => {
    setCustomAllowedUsers((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      return [...prev, id];
    });
  };

  // Infinite scroll handler
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
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
      <DialogContent className="w-[95%] md:max-w-lg bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70] max-h-[90vh] flex flex-col">
        {/* Header */}
        <DialogHeader className="flex items-center justify-center h-14 border-b bg-gradient-to-r from-green-50 to-white z-10 relative shrink-0">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none flex items-center gap-2">
            <Video className="w-4 h-4 text-green-600" />
            {t("createNewReel")}
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover: text-gray-900"
              aria-label="Close"
              onClick={handleClose}
              disabled={isUploading}
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Body */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto scroll-custom">
          {/* Video Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Upload className="w-4 h-4 text-green-600" />
              {t("chooseVideo")}
            </label>

            {! videoPreview ?  (
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-500 transition-colors bg-gray-50 hover:bg-green-50">
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Video className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      {t("clickToUpload")}
                    </p>
                    <p className="text-xs text-gray-500">
                      {t("videoFormatsSupported")}
                    </p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            ) : (
              <div className="relative">
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded-lg border shadow-sm max-h-[300px] object-contain bg-black"
                />
                <button
                  onClick={() => {
                    setFile(null);
                    setVideoPreview(null);
                  }}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg"
                  disabled={isUploading}
                >
                  <X size={16} />
                </button>
                <div className="mt-2 flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded p-2">
                  <Video className="w-4 h-4" />
                  <span className="truncate flex-1">{file?.name}</span>
                  <span className="text-gray-400">
                    {(file! .size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Visibility Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Users className="w-4 h-4 text-green-600" />
              {t("chooseAudience")}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setVisibility(ReelVisibility.PUBLIC)}
                disabled={isUploading}
                className={`flex flex-col items-center gap-1. 5 p-3 rounded-lg border-2 transition-all ${
                  visibility === ReelVisibility. PUBLIC
                    ? "bg-green-50 border-green-600 text-green-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-medium">{t("public")}</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility(ReelVisibility. PRIVATE)}
                disabled={isUploading}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                  visibility === ReelVisibility.PRIVATE
                    ? "bg-green-50 border-green-600 text-green-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Lock className="w-5 h-5" />
                <span className="text-xs font-medium">{t("private")}</span>
              </button>

              <button
                type="button"
                onClick={() => setVisibility(ReelVisibility.CUSTOM)}
                disabled={isUploading}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 transition-all ${
                  visibility === ReelVisibility.CUSTOM
                    ? "bg-green-50 border-green-600 text-green-700"
                    :  "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="text-xs font-medium">{t("custom")}</span>
              </button>
            </div>
          </div>

          {/* Custom Friends Selection */}
          {visibility === ReelVisibility.CUSTOM && (
            <div className="space-y-2">
              {/* Selected Counter */}
              {customAllowedUsers.length > 0 && (
                <div className="flex items-center justify-between py-2 px-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-800">
                    {t("selected")}: {customAllowedUsers. length}
                  </span>
                  <button
                    onClick={() => setCustomAllowedUsers([])}
                    className="text-xs text-green-600 hover:text-green-800 font-medium underline"
                    disabled={isUploading}
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
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  disabled={isUploading}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={isUploading}
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
                      {searchQuery ?  t("noFriendsFound") : t("noFriends")}
                    </p>
                  </div>
                ) : (
                  <>
                    {filteredFriends.slice(0, visibleCount).map((f) => {
                      const isSelected = customAllowedUsers.includes(f.id);
                      const fallbackLetter =
                        f.fullName?.[0]?.toUpperCase() || "? ";

                      return (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => toggleUser(f.id)}
                          disabled={isUploading}
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
                                src={f. avatarUrl}
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
                                ?  "bg-green-600 border-green-600"
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

          {/* TTL Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock className="w-4 h-4 text-green-600" />
              {t("ttlHours")}
            </label>
            <div className="flex gap-2">
              {[24, 48, 72].map((hours) => (
                <button
                  key={hours}
                  type="button"
                  onClick={() => setTtlHours(hours)}
                  disabled={isUploading}
                  className={`flex-1 py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                    ttlHours === hours
                      ? "bg-green-50 border-green-600 text-green-700"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {hours}h
                </button>
              ))}
            </div>
            <input
              type="number"
              min={1}
              max={168}
              value={ttlHours}
              onChange={(e) => setTtlHours(Number(e.target.value))}
              disabled={isUploading}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder={t("customHours")}
            />
            <p className="text-xs text-gray-500">
              {t("ttlDescription")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 border-t bg-gray-50 flex justify-end gap-2 shrink-0">
          <button
            className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium text-sm transition-colors"
            onClick={handleClose}
            disabled={isUploading}
          >
            {t("cancel")}
          </button>
          <button
            onClick={handleCreateReel}
            disabled={isUploading || !file}
            className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 ${
              isUploading || ! file
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("creating")}
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                {t("createReel")}
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}