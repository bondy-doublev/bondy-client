import RoundedAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";
import React from "react";
import { IoSend } from "react-icons/io5";

export default function CommentComposer({ t }: { t: (key: string) => string }) {
  const { user } = useAuthStore();

  return (
    <div className="p-4 flex items-center gap-2 border-t-0.5 justify-center h-18 border-b top-0 bg-white z-10">
      {user?.avatarUrl ? (
        <RoundedAvatar avatarUrl={user.avatarUrl} />
      ) : (
        <DefaultAvatar firstName={user?.firstName} />
      )}
      <Input
        className="flex-1 rounded-2xl shadow-none focus:shadow-none focus-visible:ring-0 focus:ring-0 focus:outline-none"
        placeholder={t("writeComment") + "..."}
      />
      <Button
        type="submit"
        className=" h-9 w-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-green-600 shadow-none focus:outline-none focus:ring-0 transition "
      >
        <IoSend size={18} />
      </Button>
    </div>
  );
}
