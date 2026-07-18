import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockEngineeringIntelligenceClient,
  MOCK_EI_SCORE,
} from "@/lib/testing/mock-engineering-intelligence-client";
import { EngineeringIntelligenceClientError } from "@/lib/testing/engineering-intelligence-errors";
import {
  resetEngineeringIntelligenceClient,
  setEngineeringIntelligenceClient,
} from "@/lib/testing/engineering-intelligence-api";
import * as testingApi from "@/lib/testing/testing-api";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/testing/engineering-intelligence",
  useSearchParams: () => new URLSearchParams(),
}));

import { TestingEngineeringIntelligenceView } from "./testing-engineering-intelligence-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TestingEngineeringIntelligenceView", () => {
  beforeEach(() => {
    resetEngineeringIntelligenceClient();
    setEngineeringIntelligenceClient(createMockEngineeringIntelligenceClient());
    vi.restoreAllMocks();
    setEngineeringIntelligenceClient(createMockEngineeringIntelligenceClient());
  });

  it("renders executive overview with quality score", async () => {
    render(
      wrap(<TestingEngineeringIntelligenceView permissions={["engineering.*"]} />),
    );

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Engineering Intelligence" }),
      ).toBeTruthy();
      expect(
        screen.getByLabelText(`Quality score ${MOCK_EI_SCORE.score}`),
      ).toBeTruthy();
    });

    expect(
      screen.getByRole("tablist", { name: /Engineering Intelligence panels/i }),
    ).toBeTruthy();
  });

  it("shows forbidden empty state without permissions", async () => {
    render(wrap(<TestingEngineeringIntelligenceView permissions={[]} />));

    await waitFor(() => {
      expect(screen.getByText("Engineering Intelligence unavailable")).toBeTruthy();
    });
  });

  it("shows error state with retry when score fails", async () => {
    vi.spyOn(testingApi, "getEngineeringQualityScore").mockRejectedValue(
      new EngineeringIntelligenceClientError({
        message: "Provider unavailable",
        code: "provider_unavailable",
        status: 503,
      }),
    );
    const mockClient = createMockEngineeringIntelligenceClient();
    vi.spyOn(testingApi, "getEngineeringHealth").mockResolvedValue(
      await mockClient.getHealth(),
    );
    vi.spyOn(testingApi, "getEngineeringRisk").mockResolvedValue(
      await mockClient.getRisk(),
    );
    vi.spyOn(testingApi, "listEngineeringTrends").mockResolvedValue({
      items: [],
      total: 0,
    });

    render(
      wrap(<TestingEngineeringIntelligenceView permissions={["analytics.view"]} />),
    );

    await waitFor(() => {
      expect(screen.getByText("Provider unavailable")).toBeTruthy();
    });
  });

  it("switches to trends panel and filters by kind", async () => {
    const user = userEvent.setup();
    render(wrap(<TestingEngineeringIntelligenceView permissions={["quality.view"]} />));

    await waitFor(() => {
      expect(screen.getByText("Executive Overview")).toBeTruthy();
    });

    await user.click(screen.getByRole("tab", { name: "Trends" }));
    await waitFor(() => {
      expect(screen.getByText("Quality & delivery trends")).toBeTruthy();
    });

    await user.selectOptions(screen.getByLabelText("Trend kind filter"), "coverage");
    await waitFor(() => {
      expect(screen.getByText("coverage")).toBeTruthy();
    });
  });

  it("opens score, health, risk, benchmarks, and historical panels", async () => {
    const user = userEvent.setup();
    render(
      wrap(<TestingEngineeringIntelligenceView permissions={["engineering.view"]} />),
    );

    await waitFor(() => {
      expect(screen.getByText("Executive Overview")).toBeTruthy();
    });

    await user.click(screen.getByRole("tab", { name: "Quality Score" }));
    expect(await screen.findByText("Quality Score breakdown")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Engineering Health" }));
    expect(
      await screen.findByRole("region", { name: "Engineering Health" }),
    ).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Risk Overview" }));
    expect(await screen.findByText("Risk overview")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Benchmarks" }));
    expect(await screen.findByText("Compare Baselines")).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Compare Baselines" }));

    await user.click(screen.getByRole("tab", { name: "Historical Analysis" }));
    expect(
      await screen.findByRole("region", { name: "Historical snapshots" }),
    ).toBeTruthy();
    expect(await screen.findByText("June 2026")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Refresh" }));
    await user.click(screen.getByRole("button", { name: "Open Certification" }));
    await user.click(screen.getByRole("button", { name: "Open Coverage" }));
    await user.click(screen.getByRole("button", { name: "Open Evidence" }));
    await user.click(screen.getByRole("button", { name: "Open Pipeline" }));
    await user.click(screen.getByRole("button", { name: "Open Release" }));
  });

  it("filters trends by search query to empty state", async () => {
    const user = userEvent.setup();
    render(
      wrap(<TestingEngineeringIntelligenceView permissions={["engineering.view"]} />),
    );

    await waitFor(() => {
      expect(screen.getByText("Executive Overview")).toBeTruthy();
    });

    await user.click(screen.getByRole("tab", { name: "Trends" }));
    await user.type(screen.getByLabelText("Search trends"), "zzzz-no-match");
    await waitFor(() => {
      expect(screen.getByText("No trends")).toBeTruthy();
    });
  });
});
