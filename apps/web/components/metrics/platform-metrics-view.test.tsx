"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMockMetricsClient } from "@/lib/metrics/mock-metrics-client";
import {
  MetricsClientError,
  resetMetricsClient,
  setMetricsClient,
} from "@/lib/metrics";

import { MetricsWorkspaceRouter } from "./metrics-workspace-router";
import { PlatformMetricsView } from "./platform-metrics-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/metrics/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformMetricsView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetMetricsClient();
    setMetricsClient(createMockMetricsClient());
  });

  it("renders overview with capability limitation banners", async () => {
    render(wrap(<PlatformMetricsView section="overview" />));

    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
      expect(screen.getByTestId("card-metrics-count")).toBeTruthy();
    });

    expect(screen.getByTestId("banner-formula-execution").textContent).toContain(
      "FORMULA EXECUTION NOT AVAILABLE",
    );
    expect(screen.getByTestId("banner-kpi-execution").textContent).toContain(
      "KPI EXECUTION NOT AVAILABLE",
    );
    expect(screen.getByTestId("banner-prometheus").textContent).toContain(
      "PROMETHEUS INTEGRATION NOT AVAILABLE",
    );
    expect(screen.getByTestId("card-formula-execution").textContent).toContain(
      "Unavailable",
    );
    expect(screen.getByRole("toolbar", { name: /Metrics commands/i })).toBeTruthy();
  });

  it("lists metrics and shows detail inspector", async () => {
    render(wrap(<PlatformMetricsView section="metrics" />));

    await waitFor(() => {
      expect(screen.getByTestId("facet-metrics")).toBeTruthy();
      expect(screen.getByTestId("metrics-detail")).toBeTruthy();
    });
  });

  it("covers definition, version, formula, and KPI facets", async () => {
    for (const section of [
      "definitions",
      "versions",
      "formulas",
      "aggregations",
      "thresholds",
      "kpis",
      "kpi-groups",
      "kpi-targets",
    ] as const) {
      cleanup();
      render(wrap(<PlatformMetricsView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId(`facet-${section}`)).toBeTruthy();
      });
    }
  });

  it("covers taxonomy and relationship facets", async () => {
    for (const section of [
      "categories",
      "groups",
      "dimensions",
      "labels",
      "units",
      "owners",
      "consumers",
      "retention-policies",
      "classifications",
      "dependencies",
      "relationships",
      "metadata",
    ] as const) {
      cleanup();
      render(wrap(<PlatformMetricsView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId(`facet-${section}`)).toBeTruthy();
      });
    }
  });

  it("renders diagnostics metadata only", async () => {
    render(wrap(<PlatformMetricsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diag-metrics-enabled")).toBeTruthy();
      expect(screen.getByTestId("diag-formula-execution").textContent).toContain(
        "Unavailable",
      );
    });
  });

  it("shows unavailable state for METRICS_SERVICE_UNAVAILABLE", async () => {
    setMetricsClient({
      ...createMockMetricsClient(),
      metrics: {
        async list() {
          throw new MetricsClientError({
            message: "disabled",
            code: "METRICS_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
        async get() {
          throw new MetricsClientError({
            message: "disabled",
            code: "METRICS_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
        async create() {
          throw new MetricsClientError({
            message: "disabled",
            code: "METRICS_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
        async update() {
          throw new MetricsClientError({
            message: "disabled",
            code: "METRICS_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
      },
      getCapabilities: async () => {
        throw new MetricsClientError({
          message: "disabled",
          code: "METRICS_SERVICE_UNAVAILABLE",
          status: 503,
        });
      },
    } as ReturnType<typeof createMockMetricsClient>);

    render(wrap(<PlatformMetricsView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-unavailable")).toBeTruthy();
    });
  });

  it("routes via MetricsWorkspaceRouter", async () => {
    render(wrap(<MetricsWorkspaceRouter />));
    await waitFor(() => {
      expect(screen.getByRole("heading", { level: 1, name: "Overview" })).toBeTruthy();
    });
  });

  it("hides create controls when canManage is false", async () => {
    render(wrap(<PlatformMetricsView section="metrics" canManage={false} />));
    await waitFor(() => {
      expect(screen.getByTestId("facet-metrics")).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
  });
});
