import { MediaAttachment } from "@/models/Post";
import { wallService } from "@/services/wallService";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Play } from "lucide-react";
import MediaModal from "./MediaModal";

export default function MediaSidebar({
  className,
  userId,
}: {
  className?: string;
  userId: number;
}) {
  const t = useTranslations("wall");
  const [medias, setMedias] = useState<MediaAttachment[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<MediaAttachment | null>(
    null
  );

  useEffect(() => {
    const fetchMedias = async () => {
      try {
        const data = await wallService.getWallMedias({ userId });
        setMedias(data);
      } catch (error) {
        console.error("Failed to fetch medias:", error);
      }
    };
    fetchMedias();
  }, [userId]);

  return (
    <>
      <aside
        className={`hidden xl:block w-80 bg-white rounded-xl shadow p-4 space-y-4 h-fit ${className}`}
      >
        <h2 className="font-semibold text-gray-700">{t("media")}</h2>

        <ul className="grid grid-cols-3 gap-2">
          {medias.map((media) => {
            const isVideo = media.url.endsWith(".mp4");
            return (
              <li
                key={media.id}
                onClick={() => setSelectedMedia(media)}
                className="relative aspect-square overflow-hidden rounded-md group cursor-pointer"
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
      </aside>

      {/* 🧩 Modal hiển thị media */}
      {selectedMedia && (
        <MediaModal
          open={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          url={selectedMedia.url}
          type={selectedMedia.url.endsWith(".mp4") ? "video" : "image"}
        />
      )}
    </>
  );
}
