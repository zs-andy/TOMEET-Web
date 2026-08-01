import type { Metadata } from "next";
import ProfileHub from "@/components/ProfileHub";
import { getAuthenticatedViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Profile — TOMEET"
};

export default async function ProfilePage() {
  await getAuthenticatedViewer();

  return <ProfileHub />;
}
