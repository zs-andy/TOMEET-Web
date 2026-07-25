import createIntlMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Routes that authed users should be redirected away from
const authPaths = ["/login", "/signup"];
const protectedPaths = ["/profile"];

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const localeMatch = pathname.match(/^\/(en|zh)(?=\/|$)/);
  const localePrefix = localeMatch?.[1] === "en" ? "/en" : "";
  const pathnameWithoutLocale =
    pathname.replace(/^\/(?:en|zh)(?=\/|$)/, "") || "/";

  // Run intl middleware first (handles locale detection/redirect)
  const intlResponse = intlMiddleware(request);
  const response = intlResponse || NextResponse.next();

  if (
    pathnameWithoutLocale === "/agent" ||
    pathnameWithoutLocale.startsWith("/agent/")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = localePrefix || "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

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
      url.pathname = localePrefix || "/";
      url.search = "";
      return NextResponse.redirect(url);
    }

    if (isProtectedPath && !user) {
      const url = request.nextUrl.clone();
      url.pathname = `${localePrefix}/login`;
      url.searchParams.set("next", `${localePrefix}${pathnameWithoutLocale}`);
      return NextResponse.redirect(url);
    }
  }

  if (pathnameWithoutLocale === "/") {
    response.headers.set(
      "Cache-Control",
      "private, no-store, max-age=0"
    );
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
