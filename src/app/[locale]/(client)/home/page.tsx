import CreateChatButton from "./components/CreateChatButton";
import FriendSidebar from "./components/FriendSidebar";
import HelpButton from "./components/HelpButton";
import MainFeed from "./components/MainFeed";

export default function Home() {
  return (
    <div className="flex justify-center overflow-x-hidden min-w-full">
      {/* Feed chính */}
      <div className="w-full xl:mr-[20%] flex justify-center p-4">
        <MainFeed className="w-full" />
      </div>

      {/* Sidebar bạn bè (to hơn) */}
      <div className="hidden xl:block fixed right-5 top-20">
        <FriendSidebar />
      </div>

      {/* Nút tạo bài viết (floating) */}
      <CreateChatButton />

      <HelpButton />
    </div>
  );
}
