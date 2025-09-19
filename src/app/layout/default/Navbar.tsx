"use client";

import { useState, useRef, useEffect } from "react";
import LanguageSwitcher from "@/app/components/header/LanguageSwitcher";
import { ModeToggle } from "@/app/components/header/ModeToggle";
import NotificationDropdown from "@/app/components/header/NotificationDropdown";
import UserDropdown from "@/app/components/header/UserDropdown";
import {
  Home,
  Users,
  Video,
  Users2,
  MessageCircle,
  Search,
  X,
} from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import MenuDrawer from "@/app/components/header/MenuDrawer";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function Navbar() {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <header className="w-full bg-green text-foreground shadow-md sticky top-0 z-50">
      <div className="max-w-8xl mx-auto flex items-center justify-between px-4 py-2">
        {/* Left: Logo + Desktop Search */}
        <div className="flex items-center space-x-3 flex-1">
          <Image
            width={32}
            height={32}
            src={"/images/logo/favicon.png"}
            alt="Logo"
            className="w-8 h-8 rounded cursor-pointer"
          />
          <h2 className="text-xl font-semibold transition-colors duration-300 ml-[-8px]">
            Bondy
          </h2>

          {/* Desktop Search */}
          <div className="relative hidden sm:block w-full max-w-xs">
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-3 py-2 rounded-full bg-muted text-sm text-black focus:outline-none"
            />
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          </div>

          {/* Mobile Search */}
          <div className="sm:hidden">
            <Dialog>
              <DialogTrigger asChild>
                <Search className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
              </DialogTrigger>

              <DialogContent className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg">
                <DialogTitle></DialogTitle>
                <Input
                  ref={inputRef}
                  placeholder="Search..."
                  className="pl-4 w-full text-black"
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Center: Navigation icons */}
        <div className="hidden sm:flex items-center space-x-8 justify-center flex-1">
          <Home className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
          <Users className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
          <MessageCircle className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
          <Video className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
          <Users2 className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4 flex-1 justify-end">
          {/* Desktop */}
          <div className="hidden sm:flex items-center space-x-4">
            <LanguageSwitcher />
            <ModeToggle />
            <NotificationDropdown />
            <UserDropdown />
          </div>

          {/* Mobile */}
          <div className="sm:hidden flex items-center space-x-4">
            <LanguageSwitcher />  
            <NotificationDropdown />
            <MessageCircle className="w-6 h-6 cursor-pointer hover:text-cyan transition" />
            <UserDropdown />
            <MenuDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
