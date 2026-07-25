import type { Metadata } from "next";
import FoodiesLeaderboard from "@/components/FoodiesLeaderboard";

export const metadata: Metadata = {
  title: "Must-Meet List — TOMEET",
  description: "A community ranking built from verified offline relationships.",
};

export default function FoodiesPage() {
  return <FoodiesLeaderboard />;
}
