"use client";

import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useTranslations } from "use-intl";

export default function HomePage() {
  const { user } = useAuthStore();
  const t = useTranslations("home");

  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[70vh]">
      <div className="mt-6 bg-cyan-500 text-white rounded-xl shadow-lg p-10 space-y-6 w-full max-w-xl">
        {user ? (
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold">
              {t("welcomeBack")}, {user.email}
            </h1>
            {user.avatar && (
              <Image
                src={user.avatar}
                width={100}
                height={100}
                alt="User"
                className="rounded-full mx-auto border-4 border-white"
              />
            )}
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <h1 className="text-2xl font-bold text-black">{t("welcome")}</h1>
          </div>
        )}
      </div>
    </div>
  );
}
