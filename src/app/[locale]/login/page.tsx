"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { toSupabaseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/client";

type LoadingAction = "password" | "google" | null;

export default function LoginPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const fallbackNext = locale === "en" ? "/en/agent" : "/agent";

  const getNext = () => {
    if (typeof window === "undefined") return fallbackNext;
    const requestedPath = new URL(window.location.href).searchParams.get("next");
    return requestedPath?.startsWith("/") &&
      !requestedPath.startsWith("//") &&
      !requestedPath.includes("\\")
      ? requestedPath
      : fallbackNext;
  };

  useEffect(() => {
    const url = new URL(window.location.href);
    if (!url.searchParams.has("authError")) return;

    const timer = window.setTimeout(() => setError(t("errorOAuth")), 0);
    url.searchParams.delete("authError");
    window.history.replaceState(window.history.state, "", url);
    return () => window.clearTimeout(timer);
  }, [t]);

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError(t("errorInvalidCredentials"));
      return;
    }

    setLoadingAction("password");
    const next = getNext();

    try {
      const authIdentifier = await toSupabaseAuthIdentifier(identifier);
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: authIdentifier.email,
        password,
      });

      if (authError) {
        setError(t("errorInvalidCredentials"));
        return;
      }

      window.location.replace(next);
    } catch {
      setError(t("errorServer"));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoadingAction("google");

    try {
      const supabase = createClient();
      const next = getNext();
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(next)}`,
        },
      });

      if (authError) {
        setError(t("errorOAuth"));
        setLoadingAction(null);
      }
    } catch {
      setError(t("errorOAuth"));
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-gray-900 text-center">{t("loginTitle")}</h1>
        <p className="mt-2 text-sm text-gray-500 text-center">
          {t.rich("loginSubtitle", {
            brand: (chunks) => <span className="brand-cycle-text">{chunks}</span>,
          })}
        </p>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loadingAction !== null}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {t("continueWithGoogle")}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 px-3 text-gray-400">{t("or")}</span>
            </div>
          </div>

          <form onSubmit={handlePasswordLogin} className="space-y-3">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t("loginIdentifierPlaceholder")}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
              disabled={loadingAction !== null}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors disabled:opacity-50"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("passwordPlaceholder")}
              autoComplete="current-password"
              required
              disabled={loadingAction !== null}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors disabled:opacity-50"
            />

            {error && (
              <p className="text-sm font-medium text-gray-700" aria-live="polite">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full py-3 bg-gray-950 text-white font-medium rounded-full hover:bg-gray-800 transition-colors text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loadingAction === "password" ? t("loggingIn") : t("login")}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t("noAccount")}{" "}
          <Link href={locale === "en" ? "/en/signup" : "/signup"} className="text-gray-900 hover:text-gray-600 font-medium">
            {t("signUpLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
