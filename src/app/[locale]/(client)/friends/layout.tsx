/* src/app/(client)/friends/layout.tsx */
"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import {
  useSelectedLayoutSegments,
  usePathname,
  useRouter,
} from "next/navigation";

interface FriendLayoutProps {
  children: ReactNode;
}

export default function FriendLayout({ children }: FriendLayoutProps) {
  const t = useTranslations("friend");
  const segments = useSelectedLayoutSegments();
  const pathname = usePathname();
  const router = useRouter();

  // segment hiện tại trong /friends (vd: "requests", "list", "send-requests")
  const currentSegment = segments[0] as string | undefined;

  // Tìm base path tới /friends, giữ nguyên locale và (client) group
  // ví dụ: /vi/(client)/friends/requests -> basePath = /vi/(client)/friends
  const paths = pathname.split("/").filter(Boolean);
  const friendsIndex = paths.lastIndexOf("friends");
  const basePath =
    friendsIndex !== -1
      ? "/" + paths.slice(0, friendsIndex + 1).join("/")
      : "/friends";

  const tabs: {
    key: string;
    segment?: string; // undefined = root /friends
    label: string;
  }[] = [
    {
      key: "suggestions",
      segment: undefined, // tab default: /friends
      label: t("tabSuggestions"),
    },
    { key: "requests", segment: "requests", label: t("tabRequests") },
    { key: "sent", segment: "send-requests", label: t("tabSent") },
    { key: "list", segment: "list", label: t("tabFriends") },
  ];

  const handleTabClick = (segment?: string) => {
    const target = segment ? `${basePath}/${segment}` : basePath;
    router.push(target);
  };

  return (
    <div className="w-full bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("friendsPageTitle")}
          </h1>
          <p className="text-sm text-gray-500">{t("friendsPageSubtitle")}</p>
        </div>

        {/* Tabs */}
        <div className="mb-4 border-b border-gray-200">
          {/* wrapper cho phép scroll ngang trên mobile */}
          <div className="-mx-4 overflow-x-auto sm:mx-0 scroll-custom">
            <div className="flex gap-2 px-4 sm:px-0 min-w-max">
              {tabs.map((tab) => {
                const isActive =
                  (!currentSegment && tab.segment === undefined) ||
                  currentSegment === tab.segment;

                return (
                  <Button
                    key={tab.key}
                    type="button"
                    variant="ghost"
                    className={[
                      "shrink-0 whitespace-nowrap",
                      "rounded-none border-b-2 px-3 pb-2 pt-2 text-sm font-medium",
                      isActive
                        ? "border-green-600 text-green-600"
                        : "border-transparent text-gray-600 hover:border-green-100 hover:bg-transparent hover:text-green-700",
                    ].join(" ")}
                    onClick={() => handleTabClick(tab.segment)}
                  >
                    {tab.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Content (render page con) */}
        <div className="space-y-4">{children}</div>
      </div>
    </div>
  );
}
