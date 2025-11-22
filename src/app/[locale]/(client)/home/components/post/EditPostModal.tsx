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
  DialogClose,
} from "@/components/ui/dialog";
import { X, Globe, Users, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Friend {
  id: number;
  fullName: string;
  avatarUrl?: string;
}

interface ReelCreateModalProps {
  userId: number;
  open: boolean;
  onClose: () => void;
  onCreated?: () => void; // callback sau khi tạo xong
  friends?: Friend[];
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
      <DialogContent className="w-[95%] md:max-w-md bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70]">
        <DialogHeader className="flex items-center justify-center h-14 border-b bg-white relative">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            Tạo Reel mới
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Video Upload */}
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            className="w-full text-sm"
          />

          {videoPreview && (
            <video
              src={videoPreview}
              controls
              className="w-full rounded border mt-2"
            />
          )}

          {/* Visibility */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Chọn người xem:</label>
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
                onClick={() => setVisibility(ReelVisibility.FRIENDS)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                  visibility === ReelVisibility.FRIENDS
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700"
                }`}
              >
                <Users size={14} /> Bạn bè
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
                      src={f.avatarUrl}
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
            <label className="text-sm font-medium text-gray-700">Thời gian tồn tại (giờ)</label>
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
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isUploading ? "Đang tạo..." : "Tạo reel"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
