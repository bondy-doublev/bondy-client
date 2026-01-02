import { locales, defaultLocale } from "@/i18n/config";
import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/home", "/chat", "/profile", "/settings", "/friends"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  /* ================= i18n ================= */
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (pathnameIsMissingLocale) {
    const redirectUrl = new URL(
      `/${defaultLocale}${pathname}${search}`,
      request.url
    );
    return NextResponse.redirect(redirectUrl);
  }

  /* ============== auth guard ============== */
  const locale = locales.find((l) => pathname.startsWith(`/${l}`))!;
  const pathnameWithoutLocale = pathname.replace(`/${locale}`, "") || "/";

  const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
    pathnameWithoutLocale.startsWith(route)
  );

  // 🔐 cookie-based auth
  const accessToken = request.cookies.get("accessToken")?.value;

  if (isProtectedRoute && !accessToken) {
    const signinUrl = new URL(`/${locale}/signin`, request.url);

    signinUrl.searchParams.set("callbackUrl", pathname + search);

    return NextResponse.redirect(signinUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|assets|.*\\..*).*)"],
};
