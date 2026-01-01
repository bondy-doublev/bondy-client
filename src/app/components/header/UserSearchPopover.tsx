"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// đổi đúng service của bạn
import { userService } from "@/services/userService";
import { resolveFileUrl } from "@/utils/fileUrl";

type SearchedUser = {
  id: number;
  fullName: string;
  avatarUrl?: string;
  address?: string;
};

function useDebounce<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function UserSearchPopover() {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);

  const [q, setQ] = useState("");
  const dq = useDebounce(q, 350);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState<SearchedUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  const canSearch = useMemo(() => dq.trim().length > 0, [dq]);

  const fetchMoreUsers = async (reset = false) => {
    if (!canSearch) return;
    if (loading || (!hasMore && !reset)) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ BE của bạn hiện có address/name, mình dùng name = keyword
      const keyword = dq.trim();

      // Nếu BE có paging: truyền page/size vào params (tuỳ bạn)
      // Ví dụ: searchUsers(address, name, page, size)
      // Còn nếu BE chưa hỗ trợ paging thì cứ gọi 1 lần và setHasMore(false)
      const newData = await userService.searchUsers(undefined, keyword);

      // normalize array
      const list: SearchedUser[] = Array.isArray(newData)
        ? newData
        : newData?.items ?? [];

      if (reset) {
        setUsers(list);
        setPage(1);
        setHasMore(list.length === 10); // nếu size=10
        setOpen(true);
        return;
      }

      if (!list.length) {
        setHasMore(false);
        return;
      }

      setUsers((prev) => {
        const ids = new Set(prev.map((u) => u.id));
        return [...prev, ...list.filter((u) => !ids.has(u.id))];
      });

      setPage((p) => p + 1);
      setHasMore(list.length === 10);
    } catch (e) {
      setError("Search failed");
      if (reset) setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // mỗi lần dq đổi -> reset search
  useEffect(() => {
    if (!canSearch) {
      setUsers([]);
      setError(null);
      setHasMore(true);
      setPage(0);
      return;
    }
    fetchMoreUsers(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dq]);

  const handleOpenChange = (nextOpen: boolean) => {
    // giống NotificationDropdown: open/close + sync state
    setOpen(nextOpen);
    if (!nextOpen) {
      // đóng -> optional: clear list để sạch UI
      // setUsers([]);
      // setQ("");
      setError(null);
    } else {
      // mở -> focus input
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  };

  const handleClickUser = (u: SearchedUser) => {
    router.push(`/profile/${u.id}`); // đổi route theo bạn
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange} modal={false}>
      {/* Trigger = input + icon (desktop) */}
      <PopoverTrigger asChild>
        <div className="relative w-full max-w-xs">
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (q.trim()) setOpen(true);
            }}
            placeholder="Search..."
            className="w-full pl-10 pr-3 py-2 rounded-full bg-muted text-sm text-black focus:outline-none"
          />
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        </div>
      </PopoverTrigger>

      {/* Content dropdown */}
      <PopoverContent
        align="start"
        className="w-[360px] p-0 rounded-xl border bg-white shadow-xl max-h-[420px] overflow-y-auto"
      >
        {/* Header */}
        <div className="p-3 font-semibold text-gray-800 border-b sticky top-0 bg-white z-10">
          Results
        </div>

        {/* Body */}
        {!canSearch && (
          <div className="p-4 text-sm text-gray-500 text-center">
            Type something to search
          </div>
        )}

        {canSearch && users.length === 0 && !loading && !error && (
          <div className="p-4 text-sm text-gray-500 text-center">
            No results
          </div>
        )}

        {error && (
          <div className="p-4 text-sm text-red-500 text-center">{error}</div>
        )}

        {users.length > 0 && (
          <div className="divide-y divide-gray-100">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-green-100 transition"
                onClick={() => handleClickUser(u)}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0">
                  <Image
                    src={
                      resolveFileUrl(u.avatarUrl) ||
                      "/images/default-avatar.png"
                    }
                    alt={u.fullName}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {u.fullName}
                  </div>
                  {u.address && (
                    <div className="text-xs text-gray-500 truncate">
                      {u.address}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Load more */}
        {canSearch && hasMore && (
          <div className="p-3 text-center">
            <Button
              variant="default"
              disabled={loading}
              onClick={() => fetchMoreUsers()}
              className="w-full text-sm text-black font-bold bg-gray-200 hover:bg-gray-300 rounded-md focus:ring-0 focus:outline-none"
            >
              {loading ? "Loading..." : "Load more"}
            </Button>
          </div>
        )}

        {/* Loading skeleton nhẹ */}
        {canSearch && loading && users.length === 0 && (
          <div className="p-4 text-sm text-gray-500 text-center">
            Loading...
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
