"use client";

import WallContent from "@/app/[locale]/(wall)/wall/components/WallContent";
import WallHeader from "@/app/[locale]/(wall)/wall/components/WallHeader";
import User from "@/models/User";
import { userService } from "@/services/userService";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Page() {
  const { userId } = useParams();
  const [userInfo, setUserInfo] = useState<User>();

  useEffect(() => {
    userService
      .getProfileById({ userId: Number(userId) })
      .then((res) => setUserInfo(res.data as User));
  }, [userId]);

  if (!userInfo) return <div>Loading...</div>;

  return (
    <div className="flex flex-col w-full justify-center gap-4 p-4 items-center lg:w-[60%]">
      <WallHeader user={userInfo} />
      <WallContent user={userInfo} />
    </div>
  );
}
