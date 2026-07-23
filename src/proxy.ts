import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that authed users should be redirected away from
const authPaths = ["/login", "/signup"];

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

  // Redirect authed users away from login/signup
  if (authPaths.some((p) => pathnameWithoutLocale.startsWith(p))) {
    const { user } = await updateSession(request, response);

    if (user) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
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
