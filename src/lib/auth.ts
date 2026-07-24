import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthViewer = {
  avatarUrl: string | null;
  label: string;
};

function getAvatarUrl(metadata: Record<string, unknown>) {
  const value = metadata.avatar_url ?? metadata.picture;
  if (typeof value !== "string") return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getViewerLabel(
  metadata: Record<string, unknown>,
  email?: string
) {
  const value = metadata.full_name ?? metadata.name;
  return typeof value === "string" && value.trim()
    ? value.trim()
    : email || "You";
}

export const getAuthenticatedViewer = cache(async (): Promise<AuthViewer> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    avatarUrl: getAvatarUrl(metadata),
    label: getViewerLabel(metadata, user.email),
  };
});
