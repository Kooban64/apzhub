/**
 * Escape / strip article bodies for safe text-only rendering.
 * Do not render article HTML as markup — text only.
 */

import type { SupportArticleBodyFormat } from "./types";

export interface RenderableArticleBody {
  readonly kind: "text";
  readonly text: string;
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip HTML tags and decode a minimal set of entities to plain text. */
export function stripHtmlToText(html: string): string {
  const withoutTags = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  return withoutTags
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function renderableArticleBody(
  body: string,
  format: SupportArticleBodyFormat | undefined,
): RenderableArticleBody {
  const raw = typeof body === "string" ? body : "";
  if (format === "text/html") {
    return { kind: "text", text: stripHtmlToText(raw) };
  }
  return { kind: "text", text: raw };
}
