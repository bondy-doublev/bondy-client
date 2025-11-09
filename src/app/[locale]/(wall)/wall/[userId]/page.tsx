"use client";

import MainFeed from "@/app/[locale]/(client)/home/components/MainFeed";
import MediaSidebar from "@/app/[locale]/(wall)/wall/components/MediaSidebar";
import FriendSidebar from "@/app/[locale]/(client)/home/components/FriendSidebar";
import { useEffect, useState } from "react";
import { userService } from "@/services/userService";
import User from "@/models/User";
import { useParams } from "next/navigation";

export default function Page() {
  const { userId } = useParams();

  const [userInfo, setUserInfo] = useState<User>();

  useEffect(() => {
    userService
      .getProfileById({ userId: Number(userId) })
      .then((res) => setUserInfo(res.data as User));
  }, [userId]);

  return (
    <div className="flex flex-col xl:flex-row justify-between xl:gap-4 md:px-4 pb-2 w-full">
      <div className="space-y-5 hidden xl:block">
        <MediaSidebar userId={Number(userId)} />
        <FriendSidebar
          userId={Number(userId)}
          className="sticky top-0 self-start"
        />
      </div>
      {userInfo && (
        <MainFeed wallOwner={userInfo} className="w-full max-w-full" />
      )}
    </div>
  );
}
