export function stripLocale(pathname: string) {
  const locales = ["en", "vi"];
  const parts = pathname.split("/");

  if (locales.includes(parts[1])) {
    return "/" + parts.slice(2).join("/");
  }

  return pathname;
}
