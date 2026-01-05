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
import { useTranslations } from "next-intl";
import { resolveFileUrl } from "@/utils/fileUrl";
import { userService } from "@/services/userService";
import { useEffect } from "react";

export default function UserDropdown() {
  const t = useTranslations("navbar");

  const router = useRouter();
  const { setUser, setTokens, userProfile, setUserProfile } = useAuthStore();

  const handleGetUserProfile = async () => {
    try {
      const res = await userService.getProfile();
      setUserProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch user profile:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      setUserProfile(null);
      setUser(null);
      setTokens(null);
      router.push("/signin");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  useEffect(() => {
    handleGetUserProfile();
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center justify-center w-8 h-8 overflow-hidden bg-gray-100 border border-gray-300 rounded-full cursor-pointer">
          {userProfile !== null ? (
            userProfile.avatarUrl ? (
              <Image
                width={32}
                height={32}
                src={resolveFileUrl(userProfile.avatarUrl)}
                alt="Avatar"
                className="object-cover"
                unoptimized
              />
            ) : (
              <DefaultAvatar firstName={userProfile?.firstName} />
            )
          ) : (
            <Image
              width={32}
              height={32}
              src="/images/fallback/user.png"
              alt="Default Avatar"
              unoptimized
            />
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {userProfile ? (
          <>
            <div
              onClick={() => router.push("/user/" + userProfile.id)}
              className="px-3 py-2 text-sm font-medium border-b border-gray-200 cursor-pointer hover:bg-gray-100 hover:rounded-md"
            >
              {userProfile?.firstName} {userProfile?.lastName}
            </div>
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-red-500 cursor-pointer"
            >
              {t("logout")}
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href="/signin">{t("signIn")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/signup">{t("signUp")}</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
