"use client";

import { X } from "lucide-react";
import Image from "next/image";
import React from "react";
import { createPortal } from "react-dom";

type MediaModalProps = {
  open: boolean;
  onClose: () => void;
  url: string;
  type: "image" | "video";
};

export default function MediaModal({
  open,
  onClose,
  url,
  type,
}: MediaModalProps) {
  if (!open) return null;

  const modal = (
    <div
      className="
        fixed inset-0 
        z-[9999] 
        flex items-center justify-center 
        bg-black/90 backdrop-blur-sm
      "
      style={{ pointerEvents: "auto" }}
    >
      {/* Nút đóng */}
      <button
        onClick={onClose}
        className="absolute top-4 right-6 bg-black/60 hover:bg-black/80 p-2 rounded-full z-[10000]"
      >
        <X className="text-white w-5 h-5" />
      </button>

      {type === "video" ? (
        <video
          src={url}
          controls
          autoPlay
          playsInline
          className="rounded-lg shadow-lg"
          style={{
            maxWidth: "95vw",
            maxHeight: "90vh",
            cursor: "pointer",
          }}
        />
      ) : (
        <Image
          src={url}
          alt="media"
          width={1200}
          height={900}
          className="rounded-lg object-contain shadow-lg"
          style={{
            maxWidth: "95vw",
            maxHeight: "90vh",
          }}
        />
      )}
    </div>
  );

  // ✅ render portal ra body để không bị Dialog cắt
  return typeof window !== "undefined"
    ? createPortal(modal, document.body)
    : null;
}
