import React from "react";

export default function DefaultAvatar({ firstName }: { firstName?: string }) {
  const initial = firstName?.charAt(0)?.toUpperCase() || "?";

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-red-500",
  ];

  const color = colors[initial.charCodeAt(0) % colors.length];

  return (
    <div
      className={`relative w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold cursor-pointer hover:brightness-105 transition ring-2 ring-white ${color}`}
    >
      {initial}
    </div>
  );
}
