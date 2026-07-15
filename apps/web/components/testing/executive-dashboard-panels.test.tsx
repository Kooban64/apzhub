import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  MOCK_EI_BASELINE,
  MOCK_EI_BENCHMARK,
  MOCK_EI_HEALTH,
  MOCK_EI_HISTORICAL,
  MOCK_EI_RISK,
  MOCK_EI_SCORE,
  MOCK_EI_SNAPSHOT,
  MOCK_EI_TRENDS,
} from "@/lib/testing/mock-engineering-intelligence-client";
import {
  DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
  EXECUTIVE_DASHBOARD_CATEGORIES,
  type ExecutiveDashboardCategory,
} from "@/lib/testing/executive-dashboard-categories";

import { ExecutiveDashboardPanel } from "./executive-dashboard-panels";

const data = {
  score: MOCK_EI_SCORE,
  health: MOCK_EI_HEALTH,
  risk: MOCK_EI_RISK,
  trends: MOCK_EI_TRENDS,
  snapshots: [MOCK_EI_SNAPSHOT],
  benchmarks: [MOCK_EI_BENCHMARK],
  baselines: [MOCK_EI_BASELINE],
  historical: [MOCK_EI_HISTORICAL],
};

describe("ExecutiveDashboardPanel", () => {
  it.each(EXECUTIVE_DASHBOARD_CATEGORIES)(
    "renders category %s without throwing",
    (category: ExecutiveDashboardCategory) => {
      render(
        <ExecutiveDashboardPanel
          category={category}
          data={data}
          filters={DEFAULT_EXECUTIVE_DASHBOARD_FILTERS}
        />,
      );
      expect(screen.getByTestId(`dashboard-${category === "manual-testing" ? "manual" : category === "historical-trends" ? "historical" : category === "release-readiness" ? "release" : category}`)).toBeTruthy();
    },
  );

  it("shows executive cards and heat map data", () => {
    render(
      <ExecutiveDashboardPanel
        category="executive"
        data={data}
        filters={DEFAULT_EXECUTIVE_DASHBOARD_FILTERS}
      />,
    );
    expect(screen.getByText("Engineering Health")).toBeTruthy();
    expect(screen.getByText("Quality Score")).toBeTruthy();
  });

  it("filters trends in engineering panel", () => {
    render(
      <ExecutiveDashboardPanel
        category="engineering"
        data={data}
        filters={{
          ...DEFAULT_EXECUTIVE_DASHBOARD_FILTERS,
          search: "zzzz-none",
        }}
      />,
    );
    expect(screen.getAllByText("No trends").length).toBeGreaterThan(0);
  });

  it("renders empty snapshots and baselines", () => {
    render(
      <ExecutiveDashboardPanel
        category="executive"
        data={{ ...data, snapshots: [], historical: [], baselines: [] }}
        filters={DEFAULT_EXECUTIVE_DASHBOARD_FILTERS}
      />,
    );
    expect(screen.getByText("No snapshots")).toBeTruthy();

    render(
      <ExecutiveDashboardPanel
        category="historical-trends"
        data={{ ...data, historical: [], baselines: [], benchmarks: [] }}
        filters={DEFAULT_EXECUTIVE_DASHBOARD_FILTERS}
      />,
    );
    expect(screen.getByText("No historical heat map data")).toBeTruthy();
    expect(screen.getByText("No baselines")).toBeTruthy();
  });
});
