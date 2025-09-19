"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { setUserLocale } from "@/actions/locale";
import { Globe } from "lucide-react"; // <-- đổi sang Lucide

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const localeLabels: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};

export default function LanguageSwitcher() {
  const currentLocale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = async (lang: Locale) => {
    await setUserLocale(lang);

    const segments = pathname.split("/");
    segments[1] = lang;
    const newPath = segments.join("/");

    router.replace(newPath);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 text-sm font-medium hover:text-cyan transition-colors">
          <Globe className="w-6 h-6" />
          {currentLocale.toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {locales.map((lang) => (
          <DropdownMenuItem
            key={lang}
            onClick={() => handleChange(lang as Locale)}
            className={`cursor-pointer ${
              lang === currentLocale
                ? "font-bold text-cyan"
                : "hover:text-cyan transition-colors"
            }`}
          >
            {localeLabels[lang as Locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
