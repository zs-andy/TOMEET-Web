import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that require authentication (locale-stripped paths)
const protectedPaths = ["/app"];
// Routes that authed users should be redirected away from
const authPaths = ["/login", "/signup"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix for path matching
  const pathnameWithoutLocale = pathname.replace(/^\/(en|zh)/, "") || "/";

  // Run intl middleware first (handles locale detection/redirect)
  const intlResponse = intlMiddleware(request);
  const response = intlResponse || NextResponse.next();

  // Refresh Supabase session (updates cookies)
  const { user } = await updateSession(request, response);

  // Protect app routes — redirect to login if not authenticated
  if (protectedPaths.some((p) => pathnameWithoutLocale.startsWith(p))) {
    if (!user) {
      const locale = pathname.match(/^\/(en|zh)/)?.[1] || routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }
  }

  // Redirect authed users away from login/signup
  if (authPaths.some((p) => pathnameWithoutLocale.startsWith(p))) {
    if (user) {
      const locale = pathname.match(/^\/(en|zh)/)?.[1] || routing.defaultLocale;
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/app`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
