"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Users,
  Video,
  Users2,
  MessageCircle,
  Search,
} from "lucide-react";
import Image from "next/image";
import { useAuthStore } from "@/store/authStore";
import LanguageSwitcher from "@/app/components/header/LanguageSwitcher";
import { ModeToggle } from "@/app/components/header/ModeToggle";
import NotificationDropdown from "@/app/components/header/NotificationDropdown";
import UserDropdown from "@/app/components/header/UserDropdown";
import MenuDrawer from "@/app/components/header/MenuDrawer";
import { requestBrowserNotificationPermission } from "@/lib/browserNotification";
import { useChat } from "@/app/providers/ChatProvider";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

import { userService } from "@/services/userService";
import User from "@/models/User";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";
import UserAvatar from "@/app/[locale]/(client)/home/components/user/UserAvatar";
import { useTranslations } from "next-intl";

function useDebounce<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ✅ simple media query hook (no extra libs)
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const onChange = () => setMatches(m.matches);
    onChange();
    m.addEventListener?.("change", onChange);
    return () => m.removeEventListener?.("change", onChange);
  }, [query]);
  return matches;
}

export default function Navbar() {
  const t = useTranslations("navbar");

  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const { user } = useAuthStore();
  const { unreadCount } = useChat();

  useEffect(() => {
    if (!user?.id) return;
    requestBrowserNotificationPermission();
  }, [user?.id]);

  const navItems = [
    { path: "/", icon: Home },
    { path: "/friends", icon: Users },
    {
      path: "/chat",
      icon: MessageCircle,
      badge: unreadCount, // 👈 dùng unreadCount
    },
    {
      path: "/reels",
      icon: Video,
    },
  ];

  // =======================
  // ✅ Search state
  // =======================
  const isMobile = useMediaQuery("(max-width: 639px)"); // tailwind sm breakpoint

  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 350);

  const [openPopover, setOpenPopover] = useState(false); // desktop
  const [openDialog, setOpenDialog] = useState(false); // mobile

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  const keyword = useMemo(() => debouncedQ.trim(), [debouncedQ]);

  // fetch
  useEffect(() => {
    if (!keyword) {
      setResults([]);
      setError(null);
      setLoading(false);
      setOpenPopover(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await userService.searchUsers(undefined, keyword);
        if (cancelled) return;

        setResults(Array.isArray(data) ? data : data?.items ?? []);

        // ✅ auto open when has keyword (desktop only)
        if (!isMobile) setOpenPopover(true);
      } catch {
        if (cancelled) return;
        setError("Search failed");
        setResults([]);
        if (!isMobile) setOpenPopover(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [keyword, isMobile]);

  // ✅ keep focus when popover opens (desktop)
  useEffect(() => {
    if (openPopover) {
      // delay 0 to allow popover mount, then focus back
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [openPopover]);

  const onSelectUser = (u: User) => {
    setOpenPopover(false);
    setOpenDialog(false);
    setQ("");
    setResults([]);
    router.push(`/user/${u.id}`);
  };

  // ✅ shared UI list (đồng nhất giữa popover & dialog)
  const ResultList = () => (
    <div className="overflow-auto max-h-72 scroll-custom">
      {loading && (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          {t("searching")}
        </div>
      )}

      {!loading && error && (
        <div className="px-4 py-3 text-sm text-red-500">{error}</div>
      )}

      {!loading && !error && keyword && results.length === 0 && (
        <div className="px-4 py-3 text-sm text-muted-foreground">
          {t("noResults")}
        </div>
      )}

      {!loading &&
        !error &&
        results.map((u) => (
          <button
            key={u.id}
            onClick={() => onSelectUser(u)}
            className="flex items-center w-full gap-3 px-4 py-3 text-left transition hover:bg-green-100"
          >
            <div className="relative overflow-hidden rounded-full bg-muted shrink-0">
              {u.avatarUrl ? (
                <UserAvatar userId={u.id} avatarUrl={u.avatarUrl} />
              ) : (
                <DefaultAvatar userId={u.id} firstName={u.firstName} />
              )}
            </div>

            <div className="min-w-0">
              <div className="text-sm font-medium truncate">
                {u.firstName + " " + u.lastName + " " + (u.middleName ?? "")}
              </div>
              {u.address && (
                <div className="text-xs truncate text-muted-foreground">
                  {u.address}
                </div>
              )}
            </div>
          </button>
        ))}
    </div>
  );

  // ✅ shared search input UI (đồng nhất)
  const SearchInput = ({ className = "" }: { className?: string }) => (
    <div className={`relative w-full max-w-xs ${className}`}>
      <Input
        ref={inputRef}
        value={q}
        onChange={(e) => {
          const val = e.target.value;
          setQ(val);
          if (!isMobile && val.trim()) setOpenPopover(true);
          if (!isMobile && !val.trim()) setOpenPopover(false);
        }}
        onFocus={() => {
          if (!isMobile && q.trim()) setOpenPopover(true);
        }}
        placeholder="Search..."
        className="w-full py-2 pl-10 pr-3 text-sm text-black rounded-full bg-muted"
      />
      <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full bg-green text-foreground">
      <div className="flex items-center justify-between px-4 py-2 mx-auto max-w-8xl">
        {/* Left */}
        <div className="flex items-center flex-1 space-x-3">
          <Image
            width={32}
            height={32}
            src="/images/logo/favicon.png"
            alt="Logo"
            className="w-8 h-8 rounded cursor-pointer"
            onClick={() => router.push("/")}
            unoptimized
          />
          <h2
            className="text-xl font-semibold cursor-pointer"
            onClick={() => router.push("/")}
          >
            Bondy
          </h2>

          {/* ✅ Desktop: Popover */}
          <div className="hidden sm:block">
            <Popover
              open={openPopover}
              onOpenChange={(v) => {
                setOpenPopover(v);
                if (!v) setError(null);
              }}
              modal={false}
            >
              <PopoverTrigger asChild>
                {/* trigger = input, nhưng focus sẽ được giữ nhờ onOpenAutoFocus + effect */}
                <div>{SearchInput({})}</div>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                className="w-[360px] p-0 rounded-xl border bg-white max-h-[420px] overflow-y-auto"
                // ✅ quan trọng: ngăn Radix auto-focus sang popover content
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="sticky top-0 z-10 p-3 font-semibold text-gray-800 bg-white border-b">
                  {t("results")}
                </div>
                <ResultList />
              </PopoverContent>
            </Popover>
          </div>

          {/* ✅ Mobile: Dialog modal (UI list vẫn y chang) */}
          <div className="sm:hidden">
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
              <DialogTrigger asChild>
                <Search className="w-6 h-6 transition cursor-pointer hover:text-cyan" />
              </DialogTrigger>

              <DialogContent className="fixed z-50 w-full max-w-md p-6 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg left-1/2 top-1/2">
                <DialogTitle />
                <div className="w-full">
                  <div className="relative w-full">
                    <Input
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Search..."
                      className="w-full pl-10 text-black"
                      autoFocus
                    />
                    <Search className="absolute w-5 h-5 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
                  </div>

                  <div className="mt-3 overflow-hidden bg-white border rounded-xl">
                    <ResultList />
                  </div>

                  {/* Optional clear */}
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => {
                        setQ("");
                        setResults([]);
                        setError(null);
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Center: Nav */}
        <div className="items-center justify-center flex-1 hidden space-x-8 sm:flex">
          {navItems.map(({ path, icon: Icon, badge }) => (
            <div key={path} className="relative">
              <Icon
                onClick={() => router.push(path)}
                className={`w-6 h-6 cursor-pointer transition ${
                  pathname === path ? "text-cyan" : "hover:text-cyan"
                }`}
              />
              {!!badge && (
                <span className="absolute px-1 text-xs text-white bg-red-500 rounded-full -top-2 -right-2">
                  {badge}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center justify-end flex-1 space-x-4">
          <div className="items-center hidden space-x-4 xl:flex">
            <LanguageSwitcher />
            {/* <ModeToggle /> */}
            <NotificationDropdown />
            <UserDropdown />
          </div>

          <div className="flex items-center space-x-4 xl:hidden">
            <LanguageSwitcher />
            <NotificationDropdown />
            <MessageCircle
              onClick={() => router.push("/chat")}
              className="w-6 h-6 transition cursor-pointer hover:text-cyan"
            />
            <UserDropdown />
            <MenuDrawer />
          </div>
        </div>
      </div>
    </header>
  );
}
