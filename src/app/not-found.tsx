"use client";

import Link from "next/link";
import { useTranslations } from "use-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6">
      {/* Mã số lỗi */}
      <h1 className="text-9xl font-bold text-cyan">404</h1>

      {/* Tiêu đề */}
      <h2 className="mt-4 text-3xl font-semibold text-gray-800">
        {t("title")}
      </h2>

      {/* Mô tả */}
      <p className="mt-2 text-gray-500 max-w-lg">{t("description")}</p>

      {/* Nút quay về Home */}
      <div className="mt-6 flex gap-3">
        <Link href="/">
          <button className="cursor-pointer" color="success">
            {t("backHome")}
          </button>
        </Link>
        <Link href="/contact">
          <button className="cursor-pointer" color="cyan">
            {t("contactSupport")}
          </button>
        </Link>
      </div>
    </div>
  );
}
