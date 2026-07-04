import type { ReactNode } from "react";

export type HighlightColor =
  | "yellow"
  | "orange"
  | "purple"
  | "blue"
  | "pink"
  | "mustard"
  | "green";

const PILL_BG: Record<string, string> = {
  blue: "bg-comment-blue",
  purple: "bg-markup-purple",
  yellow: "bg-marker-yellow",
  orange: "bg-edit-orange",
  pink: "bg-sticky-pink",
  mustard: "bg-mustard",
  green: "bg-highlight-green",
  ink: "bg-india-ink",
};

const PILL_TEXT: Record<string, string> = {
  yellow: "text-india-ink",
  pink: "text-india-ink",
  mustard: "text-india-ink",
};

const shouldInvertHighlightText = (color: string) =>
  color === "orange" || color === "green" || color === "blue";

type HighlightTags = string | Partial<Record<HighlightColor, string>>;

/**
 * Legacy renderer for `<highlight>word</highlight>` markup.
 * Colors are assigned in order from `colors` — one color per word, never mixed.
 * `tagText` pins a small flag label to either one selected highlight color, or
 * to each color named in a tag map.
 */
export function renderHighlight(
  text: string,
  colors: HighlightColor[] = ["yellow"],
  tagText?: HighlightTags,
  tagColor?: HighlightColor
): ReactNode[] {
  const parts = text.split(/(<highlight>.*?<\/highlight>|<br\s*\/?>)/g);
  let hlIndex = 0;
  const shownTags = new Set<string>();
  return parts.map((part, i) => {
    if (/^<br\s*\/?>$/.test(part)) {
      return <br key={i} />;
    }

    const match = part.match(/^<highlight>(.*?)<\/highlight>$/);
    if (match) {
      const color = colors[hlIndex % colors.length];
      const isFirst = hlIndex === 0;
      const resolvedTag =
        typeof tagText === "string"
          ? tagColor
            ? color === tagColor
              ? tagText
              : undefined
            : isFirst
              ? tagText
              : undefined
          : tagText?.[color];
      const tagKey = `${color}:${resolvedTag ?? ""}`;
      const showTag = Boolean(resolvedTag && !shownTags.has(tagKey));
      if (showTag) {
        shownTags.add(tagKey);
      }
      hlIndex += 1;
      return (
        <span
          key={i}
          className="highlighter"
          data-hl={color}
          data-has-tag={showTag ? "true" : undefined}
        >
          {showTag && resolvedTag && (
            <span
              className={`highlight-tag ${PILL_BG[color] ?? "bg-highlight-green"} ${PILL_TEXT[color] ?? "text-bone-white"}`}
            >
              <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 2v20h2v-8h12l-3-5 3-5H6V2H4z" />
              </svg>
              {resolvedTag}
            </span>
          )}
          <span
            className="highlighter-text"
            style={
              shouldInvertHighlightText(color)
                ? { color: "var(--color-bone-white)" }
                : undefined
            }
          >
            {match[1]}
          </span>
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

/**
 * Rich markup renderer for annotated running text:
 *   <highlight>…</highlight>        — legacy, colored via `colors` rotation
 *   <hl-yellow>…</hl-yellow>        — highlighter block in a named color
 *   <pill-blue>…</pill-blue>        — rotated sticker pill over the text
 */
export function renderMarkup(
  text: string,
  colors: HighlightColor[] = ["yellow"]
): ReactNode[] {
  const parts = text.split(
    /(<hl-\w+>.*?<\/hl-\w+>|<pill-\w+>.*?<\/pill-\w+>|<highlight>.*?<\/highlight>)/g
  );
  let hlIndex = 0;
  return parts.map((part, i) => {
    const legacy = part.match(/^<highlight>(.*?)<\/highlight>$/);
    if (legacy) {
      const color = colors[hlIndex % colors.length];
      hlIndex += 1;
      return (
        <span key={i} className="highlighter" data-hl={color}>
          <span
            className="highlighter-text"
            style={
              shouldInvertHighlightText(color)
                ? { color: "var(--color-bone-white)" }
                : undefined
            }
          >
            {legacy[1]}
          </span>
        </span>
      );
    }
    const hl = part.match(/^<hl-(\w+)>(.*?)<\/hl-\w+>$/);
    if (hl) {
      return (
        <span key={i} className="highlighter" data-hl={hl[1]}>
          <span
            className="highlighter-text"
            style={
              shouldInvertHighlightText(hl[1])
                ? { color: "var(--color-bone-white)" }
                : undefined
            }
          >
            {hl[2]}
          </span>
        </span>
      );
    }
    const pill = part.match(/^<pill-(\w+)>(.*?)<\/pill-\w+>$/);
    if (pill) {
      return (
        <span
          key={i}
          className={`pill-sticker mx-1 text-[0.55em] uppercase align-middle ${
            PILL_BG[pill[1]] ?? "bg-comment-blue"
          }`}
        >
          {pill[2]}
        </span>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
