"use client";

import React, { useState, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function PostContent({
  content,
  urls = [],
}: {
  content: string;
  urls?: Array<string>;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    onSelect();
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  return (
    <div className="space-y-3">
      <p className="text-gray-800 px-4">{content}</p>

      {urls.length > 0 && (
        <div className="relative overflow-hidden">
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {urls.map((url, i) => (
                <div
                  key={i}
                  className="flex-[0_0_100%] relative w-full h-64 sm:h-80"
                >
                  <Image
                    src={url}
                    alt={`post image ${i + 1}`}
                    fill
                    loading="lazy"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Nút điều hướng trái/phải */}
          <button
            onClick={scrollPrev}
            className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white p-1.5 rounded-full transition"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dấu chấm nhỏ */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
            {urls.map((_, i) => (
              <span
                key={i}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  i === selectedIndex ? "bg-white scale-110" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
