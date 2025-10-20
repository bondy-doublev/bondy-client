import RoundedAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import React, { useState } from "react";
import { IoSend } from "react-icons/io5";

export default function CommentComposer({
  t,
  onSubmit,
}: {
  t: (key: string) => string;
  onSubmit: (content: string) => void;
}) {
  const { user } = useAuthStore();
  const [content, setContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 justify-center bg-white z-10"
    >
      {user?.avatarUrl ? (
        <RoundedAvatar avatarUrl={user.avatarUrl} />
      ) : (
        <DefaultAvatar firstName={user?.firstName} />
      )}
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="flex-1 rounded-2xl shadow-none focus:shadow-none focus-visible:ring-0 focus:ring-0 focus:outline-none"
        placeholder={t("writeComment") + "..."}
      />
      <Button
        type="submit"
        className="h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-green-600 shadow-none focus:outline-none focus:ring-0 transition"
      >
        <IoSend size={18} />
      </Button>
    </form>
  );
}
