/** Platform Reporting workspace route helpers (APZREPORT-002). */

export const REPORTING_BASE = "/workspace/reporting";

export const REPORTING_SECTIONS = [
  "templates",
  "generations",
  "history",
  "formats",
] as const;

export type ReportingSection = (typeof REPORTING_SECTIONS)[number];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isReportingRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === REPORTING_BASE || normalized.startsWith(`${REPORTING_BASE}/`);
}

export function resolveReportingSection(
  pathname: string,
): ReportingSection | "templates" {
  const normalized = normalizePath(pathname);
  if (normalized === REPORTING_BASE) return "templates";
  const suffix = normalized.slice(REPORTING_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (REPORTING_SECTIONS.includes(section as ReportingSection)) {
    return section as ReportingSection;
  }
  return "templates";
}

export function reportingSectionPath(section?: ReportingSection): string {
  if (!section || section === "templates") {
    return `${REPORTING_BASE}/templates`;
  }
  return `${REPORTING_BASE}/${section}`;
}
