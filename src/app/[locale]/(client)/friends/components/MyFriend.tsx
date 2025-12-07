"use client";

import { useRef, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useMyFriends } from "@/app/hooks/useMyFriends";
import { useTranslations } from "next-intl";

import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import UserName from "@/app/[locale]/(client)/home/components/user/UserName";

export default function MyFriends() {
  const t = useTranslations("friend");

  const { user } = useAuthStore();
  const currentUserId = user?.id ?? 0;

  const { friendUsers, isInitialLoading, loading, hasMore, loadMore } =
    useMyFriends(currentUserId);

  const loaderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const target = entries[0];
        if (target.isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.2 }
    );

    const el = loaderRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
      observer.disconnect();
    };
  }, [hasMore, loading, loadMore]);

  if (!user) {
    return <div className="text-sm text-gray-500">{t("loadingUser")}</div>;
  }

  return (
    <section className="bg-white rounded-xl border border-gray-100 p-4 pt-2 space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-gray-700 py-2">{t("friends")}</h2>
      </div>

      {isInitialLoading ? (
        <div className="text-sm text-gray-600">{t("loading")}</div>
      ) : friendUsers.length === 0 ? (
        <div className="text-sm text-gray-500">{t("noFriends")}</div>
      ) : (
        <>
          {/* card to hơn: 1 cột trên mobile, 2 cột từ md trở lên */}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friendUsers.map((f) => (
              <li
                key={f.id}
                className="group cursor-pointer flex items-center gap-4 hover:bg-gray-50 p-4 rounded-md border border-gray-100 min-h-[96px]"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative">
                    {f.avatarUrl ? (
                      <UserAvatar
                        userId={f.id}
                        avatarUrl={f.avatarUrl}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-md"
                      />
                    ) : (
                      <DefaultAvatar
                        userId={f.id}
                        firstName={f.fullName}
                        className="w-16 h-16 md:w-20 md:h-20 rounded-md"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className="text-sm md:text-base font-medium text-gray-800 hover:underline hover:text-green-600 truncate"
                      title={f.fullName}
                    >
                      <UserName userId={f.id} fullname={f.fullName ?? ""} />
                    </p>
                    {f.address && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {f.address}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {hasMore && (
            <div
              ref={loaderRef}
              className="mt-3 h-8 flex items-center justify-center text-xs text-gray-500"
            >
              {loading && t("loading")}
            </div>
          )}
        </>
      )}
    </section>
  );
}
