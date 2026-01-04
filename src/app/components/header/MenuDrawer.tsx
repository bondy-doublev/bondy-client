"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useTranslations } from "use-intl";

import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "@/components/ui/drawer";
import { SIDEBAR_ITEMS } from "@/constants";

export default function MenuDrawer() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("sidebar");
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <Drawer open={open} onOpenChange={setOpen}>
        {/* ===== Trigger: Menu icon ===== */}
        <DrawerTrigger asChild>
          <button
            aria-label="Open menu"
            className="
              p-2.5 rounded-xl
              bg-white
              active:scale-95
              transition
            "
          >
            {/* Icon trắng, nổi trên nền trắng nhờ shadow */}
            <Menu className="w-6 h-6 text-green-600" />
          </button>
        </DrawerTrigger>

        {/* ===== Drawer Content ===== */}
        <DrawerContent className="bg-gray-100 border-t-0 rounded-t-3xl outline-none">
          <div className="mx-auto w-full max-w-sm">
            {/* ===== Header ===== */}
            <DrawerHeader className="flex items-center justify-between px-5 pt-6 pb-3">
              <DrawerTitle className="text-xl font-bold text-green-800">
                Menu
              </DrawerTitle>

              <DrawerClose asChild>
                <button
                  aria-label="Close menu"
                  className="
                    p-2 rounded-full
                    bg-white
                    text-green-700
                    hover:bg-green-100
                    transition
                  "
                >
                  <X className="w-5 h-5" />
                </button>
              </DrawerClose>
            </DrawerHeader>

            {/* ===== Menu List ===== */}
            <div className="px-4 pb-8">
              <ul className="flex flex-col gap-2">
                {SIDEBAR_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={() => setOpen(false)}
                        className={`
                          flex items-center gap-4
                          px-4 py-3.5
                          rounded-xl
                          text-sm font-medium
                          transition
                          ${
                            isActive
                              ? "bg-green-600 text-white shadow-lg shadow-green-200"
                              : "bg-white text-green-800 hover:bg-green-100"
                          }
                        `}
                      >
                        <span>{t(item.id)}</span>

                        {item.badge && (
                          <span className="ml-auto text-xs font-semibold bg-red-500 text-white rounded-full px-2 py-0.5">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* ===== Footer ===== */}
            <DrawerFooter className="pt-0 pb-6">
              <p className="text-center text-xs text-green-400">
                © 2024 Your App
              </p>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
