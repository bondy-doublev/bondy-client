"use client";

import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { MediaAttachment } from "@/models/Post";
import MediaModal from "@/app/[locale]/(wall)/wall/components/MediaModal";

type ModalItem = {
  url: string;
  type: "image" | "video";
};

export default function PostContent({
  content,
  mediaAttachments,
}: {
  content: string;
  mediaAttachments: Array<MediaAttachment>;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [modalState, setModalState] = useState<{
    index: number;
    items: ModalItem[];
  } | null>(null);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const openModalAt = (startIndex: number) => {
    const items: ModalItem[] = mediaAttachments.map((media) => {
      const isVideo = media.type === "VIDEO" || media.url.endsWith(".mp4");
      return {
        url: media.url,
        type: isVideo ? "video" : "image",
      };
    });

    setModalState({
      index: startIndex,
      items,
    });
  };

  return (
    <div className="space-y-3">
      {/* text content */}
      {content && (
        <p className="px-4 text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      )}

      {/* media gallery */}
      {mediaAttachments.length > 0 && (
        <div className="relative overflow-hidden">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {mediaAttachments.map((media, i) => {
                const isVideo =
                  media.type === "VIDEO" || media.url.endsWith(".mp4");

                return (
                  <div
                    key={i}
                    className="flex-[0_0_100%] relative w-full h-auto max-w-full flex justify-center items-center bg-black"
                  >
                    {isVideo ? (
                      <div className="relative w-auto h-auto max-h-[80vh]">
                        <video
                          src={media.url}
                          controls
                          preload="metadata"
                          className="max-h-[80vh] w-auto object-contain bg-black"
                        />
                        <button
                          onClick={() => openModalAt(i)}
                          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition z-10"
                          title="Xem chi tiết"
                        >
                          <Maximize2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="relative w-auto h-auto max-h-[80vh]">
                        <Image
                          unoptimized
                          src={media.url}
                          alt={`post media ${i + 1}`}
                          width={800}
                          height={600}
                          priority={i === 0}
                          loading={i === 0 ? undefined : "lazy"}
                          className="max-h-[80vh] w-auto object-contain select-none cursor-pointer"
                          sizes="(max-width: 768px) 100vw, 50vw"
                          onClick={() => openModalAt(i)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* navigation */}
          {mediaAttachments.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                className="absolute top-1/2 left-3 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={scrollNext}
                className="absolute top-1/2 right-3 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition"
              >
                <ChevronRight size={20} />
              </button>

              {/* dots */}
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                {mediaAttachments.map((_, i) => (
                  <span
                    key={i}
                    className={`h-2 w-2 rounded-full transition-all duration-300 ${
                      i === selectedIndex ? "bg-white scale-110" : "bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Modal chi tiết */}
      {modalState && (
        <MediaModal
          open={!!modalState}
          onClose={() => setModalState(null)}
          items={modalState.items}
          initialIndex={modalState.index}
        />
      )}
    </div>
  );
}
