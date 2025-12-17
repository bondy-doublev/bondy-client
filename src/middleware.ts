import { locales, defaultLocale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // ✅ Lấy search params (query string)
  const searchParams = request.nextUrl.search;

  // Bỏ qua nếu đã có locale
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const locale = defaultLocale;

    // ✅ FIX: Giữ lại query params khi redirect
    const redirectUrl = new URL(
      `/${locale}${pathname}${searchParams}`,
      request.url
    );

    console.log("🔀 MIDDLEWARE REDIRECT:", {
      from: request.url,
      to: redirectUrl.toString(),
      searchParams,
    });

    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    "/((?!api|_next|favicon.ico|assets|.*\\..*|auth-callback|auth-success).*)",
  ],
};
