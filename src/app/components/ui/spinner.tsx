export default function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900 ${className}`}
    />
  );
}
