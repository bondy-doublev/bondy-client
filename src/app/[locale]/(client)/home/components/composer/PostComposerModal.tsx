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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Globe, Lock, X } from "lucide-react";
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
  const [visibility, setVisibility] = useState(true);

  const [selectedFiles, setSelectedFiles] = useState<
    { type: "image" | "video"; url: string }[]
  >([]);

  const editorRef = useRef<HTMLDivElement | null>(null);
  const [content, setContent] = useState<string>("");

  const handleImageClick = () => imageInputRef.current?.click();
  const handleVideoClick = () => videoInputRef.current?.click();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "image" | "video"
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newFiles = files.map((file) => ({
      type,
      url: URL.createObjectURL(file),
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);

    e.target.value = ""; // reset để chọn lại file cũ vẫn được
  };

  const handleEditorInput = () => {
    const el = editorRef.current;
    if (!el) return;

    const text = el.innerText;

    if (text.length > 1000) {
      el.innerText = text.slice(0, 1000);
      placeCaretAtEnd(el);
    }

    setContent(el.innerText);
  };

  function placeCaretAtEnd(el: HTMLElement) {
    const range = document.createRange();
    const sel = window.getSelection();
    range.selectNodeContents(el);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }

  // ✅ Dọn dẹp URL tránh leak memory
  useEffect(() => {
    return () => {
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    };
  }, [selectedFiles]);

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30" />
      <DialogContent
        className="
          w-[90%] md:w-full md:max-w-xl min-h-[60%] max-h-[90%]
          bg-white rounded-2xl shadow-xl p-0 gap-0 flex flex-col
          overflow-hidden data-[state=open]:animate-none
        "
      >
        {/* Header */}
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
          <div className="flex items-center gap-2 p-4 pb-2 shrink-0 relative z-10">
            {user?.avatarUrl ? (
              <UserAvatar avatarUrl={user?.avatarUrl} />
            ) : (
              <DefaultAvatar firstName={user?.firstName} />
            )}
            <div className="flex flex-col">
              <UserName fullname={fullname.trim()} />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 hover:underline transition">
                    {visibility ? (
                      <>
                        <Globe size={14} />
                        <span className="pt-0.5">{t("public")}</span>
                      </>
                    ) : (
                      <>
                        <Lock size={14} />
                        <span className="pt-0.5">{t("private")}</span>
                      </>
                    )}
                  </button>
                </DropdownMenuTrigger>

                {/* 👇 Menu hiển thị phía trên, z-index cao hơn editor */}
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  className="p-2 bg-gray-200 rounded-xl z-[9999]"
                >
                  <DropdownMenuItem
                    onClick={() => setVisibility(true)}
                    className="flex items-center gap-2 rounded-xl cursor-pointer hover:bg-gray-300"
                  >
                    <Globe size={14} />
                    <span className="pt-0.5">{t("public")}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setVisibility(false)}
                    className="flex items-center gap-2 rounded-xl cursor-pointer hover:bg-gray-300"
                  >
                    <Lock size={14} />
                    <span className="pt-0.5">{t("private")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
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

            {/* Preview (ảnh + video chung) */}
            {selectedFiles.length > 0 && (
              <div
                className={`
                  mt-2 grid gap-2
                  ${
                    selectedFiles.length === 1
                      ? "grid-cols-1"
                      : selectedFiles.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-3"
                  }
                `}
              >
                {selectedFiles.map((file) => (
                  <div
                    key={file.url}
                    className="relative group aspect-square overflow-hidden rounded-lg"
                  >
                    {file.type === "image" ? (
                      <Image
                        src={file.url}
                        alt="preview"
                        fill
                        sizes="100vw"
                        className="object-cover"
                      />
                    ) : (
                      <video
                        src={file.url}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedFiles((prev) =>
                          prev.filter((x) => x.url !== file.url)
                        )
                      }
                      className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 transition"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
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
                  multiple
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
                  accept="video/*,.mkv"
                  ref={videoInputRef}
                  onChange={(e) => handleFileChange(e, "video")}
                  className="hidden"
                  multiple
                />

                <button className="rounded-md hover:bg-gray-200 transition p-2">
                  <FaUserTag color="green" size={24} />
                </button>
              </div>
            </div>

            <Button
              className="bg-green-600 hover:bg-green-700 w-full"
              onClick={() => {
                console.log({ content, selectedFiles });
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
