import type { Metadata } from "next";
import ProfileHub from "@/components/ProfileHub";
import { getAuthenticatedViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile — TOMEET"
};

export default async function ProfilePage({
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ invite?: string }>;
}) {
  const viewer = await getAuthenticatedViewer();
  const query = await searchParams;

  return (
    <ProfileHub
      viewer={viewer}
      initialInvite={query.invite ?? null}
    />
  );
}
