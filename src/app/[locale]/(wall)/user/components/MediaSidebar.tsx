"use client";

import { MediaAttachment } from "@/models/Post";
import { wallService } from "@/services/wallService";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import MediaModal from "./MediaModal";
import Link from "next/link";

type ModalItem = {
  url: string;
  type: "image" | "video";
};

export default function MediaSidebar({
  className,
  userId,
  isDetail = false,
}: {
  className?: string;
  userId: number;
  isDetail?: boolean;
}) {
  const t = useTranslations("wall");
  const [medias, setMedias] = useState<MediaAttachment[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // index của media đang mở trong modal (null = không mở)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const loaderRef = useRef<HTMLDivElement | null>(null);
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

  // Load page đầu tiên khi đổi user
  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchMedias(0, true);
    setSelectedIndex(null); // đóng modal nếu đang mở
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

  const handleModalReachEnd = () => {
    // tuỳ bạn, nếu chỉ muốn load thêm ở trang detail:
    if (!isDetail) return;

    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  // map medias -> items cho modal
  const modalItems: ModalItem[] = medias.map((media) => {
    const isVideo = media.type === "VIDEO" || media.url.endsWith(".mp4");
    return {
      url: media.url,
      type: isVideo ? "video" : "image",
    };
  });

  return (
    <>
      <aside
        ref={containerRef}
        className={`${
          !isDetail ? "hidden xl:block" : ""
        } w-80 bg-white rounded-xl shadow p-4 pt-2 space-y-2 h-fit transition-all duration-300 ${className}`}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-gray-700 py-2">{t("media")}</h2>

          {medias.length > 0 && !isDetail && (
            <div className="text-center">
              <Link
                href={`/user/${userId}/media`}
                className="text-green-600 hover:bg-green-100 p-2 rounded-md text-sm font-medium"
              >
                {t("seeAllMedias")}
              </Link>
            </div>
          )}
        </div>

        {/* Media grid */}
        <ul className="grid grid-cols-3 gap-2">
          {medias.map((media, index) => {
            const isVideo =
              media.type === "VIDEO" || media.url.endsWith(".mp4");

            return (
              <li
                key={media.id}
                onClick={() => setSelectedIndex(index)}
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

      {/* Modal hiển thị media (có thể next/prev) */}
      {selectedIndex !== null && modalItems.length > 0 && (
        <MediaModal
          open={selectedIndex !== null}
          onClose={() => setSelectedIndex(null)}
          items={modalItems}
          initialIndex={selectedIndex}
          onReachEnd={handleModalReachEnd}
        />
      )}
    </>
  );
}
