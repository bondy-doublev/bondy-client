"use client";

import AdRunningCarousel from "@/app/[locale]/(client)/advert/components/AdRunningCarousel";
import Profile from "@/app/[locale]/(client)/home/components/sidebar/Profile";
import { SIDEBAR_ITEMS } from "@/constants";
import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "use-intl";

export default function Sidebar() {
  const [active, setActive] = useState("home");
  const t = useTranslations("sidebar");

  return (
    <aside className="hidden md:block fixed top-0 left-0 h-screen w-[20%] bg-green-100 text-black overflow-y-auto scroll-custom shadow-md px-3">
      <div className="text-2xl font-bold mb-6 cursor-pointer">Bondy</div>

      <Profile />

      <div className="space-y-1 mt-4">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            href={item.href || "#"}
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-green/70 transition-colors ${
              active === item.id ? "bg-green/80 font-semibold" : ""
            }`}
          >
            <div className="relative">{item.icon}</div>
            <span>{t(item.id)}</span>
          </Link>
        ))}
      </div>

      {/* ADS */}
      <div className="mt-6">
        <AdRunningCarousel />
      </div>
    </aside>
  );
}
