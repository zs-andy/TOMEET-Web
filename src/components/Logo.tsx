import type { CSSProperties } from "react";

export default function Logo({
  size = 32,
  inverse = false,
}: {
  size?: number;
  inverse?: boolean;
}) {
  return (
    <span
      aria-label="TOMEET"
      className={`brand-wordmark${inverse ? " brand-wordmark--inverse" : ""}`}
      style={{ "--logo-size": `${size}px` } as CSSProperties}
    >
      <span className="brand-word" aria-hidden="true">
        <span className="brand-letter--accent">T</span>
        <span>O</span>
        <span>M</span>
        <span>E</span>
        <span>E</span>
        <span className="brand-letter--accent">T</span>
      </span>
    </span>
  );
}
