import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that authed users should be redirected away from
const authPaths = ["/login", "/signup"];
const protectedPaths = ["/agent", "/profile"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The public experience is English-only. Preserve old links without serving
  // a second localized version of the interface.
  if (/^\/zh(?:\/|$)/.test(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/^\/zh(?=\/|$)/, "") || "/";
    return NextResponse.redirect(url, 308);
  }

  // Strip locale prefix for path matching
  const pathnameWithoutLocale = pathname.replace(/^\/en(?=\/|$)/, "") || "/";

  // Run intl middleware first (handles locale detection/redirect)
  const intlResponse = intlMiddleware(request);
  const response = intlResponse || NextResponse.next();

  const isAuthPath = authPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );
  const isProtectedPath = protectedPaths.some((path) =>
    pathnameWithoutLocale.startsWith(path)
  );

  if (isAuthPath || isProtectedPath) {
    const { user } = await updateSession(request, response);

    if (isAuthPath && user) {
      const url = request.nextUrl.clone();
      url.pathname = "/agent";
      return NextResponse.redirect(url);
    }

    if (isProtectedPath && !user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathnameWithoutLocale);
      return NextResponse.redirect(url);
    }
  }

  if (pathnameWithoutLocale === "/") {
    response.headers.set(
      "Cache-Control",
      "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400"
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
