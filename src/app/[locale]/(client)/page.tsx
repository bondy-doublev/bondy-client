"use client";

import { useAuthStore } from "@/store/authStore";
import Home from "./home/page";
import Loader from "@/app/components/ui/loader/Loader";

export default function HomePage() {
  const { user } = useAuthStore();

  return (
    <div className="min-h-[70vh] min-w-full">
      {user ? <Home /> : <Loader loading={user === null} type="success" />}
    </div>
  );
}
