"use client";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export default function UserDropdown() {
  const options = [
    { id: 1, label: "Profile", href: "/profile" },
    { id: 2, label: "Settings", href: "/settings" },
    { id: 3, label: "Logout", href: "/logout" },
  ];

  return (
    <DropdownMenu>
      {/* Trigger là avatar */}
      <DropdownMenuTrigger asChild>
        <div className="w-6 h-6 rounded-full overflow-hidden cursor-pointer border border-gray-300">
          <Image
            width={36}
            height={36}
            src="/images/fallback/user.png"
            alt="Avatar"
          />
        </div>
      </DropdownMenuTrigger>

      {/* Dropdown menu */}
      <DropdownMenuContent align="end" className="w-40">
        {options.map((opt) => (
          <DropdownMenuItem key={opt.id} asChild>
            <a href={opt.href}>{opt.label}</a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
