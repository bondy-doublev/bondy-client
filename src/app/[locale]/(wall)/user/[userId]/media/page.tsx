"use client";
import MediaSidebar from "@/app/[locale]/(wall)/user/components/MediaSidebar";
import { useParams } from "next/navigation";

export default function MediaPage() {
  const { userId } = useParams();

  return (
    <div className="md:px-4 w-full">
      <MediaSidebar className="w-full" userId={Number(userId)} isDetail />
    </div>
  );
}
