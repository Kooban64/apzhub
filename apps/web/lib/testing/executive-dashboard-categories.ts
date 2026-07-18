/**
 * Executive dashboard categories (APZTCMS-023) — presentation routing only.
 */

export const EXECUTIVE_DASHBOARD_CATEGORIES = [
  "executive",
  "engineering",
  "qa",
  "release",
  "certification",
  "quality",
  "coverage",
  "automation",
  "manual-testing",
  "risk",
  "historical-trends",
  "release-readiness",
] as const;

export type ExecutiveDashboardCategory =
  (typeof EXECUTIVE_DASHBOARD_CATEGORIES)[number];

export const EXECUTIVE_DASHBOARD_LABELS: Readonly<
  Record<ExecutiveDashboardCategory, string>
> = {
  executive: "Executive",
  engineering: "Engineering Management",
  qa: "QA Management",
  release: "Release Management",
  certification: "Certification",
  quality: "Quality",
  coverage: "Coverage",
  automation: "Automation",
  "manual-testing": "Manual Testing",
  risk: "Risk",
  "historical-trends": "Historical Trends",
  "release-readiness": "Release Readiness",
};

export function isExecutiveDashboardCategory(
  value: string,
): value is ExecutiveDashboardCategory {
  return (EXECUTIVE_DASHBOARD_CATEGORIES as readonly string[]).includes(value);
}

export function resolveExecutiveDashboardCategory(
  value: string | undefined | null,
): ExecutiveDashboardCategory {
  if (value && isExecutiveDashboardCategory(value)) return value;
  return "executive";
}

export type ExecutiveDashboardFilterState = {
  readonly search: string;
  readonly product: string;
  readonly release: string;
  readonly dateFrom: string;
  readonly dateTo: string;
  readonly comparison: "none" | "previous" | "baseline";
  readonly sort: "kind" | "direction" | "delta" | "period";
  readonly order: "asc" | "desc";
};

export const DEFAULT_EXECUTIVE_DASHBOARD_FILTERS: ExecutiveDashboardFilterState = {
  search: "",
  product: "",
  release: "",
  dateFrom: "",
  dateTo: "",
  comparison: "none",
  sort: "kind",
  order: "asc",
};

const FILTER_STORAGE_KEY = "apzhub.testing.executive-dashboards.filters";

export function loadSavedExecutiveDashboardFilters(): ExecutiveDashboardFilterState {
  if (typeof window === "undefined") return DEFAULT_EXECUTIVE_DASHBOARD_FILTERS;
  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return DEFAULT_EXECUTIVE_DASHBOARD_FILTERS;
    const parsed = JSON.parse(raw) as Partial<ExecutiveDashboardFilterState>;
    return {
      ...DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
      ...parsed,
    };
  } catch {
    return DEFAULT_EXECUTIVE_DASHBOARD_FILTERS;
  }
}

export function saveExecutiveDashboardFilters(
  filters: ExecutiveDashboardFilterState,
): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    // ignore quota / private mode
  }
}

export function filterTrendRows<
  T extends {
    readonly kind: string;
    readonly direction: string;
    readonly id: string;
    readonly delta: number;
    readonly periodKind: string;
  },
>(items: readonly T[], filters: ExecutiveDashboardFilterState): T[] {
  const q = filters.search.trim().toLowerCase();
  const product = filters.product.trim().toLowerCase();
  const release = filters.release.trim().toLowerCase();

  let next = items.filter((item) => {
    const hay =
      `${item.kind} ${item.direction} ${item.id} ${item.periodKind}`.toLowerCase();
    if (q.length > 0 && !hay.includes(q)) return false;
    if (product.length > 0 && !hay.includes(product)) return false;
    if (release.length > 0 && !hay.includes(release)) return false;
    return true;
  });

  const dir = filters.order === "asc" ? 1 : -1;
  next = next.slice().sort((a, b) => {
    const av =
      filters.sort === "delta"
        ? a.delta
        : filters.sort === "direction"
          ? a.direction
          : filters.sort === "period"
            ? a.periodKind
            : a.kind;
    const bv =
      filters.sort === "delta"
        ? b.delta
        : filters.sort === "direction"
          ? b.direction
          : filters.sort === "period"
            ? b.periodKind
            : b.kind;
    if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
    return String(av).localeCompare(String(bv)) * dir;
  });

  return next;
}

export function healthTone(
  status: string,
): "neutral" | "success" | "warning" | "danger" {
  if (status === "healthy") return "success";
  if (status === "watch") return "warning";
  if (status === "at_risk" || status === "critical") return "danger";
  return "neutral";
}

export function riskTone(level: string): "neutral" | "success" | "warning" | "danger" {
  if (level === "low") return "success";
  if (level === "medium") return "warning";
  if (level === "high" || level === "critical") return "danger";
  return "neutral";
}

export function directionTone(
  direction: string,
): "neutral" | "success" | "warning" | "danger" {
  if (direction === "improving" || direction === "increase") return "success";
  if (direction === "declining" || direction === "decrease") return "danger";
  if (direction === "stable") return "neutral";
  return "warning";
}
