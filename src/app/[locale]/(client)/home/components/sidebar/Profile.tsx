"use client";

import { userService } from "@/services/userService";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";

interface ProfileData {
  id: number;
  firstName: string;
  middleName?: string;
  lastName: string;
  avatarUrl: string;
  role: string;
  friendCount: number;
  active: boolean;
  gender?: boolean;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const { user } = useAuthStore();
  const t = useTranslations("sidebar");

  useEffect(() => {
    if (!user) return;

    userService.getProfile().then((res) => {
      setProfile(res.data ?? res);
    });
  }, [user]);

  if (!user) {
    return null;
  }

  if (!profile) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
        <div className="w-11 h-11 rounded-full bg-gray-300" />
        <div className="flex-1">
          <div className="h-3 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-2 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.middleName ?? ""} ${
    profile.lastName
  }`;
  const genderLabel =
    profile.gender === true ? "♂" : profile.gender === false ? "♀" : "";

  return (
    <Link
      href={`user/${profile.id}/profile`}
      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-green-200 transition"
    >
      {/* Avatar */}
      <div className="relative w-11 h-11 shrink-0">
        <Image
          unoptimized
          src={profile.avatarUrl}
          alt="avatar"
          fill
          className="rounded-full object-cover"
        />
        {profile.active && (
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-green-100 rounded-full" />
        )}
      </div>

      {/* Info */}
      <div className="leading-tight min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate flex items-center gap-1">
          {fullName}
          {genderLabel && (
            <span className="text-xs text-gray-500">{genderLabel}</span>
          )}
        </p>
        <p className="text-xs text-gray-500 truncate">
          {profile.role} · {profile.friendCount} {t("friends")}
        </p>
      </div>
    </Link>
  );
}
