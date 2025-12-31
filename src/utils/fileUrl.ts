export function resolveFileUrl(path: string | null | undefined) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const base = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL ?? "";
  const prefixBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const prefixPath = path.startsWith("/") ? path : `/${path}`;

  return prefixBase + prefixPath;
}
