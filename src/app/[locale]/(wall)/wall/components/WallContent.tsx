"use client";
import FriendSidebar from "@/app/[locale]/(client)/home/components/FriendSidebar";
import MainFeed from "@/app/[locale]/(client)/home/components/MainFeed";
import MediaSidebar from "@/app/[locale]/(wall)/wall/components/MediaSidebar";
import User from "@/models/User";

export default function WallContent({ user }: { user: User }) {
  return (
    <div className="flex justify-between xl:gap-4 overflow-x-hidden min-w-full md:px-4">
      <div className="space-y-5">
        <MediaSidebar userId={user.id} />
        <FriendSidebar userId={user.id} />
      </div>

      <MainFeed wallOwner={user} className="w-full max-w-full" />
    </div>
  );
}
