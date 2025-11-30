"use client";

import WallHeader from "@/app/[locale]/(wall)/wall/components/WallHeader";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import User from "@/models/User";
import { userService } from "@/services/userService";

export default function WallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useParams();
  const t = useTranslations("wall");
  const pathname = usePathname();
  const pathnameWithoutLocale = pathname.replace(/^\/(en|vi)/, "");
  const basePath = `/wall/${userId}`;

  const tabs = [
    { key: "posts", label: t("post"), href: basePath },
    { key: "friends", label: t("friends"), href: `${basePath}/friends` },
    { key: "media", label: t("media"), href: `${basePath}/media` },
  ];

  const [userInfo, setUserInfo] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const res = await userService.getProfileById({
          userId: Number(userId),
        });
        setUserInfo(res.data as User);
      } catch (error) {
        console.error("Failed to load user info:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  if (loading || !userInfo) {
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        {t("loading") ?? "Đang tải..."}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full justify-center gap-4 p-4 items-center lg:w-[60%]">
      {/* Header user */}
      <WallHeader wallUser={userInfo} />

      {/* ✅ Mini Navbar */}
      <div className="px-4 w-full">
        <div className="w-full border-b">
          <div className="flex gap-6 py-2 text-sm font-medium overflow-x-auto">
            {tabs.map((tab) => {
              const active = pathnameWithoutLocale === tab.href;

              return (
                <Link
                  key={tab.key}
                  href={tab.href}
                  className={`relative inline-flex flex-col items-center justify-center px-2 py-2 rounded-md transition-all ${
                    active
                      ? "text-green-600 font-semibold"
                      : "text-gray-600 hover:bg-gray-50 hover:text-green-500"
                  }`}
                >
                  <span>{tab.label}</span>
                  {active && (
                    <span className="mt-1 w-10 h-[3px] bg-green-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
}
