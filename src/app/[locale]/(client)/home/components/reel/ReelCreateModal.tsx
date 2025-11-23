"use client";

import { ReelVisibility } from "@/enums";
import { reelService } from "@/services/reelService";
import { uploadCloudinaryVideoSingle } from "@/services/uploadService";
import { CreateReelRequest } from "@/types/request";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
} from "@/components/ui/dialog";
import { X, Globe, Lock } from "lucide-react";
import User from "@/models/User";

interface ReelCreateModalProps {
  userId: number;
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback sau khi tạo xong
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

  // Reset state khi mở modal
  const handleClose = () => {
    setFile(null);
    setVideoPreview(null);
    setVisibility(ReelVisibility.PUBLIC);
    setCustomAllowedUsers([]);
    setTtlHours(24);
    setIsUploading(false);
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
    if (!file) return alert("Chọn video trước nha");

    try {
      setIsUploading(true);
      const videoUrl = await uploadCloudinaryVideoSingle(file);

      const payload: CreateReelRequest = {
        userId,
        videoUrl,
        visibilityType: visibility,
        customAllowedUserIds:
          visibility === ReelVisibility.CUSTOM ? customAllowedUsers : [],
        ttlHours,
      };

      await reelService.create(payload);
      handleClose();
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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
      <DialogContent className="w-[95%] md:max-w-md bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70]">
        <DialogHeader className="relative flex items-center justify-center h-14 border-b bg-white/90">
          <DialogTitle className="text-base font-semibold text-gray-800">
            Tạo Reel mới
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </DialogHeader>

        <div className="px-4 pb-4 space-y-4">
          {/* Chọn video */}
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
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                  />
                  <img
                    src={f.avatarUrl || "/images/fallback/user.png"}
                    alt={f.fullName}
                    className="w-6 h-6 rounded-full object-cover"
                  />
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
          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              className="px-3 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300"
              onClick={handleClose}
            >
              Hủy
            </button>
            <button
              onClick={handleCreateReel}
              disabled={isUploading || !file}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUploading ? "Đang tạo..." : "Tạo reel"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
