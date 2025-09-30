"use client";

import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useTranslations } from "use-intl";
import Home from "./home/page";

export default function HomePage() {
  const { user } = useAuthStore();
  const t = useTranslations("home");

  return (
    <div className="min-h-[70vh]">
      {user ? (
        <Home />
      ) : (
        <div className="space-y-4 text-center p-6">
          <h1 className="text-2xl font-bold text-black">{t("welcome")}</h1>
        </div>
      )}
    </div>
  );
}
