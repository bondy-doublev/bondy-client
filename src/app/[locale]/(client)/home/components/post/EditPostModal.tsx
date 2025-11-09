"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogClose,
} from "@/components/ui/dialog";
import { X, Trash2, Lock, Globe } from "lucide-react";
import { useEffect, useMemo, useState, useCallback } from "react";
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

  // Visibility
  const [isPublic, setIsPublic] = useState<boolean>(post.visibility ?? true);

  // Chọn media để xoá
  const [selectedForRemove, setSelectedForRemove] = useState<Set<number>>(
    new Set()
  );

  const tagUserIds = useMemo(() => tagged.map((u) => u.id), [tagged]);

  useEffect(() => {
    setContent(post.contentText ?? "");
    setTagged(post.taggedUsers ?? []);
    setIsPublic(post.visibility ?? true);
    setSelectedForRemove(new Set());
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

  // Cho phép lưu nếu: có text sau trim HOẶC vẫn còn media sau khi xoá
  const willHaveAnyContent = useMemo(() => {
    const textOk = content.trim() !== "";
    const mediaLeft =
      (post.mediaAttachments?.length ?? 0) - selectedForRemove.size;
    return textOk || mediaLeft > 0;
  }, [content, post.mediaAttachments, selectedForRemove]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const removeAttachmentIds = Array.from(selectedForRemove);

      const res = await postService.update({
        postId: post.id,
        content: content.trim(), // "" để xoá text nếu cần
        isPublic,
        tagUserIds,
        removeAttachmentIds,
      });

      // Nếu backend trả post mới thì dùng, không thì tự cập nhật local
      const removed = new Set(removeAttachmentIds);
      const newMedia = post.mediaAttachments.filter((m) => !removed.has(m.id));
      const updated: Post = res?.data ?? {
        ...post,
        contentText: content.trim(),
        taggedUsers: tagged,
        mediaAttachments: newMedia,
        mediaCount: newMedia.length,
        visibility: isPublic,
      };

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
          {/* Visibility toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{t("addToYourPost")}:</span>
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

          {/* Tagged friends */}
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

          {/* Content */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-32 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder={t("saySomething")}
          />

          {/* Media hiện có + chọn để xoá */}
          {post.mediaAttachments?.length > 0 && (
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
                    <label
                      key={m.id}
                      className={`relative group border rounded-lg overflow-hidden cursor-pointer ${
                        checked ? "ring-2 ring-red-500" : ""
                      }`}
                    >
                      {/* overlay checkbox */}
                      <input
                        type="checkbox"
                        className="absolute top-2 left-2 z-10 w-4 h-4"
                        checked={checked}
                        onChange={() => toggleSelectMedia(m.id)}
                      />
                      <div
                        className={`absolute inset-0 bg-black/0 group-hover:bg-black/10 transition ${
                          checked ? "bg-black/20" : ""
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
                          controls={false}
                          muted
                        />
                      )}
                    </label>
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
                selectedForRemove.size > 0
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
            >
              {saving ? t("loading") : t("save")}
            </Button>
          </div>
        </div>
      </DialogContent>

      {showTagModal && (
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
