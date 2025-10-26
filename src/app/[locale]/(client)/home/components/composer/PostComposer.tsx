import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import PostComposerModal from "@/app/[locale]/(client)/home/components/composer/PostComposerModal";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { Plus } from "lucide-react";
import { userService } from "@/services/userService";
import User from "@/models/User";

export default function PostComposer({
  owner,
  onPostCreated,
}: {
  owner?: User;
  onPostCreated?: () => void;
}) {
  const t = useTranslations("post");
  const [userInfo, setUserInfo] = useState<any>(null);
  const { user } = useAuthStore();

  const handleGetUserInfo = async () => {
    if (owner) {
      setUserInfo(owner);
    } else {
      setUserInfo(user);
    }
  };

  const [showModal, setShowModal] = useState(false);

  const placeholder = user?.firstName + ", " + t("message");

  useEffect(() => {
    handleGetUserInfo();
  }, []);

  return (
    <div className="bg-white rounded-xl shadow">
      <div className="flex items-center gap-3 p-4">
        {userInfo?.avatarUrl ? (
          <UserAvatar avatarUrl={userInfo?.avatarUrl} />
        ) : (
          <DefaultAvatar firstName={userInfo?.firstName} />
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
          onPostCreated={onPostCreated}
        />
      )}
    </div>
  );
}
