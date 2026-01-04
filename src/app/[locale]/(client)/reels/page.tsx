"use client";

import { useEffect, useRef, useState } from "react";
import {
  Eye,
  Globe,
  Users,
  Lock,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Play,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Reel } from "@/models/Reel";
import { reelService } from "@/services/reelService";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { resolveFileUrl } from "@/utils/fileUrl";
import { useTranslations } from "use-intl";

export default function ReelsPage() {
  const t = useTranslations("reel");
  const { user } = useAuthStore();
  const router = useRouter();

  const [reels, setReels] = useState<Reel[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("reel");

  // 🔊 mặc định BẬT tiếng
  const [muted, setMuted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [pausedIndex, setPausedIndex] = useState<number | null>(null);

  const viewedReelsRef = useRef<Set<number>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  /* ================= FETCH ================= */

  const loadReels = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const data = await reelService.getPublicReels(page, 5);
      if (!data.length) {
        setHasMore(false);
      } else {
        setReels((prev) => [...prev, ...data]);
        setPage((p) => p + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReels();
  }, []);

  const handleGoToProfile = (userId: number) => {
    router.push(`/user/${userId}`);
  };

  /* ================= AUTOPLAY + MARK VIEW ================= */

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          const index = videoRefs.current.indexOf(video);
          const reel = reels[index];
          if (!reel) return;

          if (entry.isIntersecting) {
            setActiveIndex(index);
            setPausedIndex(null);

            video.currentTime = 0;
            video.muted = muted;
            video.play().catch(() => {});

            if (user?.id && !viewedReelsRef.current.has(reel.id)) {
              viewedReelsRef.current.add(reel.id);
              reelService.markViewed(reel.id, user.id);
              reelService.markRead(reel.id, user.id);
            }
          } else {
            video.pause();
          }
        });
      },
      { root: containerRef.current, threshold: 0.6 }
    );

    videoRefs.current.forEach((v) => v && observer.observe(v));
    return () => observer.disconnect();
  }, [reels, muted, user?.id]);

  /* ================= LOAD MORE ================= */

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onScroll = () => {
      if (
        el.scrollTop + el.clientHeight >=
        el.scrollHeight - el.clientHeight * 1.5
      ) {
        loadReels();
      }
    };

    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [loading, hasMore]);

  /* ================= CONTROLS ================= */

  const toggleMute = () => {
    setMuted((m) => !m);
    videoRefs.current.forEach((v) => v && (v.muted = !muted));
  };

  const togglePlay = (idx: number) => {
    const video = videoRefs.current[idx];
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
      setPausedIndex(null);
    } else {
      video.pause();
      setPausedIndex(idx);
    }
  };

  /* ================= RENDER ================= */

  return (
    <div className="h-[100vh] bg-gray-100 z-[60]">
      <div
        ref={containerRef}
        className="h-full max-w-[430px] mx-auto overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {/* EMPTY STATE */}
        {!loading && reels.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-500 px-6 text-center">
            <Play size={48} className="mb-3 opacity-50" />
            <p className="text-sm">{t("empty")}</p>
          </div>
        )}

        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            className="relative h-[calc(100vh-40px)] snap-start overflow-hidden"
            onClick={() => togglePlay(idx)}
          >
            {/* BLUR BACKGROUND */}
            <video
              src={resolveFileUrl(reel.videoUrl)}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-40"
            />

            {/* MAIN VIDEO */}
            <video
              src={resolveFileUrl(reel.videoUrl)}
              ref={(el) => (videoRefs.current[idx] = el)}
              playsInline
              loop
              muted={muted}
              className="relative z-10 w-full h-full object-contain"
            />

            {/* PAUSE ICON */}
            {pausedIndex === idx && (
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                  <Play className="text-white ml-1" size={32} />
                </div>
              </div>
            )}

            {/* TOP BAR */}
            <div className="absolute top-3 left-4 right-4 flex justify-between z-20">
              <div
                onClick={() => handleGoToProfile(reel.owner.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Image
                  alt="avatar"
                  width={32}
                  height={32}
                  unoptimized={true}
                  src={
                    resolveFileUrl(reel.owner.avatarUrl) ||
                    "/images/fallback/user.png"
                  }
                  className="w-8 h-8 rounded-full border-2 border-white"
                />
                <span className="text-white text-sm font-semibold">
                  {reel.owner.fullName}
                </span>
              </div>
              <button className="text-white p-2">
                <MoreHorizontal />
              </button>
            </div>

            {/* ACTIONS */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-4 z-20">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
              >
                <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center">
                  {muted ? (
                    <VolumeX className="text-white" />
                  ) : (
                    <Volume2 className="text-white" />
                  )}
                </div>
              </button>
            </div>

            {/* BOTTOM INFO */}
            <div className="absolute bottom-5 left-4 right-20 text-white z-20">
              <div className="flex items-center gap-2 text-xs">
                {reel.visibilityType === "PUBLIC" && <Globe size={14} />}
                {reel.visibilityType === "PRIVATE" && <Lock size={14} />}
                {reel.visibilityType === "CUSTOM" && <Users size={14} />}
                <Eye size={14} />
                <span>{reel.viewCount} {t("views")}</span>
              </div>
            </div>

            {/* PROGRESS BAR */}
            {idx === activeIndex && pausedIndex !== idx && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                <div className="h-full bg-white animate-progress" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="h-24 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && reels.length > 0 && (
          <div className="h-16 flex items-center justify-center text-white/60 text-sm">
            {t("noMoreVideos")}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 15s linear;
        }
      `}</style>
    </div>
  );
}
