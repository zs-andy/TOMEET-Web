import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Logo from "@/components/Logo";
import { getAuthenticatedViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile — TOMEET",
};

export default async function ProfilePage() {
  await getAuthenticatedViewer();
  const t = await getTranslations("profile");

  return (
    <main className="profile-shell">
      <header className="agent-header">
        <Link href="/agent" className="agent-brand" aria-label={t("backToAgent")}>
          <Logo size={29} />
        </Link>
      </header>
      <section className="profile-empty" aria-label={t("title")} />
    </main>
  );
}
