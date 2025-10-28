import { useRouter } from "next/navigation";

export default function UserName({
  className,
  userId,
  fullname,
}: {
  className?: string;
  userId: number;
  fullname: string;
}) {
  const router = useRouter();

  return (
    <p
      onClick={() => router.push("/wall/" + userId)}
      className={`font-semibold hover:underline cursor-pointer ${className}`}
    >
      {fullname}
    </p>
  );
}
