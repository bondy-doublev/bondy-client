"use client";

import { SIDEBAR_ITEMS } from "@/constants";
import { useState } from "react";
import { useTranslations } from "use-intl";

export default function Sidebar() {
  const [active, setActive] = useState("home");
  const t = useTranslations("sidebar");

  return (
    <aside className="hidden md:block fixed top-0 left-0 h-screen w-[250px] bg-green-100 text-black overflow-y-auto shadow-md">
      <div className="text-2xl font-bold mb-10 cursor-pointer">Bondy</div>

      {SIDEBAR_ITEMS.map((item) => (
        <div
          key={item.id}
          onClick={() => setActive(item.id)}
          className={`flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer hover:bg-green/70 transition-colors text-black-always ${
            active === item.id ? "bg-green/80 font-semibol  d" : ""
          }`}
        >
          <div className="relative">
            {item.icon}
            {item.badge && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-xs w-4 h-4 flex items-center justify-center rounded-full text-white-always">
                {item.badge}
              </span>
            )}
          </div>
          <span>{t(item.id)}</span>
        </div>
      ))}
    </aside>
  );
}
