import React from "react";

export default function Stories() {
  return (
    <div className="flex gap-4 overflow-x-auto">
      {[...Array(2)].map((_, i) => (
        <div
          key={i}
          className="w-20 h-32 sm:w-24 sm:h-36 bg-gray-200 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
        >
          Story {i + 1}
        </div>
      ))}
    </div>
  );
}
