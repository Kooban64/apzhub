/**
 * QEP ↔ Source deep-link helpers (Slice 3).
 * Only use when real repositoryId + path are known — no filename inference.
 */

import { SOURCE_ROUTES } from "@/lib/source/routes";

export function sourceFileWorkbenchHref(input: {
  readonly repositoryId: string;
  readonly path: string;
  readonly line?: number;
  readonly qepTestId?: string;
  readonly qepRunId?: string;
}): string {
  const base = SOURCE_ROUTES.repository(input.repositoryId);
  const params = new URLSearchParams();
  params.set("path", input.path);
  if (input.line != null && input.line > 0) {
    params.set("line", String(input.line));
  }
  if (input.qepTestId) params.set("qepTest", input.qepTestId);
  if (input.qepRunId) params.set("qepRun", input.qepRunId);
  return `${base}?${params.toString()}`;
}

export function parseSourceFileQuery(search: string): {
  readonly path: string | null;
  readonly line: number | null;
  readonly qepTestId: string | null;
  readonly qepRunId: string | null;
} {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const lineRaw = params.get("line");
  const line = lineRaw ? Number(lineRaw) : null;
  return {
    path: params.get("path"),
    line: line != null && Number.isFinite(line) && line > 0 ? line : null,
    qepTestId: params.get("qepTest"),
    qepRunId: params.get("qepRun"),
  };
}
