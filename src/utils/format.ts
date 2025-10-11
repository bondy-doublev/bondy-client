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

export const formatTime = (seconds: number, t: (key: string) => string) => {
  if (seconds < 60) {
    return `${seconds} ${seconds > 1 ? t("seconds") : t("second")}`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} ${minutes > 1 ? t("minutes") : t("minute")}`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ${hours > 1 ? t("hours") : t("hour")}`;
  }
  const days = Math.floor(hours / 24);
  return `${days} ${days > 1 ? t("days") : t("day")}`;
};
