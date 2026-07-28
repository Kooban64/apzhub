import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AnalyticsHomeView } from "./analytics-home-view";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/analytics/analytics-api", () => ({
  listAnalyticsDashboards: vi.fn(async () => ({
    items: [
      {
        id: "dash_exec_overview",
        tenantId: "tenant-a",
        title: "Executive Overview",
        description: "Cross-product executive scorecards",
        status: "published",
        tags: ["executive"],
        provider: { providerId: "platform", providerRef: "collection:1" },
        updatedAt: "2026-07-19T00:00:00.000Z",
      },
    ],
  })),
}));

function renderHome() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AnalyticsHomeView permissions={["analytics.*"]} />
    </QueryClientProvider>,
  );
}

describe("AnalyticsHomeView", () => {
  beforeEach(() => {
    push.mockReset();
  });

  it("renders home suites and recent catalogue", async () => {
    renderHome();
    expect(screen.getByTestId("analytics-page")).toBeInTheDocument();
    expect(screen.getByTestId("analytics-home-suites")).toBeInTheDocument();
    await waitFor(() => {
      expect(
        screen.getByTestId("analytics-dashboard-row-dash_exec_overview"),
      ).toBeInTheDocument();
    });
    expect(screen.getByText("Executive Overview")).toBeInTheDocument();
  });
});
