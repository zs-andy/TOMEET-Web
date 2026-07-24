import type { Metadata } from "next";
import AgentChat from "@/components/AgentChat";
import { getAuthenticatedViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Agent — TOMEET",
  description: "Meet the right people through a simple conversation.",
};

export default async function AgentPage() {
  const viewer = await getAuthenticatedViewer();

  return <AgentChat viewer={viewer} />;
}
