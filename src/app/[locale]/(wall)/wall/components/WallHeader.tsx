"use client";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import { Button } from "@/components/ui/button";
import { IoIosMore } from "react-icons/io";
import { GoPlus } from "react-icons/go";
import { MdEdit } from "react-icons/md";
import { useTranslations } from "next-intl";
import User from "@/models/User";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";

export default function WallHeader({ user }: { user: User }) {
  const t = useTranslations("wall");

  return (
    <div className="md:px-4 w-full">
      <div className="flex flex-col w-full items-center bg-white rounded-xl shadow-sm p-6">
        {/* Avatar + Info + Buttons */}
        <div className="flex flex-col xl:flex-row items-center justify-between w-full gap-4">
          {/* Avatar + Info */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md">
              {user.avatarUrl ? (
                <UserAvatar
                  className="w-full h-full"
                  avatarUrl={user.avatarUrl}
                />
              ) : (
                <DefaultAvatar
                  className="w-full h-full"
                  firstName={user.firstName}
                />
              )}
            </div>

            <div className="flex flex-col items-center md:items-start">
              <span className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName} {user.middleName}
              </span>
              <span className="text-sm text-gray-600">
                234 {t("friends").toLowerCase()}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <Button className="bg-green-600 text-white hover:bg-green-700">
              <MdEdit />
              {t("editProfile")}
            </Button>
            <Button
              variant="secondary"
              className="bg-gray-100 hover:bg-gray-200"
            >
              <GoPlus /> {t("addStory")}
            </Button>
            <Button className="border-none" variant="outline">
              <IoIosMore />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
