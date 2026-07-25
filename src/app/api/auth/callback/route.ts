import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function redirectToLogin(origin: string, loginPath: string, next: string) {
  const url = new URL(loginPath, origin);
  url.searchParams.set("authError", "oauth");
  url.searchParams.set("next", next);
  return NextResponse.redirect(url, 303);
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedPath = searchParams.get("next");
  const next =
    requestedPath?.startsWith("/") &&
    !requestedPath.startsWith("//") &&
    !requestedPath.includes("\\")
      ? requestedPath
      : "/";
  const loginPath = next === "/en" || next.startsWith("/en/")
    ? "/en/login"
    : "/login";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(new URL(next, origin), 303);
      }
    } catch {
      return redirectToLogin(origin, loginPath, next);
    }
  }

  return redirectToLogin(origin, loginPath, next);
}
