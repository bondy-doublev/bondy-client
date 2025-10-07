"use client";

import PostCard from "@/app/components/post/PostCard";
import Image from "next/image";
import { FaRegImage, FaVideo, FaSmile } from "react-icons/fa";
import { FiEdit2 } from "react-icons/fi";

export default function Home() {
  const friends = [
    { id: 1, name: "Hà An", avatar: "https://picsum.photos/40?1" },
    { id: 2, name: "Minh Quân", avatar: "https://picsum.photos/40?2" },
    { id: 3, name: "Lan Chi", avatar: "https://picsum.photos/40?3" },
    { id: 4, name: "Tuấn Kiệt", avatar: "https://picsum.photos/40?4" },
    { id: 5, name: "Gia Minh", avatar: "https://picsum.photos/40?5" },
    { id: 6, name: "Bần Vương", avatar: "https://picsum.photos/40?6" },
    { id: 7, name: "Cầy Tơ", avatar: "https://picsum.photos/40?7" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-6 md:gap-16 overflow-x-hidden md:px-4 w-full max-w-max mx-auto">
      {/* Feed chính */}
      <div className="flex-1 max-w-[500px] space-y-6">
        {/* Stories */}
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-20 h-32 sm:w-24 sm:h-36 bg-gray-200 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
            >
              Story {i + 1}
            </div>
          ))}
        </div>

        {/* Ô tạo bài */}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <input
              type="text"
              placeholder="Lê ơi, bạn đang nghĩ gì thế?"
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 outline-none text-sm"
            />
          </div>
          <div className="flex justify-around border-t pt-2 text-gray-600 text-sm">
            <button className="flex items-center gap-2 hover:text-blue-500">
              <FaRegImage /> Ảnh
            </button>
            <button className="flex items-center gap-2 hover:text-green-500">
              <FaVideo /> Video
            </button>
            <button className="flex items-center gap-2 hover:text-yellow-500">
              <FaSmile /> Cảm xúc
            </button>
          </div>
        </div>

        <PostCard />
        <PostCard />
        <PostCard />
      </div>

      {/* Sidebar bạn bè (to hơn) */}
      <aside className="hidden xl:block w-80 bg-white rounded-xl shadow p-4 space-y-4 h-fit">
        <h2 className="font-semibold text-gray-700">Bạn bè đang online</h2>
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li key={friend.id} className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={friend.avatar}
                  alt={friend.name}
                  width={50}
                  height={50}
                  className="w-12 h-12 rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <p className="text-sm font-medium">{friend.name}</p>
            </li>
          ))}
        </ul>
      </aside>

      {/* Nút tạo bài viết (floating) */}
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700">
        <FiEdit2 size={22} />
      </button>
    </div>
  );
}
