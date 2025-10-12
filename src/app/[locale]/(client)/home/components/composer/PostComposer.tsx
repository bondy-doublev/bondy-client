import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import PostComposerModal from "@/app/[locale]/(client)/home/components/composer/PostComposerModal";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { Plus } from "lucide-react";

export default function PostComposer() {
  const t = useTranslations("post");
  const { user } = useAuthStore();

  const [showModal, setShowModal] = useState(false);

  const placeholder = user?.firstName + ", " + t("message");

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="flex items-center gap-3 p-4">
        {user?.avatarUrl ? (
          <UserAvatar avatarUrl={user?.avatarUrl} />
        ) : (
          <DefaultAvatar firstName={user?.firstName} />
        )}

        <input
          readOnly
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm hover:bg-gray-200 cursor-pointer"
          onClick={() => setShowModal(true)}
        />
        <div className="flex gap-2">
          <button
            className="p-2 rounded-3xl hover:bg-gray-100 transition"
            onClick={() => setShowModal(true)}
          >
            <Plus color="blue" size={24} />
          </button>
        </div>
      </div>

      {showModal === true && (
        <PostComposerModal
          t={t}
          showModal={showModal}
          placeholder={placeholder}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
