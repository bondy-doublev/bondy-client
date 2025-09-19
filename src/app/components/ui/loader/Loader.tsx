"use client";

interface LoaderProps {
  loading: boolean;
  text?: string;
  type?: "success" | "info" | "warning" | "error" | "default"; 
}

export default function Loader({ loading, text, type = "info" }: LoaderProps) {
  if (!loading) return null;

  const bgColors: Record<string, string> = {
    success: "bg-green-500",
    info: "bg-blue-500",
    warning: "bg-yellow-400",
    error: "bg-red-500",
    default: "bg-cyan-500", // thêm màu cyan
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="flex flex-col items-center gap-3 p-4">
        {/* Square spinner */}
        <div
          className={`w-12 h-12 ${bgColors[type]} animate-spin`}
          style={{ borderRadius: "0.25rem" }}
        ></div>
        {text && <div className="text-gray-100 font-medium">{text}</div>}
      </div>
    </div>
  );
}
