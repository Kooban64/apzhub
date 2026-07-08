import type { ReactNode } from "react";

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Highlight query matches in search result text (LAW-013-07). */
export function highlightSearchTerm(text: string, query: string): ReactNode {
  const trimmed = query.trim();
  if (!trimmed) {
    return text;
  }

  const pattern = new RegExp(`(${escapeRegExp(trimmed)})`, "gi");
  const parts = text.split(pattern);

  return parts.map((part, index) =>
    pattern.test(part) ? (
      <mark
        key={`${part}-${index}`}
        className="rounded bg-[var(--law-accent)]/20 px-0.5 text-[var(--color-foreground)]"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
