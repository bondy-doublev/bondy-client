import RoundedAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import React, { useRef, useState, useEffect } from "react";
import { IoSend } from "react-icons/io5";
import { X } from "lucide-react";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { UserBasic, mapUserToUserBasic } from "@/models/User";

export default function CommentComposer({
  t,
  replyToUser,
  onSubmit,
}: {
  t: (key: string) => string;
  replyToUser?: UserBasic;
  onSubmit: (content: string, mentionUserIds: number[]) => void;
}) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");
  const [mentionUsers, setMentionUsers] = useState<UserBasic[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const { friendUsers } = useMyFriends(user?.id ?? 0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (replyToUser && replyToUser.id !== user?.id) {
      setMentionUsers((prev) => [...prev, replyToUser]);
    }
  }, []);

  // co giãn textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }
  }, [content]);

  // khi hiển thị suggestion => focus mặc định dòng đầu tiên
  useEffect(() => {
    if (showSuggestions) {
      setHighlightIndex(0);
    }
  }, [showSuggestions, mentionQuery]);

  // auto scroll đến item được highlight
  useEffect(() => {
    const el = suggestionRefs.current[highlightIndex];
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [highlightIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setContent(val);

    const cursor = e.target.selectionStart;
    const beforeCursor = val.slice(0, cursor);
    const match = /@([\w\s]*)$/.exec(beforeCursor);

    if (match) {
      setMentionQuery(match[1]);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
      setMentionQuery("");
    }
  };

  const filteredFriends = mentionQuery
    ? friendUsers.filter((f) =>
        f.fullName!.toLowerCase().includes(mentionQuery.toLowerCase())
      )
    : friendUsers;

  const handleSelectMention = (u: UserBasic) => {
    setMentionUsers((prev) =>
      prev.find((x) => x.id === u.id) ? prev : [...prev, u]
    );
    setContent(""); // clear input
    setShowSuggestions(false);
    setMentionQuery("");
    setHighlightIndex(0);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && filteredFriends.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev + 1 < filteredFriends.length ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightIndex((prev) =>
          prev - 1 >= 0 ? prev - 1 : filteredFriends.length - 1
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleSelectMention(
          mapUserToUserBasic(filteredFriends[highlightIndex])
        );
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  };

  const handleRemoveMention = (id: number) => {
    setMentionUsers((prev) => prev.filter((m) => m.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mentionUsers.length === 0) return;
    const mentionIds = mentionUsers.map((u) => u.id);
    onSubmit(content.trim(), mentionIds);
    setContent("");
    setMentionUsers([]);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative flex items-center gap-2 bg-white z-10"
    >
      {user?.avatarUrl ? (
        <RoundedAvatar userId={user.id} avatarUrl={user.avatarUrl} />
      ) : (
        <DefaultAvatar userId={user?.id} firstName={user?.firstName} />
      )}

      <div className="flex-1 flex flex-col bg-gray-50 border rounded-2xl px-3 py-1 relative">
        {/* mention chips */}
        {mentionUsers.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-1">
            {mentionUsers.map((m) => (
              <span
                key={m.id}
                className="flex items-center gap-1 text-green-600 font-semibold text-sm bg-green-100 px-2 py-[2px] rounded-full"
              >
                @{m.fullName}
                <button
                  type="button"
                  onClick={() => handleRemoveMention(m.id)}
                  className="text-green-500 hover:text-red-500"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* textarea */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full bg-transparent resize-none border-0 focus:ring-0 focus:outline-none text-sm py-1"
          placeholder={t("writeComment") + "..."}
          rows={1}
        />

        {/* suggestion dropdown */}
        {showSuggestions && (
          <div className="scroll-custom absolute bottom-full mb-1 left-0 w-full bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto z-20">
            {filteredFriends.length > 0 ? (
              filteredFriends.map((friend, index) => (
                <div
                  key={friend.id}
                  onClick={() =>
                    handleSelectMention(mapUserToUserBasic(friend))
                  }
                  className={`flex items-center gap-3 p-2 cursor-pointer ${
                    highlightIndex === index
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {friend.avatarUrl ? (
                    <RoundedAvatar
                      userId={friend.id}
                      avatarUrl={friend.avatarUrl}
                    />
                  ) : (
                    <DefaultAvatar
                      userId={friend.id}
                      firstName={friend.fullName}
                    />
                  )}
                  <span className="text-sm font-medium">{friend.fullName}</span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 text-sm p-2">
                {t("notFound")}
              </p>
            )}
          </div>
        )}
      </div>

      <Button
        type="submit"
        className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-green-600"
      >
        <IoSend size={18} />
      </Button>
    </form>
  );
}
