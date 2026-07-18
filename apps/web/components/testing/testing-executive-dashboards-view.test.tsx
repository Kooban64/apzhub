import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createMockEngineeringIntelligenceClient } from "@/lib/testing/mock-engineering-intelligence-client";
import { EngineeringIntelligenceClientError } from "@/lib/testing/engineering-intelligence-errors";
import {
  resetEngineeringIntelligenceClient,
  setEngineeringIntelligenceClient,
} from "@/lib/testing/engineering-intelligence-api";
import * as testingApi from "@/lib/testing/testing-api";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
  usePathname: () => "/workspace/testing/executive-dashboards",
  useSearchParams: () => new URLSearchParams(),
}));

import { TestingExecutiveDashboardsView } from "./testing-executive-dashboards-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingExecutiveDashboardsView", () => {
  beforeEach(() => {
    resetEngineeringIntelligenceClient();
    setEngineeringIntelligenceClient(createMockEngineeringIntelligenceClient());
    push.mockReset();
    vi.restoreAllMocks();
    setEngineeringIntelligenceClient(createMockEngineeringIntelligenceClient());
    window.localStorage.clear();
  });

  it("renders executive dashboard with category tabs", async () => {
    render(wrap(<TestingExecutiveDashboardsView permissions={["engineering.*"]} />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Executive Dashboards" }),
      ).toBeTruthy();
      expect(screen.getByTestId("dashboard-executive")).toBeTruthy();
    });

    expect(screen.getByRole("tablist", { name: /Dashboard categories/i })).toBeTruthy();
    expect(screen.getByRole("search")).toBeTruthy();
  });

  it("shows forbidden state without permissions", async () => {
    render(wrap(<TestingExecutiveDashboardsView permissions={[]} />));
    await waitFor(() => {
      expect(screen.getByText("Executive Dashboards unavailable")).toBeTruthy();
    });
  });

  it("shows error state when EI score fails", async () => {
    vi.spyOn(testingApi, "getEngineeringQualityScore").mockRejectedValue(
      new EngineeringIntelligenceClientError({
        message: "Provider unavailable",
        status: 503,
      }),
    );
    vi.spyOn(testingApi, "getEngineeringHealth").mockResolvedValue(
      await createMockEngineeringIntelligenceClient().getHealth(),
    );
    vi.spyOn(testingApi, "getEngineeringRisk").mockResolvedValue(
      await createMockEngineeringIntelligenceClient().getRisk(),
    );
    vi.spyOn(testingApi, "listEngineeringTrends").mockResolvedValue({
      items: [],
      total: 0,
    });

    render(wrap(<TestingExecutiveDashboardsView permissions={["analytics.view"]} />));

    await waitFor(() => {
      expect(screen.getByText("Provider unavailable")).toBeTruthy();
    });
  });

  it("navigates categories and runs commands", async () => {
    const user = userEvent.setup();
    render(
      wrap(
        <TestingExecutiveDashboardsView category="qa" permissions={["quality.view"]} />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-qa")).toBeTruthy();
    });

    await user.click(screen.getByRole("tab", { name: "Risk" }));
    expect(push).toHaveBeenCalledWith("/workspace/testing/executive-dashboards/risk");

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await user.click(screen.getByRole("button", { name: "Compare" }));
    await user.click(screen.getByRole("button", { name: "Open Release" }));
    await user.click(screen.getByRole("button", { name: "Open Certification" }));
    await user.click(screen.getByRole("button", { name: "Open Pipeline" }));
    await user.click(screen.getByRole("button", { name: "Open Coverage" }));
    await user.click(screen.getByRole("button", { name: "Open Evidence" }));
    await user.click(screen.getByRole("button", { name: "Open Testing" }));
    await user.click(screen.getByRole("button", { name: "Open Quality" }));

    expect(push).toHaveBeenCalledWith("/workspace/testing/release-readiness");
    expect(push).toHaveBeenCalledWith("/workspace/testing/quality");
  });

  it("updates filters and persists comparison label", async () => {
    const user = userEvent.setup();
    render(wrap(<TestingExecutiveDashboardsView permissions={["engineering.view"]} />));

    await waitFor(() => {
      expect(screen.getByTestId("dashboard-executive")).toBeTruthy();
    });

    await user.type(screen.getByLabelText("Search dashboards"), "coverage");
    await user.selectOptions(screen.getByLabelText("Comparison period"), "baseline");
    await waitFor(() => {
      expect(screen.getByText(/Comparison mode: baseline/i)).toBeTruthy();
    });
  });
});
