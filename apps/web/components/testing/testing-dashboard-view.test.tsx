import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TestingClientError } from "@/lib/testing/errors";
import * as testingApi from "@/lib/testing/testing-api";
import { resetTestingClient } from "@/lib/testing/testing-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/testing",
  useSearchParams: () => new URLSearchParams(),
}));

import { TestingDashboardView } from "./testing-dashboard-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingDashboardView", () => {
  beforeEach(() => {
    resetTestingClient();
    vi.restoreAllMocks();
  });

  it("renders dashboard stat cards from the mock client", async () => {
    render(wrap(<TestingDashboardView permissions={["testing.*"]} />));

    expect(screen.getByTestId("testing-loading")).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByTestId("testing-dashboard-stats")).toBeTruthy();
    });

    expect(screen.getAllByTestId("testing-stat-card").length).toBeGreaterThan(0);
    expect(screen.getByText("Active plans")).toBeTruthy();
    expect(screen.getAllByText(/Release 2.4 Certification/).length).toBeGreaterThan(0);
    expect(screen.getByTestId("testing-page")).toBeTruthy();
  });

  it("shows error state when dashboard load fails", async () => {
    vi.spyOn(testingApi, "getDashboard").mockRejectedValue(
      new TestingClientError("Dashboard unavailable", "ERROR", 500),
    );

    render(wrap(<TestingDashboardView permissions={["testing.*"]} />));

    await waitFor(() => {
      expect(screen.getByText("Dashboard unavailable")).toBeTruthy();
    });
  });

  it("shows empty states when recent activity lists are empty", async () => {
    vi.spyOn(testingApi, "getDashboard").mockResolvedValue({
      headline: "Testing overview",
      cards: [{ id: "card", label: "Plans", value: "0", tone: "neutral" }],
      recentCertifications: [],
      recentExecutions: [],
    });

    render(wrap(<TestingDashboardView permissions={["testing.*"]} />));

    await waitFor(() => {
      expect(screen.getByText("No recent certifications")).toBeTruthy();
      expect(screen.getByText("No recent executions")).toBeTruthy();
    });
  });

  it("handles row clicks on recent activity tables", async () => {
    const user = userEvent.setup();
    render(wrap(<TestingDashboardView permissions={["testing.*"]} />));

    await waitFor(() => {
      expect(screen.getByText("Release 2.4 Certification")).toBeTruthy();
    });

    const certificationRow = screen
      .getByText("Release 2.4 Certification")
      .closest("tr");
    expect(certificationRow).toBeTruthy();
    if (certificationRow) {
      await user.click(certificationRow);
    }

    const executionRow = screen.getByText(/TC-AUTH-001 —/).closest("tr");
    expect(executionRow).toBeTruthy();
    if (executionRow) {
      await user.click(executionRow);
    }
  });
});
