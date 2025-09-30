"use client";

import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function NotificationDropdown() {
  const notifications = [
    { id: 1, text: "New comment on your post" },
    { id: 2, text: "Your profile was viewed 10 times today" },
  ];

  return (
    <DropdownMenu>
      {/* Trigger là icon Bell */}
      <DropdownMenuTrigger asChild>
        <div className="relative w-6 h-6 flex items-center justify-center cursor-pointer rounded-full transition">
          <Bell className="w-6 h-6" />
          {notifications.length > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white-always text-xs rounded-full flex items-center justify-center">
              {notifications.length}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown */}
      <DropdownMenuContent align="end" className="w-60">
        {notifications.map((n) => (
          <DropdownMenuItem key={n.id}>{n.text}</DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
