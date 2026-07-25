"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { ArrowUpRight, BadgeCheck, LoaderCircle, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Logo from "./Logo";

type LeaderboardEntry = {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  connection_count: number | string;
};

function localizedHref(locale: string, path: string) {
  return locale === "en" ? `/en${path}` : path;
}

function initial(name: string) {
  return name.slice(0, 1).toUpperCase() || "T";
}

export default function FoodiesLeaderboard() {
  const t = useTranslations("foodies");
  const locale = useLocale();
  const [people, setPeople] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const isConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const loadLeaderboard = useCallback(async () => {
    if (!isConfigured) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase.rpc("get_foodies_leaderboard");
    if (error) {
      setHasError(true);
    } else {
      setPeople((data ?? []) as LeaderboardEntry[]);
      setHasError(false);
    }
    setIsLoading(false);
  }, [isConfigured]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadLeaderboard(), 0);
    if (!isConfigured) return () => window.clearTimeout(initialLoad);

    const supabase = createClient();
    const channel = supabase
      .channel("foodies-leaderboard-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "relationship_leaderboard_events" },
        () => void loadLeaderboard()
      )
      .subscribe();

    return () => {
      window.clearTimeout(initialLoad);
      void supabase.removeChannel(channel);
    };
  }, [isConfigured, loadLeaderboard]);

  return (
    <main className="simple-foodies-shell">
      <header className="simple-foodies-header">
        <Link href={localizedHref(locale, "") || "/"} aria-label="TOMEET home">
          <Logo size={29} />
        </Link>
        <Link href={localizedHref(locale, "/profile")} className="simple-foodies-profile">
          {t("myProfile")}<ArrowUpRight aria-hidden="true" />
        </Link>
      </header>

      <section className="simple-foodies-content">
        <div className="simple-foodies-title">
          <h1>{t("simpleTitle")}</h1>
          <span>{t("simpleDescription")}</span>
        </div>

        <div className="simple-foodies-list" role="list" aria-label={t("simpleTitle")}>
          <div className="simple-foodies-columns" aria-hidden="true">
            <span>{t("rank")}</span>
            <span>{t("person")}</span>
            <span>{t("connections")}</span>
          </div>

          {isLoading && (
            <div className="simple-foodies-state">
              <LoaderCircle aria-hidden="true" />{t("loading")}
            </div>
          )}

          {!isLoading && hasError && (
            <div className="simple-foodies-state">{t("unavailable")}</div>
          )}

          {!isLoading && !hasError && people.length === 0 && (
            <div className="simple-foodies-state">{t("empty")}</div>
          )}

          {people.map((person, index) => {
            const avatarStyle = person.avatar_url
              ? { backgroundImage: `url(${JSON.stringify(person.avatar_url)})` }
              : undefined;

            return (
              <article className="simple-foodies-row" role="listitem" key={person.user_id}>
                <span className="simple-foodies-rank">{String(index + 1).padStart(2, "0")}</span>
                <div
                  className={`simple-foodies-avatar${person.avatar_url ? " has-image" : ""}`}
                  style={avatarStyle}
                >
                  {!person.avatar_url && initial(person.display_name)}
                </div>
                <div className="simple-foodies-person">
                  <strong>{person.display_name}<BadgeCheck aria-label={t("verified")} /></strong>
                </div>
                <div className="simple-foodies-count">
                  <strong>{Number(person.connection_count)}</strong>
                  <span><Users aria-hidden="true" />{t("offlineConnections")}</span>
                </div>
              </article>
            );
          })}
        </div>

        {!hasError && (
          <p className="simple-foodies-note">
            <span aria-hidden="true" />{t("liveUpdated")}
          </p>
        )}
      </section>
    </main>
  );
}
