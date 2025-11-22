"use client";

import { ReelVisibility } from "@/enums";
import { reelService } from "@/services/reelService";
import { UpdateReelVisibilityRequest } from "@/types/request";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Globe, Lock, Trash2, AlertCircle } from "lucide-react";
import User from "@/models/User";

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
  friends?: User[];
}

export default function ReelEditModal({
  reel,
  currentUserId,
  open,
  onClose,
  onUpdated,
  onDeleted,
  friends = [],
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

  if (!open) return null;

  const isOwner = reel.owner.id === currentUserId;

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

      onClose();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      alert("Lỗi cập nhật reel");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!isOwner) return;

    try {
      setIsDeleting(true);
      await reelService.delete(reel.id, currentUserId);
      setShowDeleteConfirm(false);
      onClose();
      onDeleted?.();
    } catch (err) {
      console.error(err);
      alert("Lỗi xóa reel");
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

  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
        <DialogContent className="w-[95%] md:max-w-md bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70]">
          <DialogHeader className="flex items-center justify-between px-4 py-2 bg-green-600 backdrop-blur-md z-20">
            <DialogTitle className="text-sm md:text-base font-semibold text-white">
              Chỉnh sửa Reel
            </DialogTitle>
          </DialogHeader>

          <div className="p-4 space-y-4">
            {/* Owner Info */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <img
                src={reel.owner.avatarUrl || "/images/fallback/user.png"}
                alt={reel.owner.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-medium text-sm text-gray-900">
                  {reel.owner.fullName}
                </p>
                <p className="text-xs text-gray-500">Chủ sở hữu</p>
              </div>
            </div>

            {/* Video Preview */}
            <div className="relative rounded-lg overflow-hidden bg-black">
              <video
                src={reel.videoUrl}
                controls
                className="w-full max-h-[300px] object-contain"
              />
            </div>

            {isOwner ? (
              <>
                {/* Visibility Settings */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Quyền xem:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setVisibility(ReelVisibility.PUBLIC)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${
                        visibility === ReelVisibility.PUBLIC
                          ? "bg-green-600 text-white border-green-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                      }`}
                    >
                      <Globe size={14} /> Công khai
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility(ReelVisibility.PRIVATE)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${
                        visibility === ReelVisibility.PRIVATE
                          ? "bg-green-600 text-white border-green-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                      }`}
                    >
                      <Lock size={14} /> Riêng tư
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibility(ReelVisibility.CUSTOM)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all ${
                        visibility === ReelVisibility.CUSTOM
                          ? "bg-green-600 text-white border-green-600 shadow-sm"
                          : "bg-white text-gray-700 border-gray-300 hover:border-green-500"
                      }`}
                    >
                      <Lock size={14} /> Tùy chọn
                    </button>
                  </div>
                </div>

                {/* Custom User Selection */}
                {visibility === ReelVisibility.CUSTOM && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Chọn người được xem ({customAllowedUsers.length})
                    </label>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1 bg-gray-50">
                      {friends.map((f) => (
                        <label
                          key={f.id}
                          className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded-lg transition-colors"
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
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {f.fullName}
                          </span>
                        </label>
                      ))}
                      {friends.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-4">
                          Bạn chưa có bạn bè nào
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <button
                    onClick={handleUpdateVisibility}
                    disabled={isUpdating}
                    className="w-full px-4 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                    className="w-full px-4 py-2.5 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={16} />
                    Xóa reel
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Bạn không có quyền chỉnh sửa reel này
                </p>
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
                  Xóa reel?
                </DialogTitle>
                <p className="text-sm text-gray-500 mt-0.5">
                  Hành động này không thể hoàn tác
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="px-5 pb-5 space-y-3">
            <p className="text-sm text-gray-600">
              Reel của bạn sẽ bị xóa vĩnh viễn và không thể khôi phục lại.
            </p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isDeleting ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
