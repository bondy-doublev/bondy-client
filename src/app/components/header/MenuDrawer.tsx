"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Drawer,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { SIDEBAR_ITEMS } from "@/constants";
import { useTranslations } from "use-intl";

export default function MenuDrawer() {
  const [open, setOpen] = useState(false);
  const t = useTranslations("sidebar");

  return (
    <div className="sm:hidden">
      <Drawer open={open} onOpenChange={setOpen}>
        {/* Trigger: Menu icon */}
        <DrawerTrigger asChild>
          <Menu className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
        </DrawerTrigger>

        {/* Drawer Content */}
        <DrawerContent className="w-64 p-4 bg-green text-white">
          <DrawerHeader>
            <DrawerTitle>Menu</DrawerTitle>
            <DrawerClose className="absolute top-3 right-3" />
          </DrawerHeader>

          <ul className="flex flex-col mt-6 space-y-4">
            {SIDEBAR_ITEMS.map((item) => (
              <li
                key={item.id}
                className="flex items-center space-x-3 cursor-pointer hover:bg-green-700 p-2 rounded-lg"
              >
                <div className="w-6 h-6">{item.icon}</div>
                <span>{t(item.id)}</span>
                {item.badge && (
                  <span className="ml-auto text-sm bg-red-500 text-white rounded-full px-2">
                    {item.badge}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
