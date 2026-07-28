import type { Metadata } from "next";
import { notFound } from "next/navigation";
import FoodiesLeaderboard from "@/components/FoodiesLeaderboard";
import { FOODIES_ENABLED } from "@/lib/feature-flags";

export const metadata: Metadata = {
  title: "Must-Meet List — TOMEET",
  description: "A community ranking built from verified offline relationships.",
};

export default function FoodiesPage() {
  if (!FOODIES_ENABLED) notFound();

  return <FoodiesLeaderboard />;
}
