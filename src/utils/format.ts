export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const hh = h > 0 ? `${h.toString().padStart(2, "0")}:` : "";
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");

  return `${hh}${mm}:${ss}`;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}

export function extractErrorMessage(err: any): string {
  if (!err) return "Something went wrong";

  return (
    err?.response?.data?.data?.message ||
    err?.response?.data?.message ||
    err?.message ||
    err ||
    "Something went wrong"
  );
}

export function getTimeAgo(createdAt: string): number {
  const now = Date.now();
  const diff = (new Date(createdAt).getTime() - now) / 1000;

  const absDiff = Math.abs(diff);

  return absDiff;
}
