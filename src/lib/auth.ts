import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AuthViewer = {
  id: string;
  avatarUrl: string | null;
  label: string;
};

export type CurrentAuthUser = AuthViewer & {
  email: string | null;
  metadata: Record<string, unknown>;
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
  const value =
    metadata.full_name ?? metadata.name ?? metadata.login_identifier;
  return typeof value === "string" && value.trim()
    ? value.trim()
    : email || "You";
}

export const getCurrentAuthUser = cache(async (): Promise<CurrentAuthUser | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    id: user.id,
    avatarUrl: getAvatarUrl(metadata),
    label: getViewerLabel(metadata, user.email ?? undefined),
    email: user.email ?? null,
    metadata,
  };
});

export const getAuthenticatedViewer = cache(async (): Promise<AuthViewer> => {
  const user = await getCurrentAuthUser();

  if (!user) redirect("/login");

  return {
    id: user.id,
    avatarUrl: user.avatarUrl,
    label: user.label,
  };
});
