"use client";

/**
 * Flat geometric abstract compositions in the Ditto annotation palette.
 * No gradients, no shadows — pure ink-on-paper shapes.
 *
 * converse  → two speech bubbles talking (re-drawn per feedback)
 * understand → concentric eye reading lines (kept but simplified — no inner concentric circles)
 * match     → two solid circles overlapping, NO concentric circles inside
 */
export default function AbstractArt({
  variant,
  className = "",
}: {
  variant: "converse" | "understand" | "match";
  className?: string;
}) {
  if (variant === "converse") {
    return (
      <svg viewBox="0 0 560 360" className={className} role="img" aria-label="">
        <rect width="560" height="360" fill="#ffffff" rx="0" />
        {/* large warm speech bubble — left speaker */}
        <rect x="50" y="60" width="240" height="160" rx="32" fill="#aa7e2e" />
        <polygon points="140,220 170,270 100,220" fill="#aa7e2e" />
        {/* text-line marks inside */}
        <rect x="85" y="105" width="120" height="12" rx="6" fill="#000000" />
        <rect x="85" y="130" width="80" height="12" rx="6" fill="#000000" />
        <rect x="85" y="155" width="100" height="12" rx="6" fill="#000000" />

        {/* small reply bubble — right speaker */}
        <rect x="320" y="100" width="190" height="120" rx="32" fill="#ffdd33" />
        <polygon points="420,220 440,260 470,220" fill="#ffdd33" />
        {/* dots as typing indicators */}
        <circle cx="380" cy="160" r="8" fill="#000000" />
        <circle cx="410" cy="160" r="8" fill="#000000" />
        <circle cx="440" cy="160" r="8" fill="#000000" />

        {/* floating sticker marks */}
        <rect x="30" y="30" width="42" height="14" rx="7" fill="#ff6137" transform="rotate(-8 30 30)" />
        <rect x="490" y="290" width="42" height="14" rx="7" fill="#b26dc2" transform="rotate(5 490 290)" />
        <rect x="300" y="310" width="36" height="14" rx="7" fill="#0097e6" transform="rotate(-3 300 310)" />
      </svg>
    );
  }

  if (variant === "understand") {
    return (
      <svg viewBox="0 0 560 360" className={className} role="img" aria-label="">
        <rect width="560" height="360" fill="#ffffff" rx="0" />
        {/* big eye shape — understanding, reading between lines */}
        <ellipse cx="280" cy="180" rx="140" ry="100" fill="#b26dc2" />
        <ellipse cx="280" cy="180" rx="80" ry="55" fill="#f7f5f3" />
        <circle cx="280" cy="180" r="30" fill="#000000" />
        {/* glint */}
        <circle cx="295" cy="168" r="8" fill="#ffffff" />

        {/* text lines being scanned on the left */}
        <rect x="30" y="60" width="120" height="14" rx="7" fill="#dcd8cf" />
        <rect x="30" y="88" width="90" height="14" rx="7" fill="#ffdd33" />
        <rect x="30" y="116" width="100" height="14" rx="7" fill="#dcd8cf" />

        {/* text lines on the right — processed */}
        <rect x="420" y="260" width="110" height="14" rx="7" fill="#dcd8cf" />
        <rect x="430" y="232" width="90" height="14" rx="7" fill="#3e6b15" />
        <rect x="410" y="288" width="120" height="14" rx="7" fill="#dcd8cf" />

        {/* small marker stickers */}
        <rect x="55" y="310" width="36" height="14" rx="7" fill="#ff6137" transform="rotate(-6 55 310)" />
        <rect x="500" y="40" width="36" height="14" rx="7" fill="#0097e6" transform="rotate(4 500 40)" />
      </svg>
    );
  }

  // match — two solid circles overlapping, no concentric circles
  return (
    <svg viewBox="0 0 560 360" className={className} role="img" aria-label="">
      <rect width="560" height="360" fill="#ffffff" rx="0" />
      {/* left person — solid orange circle */}
      <circle cx="210" cy="180" r="110" fill="#ff6137" />
      {/* right person — solid yellow circle, slight overlap */}
      <circle cx="350" cy="180" r="110" fill="#ffdd33" />
      {/* overlap zone — the match, in black */}
      <clipPath id="clipLeft">
        <circle cx="210" cy="180" r="110" />
      </clipPath>
      <circle cx="350" cy="180" r="110" fill="#000000" opacity="0.18" clipPath="url(#clipLeft)" />

      {/* spark marks around */}
      <rect x="60" y="50" width="42" height="14" rx="7" fill="#0097e6" transform="rotate(-10 60 50)" />
      <rect x="470" y="290" width="42" height="14" rx="7" fill="#3e6b15" transform="rotate(8 470 290)" />
      <rect x="260" y="30" width="36" height="14" rx="7" fill="#b26dc2" transform="rotate(3 260 30)" />
      <rect x="250" y="320" width="50" height="14" rx="7" fill="#aa7e2e" transform="rotate(-2 250 320)" />
    </svg>
  );
}
