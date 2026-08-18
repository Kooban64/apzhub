/**
 * APZPEN ↔ Source deep-link helpers (Slice 4).
 * Only use when real repositoryId + path are known — no filename inference.
 */

import { SOURCE_ROUTES } from "@/lib/source/routes";

export function sourceFilePenHref(input: {
  readonly repositoryId: string;
  readonly path: string;
  readonly line?: number;
  readonly penFindingId?: string;
  readonly penEngagementId?: string;
}): string {
  const base = SOURCE_ROUTES.repository(input.repositoryId);
  const params = new URLSearchParams();
  params.set("path", input.path);
  if (input.line != null && input.line > 0) {
    params.set("line", String(input.line));
  }
  if (input.penFindingId) params.set("penFinding", input.penFindingId);
  if (input.penEngagementId) params.set("penEngagement", input.penEngagementId);
  return `${base}?${params.toString()}`;
}

export function parseSourcePenQuery(search: string): {
  readonly path: string | null;
  readonly line: number | null;
  readonly penFindingId: string | null;
  readonly penEngagementId: string | null;
} {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const lineRaw = params.get("line");
  const line = lineRaw ? Number(lineRaw) : null;
  return {
    path: params.get("path"),
    line: line != null && Number.isFinite(line) && line > 0 ? line : null,
    penFindingId: params.get("penFinding"),
    penEngagementId: params.get("penEngagement"),
  };
}
