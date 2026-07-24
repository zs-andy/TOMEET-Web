import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import Logo from "@/components/Logo";
import { getAuthenticatedViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile — TOMEET",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  await getAuthenticatedViewer();
  const { locale } = await params;
  const t = await getTranslations("profile");
  const agentHref = locale === "en" ? "/en/agent" : "/agent";

  return (
    <main className="profile-shell">
      <header className="agent-header">
        <Link href={agentHref} className="agent-brand" aria-label={t("backToAgent")}>
          <Logo size={29} />
        </Link>
      </header>
      <section className="profile-empty" aria-label={t("title")} />
    </main>
  );
}
