"use client";

import { useEffect } from "react";

const CYCLE_DURATION_MS = 20_000;

type ThemePalette = {
  soft: [number, number, number];
  strong: [number, number, number];
  ink: [number, number, number];
};

const PALETTES: ThemePalette[] = [
  { soft: [201, 197, 255], strong: [74, 54, 210], ink: [51, 37, 189] },
  { soft: [196, 226, 251], strong: [43, 115, 210], ink: [36, 95, 174] },
  { soft: [246, 217, 144], strong: [213, 91, 47], ink: [180, 72, 32] },
  { soft: [247, 197, 237], strong: [217, 61, 183], ink: [184, 43, 153] },
];

const SEGMENTS = [
  { start: 0, hold: 0.22, end: 0.25, from: 0, to: 1 },
  { start: 0.25, hold: 0.47, end: 0.5, from: 1, to: 2 },
  { start: 0.5, hold: 0.72, end: 0.75, from: 2, to: 3 },
  { start: 0.75, hold: 0.97, end: 1, from: 3, to: 0 },
] as const;

function mixChannel(from: number, to: number, amount: number) {
  return Math.round(from + (to - from) * amount);
}

function mixColor(
  from: ThemePalette[keyof ThemePalette],
  to: ThemePalette[keyof ThemePalette],
  amount: number
) {
  return `rgb(${mixChannel(from[0], to[0], amount)} ${mixChannel(
    from[1],
    to[1],
    amount
  )} ${mixChannel(from[2], to[2], amount)})`;
}

function paletteAt(progress: number) {
  const segment =
    SEGMENTS.find(({ start, end }) => progress >= start && progress < end) ??
    SEGMENTS[0];
  const amount =
    progress <= segment.hold
      ? 0
      : (progress - segment.hold) / (segment.end - segment.hold);
  const from = PALETTES[segment.from];
  const to = PALETTES[segment.to];

  return {
    soft: mixColor(from.soft, to.soft, amount),
    strong: mixColor(from.strong, to.strong, amount),
    ink: mixColor(from.ink, to.ink, amount),
  };
}

export default function ThemeCycleSync() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    let frame = 0;
    let previous = "";

    root.classList.add("theme-cycle-synced");

    const update = (time: number) => {
      const palette = paletteAt((time % CYCLE_DURATION_MS) / CYCLE_DURATION_MS);
      const signature = `${palette.soft}|${palette.strong}|${palette.ink}`;

      if (signature !== previous) {
        root.style.setProperty("--accent-soft", palette.soft);
        root.style.setProperty("--accent-strong", palette.strong);
        root.style.setProperty("--accent-ink", palette.ink);
        root.style.setProperty("--brand-accent", palette.strong);
        previous = signature;
      }

      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(frame);
      root.classList.remove("theme-cycle-synced");
      root.style.removeProperty("--accent-soft");
      root.style.removeProperty("--accent-strong");
      root.style.removeProperty("--accent-ink");
      root.style.removeProperty("--brand-accent");
    };
  }, []);

  return null;
}
