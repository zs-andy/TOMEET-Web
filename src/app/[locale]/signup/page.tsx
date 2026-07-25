"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { toSupabaseAuthIdentifier } from "@/lib/auth-identifier";
import { createClient } from "@/lib/supabase/client";

type LoadingAction = "signup" | "google" | null;

export default function SignupPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const fallbackNext = locale === "en" ? "/en" : "/";

  const getNext = () => {
    if (typeof window === "undefined") return fallbackNext;
    const requestedPath = new URL(window.location.href).searchParams.get("next");
    return requestedPath?.startsWith("/") &&
      !requestedPath.startsWith("//") &&
      !requestedPath.includes("\\")
      ? requestedPath
      : fallbackNext;
  };

  const getSignupError = (code?: string) => {
    switch (code) {
      case "email_exists":
      case "user_already_exists":
        return t("errorIdentifierExists");
      case "email_address_invalid":
      case "validation_failed":
        return t("errorInvalidIdentifier");
      case "weak_password":
        return t("errorPasswordWeak");
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return t("errorRateLimited");
      default:
        return t("errorServer");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!identifier.trim()) {
      setError(t("errorInvalidIdentifier"));
      return;
    }

    if (password.length < 6) {
      setError(t("errorPasswordTooShort"));
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errorPasswordMismatch"));
      return;
    }

    setLoadingAction("signup");
    const next = getNext();

    try {
      const authIdentifier = await toSupabaseAuthIdentifier(identifier);
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signUp({
        email: authIdentifier.email,
        password,
        options: {
          data: {
            login_identifier: authIdentifier.original,
            login_identifier_kind: authIdentifier.kind,
          },
        },
      });

      if (authError) {
        setError(getSignupError(authError.code));
        return;
      }

      if (!data.session) {
        setError(t("errorServer"));
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
        <h1 className="text-2xl font-bold text-gray-900 text-center">{t("signupTitle")}</h1>
        <p className="mt-2 text-sm text-gray-500 text-center">
          {t.rich("signupSubtitle", {
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

          <form onSubmit={handleSignup} className="space-y-3">
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t("signupIdentifierPlaceholder")}
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
              autoComplete="new-password"
              required
              disabled={loadingAction !== null}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-900 transition-colors disabled:opacity-50"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("confirmPasswordPlaceholder")}
              autoComplete="new-password"
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
              {loadingAction === "signup" ? t("signingUp") : t("signup")}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          {t("hasAccount")}{" "}
          <Link href={locale === "en" ? "/en/login" : "/login"} className="text-gray-900 hover:text-gray-600 font-medium">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}
