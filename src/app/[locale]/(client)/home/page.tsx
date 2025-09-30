"use client";

import Image from "next/image";
import {
  FaRegImage,
  FaVideo,
  FaSmile,
  FaHeart,
  FaRegComment,
  FaShare,
} from "react-icons/fa";
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
    <div className="flex gap-6 px-4 w-full max-w-6xl mx-auto">
      {/* Feed */}
      <div className="flex-1 space-y-6 max-w-full">
        {/* Stories */}
        <div className="flex gap-4 overflow-x-auto">
          {[...Array(7)].map((_, i) => (
            <div
              key={i}
              className="w-24 h-36 sm:w-28 sm:h-44 bg-gray-200 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
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

        {/* Post demo */}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div>
              <p className="font-semibold">Nguyễn Văn A</p>
              <span className="text-xs text-gray-500">2 giờ trước</span>
            </div>
          </div>
          <p>Thử nghiệm giao diện Bondy 😎</p>
          <div className="rounded-lg overflow-hidden">
            <Image
              src="https://picsum.photos/600/300"
              alt="post"
              width={800}
              height={300}
              className="w-full"
            />
          </div>
          <div className="flex justify-around border-t pt-2 text-gray-600 text-sm">
            <button className="flex items-center gap-2 hover:text-red-500">
              <FaHeart /> Thích
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500">
              <FaRegComment /> Bình luận
            </button>
            <button className="flex items-center gap-2 hover:text-green-500">
              <FaShare /> Chia sẻ
            </button>
          </div>
        </div>

        {/* Post demo 2 */}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-300" />
            <div>
              <p className="font-semibold">Lê Thị B</p>
              <span className="text-xs text-gray-500">5 giờ trước</span>
            </div>
          </div>
          <p>Chào mọi người, mình mới tham gia Bondy 🎉</p>
          <div className="flex justify-around border-t pt-2 text-gray-600 text-sm">
            <button className="flex items-center gap-2 hover:text-red-500">
              <FaHeart /> Thích
            </button>
            <button className="flex items-center gap-2 hover:text-blue-500">
              <FaRegComment /> Bình luận
            </button>
            <button className="flex items-center gap-2 hover:text-green-500">
              <FaShare /> Chia sẻ
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar bạn bè online */}
      <aside className="hidden lg:block w-64 bg-white rounded-xl shadow p-4 space-y-4 h-fit">
        <h2 className="font-semibold text-gray-700">Bạn bè đang online</h2>
        <ul className="space-y-3">
          {friends.map((friend) => (
            <li key={friend.id} className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={friend.avatar}
                  alt={friend.name}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
              </div>
              <p className="text-sm font-medium">{friend.name}</p>
            </li>
          ))}
        </ul>
      </aside>

      {/* Nút tạo bài viết (cố định) */}
      <button className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg hover:bg-green-700">
        <FiEdit2 size={22} />
      </button>
    </div>
  );
}
