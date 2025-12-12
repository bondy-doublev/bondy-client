"use client";
import FriendSidebar from "@/app/[locale]/(client)/home/components/FriendSidebar";
import { useParams } from "next/navigation";

export default function FriendsPage({}) {
  const { userId } = useParams();
  return (
    <div className="md:px-4 w-full">
      <FriendSidebar className="w-full" userId={Number(userId)} isDetail />
    </div>
  );
}
