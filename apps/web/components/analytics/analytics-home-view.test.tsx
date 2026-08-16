import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsHomeView } from "./analytics-home-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/analytics/analytics-api", () => ({
  listAnalyticsDashboards: vi.fn(async () => ({
    items: [{ id: "dash-1", title: "Ops pulse", status: "published" }],
    page: { cursor: null, nextCursor: null, limit: 6, hasMore: false },
  })),
}));

function renderHome(permissions: string[]) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AnalyticsHomeView permissions={permissions} />
    </QueryClientProvider>,
  );
}

describe("AnalyticsHomeView (N-03 Decision Companion)", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders question-first home with horizons and APZ dashboards strip", async () => {
    renderHome(["analytics.view"]);
    expect(screen.getByTestId("analytics-page")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-onboarding")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-apz-dashboards")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-horizons")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-questions")).toBeInTheDocument();
    expect(
      screen.getByTestId("analytics-home-horizon-operational"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-question-EQ-E01")).toBeInTheDocument();
    expect(await screen.findByText("Ops pulse")).toBeInTheDocument();
    expect(screen.queryByTestId("analytics-home-suites")).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByText(/Start with a business question/i)).toBeInTheDocument();
  });

  it("shows operator note only for admin", () => {
    const { rerender } = renderHome(["analytics.view"]);
    expect(
      screen.queryByTestId("analytics-home-operator-note"),
    ).not.toBeInTheDocument();
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    rerender(
      <QueryClientProvider client={client}>
        <AnalyticsHomeView permissions={["analytics.admin"]} />
      </QueryClientProvider>,
    );
    expect(screen.getByTestId("analytics-home-operator-note")).toBeInTheDocument();
  });
});
