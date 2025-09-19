"use client";
import { useTranslations } from "next-intl";

export default function HomeTab() {
  const t = useTranslations("home");

  return <h1>{t("hello")}</h1>;
}
