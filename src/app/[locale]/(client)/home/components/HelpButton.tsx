"use client";

import { HelpCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function HelpButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/help")}
      className="
        fixed bottom-24 right-6
        bg-[#10B981] hover:bg-[#059669]
        text-white
        rounded-full
        w-14 h-14
        flex items-center justify-center
        shadow-lg
        transition-all
        hover:scale-105
        z-50
      "
      title="Trợ lý ảo"
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
}
