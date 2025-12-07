"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Trash2, Lock, Globe, Plus } from "lucide-react";
import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Post } from "@/models/Post";
import { UserBasic } from "@/models/User";
import { Button } from "@/components/ui/button";
import { postService } from "@/services/postService";
import TagModal from "@/app/[locale]/(client)/home/components/composer/TagModal";

type Props = {
  t: (key: string) => string;
  open: boolean;
  onClose: () => void;
  post: Post;
  onSaved: (updated: Post) => void;
};

export default function EditPostModal({
  t,
  open,
  onClose,
  post,
  onSaved,
}: Props) {
  const [content, setContent] = useState(post.contentText ?? "");
  const [showTagModal, setShowTagModal] = useState(false);
  const [tagged, setTagged] = useState<UserBasic[]>(post.taggedUsers ?? []);
  const [saving, setSaving] = useState(false);

  // share-post? => chỉ cho sửa text
  const isSharePost = !!post.sharedFrom;

  // Visibility
  const [isPublic, setIsPublic] = useState<boolean>(post.visibility ?? true);

  // Chọn media để xoá
  const [selectedForRemove, setSelectedForRemove] = useState<Set<number>>(
    new Set()
  );

  // Media mới thêm
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const tagUserIds = useMemo(() => tagged.map((u) => u.id), [tagged]);

  useEffect(() => {
    setContent(post.contentText ?? "");
    setTagged(post.taggedUsers ?? []);
    setIsPublic(post.visibility ?? true);
    setSelectedForRemove(new Set());
    setNewFiles([]); // reset file mới khi đổi post
  }, [post]);

  const handleSetTagUsers = useCallback((users: UserBasic[]) => {
    setTagged(users);
  }, []);

  const toggleSelectMedia = (id: number) => {
    setSelectedForRemove((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };

  const handlePickFiles = () => fileInputRef.current?.click();

  const handleFilesChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    // Optional: giới hạn client (nên khớp backend)
    const mediaLeft =
      (post.mediaAttachments?.length ?? 0) - selectedForRemove.size;
    const totalAfter = mediaLeft + newFiles.length + files.length;
    const MAX = 20; // nên đồng bộ với PropsConfig
    if (totalAfter > MAX) {
      // bạn có thể thay bằng Toast
      alert(`Tối đa ${MAX} media cho một bài viết.`);
      return;
    }
    setNewFiles((prev) => [...prev, ...files]);
    // clean input để có thể chọn lại cùng file
    e.currentTarget.value = "";
  };

  const removeNewFile = (idx: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  // Cho phép lưu:
  // - Post thường: phải có text hoặc media
  // - Share-post: luôn cho phép (vì luôn có sharedFrom)
  const willHaveAnyContent = useMemo(() => {
    if (isSharePost) return true;

    const textOk = content.trim() !== "";
    const mediaLeft =
      (post.mediaAttachments?.length ?? 0) -
      selectedForRemove.size +
      newFiles.length;
    return textOk || mediaLeft > 0;
  }, [
    isSharePost,
    content,
    post.mediaAttachments,
    selectedForRemove,
    newFiles.length,
  ]);

  const handleSave = async () => {
    try {
      setSaving(true);

      // Nếu là share-post: chỉ sửa text, giữ nguyên mọi thứ khác
      const removeAttachmentIds = isSharePost
        ? []
        : Array.from(selectedForRemove);

      const payload: any = {
        postId: post.id,
        content: content.trim(), // "" để xoá text nếu cần
        isPublic: isSharePost ? post.visibility : isPublic,
        tagUserIds: isSharePost
          ? post.taggedUsers.map((u) => u.id)
          : tagUserIds,
        removeAttachmentIds,
        newMediaFiles: isSharePost ? [] : newFiles,
      };

      const res = await postService.update(payload);

      // Ưu tiên dùng post từ backend
      const updated: Post =
        res?.data ??
        (() => {
          // Fallback: chỉ cập nhật local phần chắc chắn
          const removed = new Set(removeAttachmentIds);
          const keptOld = post.mediaAttachments.filter(
            (m) => !removed.has(m.id)
          );
          return {
            ...post,
            contentText: content.trim(),
            taggedUsers: isSharePost ? post.taggedUsers : tagged,
            mediaAttachments: isSharePost ? post.mediaAttachments : keptOld,
            mediaCount: (isSharePost ? post.mediaAttachments : keptOld).length,
            visibility: isSharePost ? post.visibility : isPublic,
          } as Post;
        })();

      onSaved(updated);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />
      <DialogContent className="w-[95%] md:max-w-xl bg-white rounded-2xl shadow-xl p-0 overflow-hidden z-[70]">
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10 relative">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("editPost")}
          </DialogTitle>
          <DialogClose asChild>
            <button
              className="absolute right-4 p-1.5 rounded-full hover:bg-gray-100 transition text-gray-600 hover:text-gray-900"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="p-4 space-y-4">
          {/* Visibility toggle - ẩn nếu là share-post */}
          {!isSharePost && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {t("addToYourPost")}:
              </span>
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                  isPublic
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700"
                }`}
              >
                <Globe size={14} /> {t("public")}
              </button>
              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                  !isPublic
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700"
                }`}
              >
                <Lock size={14} /> {t("private")}
              </button>
            </div>
          )}

          {/* Tagged friends - ẩn nếu là share-post */}
          {!isSharePost && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">
                  {t("taggedUsers")}
                </div>
                <button
                  onClick={() => setShowTagModal(true)}
                  className="text-sm text-green-600 hover:underline"
                >
                  {t("editTags")}
                </button>
              </div>
              {tagged.length === 0 ? (
                <p className="text-xs text-gray-500">{t("noTaggedUsers")}</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tagged.map((u) => (
                    <span
                      key={u.id}
                      className="text-xs px-2 py-1 bg-gray-100 rounded-full"
                    >
                      {u.fullName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t("saySomething")}
          />

          {/* Media hiện có + chọn để xoá - ẩn nếu là share-post */}
          {!isSharePost && post.mediaAttachments?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-gray-800">
                  {t("media")}
                </div>
                {selectedForRemove.size > 0 && (
                  <div className="ml-auto text-xs text-red-600 flex items-center gap-1">
                    <Trash2 size={14} /> {selectedForRemove.size}{" "}
                    {t("selected")}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {post.mediaAttachments.map((m) => {
                  const checked = selectedForRemove.has(m.id);
                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleSelectMedia(m.id)}
                      className={`relative border rounded-lg overflow-hidden cursor-pointer group ${
                        checked ? "ring-2 ring-red-500" : ""
                      }`}
                    >
                      {/* Overlay icon X */}
                      <div
                        className={`absolute top-2 left-2 z-10 text-white rounded-full p-1 shadow-md ${
                          checked ? "bg-red-600" : "bg-black/40"
                        }`}
                      >
                        <X size={14} />
                      </div>

                      {/* Hover overlay */}
                      <div
                        className={`absolute inset-0 transition bg-black/0 group-hover:bg-black/10 ${
                          checked ? "bg-black/30" : ""
                        }`}
                      />
                      {m.type === "IMAGE" ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={m.url}
                          alt="media"
                          className="w-full h-28 object-cover"
                        />
                      ) : (
                        <video
                          src={m.url}
                          className="w-full h-28 object-cover"
                          muted
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedForRemove.size > 0 && (
                <div className="text-xs text-gray-500">
                  {t("delete")}: {selectedForRemove.size} {t("selected")}
                </div>
              )}
            </div>
          )}

          {/* Media mới thêm - ẩn nếu là share-post */}
          {!isSharePost && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-800">
                  {t("addMedia")}
                </div>
                <button
                  type="button"
                  onClick={handlePickFiles}
                  className="text-sm flex items-center gap-1 text-green-600 hover:underline"
                >
                  <Plus size={16} /> {t("chooseFiles")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleFilesChosen}
                />
              </div>

              {newFiles.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {newFiles.map((f, idx) => {
                    const isVideo = f.type?.startsWith("video/");
                    const url = URL.createObjectURL(f);
                    return (
                      <div
                        key={`${f.name}-${idx}`}
                        className="relative border rounded-lg overflow-hidden group"
                      >
                        <button
                          type="button"
                          onClick={() => removeNewFile(idx)}
                          className="absolute top-2 left-2 z-10 bg-red-600 text-white rounded-full p-1 shadow-md"
                          aria-label="remove-new-file"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute inset-0 transition bg-black/0 group-hover:bg-black/10" />
                        {isVideo ? (
                          <video
                            src={url}
                            className="w-full h-28 object-cover"
                            muted
                          />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={url}
                            alt={f.name}
                            className="w-full h-28 object-cover"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-gray-500">{t("noNewMedia")}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="px-3"
            >
              {t("cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || !willHaveAnyContent}
              className={
                !isSharePost && selectedForRemove.size > 0
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {saving ? t("loading") : t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* TagModal chỉ dùng cho post thường */}
      {!isSharePost && showTagModal && (
        <TagModal
          t={t}
          showModal={showTagModal}
          onClose={() => setShowTagModal(false)}
          onSetTagUsers={handleSetTagUsers}
          initialTagged={tagged}
        />
      )}
    </Dialog>
  );
}
