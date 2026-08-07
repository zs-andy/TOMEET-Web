import AgentChat from "@/components/AgentChat";
import { getCurrentAuthUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AgentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const currentUser = await getCurrentAuthUser();

  if (!currentUser) {
    redirect(
      locale === "en"
        ? "/en/login?next=/en/agent"
        : "/login?next=/agent"
    );
  }

  return (
    <AgentChat
      viewer={{
        id: currentUser.id,
        avatarUrl: currentUser.avatarUrl,
        label: currentUser.label,
      }}
    />
  );
}
