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
    const email = searchParams.get("email");
    const name = searchParams.get("name");
    const image = searchParams.get("image") || undefined;

    if (email && name) {
      authService
        .signInOAuth(email, name, image)
        .then((res) => {
          setUser(res.user);
          router.replace("/");
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[300px] w-full">
      <Spinner size="xl" aria-label="Sign in..." />
    </div>
  );
}
