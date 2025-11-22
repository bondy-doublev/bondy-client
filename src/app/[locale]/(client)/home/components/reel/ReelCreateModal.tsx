"use client";

import { ReelVisibility } from "@/enums";
import { reelService } from "@/services/reelService";
import { uploadCloudinaryVideoSingle } from "@/services/uploadService";
import { CreateReelRequest } from "@/types/request";
import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { X, Globe, Lock } from "lucide-react";
import User from "@/models/User";

interface Friend {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

interface ReelResponse {
  id: number;
  videoUrl: string;
  owner: { id: number; fullName: string; avatarUrl?: string };
  createdAt: string;
  viewCount: number;
}

interface ReelCreateModalProps {
  userId: number;
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback sau khi tạo xong
  friends?: User[];
  isViewOnly?: boolean; // true nếu chỉ xem reel
  initialReels?: ReelResponse[]; // danh sách reels để xem
}

export default function ReelCreateModal({
  userId,
  open,
  onClose,
  onCreated,
  friends = [],
  isViewOnly = false,
  initialReels = [],
}: ReelCreateModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<ReelVisibility>(
    ReelVisibility.PUBLIC
  );
  const [customAllowedUsers, setCustomAllowedUsers] = useState<number[]>([]);
  const [ttlHours, setTtlHours] = useState<number>(24);
  const [isUploading, setIsUploading] = useState(false);

  // Chỉ dùng cho chế độ xem reel
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setCurrentIndex(0); // reset index khi open modal xem
  }, [open, initialReels]);

  if (!open) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setVideoPreview(URL.createObjectURL(f));
    }
  };

  const handleCreateReel = async () => {
    if (!file) return alert("Chọn video trước nha");

    try {
      setIsUploading(true);
      const videoUrl = await uploadCloudinaryVideoSingle(file);

      const payload: CreateReelRequest = {
        userId,
        videoUrl,
        visibilityType: visibility,
        customAllowedUserIds: visibility === "CUSTOM" ? customAllowedUsers : [],
        ttlHours,
      };

      await reelService.create(payload);
      alert("Tạo reel thành công!");
      onClose();
      onCreated?.();
    } catch (err) {
      console.error(err);
      alert("Lỗi tạo reel");
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

  // Auto next video khi xem
  const handleEnded = () => {
    if (!initialReels || initialReels.length === 0) return;
    setCurrentIndex((prev) =>
      prev + 1 < initialReels.length ? prev + 1 : prev
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
      <DialogContent className="w-[95%] md:max-w-md bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70]">
        <DialogHeader className="relative flex items-center justify-center h-14 border-b bg-white/90">
          <DialogTitle className="text-base font-semibold text-gray-800">
            {isViewOnly ? "Reels" : "Tạo Reel mới"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-4">
          {isViewOnly ? (
            <>
              {initialReels.length === 0 ? (
                <p className="text-gray-500 text-sm mt-4">Không có reel nào</p>
              ) : (
                <div className="relative -mx-4 -mb-4">
                  {/* Progress bars - overlay trên video */}
                  <div className="absolute top-2 left-4 right-4 flex gap-1 z-20">
                    {initialReels.map((_, idx) => (
                      <div
                        key={idx}
                        className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                          idx === currentIndex
                            ? "bg-white"
                            : idx < currentIndex
                            ? "bg-white/70"
                            : "bg-white/30"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Header với avatar + tên - overlay */}
                  <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-20">
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          initialReels[currentIndex].owner.avatarUrl ||
                          "/images/fallback/user.png"
                        }
                        alt={initialReels[currentIndex].owner.fullName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
                      />
                      <div>
                        <span className="font-semibold text-white text-sm drop-shadow-lg">
                          {initialReels[currentIndex].owner.fullName}
                        </span>
                        <p className="text-white/80 text-xs drop-shadow-lg">
                          {new Date(
                            initialReels[currentIndex].createdAt
                          ).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Video container */}
                  <div className="relative bg-black">
                    <video
                      ref={videoRef}
                      key={initialReels[currentIndex].id}
                      src={initialReels[currentIndex].videoUrl}
                      autoPlay
                      loop={false}
                      onEnded={handleEnded}
                      playsInline
                      className="w-full max-h-[70vh] object-contain"
                    />

                    {/* Navigation buttons */}
                    {currentIndex > 0 && (
                      <button
                        onClick={() => setCurrentIndex((prev) => prev - 1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all z-10"
                      >
                        ‹
                      </button>
                    )}
                    {currentIndex < initialReels.length - 1 && (
                      <button
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all z-10"
                      >
                        ›
                      </button>
                    )}
                  </div>

                  {/* Bottom info bar */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-16 pb-4 px-4 z-10">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path
                              fillRule="evenodd"
                              d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          {initialReels[currentIndex].viewCount}
                        </span>
                      </div>
                      <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                        {currentIndex + 1} / {initialReels.length}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* CHẾ ĐỘ TẠO REEL */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Chọn video:
                </label>
                <label className="cursor-pointer px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center">
                  {file ? file.name : "Chọn tệp video"}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {videoPreview && (
                <video
                  src={videoPreview}
                  controls
                  className="w-full rounded border mt-2 max-h-[400px] object-contain"
                />
              )}

              {/* Visibility */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">
                  Chọn người xem:
                </label>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setVisibility(ReelVisibility.PUBLIC)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                      visibility === ReelVisibility.PUBLIC
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <Globe size={14} /> Công khai
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility(ReelVisibility.PRIVATE)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                      visibility === ReelVisibility.PRIVATE
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <Lock size={14} /> Riêng tư
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisibility(ReelVisibility.CUSTOM)}
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                      visibility === ReelVisibility.CUSTOM
                        ? "bg-green-600 text-white border-green-600"
                        : "bg-white text-gray-700"
                    }`}
                  >
                    <Lock size={14} /> Tùy chọn
                  </button>
                </div>
              </div>

              {/* Custom user list */}
              {visibility === ReelVisibility.CUSTOM && (
                <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                  {friends.map((f) => (
                    <label
                      key={f.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={customAllowedUsers.includes(f.id)}
                        onChange={() => toggleUser(f.id)}
                      />
                      {f.avatarUrl && (
                        <img
                          src={f.avatarUrl || "images/fallback/user.png"}
                          alt={f.fullName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      )}
                      <span className="text-sm">{f.fullName}</span>
                    </label>
                  ))}
                  {friends.length === 0 && (
                    <p className="text-xs text-gray-500">Bạn chưa có bạn bè</p>
                  )}
                </div>
              )}

              {/* TTL */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Thời gian tồn tại (giờ)
                </label>
                <input
                  type="number"
                  min={1}
                  value={ttlHours}
                  onChange={(e) => setTtlHours(Number(e.target.value))}
                  className="w-full p-2 border rounded"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-2">
                <button
                  className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300"
                  onClick={onClose}
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateReel}
                  disabled={isUploading}
                  className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {isUploading ? "Đang tạo..." : "Tạo reel"}
                </button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
