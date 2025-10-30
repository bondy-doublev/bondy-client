"use client";

import { MediaAttachment } from "@/models/Post";
import { wallService } from "@/services/wallService";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import MediaModal from "./MediaModal";

export default function MediaSidebar({
  className,
  userId,
  onSeeAll,
  isDetail = false,
}: {
  className?: string;
  userId: number;
  onSeeAll?: () => void;
  isDetail?: boolean;
}) {
  const t = useTranslations("wall");
  const [medias, setMedias] = useState<MediaAttachment[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaAttachment | null>(
    null
  );
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // ✅ Fix layout shift bằng cách giữ tham chiếu container
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch media
  const fetchMedias = async (page: number, reset = false) => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await wallService.getWallMedias({
        userId,
        page,
        size: 9,
      });

      if (!data || data.length < 9) {
        setHasMore(false);
      }

      setMedias((prev) => (reset ? data : [...prev, ...data]));
    } catch (error) {
      console.error("Failed to fetch medias:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load page đầu tiên
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchMedias(0, true);
  }, [userId]);

  // Fetch khi page thay đổi (chỉ nếu isDetail)
  useEffect(() => {
    if (isDetail && page > 0) fetchMedias(page);
  }, [page, isDetail]);

  // Infinite scroll (chỉ bật khi isDetail)
  useEffect(() => {
    if (!isDetail) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.2 }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore, isDetail]);

  return (
    <>
      <aside
        ref={containerRef}
        className={`${
          !isDetail ? "hidden xl:block" : ""
        } w-80 bg-white rounded-xl shadow p-4 pt-2 space-y-2 h-fit transition-all duration-300 ${className}`}
      >
        {/* Header */}
        <div className="flex justify-between">
          <h2 className="font-semibold text-gray-700 py-2">{t("media")}</h2>

          {medias.length > 0 && onSeeAll && (
            <div className="text-center">
              <button
                onClick={onSeeAll}
                className="text-green-600 hover:bg-green-100 p-2 rounded-md text-sm font-medium"
              >
                {t("seeAllMedias")}
              </button>
            </div>
          )}
        </div>

        {/* Media grid */}
        <ul className="grid grid-cols-3 gap-2">
          {medias.map((media) => {
            const isVideo =
              media.type === "VIDEO" || media.url.endsWith(".mp4");

            return (
              <li
                key={media.id}
                onClick={() => setSelectedMedia(media)}
                className="relative aspect-square overflow-hidden rounded-md group cursor-pointer bg-black"
              >
                {isVideo ? (
                  <>
                    <video
                      src={media.url}
                      className="w-full h-full object-cover brightness-75 group-hover:brightness-100 transition"
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-black/50 rounded-full p-3 group-hover:scale-110 transition-transform">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <Image
                    unoptimized
                    src={media.url}
                    alt="media"
                    fill
                    className="object-cover hover:brightness-90 transition"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                )}
              </li>
            );
          })}
        </ul>

        {/* Loader cho infinite scroll */}
        {isDetail && hasMore && (
          <div ref={loaderRef} className="text-center py-4 text-gray-500">
            {loading ? t("loading") : t("scrollToLoadMore")}
          </div>
        )}
      </aside>

      {/* 🧩 Modal hiển thị media */}
      {selectedMedia && (
        <MediaModal
          open={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          url={selectedMedia.url}
          type={
            selectedMedia.type === "VIDEO" || selectedMedia.url.endsWith(".mp4")
              ? "video"
              : "image"
          }
        />
      )}
    </>
  );
}
