"use client";

import { resolveFileUrl } from "@/utils/fileUrl";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

type ModalItem = {
  url: string;
  type: "image" | "video";
};

type MediaModalProps = {
  open: boolean;
  onClose: () => void;
  items: ModalItem[];
  initialIndex?: number;
  onReachEnd?: () => void;
};

export default function MediaModal({
  open,
  onClose,
  items,
  initialIndex = 0,
  onReachEnd,
}: MediaModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // nhớ lần click Next ở cuối để đợi load xong thì nhảy tiếp
  const pendingAdvanceRef = useRef(false);
  const prevLengthRef = useRef(items.length);

  // ✅ chỉ reset index khi modal mở lại hoặc initialIndex đổi
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
      pendingAdvanceRef.current = false;
      prevLengthRef.current = items.length;
    }
  }, [open, initialIndex]); // ❌ bỏ items.length ở đây

  // Khi items.length thay đổi (parent load thêm), nếu đang pendingAdvance → tự advance
  useEffect(() => {
    const prevLen = prevLengthRef.current;
    const currLen = items.length;

    if (currLen > prevLen && pendingAdvanceRef.current) {
      setCurrentIndex((prev) => Math.min(prev + 1, currLen - 1));
      pendingAdvanceRef.current = false;
    }

    prevLengthRef.current = currLen;
  }, [items.length]);

  if (!open || items.length === 0) return null;

  const current = items[currentIndex];

  const handleOverlayClick = () => {
    onClose();
  };

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  const goPrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? items.length - 1 : prev - 1));
    pendingAdvanceRef.current = false;
  };

  const goNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();

    const isLast = currentIndex === items.length - 1;

    if (isLast) {
      // đang ở cuối: báo cha load thêm và chờ
      pendingAdvanceRef.current = true;
      onReachEnd?.();
      return;
    }

    setCurrentIndex((prev) => Math.min(prev + 1, items.length - 1));
    pendingAdvanceRef.current = false;
  };

  const modal = (
    <div
      className="
        fixed inset-0 
        z-[9999] 
        flex items-center justify-center 
        bg-black/90 backdrop-blur-sm
      "
      style={{ pointerEvents: "auto" }}
      onClick={handleOverlayClick}
    >
      {/* nút đóng */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-4 right-6 bg-black/60 hover:bg-black/80 p-2 rounded-full z-[10000]"
      >
        <X className="text-white w-5 h-5" />
      </button>

      {/* nút điều hướng */}
      {items.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-[10000]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full z-[10000]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* content wrapper */}
      <div className="relative" onClick={handleContentClick}>
        {current.type === "video" ? (
          <video
            src={resolveFileUrl(current.url)}
            controls
            autoPlay
            playsInline
            className="rounded-lg shadow-lg max-w-[95vw] max-h-[90vh] object-contain"
          />
        ) : (
          <Image
            src={resolveFileUrl(current.url)}
            alt="media"
            width={1200}
            height={900}
            className="rounded-lg shadow-lg object-contain w-auto h-auto max-w-[95vw] max-h-[90vh]"
            sizes="(max-width: 768px) 100vw, 95vw"
            unoptimized
          />
        )}
      </div>

      {/* dot indicator */}
      {items.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
          {items.map((_, i) => (
            <span
              key={i}
              className={`h-2 w-2 rounded-full transition-all ${
                i === currentIndex ? "bg-white scale-110" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
