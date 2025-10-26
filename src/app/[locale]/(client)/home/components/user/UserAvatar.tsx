import Image from "next/image";
import React from "react";

export default function UserAvatar({
  className,
  avatarUrl,
}: {
  className?: string;
  avatarUrl: string;
}) {
  return (
    <div
      className={`relative w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:brightness-105 transition ${className}`}
    >
      <Image src={avatarUrl} alt="post" fill className="object-cover" />
    </div>
  );
}
