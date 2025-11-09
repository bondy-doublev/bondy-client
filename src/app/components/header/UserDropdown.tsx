"use client";

import Image from "next/image";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import DefaultAvatar from "@/app/[locale]/(client)/home/components/user/DefaultAvatar";

export default function UserDropdown() {
  const router = useRouter();
  const { user, setUser, setTokens } = useAuthStore();

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setTokens(null);
      router.push("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-8 h-8 rounded-full overflow-hidden cursor-pointer border border-gray-300 flex items-center justify-center bg-gray-100">
          {user !== null ? (
            user.avatarUrl ? (
              <Image
                width={32}
                height={32}
                src={user.avatarUrl}
                alt="Avatar"
                className="object-cover"
              />
            ) : (
              <DefaultAvatar firstName={user?.firstName} />
            )
          ) : (
            <Image
              width={32}
              height={32}
              src="/images/fallback/user.png"
              alt="Default Avatar"
            />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {user ? (
          <>
            <div
              onClick={() => router.push("/wall/" + user.id)}
              className="px-3 py-2 border-b border-gray-200 text-sm font-medium cursor-pointer hover:bg-gray-100 hover:rounded-md"
            >
              {user?.firstName} {user?.lastName}
            </div>
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 cursor-pointer"
            >
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/signin">Sign In</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/signup">Sign Up</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
