"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
} from "@/components/ui/dialog";
import { X, Settings, Eye, Globe, Users, Lock, LockIcon } from "lucide-react";
import { DialogTitle } from "@radix-ui/react-dialog";
import { reelService } from "@/services/reelService";
import { ReelAction } from "@/app/[locale]/(client)/home/components/reel/VisibleReels";
import { resolveFileUrl } from "@/utils/fileUrl";

interface ReelResponse {
  id: number;
  videoUrl: string;
  visibilityType: string;
  customAllowedUserIds?: number[];
  owner: { id: number; fullName: string; avatarUrl?: string };
  createdAt: string;
  viewCount: number;
}

interface ReelViewModalProps {
  currentUserId: number;
  open: boolean;
  onClose: () => void;
  initialReels: any[];
  onOpenEdit: (reel: any) => void;
  onMarkViewdOrRead: (reelId: number, action: ReelAction) => void;
}

export default function ReelViewModal({
  currentUserId,
  open,
  onClose,
  initialReels = [],
  onOpenEdit,
  onMarkViewdOrRead,
}: ReelViewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<number | null>(null);
  const [progress, setProgress] = useState(0);

  const handleEnded = useCallback(() => {
    if (currentIndex < initialReels.length - 1) setCurrentIndex((p) => p + 1);
    else onClose();
  }, [currentIndex, initialReels.length, onClose]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((p) => p - 1);
  }, [currentIndex]);

  const handleNext = useCallback(() => {
    if (currentIndex < initialReels.length - 1) setCurrentIndex((p) => p + 1);
    else onClose();
  }, [currentIndex, initialReels.length, onClose]);

  useEffect(() => {
    if (open) setCurrentIndex(0);
  }, [open]);

  // === FIX autoplay bằng cách dùng onOpenAutoFocus trong DialogContent ===
  const handleAutoPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    const p = video.play();
    if (p) {
      p.then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  useEffect(() => {
    if (!open) {
      if (videoRef.current) videoRef.current.pause();
      return;
    }
    handleAutoPlay();

    if (progressTimerRef.current) {
      cancelAnimationFrame(progressTimerRef.current);
      progressTimerRef.current = null;
    }
  }, [open, currentIndex]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlaying) return;

    const animate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      progressTimerRef.current = requestAnimationFrame(animate);
    };

    progressTimerRef.current = requestAnimationFrame(animate);

    return () => {
      if (progressTimerRef.current)
        cancelAnimationFrame(progressTimerRef.current);
      setProgress(0);
    };
  }, [currentIndex, isPlaying]);

  const handleNavigationClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX;
    const mid = rect.left + rect.width / 2;

    if (clickX < mid) {
      handlePrev();
    } else {
      handleNext();
    }
  };

  const currentReel = initialReels[currentIndex];
  const isOwner = currentReel?.owner?.id === currentUserId;

  useEffect(() => {
    if (!open || !currentReel) return;

    (async () => {
      try {
        await reelService.markViewed(currentReel.id, currentUserId);
        onMarkViewdOrRead(currentReel.id, "viewed");
      } catch (error) {
        console.error("Failed to mark reel viewed", error);
      }

      try {
        await reelService.markRead(currentReel.id, currentUserId);
        onMarkViewdOrRead(currentReel.id, "read");
      } catch (error) {
        console.error("Failed to mark reel read", error);
      }
    })();
  }, [open, currentReel?.id, currentIndex, currentUserId]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]" />

      <DialogHeader className="sr-only">
        <DialogTitle>Reel Viewer</DialogTitle>
      </DialogHeader>

      <DialogContent
        className="w-[98%] md:max-w-md h-[95vh] md:h-[90vh] bg-black rounded-xl shadow-2xl p-0 overflow-hidden z-[70] flex flex-col"
        onPointerDownOutside={(e) => e.preventDefault()}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          setTimeout(() => handleAutoPlay(), 0);
        }}
      >
        {/* Progress bars */}
        <div className="absolute top-2 left-3 right-3 flex gap-1 z-20">
          {initialReels.map((reel, idx) => (
            <div
              key={reel.id}
              className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: `${
                    idx < currentIndex
                      ? 100
                      : idx === currentIndex
                      ? progress
                      : 0
                  }%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 left-4 right-4 flex items-start justify-between z-20">
          <div className="flex items-center gap-3">
            <img
              src={
                resolveFileUrl(currentReel?.owner?.avatarUrl) ||
                "/images/fallback/user.png"
              }
              alt={currentReel?.owner?.fullName}
              className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-lg"
            />
            <div>
              <span className="font-semibold text-white text-sm drop-shadow-lg">
                {currentReel?.owner?.fullName}
              </span>
              <div className="flex items-center justify-start">
                {currentReel?.visibilityType === "PUBLIC" && (
                  <Globe size={16} className="text-white" />
                )}
                {currentReel?.visibilityType === "PRIVATE" && (
                  <LockIcon size={16} className="text-white" />
                )}
                {currentReel?.visibilityType === "CUSTOM" && (
                  <Users size={16} className="text-white" />
                )}
                <p className="text-white/80 text-xs drop-shadow-lg ml-2">
                  {new Date(currentReel?.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <button
                onClick={() => onOpenEdit(currentReel)}
                className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition text-white"
              >
                <Settings size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/30 hover:bg-black/50 transition text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ===== VIDEO WRAPPER (FIX CHE HEADER) ===== */}
        <div className="flex-1 relative min-h-0 pt-24">
          <video
            ref={videoRef}
            key={currentReel?.id}
            src={resolveFileUrl(currentReel?.videoUrl)}
            onEnded={handleEnded}
            onClick={() => {
              const v = videoRef.current;
              if (!v) return;
              if (isPlaying) v.pause();
              else v.play();
              setIsPlaying(!isPlaying);
            }}
            playsInline
            className="w-full h-full object-contain"
          />

          {/* Click vùng trái/phải để next/prev */}
          <div
            className="absolute inset-0 flex items-center justify-between z-10"
            onClick={handleNavigationClick}
          >
            <div
              className={`w-1/3 h-full ${
                currentIndex === 0 ? "opacity-0" : "opacity-100"
              }`}
            />
            <div
              className={`w-1/3 h-full ${
                currentIndex === initialReels.length - 1
                  ? "opacity-0"
                  : "opacity-100"
              }`}
            />
          </div>

          {/* Play overlay */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center text-white">
                <svg
                  width="32"
                  height="32"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 flex justify-between items-center bg-black/10 z-20 relative">
          <div className="flex items-center gap-2 text-sm text-white drop-shadow-lg">
            <Eye size={16} />
            <span>{currentReel?.viewCount} lượt xem</span>
          </div>
          <span className="text-xs font-medium text-white/80">
            {currentIndex + 1} / {initialReels.length}
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
