import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

export default function FriendSidebar() {
  const t = useTranslations("friend");

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
    <aside className="hidden xl:block w-80 bg-white rounded-xl shadow p-4 space-y-4 h-fit">
      <h2 className="font-semibold text-gray-700">{t("contacts")}</h2>
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
  );
}
