"use client";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { Button } from "@/components/ui/button";
import { IoIosMore } from "react-icons/io";
import { GoPlus } from "react-icons/go";
import { MdEdit } from "react-icons/md";
import { useTranslations } from "next-intl";
import User from "@/models/User";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";
import { Friendship } from "@/models/Friendship";
import { friendService } from "@/services/friendService";
import { FiMessageCircle } from "react-icons/fi";
import { FaRegFlag } from "react-icons/fa";
import FriendButton from "@/app/components/button/FriendButton";
import ReportModal from "@/app/components/report/ReportModal";
import { moderationService } from "@/services/reportService";
import { TargetType } from "@/models/Report";

export default function WallHeader({ wallUser }: { wallUser: User }) {
  const t = useTranslations("wall");
  const { user } = useAuthStore();

  const [showReportModal, setShowReportModal] = useState(false);

  const [friendshipStatus, setFriendshipStatus] = useState<Friendship | null>(
    null
  );
  const [loadingFriendship, setLoadingFriendship] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!user || user.id === wallUser.id) return;
      try {
        setLoadingFriendship(true);
        const res = await friendService.getFriendshipStatus(wallUser.id);
        setFriendshipStatus(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingFriendship(false);
      }
    };

    fetchStatus();
  }, [wallUser.id, user]);

  const fullname =
    (wallUser.firstName ?? "") +
    " " +
    (wallUser.lastName ?? "") +
    " " +
    (wallUser.middleName ?? "");

  const isOwner = user?.id === wallUser.id;

  const handleMessage = () => {
    console.log("Open chat with", wallUser.id);
  };

  const handleSubmitReport = async (reason: string) => {
    await moderationService.createReport({
      targetType: TargetType.USER,
      targetId: wallUser.id,
      reason,
    });
  };

  return (
    <div className="md:px-4 w-full">
      <div className="flex flex-col w-full items-center bg-white rounded-xl shadow-sm p-6">
        <div className="flex flex-col xl:flex-row items-center justify-between w-full gap-4">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
              {wallUser.avatarUrl ? (
                <UserAvatar
                  className="w-full h-full"
                  userId={wallUser.id}
                  avatarUrl={wallUser.avatarUrl}
                />
              ) : (
                <DefaultAvatar
                  userId={wallUser.id}
                  className="w-full h-full"
                  firstName={wallUser.firstName}
                />
              )}
            </div>

            <div className="flex flex-col items-center md:items-start">
              <UserName
                className="text-2xl font-bold"
                userId={wallUser.id}
                fullname={fullname}
              />
              <Link href={`/wall/${wallUser.id}/friends`}>
                <span className="text-sm text-gray-600 hover:underline">
                  {wallUser.friendCount}{" "}
                  {wallUser.friendCount > 1
                    ? t("friends").toLowerCase()
                    : t("friend").toLowerCase()}
                </span>
              </Link>
            </div>
          </div>

          {isOwner ? (
            // ===== Tường của chính mình =====
            <div className="flex items-center gap-2">
              <Button className="bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
                <MdEdit />
                {t("editProfile")}
              </Button>
              <Button
                variant="secondary"
                className="bg-gray-100 hover:bg-gray-200 flex items-center gap-2"
              >
                <GoPlus /> {t("addStory")}
              </Button>
              <Button className="border-none" variant="outline">
                <IoIosMore />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <FriendButton
                t={t}
                wallUserId={wallUser.id}
                currentUserId={user!.id}
                friendship={friendshipStatus}
                onChanged={setFriendshipStatus}
                loadingStatus={loadingFriendship}
              />

              {/* Message: nền xám nhạt kiểu FB */}
              <Button
                className="flex items-center px-3 h-9 text-sm font-medium rounded-md
               bg-green hover:bg-green-700"
                onClick={handleMessage}
              >
                <FiMessageCircle className="text-white" />
                {t("message")}
              </Button>

              {/* Report: nền xám hơi đỏ, nhưng không chói */}
              <Button
                className="flex items-center gap-2 px-3 h-9 text-sm font-medium rounded-md
               bg-gray-100 hover:bg-gray-200 text-gray-800"
                onClick={() => setShowReportModal(true)}
              >
                <FaRegFlag />
              </Button>
            </div>
          )}
        </div>
      </div>

      <ReportModal
        open={showReportModal}
        target="user"
        onClose={() => setShowReportModal(false)}
        onSubmit={handleSubmitReport}
      />
    </div>
  );
}
