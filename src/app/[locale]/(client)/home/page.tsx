import CreatePostButton from "@/app/[locale]/(client)/home/components/CreatePostButton";
import FriendSidebar from "@/app/[locale]/(client)/home/components/FriendSidebar";
import MainFeed from "@/app/[locale]/(client)/home/components/center-content/MainFeed";

export default function Home() {
  return (
    <div className="flex justify-center xl:gap-24 overflow-x-hidden w-full max-w-full mx-auto">
      {/* Feed chính */}
      <MainFeed />

      {/* Sidebar bạn bè (to hơn) */}
      <FriendSidebar />

      {/* Nút tạo bài viết (floating) */}
      <CreatePostButton />
    </div>
  );
}
