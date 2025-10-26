import CreateChatButton from "./components/CreateChatButton";
import FriendSidebar from "./components/FriendSidebar";
import MainFeed from "./components/MainFeed";

export default function Home() {
  return (
    <div className="flex justify-center overflow-x-hidden min-w-full">
      {/* Feed chính */}
      <MainFeed />

      {/* Sidebar bạn bè (to hơn) */}
      <div className="hidden xl:block fixed right-10 top-20">
        <FriendSidebar />
      </div>

      <div className="block xl:ml-[25%]"></div>

      {/* Nút tạo bài viết (floating) */}
      <CreateChatButton />
    </div>
  );
}
