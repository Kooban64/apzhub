/** Shared APZ Source Workspace routes (phases 1–3). */

export const SOURCE_BASE = "/workspace/source" as const;

export type SourceRepositoryMode = "files" | "review" | "admin";

export const SOURCE_ROUTES = {
  home: SOURCE_BASE,
  repositories: `${SOURCE_BASE}/repositories`,
  repository: (repositoryId: string) =>
    `${SOURCE_BASE}/repositories/${encodeURIComponent(repositoryId)}`,
  repositoryReview: (repositoryId: string) =>
    `${SOURCE_BASE}/repositories/${encodeURIComponent(repositoryId)}/review`,
  repositoryAdmin: (repositoryId: string) =>
    `${SOURCE_BASE}/repositories/${encodeURIComponent(repositoryId)}/admin`,
  changes: `${SOURCE_BASE}/changes`,
  change: (changeEventId: string) =>
    `${SOURCE_BASE}/changes/${encodeURIComponent(changeEventId)}`,
} as const;

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isSourceWorkspaceRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === SOURCE_BASE || normalized.startsWith(`${SOURCE_BASE}/`);
}

export function parseSourceRepositoryId(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const prefix = `${SOURCE_BASE}/repositories/`;
  if (!normalized.startsWith(prefix)) return null;
  const id = normalized.slice(prefix.length).split("/")[0];
  return id ? decodeURIComponent(id) : null;
}

export function parseSourceRepositoryMode(pathname: string): SourceRepositoryMode {
  const normalized = normalizePath(pathname);
  const repositoryId = parseSourceRepositoryId(normalized);
  if (!repositoryId) return "files";
  const prefix = `${SOURCE_BASE}/repositories/${encodeURIComponent(repositoryId)}`;
  if (normalized === `${prefix}/review` || normalized.startsWith(`${prefix}/review/`)) {
    return "review";
  }
  if (normalized === `${prefix}/admin` || normalized.startsWith(`${prefix}/admin/`)) {
    return "admin";
  }
  return "files";
}

export function parseSourceChangeId(pathname: string): string | null {
  const normalized = normalizePath(pathname);
  const prefix = `${SOURCE_BASE}/changes/`;
  if (!normalized.startsWith(prefix)) return null;
  const id = normalized.slice(prefix.length).split("/")[0];
  return id ? decodeURIComponent(id) : null;
}
