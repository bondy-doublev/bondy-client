"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/authStore";
import { X } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { BiSolidImage } from "react-icons/bi";
import { FaVideo, FaUserTag } from "react-icons/fa";

export default function PostComposerModal({
  t,
  showModal,
  onClose,
  placeholder,
}: {
  t: (key: string) => string;
  showModal: boolean;
  onClose: () => void;
  placeholder: string;
}) {
  const { user } = useAuthStore();
  const fullname =
    (user?.firstName ?? "") +
    " " +
    (user?.lastName ?? "") +
    " " +
    (user?.middleName ?? "");

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState<string>(""); // plain text

  const handleImageClick = () => imageInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (type === "image") {
      setSelectedImage(url);
      setSelectedVideo(null);
    } else {
      setSelectedVideo(url);
      setSelectedImage(null);
    }
  };

  const handleEditorInput = () => {
    const el = editorRef.current;
    if (!el) return;

    const text = el.innerText;

    // Nếu dài hơn 1000 ký tự → cắt bớt và reset lại DOM
    if (text.length > 1000) {
      el.innerText = text.slice(0, 1000);
      placeCaretAtEnd(el); // Giữ con trỏ ở cuối
    }

    setContent(el.innerText);
  };

  // Hàm phụ giúp giữ caret ở cuối sau khi sửa innerText
  function placeCaretAtEnd(el: HTMLElement) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage);
      if (selectedVideo) URL.revokeObjectURL(selectedVideo);
    };
  }, [selectedImage, selectedVideo]);

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30" />
      <DialogContent
        className="
          w-[90%] md:w-full md:max-w-xl min-h-[60%] max-h-[90%] bg-white rounded-2xl shadow-xl p-0 gap-0 flex flex-col overflow-hidden data-[state=open]:animate-none"
      >
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10">
          {/* Title ở giữa */}
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("createNewPost")}
          </DialogTitle>

          {/* Nút đóng */}
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* User */}
          <div className="flex items-center gap-2 p-4 pb-2 shrink-0">
            {user?.avatarUrl ? (
              <UserAvatar avatarUrl={user?.avatarUrl} />
            ) : (
              <DefaultAvatar firstName={user?.firstName} />
            )}
            <UserName fullname={fullname.trim()} />
          </div>

          {/* Content area */}
          <div className="px-4 flex-1 overflow-y-auto scroll-custom">
            <div
              ref={editorRef}
              contentEditable
              role="textbox"
              spellCheck
              onInput={handleEditorInput}
              data-placeholder={placeholder}
              className={`
                relative editable outline-none border-none ring-0
                text-gray-900 whitespace-pre-wrap break-words min-h-[120px] pb-4
                before:absolute before:text-gray-400 before:content-[attr(data-placeholder)]
                before:pointer-events-none before:select-none
                ${content.trim() === "" ? "before:block" : "before:hidden"}
              `}
            />

            {/* Image preview */}
            {selectedImage && (
              <div className="mt-2 w-full max-h-[60vh]">
                <Image
                  src={selectedImage}
                  alt="preview"
                  width={800}
                  height={800}
                  sizes="100vw"
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            {/* Video preview */}
            {selectedVideo && (
              <div className="mt-2">
                <video
                  src={selectedVideo}
                  controls
                  className="w-full max-h-[60vh]"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 space-y-4 shrink-0">
            <div className="flex justify-between items-center rounded-md border p-3">
              <p className="text-sm text-gray-700">
                {t("addToYourPost") ?? "Thêm vào bài viết của bạn"}
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="rounded-md hover:bg-gray-200 transition p-2"
                  onClick={handleImageClick}
                >
                  <BiSolidImage color="blue" size={24} />
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={imageInputRef}
                  onChange={(e) => handleFileChange(e, "image")}
                  className="hidden"
                />

                <button
                  type="button"
                  className="rounded-md hover:bg-gray-200 transition p-2"
                  onClick={handleVideoClick}
                >
                  <FaVideo color="red" size={24} />
                </button>
                <input
                  type="file"
                  accept="video/*"
                  ref={videoInputRef}
                  onChange={(e) => handleFileChange(e, "video")}
                  className="hidden"
                />

                <button className="rounded-md hover:bg-gray-200 transition p-2">
                  <FaUserTag color="green" size={24} />
                </button>
              </div>
            </div>

            <Button
              className="bg-green-600 hover:bg-green-700 w-full"
              onClick={() => {
                console.log({ content, selectedImage, selectedVideo });
              }}
            >
              Đăng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
