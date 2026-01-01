import { resolveFileUrl } from "@/utils/fileUrl";
import Image from "next/image";
import Link from "next/link";

export default function UserAvatar({
  className,
  userId,
  avatarUrl,
}: {
  className?: string;
  userId: number;
  avatarUrl: string;
}) {
  return (
    <Link href={`/user/${userId}`} className={className}>
      <div
        className={`relative w-10 h-10 rounded-full overflow-hidden cursor-pointer hover:brightness-105 transition ${className}`}
      >
        <Image
          src={resolveFileUrl(avatarUrl)}
          alt="avatar"
          fill
          className="object-cover"
          unoptimized
        />
      </div>
    </Link>
  );
}
