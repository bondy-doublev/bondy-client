import Link from "next/link";

export default function UserName({
  className,
  userId,
  fullname,
}: {
  className?: string;
  userId: number;
  fullname: string;
}) {
  return (
    <Link
      href={"/wall/" + userId}
      className={`hover:underline cursor-pointer ${className}`}
    >
      {fullname}
    </Link>
  );
}
