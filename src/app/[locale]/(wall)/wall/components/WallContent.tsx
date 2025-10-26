"use client";
import { useState } from "react";
import FriendSidebar from "@/app/[locale]/(client)/home/components/FriendSidebar";
import MainFeed from "@/app/[locale]/(client)/home/components/MainFeed";
import MediaSidebar from "@/app/[locale]/(wall)/wall/components/MediaSidebar";
import User from "@/models/User";

export default function WallContent({ user }: { user: User }) {
  const [activeTab, setActiveTab] = useState<"posts" | "friends" | "media">(
    "posts"
  );

  const tabs = [
    { key: "posts", label: "Bài viết" },
    { key: "friends", label: "Bạn bè" },
    { key: "media", label: "Media" },
  ] as const;

  return (
    <div className="w-full space-y-4">
      {/* ✅ Mini navbar (Tabs) */}
      <div className="px-4">
        <div className="flex px-2 gap-6 py-2 text-sm font-medium overflow-x-auto border-b">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-2 py-2 rounded-md transition-all
              ${
                activeTab === tab.key
                  ? "text-green-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-green-500"
              }`}
            >
              {tab.label}
              {activeTab === tab.key && (
                <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-green-500 rounded-t-xl" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ✅ Nội dung theo từng Tab */}
      {activeTab === "posts" && (
        <div className="flex flex-col xl:flex-row justify-between xl:gap-4 md:px-4 pb-2">
          <div className="space-y-5 hidden xl:block sticky top-20 h-fit">
            <MediaSidebar userId={user.id} />
            <FriendSidebar userId={user.id} />
          </div>

          <MainFeed wallOwner={user} className="w-full max-w-full" />
        </div>
      )}

      {activeTab === "friends" && (
        <div className="px-4">
          <FriendSidebar className="w-full" userId={user.id} />
        </div>
      )}

      {activeTab === "media" && (
        <div className="px-4">
          <MediaSidebar className="w-full" userId={user.id} />
        </div>
      )}
    </div>
  );
}
