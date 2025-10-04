"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import Spinner from "@/app/components/ui/spinner";

export default function SignInSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser } = useAuthStore();

  useEffect(() => {
    const email = searchParams.get("email") ?? "";
    const name = searchParams.get("name") ?? "";
    const image = searchParams.get("image") ?? "";
    const provider = searchParams.get("provider") ?? "";

    const [firstName, ...rest] = name.split(" ");
    const lastName = rest.join(" ");

    if (email && name) {
      authService
        .oauth2({
          provider,
          email,
          avatarUrl: image,
          firstName,
          lastName,
        })
        .then((res) => {
          setUser(res.data.user);
          router.replace("/");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[300px] w-full">
      <Spinner aria-label="Sign in..." />
    </div>
  );
}
