import CreateHomeButton from "@/app/components/home/CreateChatButton";
import FriendSidebar from "@/app/components/home/FriendSidebar";
import MainFeed from "@/app/components/home/center-content/MainFeed";

export default function Home() {
  return (
    <div className="flex justify-center xl:gap-24 overflow-x-hidden w-full max-w-full mx-auto">
      {/* Feed chính */}
      <MainFeed />

      {/* Sidebar bạn bè (to hơn) */}
      <FriendSidebar />

      {/* Nút tạo bài viết (floating) */}
      <CreateHomeButton />
    </div>
  );
}
