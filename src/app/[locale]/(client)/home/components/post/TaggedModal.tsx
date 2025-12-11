"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserBasic } from "@/models/User";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function TaggedModal({
  t,
  showModal,
  onClose,
  users,
}: {
  t: (key: string) => string;
  showModal: boolean;
  onClose: () => void;
  users: UserBasic[];
}) {
  const router = useRouter();

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogOverlay className="fixed inset-0 bg-black/30 z-[60]" />

      <DialogContent
        className="
          w-[90%] md:max-w-md 
          bg-white rounded-2xl
          p-0 flex flex-col overflow-hidden
          data-[state=open]:animate-none
          z-[70]
        "
      >
        <DialogHeader className="flex items-center justify-center h-14 border-b top-0 bg-white z-10 relative">
          <DialogTitle className="text-base pt-2 font-semibold text-gray-800 leading-none">
            {t("taggedUsers")}
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

        <div className="p-4 pt-1 max-h-[60vh] overflow-y-auto scroll-custom">
          {users.length === 0 ? (
            <p className="text-center text-sm text-gray-500">
              {t("noTaggedUsers")}
            </p>
          ) : (
            <ul className="space-y-3">
              {users.map((user) => (
                <li
                  onClick={() => router.push("/user/" + user.id)}
                  key={user.id}
                  className="flex items-center gap-3 p-1 cursor-pointer hover:bg-gray-100 hover:rounded-xl"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {user.avatarUrl ? (
                      <UserAvatar userId={user.id} avatarUrl={user.avatarUrl} />
                    ) : (
                      <DefaultAvatar
                        userId={user.id}
                        firstName={user.fullName}
                      />
                    )}
                  </div>
                  <p className="font-medium text-gray-800">{user.fullName}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
