import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

import {
  DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
  EXECUTIVE_DASHBOARD_CATEGORIES,
  filterTrendRows,
  healthTone,
  isExecutiveDashboardCategory,
  loadSavedExecutiveDashboardFilters,
  resolveExecutiveDashboardCategory,
  riskTone,
  directionTone,
  saveExecutiveDashboardFilters,
} from "./executive-dashboard-categories";
import { testingExecutiveDashboardsPath } from "./routes";

describe("executive-dashboard-categories", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (k: string) => store.get(k) ?? null,
        setItem: (k: string, v: string) => {
          store.set(k, v);
        },
      },
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("resolves known and unknown categories", () => {
    expect(EXECUTIVE_DASHBOARD_CATEGORIES.length).toBe(12);
    expect(isExecutiveDashboardCategory("qa")).toBe(true);
    expect(isExecutiveDashboardCategory("nope")).toBe(false);
    expect(resolveExecutiveDashboardCategory("engineering")).toBe("engineering");
    expect(resolveExecutiveDashboardCategory("nope")).toBe("executive");
    expect(resolveExecutiveDashboardCategory(undefined)).toBe("executive");
  });

  it("builds dashboard paths", () => {
    expect(testingExecutiveDashboardsPath()).toBe(
      "/workspace/testing/executive-dashboards",
    );
    expect(testingExecutiveDashboardsPath("executive")).toBe(
      "/workspace/testing/executive-dashboards",
    );
    expect(testingExecutiveDashboardsPath("risk")).toBe(
      "/workspace/testing/executive-dashboards/risk",
    );
  });

  it("filters and sorts trend rows", () => {
    const items = [
      {
        id: "t2",
        kind: "coverage",
        direction: "stable",
        delta: 0,
        periodKind: "weekly",
      },
      {
        id: "t1",
        kind: "quality",
        direction: "improving",
        delta: 5,
        periodKind: "weekly",
      },
    ];
    expect(
      filterTrendRows(items, {
        ...DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
        search: "quality",
      }).map((i) => i.id),
    ).toEqual(["t1"]);
    expect(
      filterTrendRows(items, {
        ...DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
        sort: "delta",
        order: "desc",
      }).map((i) => i.id),
    ).toEqual(["t1", "t2"]);
    expect(
      filterTrendRows(items, {
        ...DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
        product: "missing",
      }),
    ).toHaveLength(0);
  });

  it("maps tones", () => {
    expect(healthTone("healthy")).toBe("success");
    expect(healthTone("watch")).toBe("warning");
    expect(healthTone("at_risk")).toBe("danger");
    expect(healthTone("critical")).toBe("danger");
    expect(healthTone("other")).toBe("neutral");
    expect(riskTone("low")).toBe("success");
    expect(riskTone("medium")).toBe("warning");
    expect(riskTone("high")).toBe("danger");
    expect(riskTone("critical")).toBe("danger");
    expect(riskTone("other")).toBe("neutral");
    expect(directionTone("improving")).toBe("success");
    expect(directionTone("increase")).toBe("success");
    expect(directionTone("declining")).toBe("danger");
    expect(directionTone("decrease")).toBe("danger");
    expect(directionTone("stable")).toBe("neutral");
    expect(directionTone("other")).toBe("warning");
  });

  it("persists saved filters", () => {
    saveExecutiveDashboardFilters({
      ...DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
      search: "cov",
      comparison: "baseline",
    });
    expect(loadSavedExecutiveDashboardFilters().search).toBe("cov");
    expect(loadSavedExecutiveDashboardFilters().comparison).toBe("baseline");
  });

  it("returns defaults when storage is invalid", () => {
    store.set("apzhub.testing.executive-dashboards.filters", "{not-json");
    expect(loadSavedExecutiveDashboardFilters()).toEqual(
      DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
    );
  });
});
