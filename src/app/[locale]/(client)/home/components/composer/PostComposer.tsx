import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import PostComposerModal from "@/app/[locale]/(client)/home/components/composer/PostComposerModal";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { Plus } from "lucide-react";

export default function PostComposer({
  onPostCreated,
}: {
  onPostCreated?: () => void;
}) {
  const t = useTranslations("post");
  const { user } = useAuthStore();

  const [showModal, setShowModal] = useState(false);

  const placeholder = user?.firstName + ", " + t("message");

  return (
    <div className="bg-white shadow rounded-xl">
      {/* <div className="flex items-center gap-3 p-4">
        {user?.avatarUrl ? (
          <UserAvatar userId={user.id} avatarUrl={user?.avatarUrl} />
        ) : (
          <DefaultAvatar userId={user!.id ?? ""} firstName={user?.firstName} />
        )}

        <input
          readOnly
          type="text"
          placeholder={placeholder}
          className="flex-1 px-4 py-2 text-sm bg-gray-100 rounded-full outline-none cursor-pointer hover:bg-gray-200"
          onClick={() => setShowModal(true)}
        />
        <div className="flex gap-2">
          <button
            className="p-2 transition rounded-3xl hover:bg-gray-100"
            onClick={() => setShowModal(true)}
          >
            <Plus color="blue" size={24} />
          </button>
        </div>
      </div> */}

      <div className="flex items-center gap-3 p-4">
        {user?.avatarUrl ? (
          <UserAvatar userId={user.id} avatarUrl={user?.avatarUrl} />
        ) : (
          <DefaultAvatar userId={user!.id ?? ""} firstName={user?.firstName} />
        )}

        <input
          readOnly
          type="text"
          placeholder={placeholder}
          className="flex-1 min-w-0 px-4 py-2 text-sm bg-gray-100 rounded-full outline-none cursor-pointer hover:bg-gray-200"
          onClick={() => setShowModal(true)}
        />

        <button
          className="flex-shrink-0 p-2 transition rounded-3xl hover:bg-gray-100"
          onClick={() => setShowModal(true)}
        >
          <Plus color="blue" size={24} />
        </button>
      </div>

      {showModal === true && (
        <PostComposerModal
          t={t}
          showModal={showModal}
          placeholder={placeholder}
          onClose={() => setShowModal(false)}
          onPostCreated={onPostCreated}
        />
      )}
    </div>
  );
}
