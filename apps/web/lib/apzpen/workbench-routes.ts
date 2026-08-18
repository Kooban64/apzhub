/**
 * Workbench-hosted APZPEN routes (Slice 4).
 * Maps Owner Security IA → existing product surfaces (formerly Operator `/apzpen`).
 */

export const APZPEN_WORKBENCH_BASE = "/workspace/pen" as const;

/** Legacy Operator path — redirected into Workbench. */
export const APZPEN_LEGACY_BASE = "/apzpen" as const;

export function isApzpenWorkbenchRoute(pathname: string): boolean {
  return (
    pathname === APZPEN_WORKBENCH_BASE ||
    pathname.startsWith(`${APZPEN_WORKBENCH_BASE}/`) ||
    pathname === APZPEN_LEGACY_BASE ||
    pathname.startsWith(`${APZPEN_LEGACY_BASE}/`)
  );
}

/** Normalize legacy `/apzpen` paths to Workbench `/workspace/pen`. */
export function toApzpenWorkbenchPath(pathname: string): string {
  if (
    pathname === APZPEN_LEGACY_BASE ||
    pathname.startsWith(`${APZPEN_LEGACY_BASE}/`)
  ) {
    return `${APZPEN_WORKBENCH_BASE}${pathname.slice(APZPEN_LEGACY_BASE.length)}`;
  }
  return pathname;
}

export function apzpenHref(path = ""): string {
  if (!path || path === "/") return APZPEN_WORKBENCH_BASE;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${APZPEN_WORKBENCH_BASE}${suffix}`;
}

export const APZPEN_WB = {
  home: APZPEN_WORKBENCH_BASE,
  myWork: `${APZPEN_WORKBENCH_BASE}/my-work`,
  engagements: `${APZPEN_WORKBENCH_BASE}/engagements`,
  engagement: (id: string) => `${APZPEN_WORKBENCH_BASE}/engagements/${id}`,
  findings: `${APZPEN_WORKBENCH_BASE}/findings`,
  finding: (id: string) => `${APZPEN_WORKBENCH_BASE}/findings/${id}`,
  remediation: `${APZPEN_WORKBENCH_BASE}/remediation`,
  retests: `${APZPEN_WORKBENCH_BASE}/retests`,
  riskAcceptance: `${APZPEN_WORKBENCH_BASE}/risk-acceptance`,
  evidence: `${APZPEN_WORKBENCH_BASE}/evidence`,
  certification: `${APZPEN_WORKBENCH_BASE}/certification`,
  assets: `${APZPEN_WORKBENCH_BASE}/assets`,
  code: `${APZPEN_WORKBENCH_BASE}/code`,
  intelligence: `${APZPEN_WORKBENCH_BASE}/intelligence`,
  providers: `${APZPEN_WORKBENCH_BASE}/providers`,
  reports: `${APZPEN_WORKBENCH_BASE}/reports`,
} as const;

export function parseApzpenWorkbenchPath(pathname: string): {
  readonly segment: string | null;
  readonly id: string | null;
} {
  const normalized = toApzpenWorkbenchPath(pathname);
  if (
    normalized === APZPEN_WORKBENCH_BASE ||
    normalized === `${APZPEN_WORKBENCH_BASE}/`
  ) {
    return { segment: null, id: null };
  }
  const rest = normalized.slice(APZPEN_WORKBENCH_BASE.length + 1);
  const parts = rest.split("/").filter(Boolean);
  return {
    segment: parts[0] ?? null,
    id: parts[1] ?? null,
  };
}
