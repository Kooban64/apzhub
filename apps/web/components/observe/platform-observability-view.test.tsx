"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createMockObserveClient } from "@/lib/observe/mock-observe-client";
import {
  ObserveClientError,
  resetObserveClient,
  setObserveClient,
} from "@/lib/observe";

import { ObserveWorkspaceRouter } from "./observe-workspace-router";
import { PlatformObservabilityView } from "./platform-observability-view";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workspace/observability/overview",
}));

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformObservabilityView", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetObserveClient();
    setObserveClient(createMockObserveClient());
  });

  it("renders overview with capability limitation banners", async () => {
    render(wrap(<PlatformObservabilityView section="overview" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
      expect(screen.getByTestId("card-health-checks-count")).toBeTruthy();
    });

    expect(screen.getByTestId("banner-grafana").textContent).toContain(
      "GRAFANA INTEGRATION NOT AVAILABLE",
    );
    expect(screen.getByTestId("banner-prometheus").textContent).toContain(
      "PROMETHEUS INTEGRATION NOT AVAILABLE",
    );
    expect(screen.getByTestId("banner-metrics-collection").textContent).toContain(
      "LIVE METRICS COLLECTION NOT AVAILABLE",
    );
    expect(screen.getByTestId("card-provider-execution").textContent).toContain(
      "Unavailable",
    );
    expect(
      screen.getByRole("toolbar", { name: /Observability commands/i }),
    ).toBeTruthy();
  });

  it("lists health checks and shows detail inspector", async () => {
    render(wrap(<PlatformObservabilityView section="health-checks" />));

    await waitFor(() => {
      expect(screen.getByText("hc_mock_1")).toBeTruthy();
    });
    expect(screen.getByTestId("observability-detail")).toBeTruthy();
    expect(screen.getByTestId("status-badge")).toBeTruthy();
  });

  it("covers readiness, liveness, service health, and service status", async () => {
    for (const section of [
      "readiness-checks",
      "liveness-checks",
      "service-health",
      "service-status",
      "component-status",
    ] as const) {
      cleanup();
      render(wrap(<PlatformObservabilityView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId(`facet-${section}`)).toBeTruthy();
      });
    }
  });

  it("covers telemetry and operations metadata facets", async () => {
    for (const section of [
      "metric-definitions",
      "metric-samples",
      "alert-definitions",
      "alert-states",
      "dashboard-definitions",
      "log-sources",
      "trace-definitions",
      "trace-spans",
      "incident-references",
      "maintenance-windows",
      "health-summaries",
      "metadata",
    ] as const) {
      cleanup();
      render(wrap(<PlatformObservabilityView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId(`facet-${section}`)).toBeTruthy();
      });
    }
  });

  it("creates health-check metadata via form", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformObservabilityView section="health-checks" />));

    await waitFor(() => {
      expect(screen.getByText("hc_mock_1")).toBeTruthy();
    });

    await user.click(screen.getByRole("button", { name: /^Create$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("observability-status").textContent).toMatch(
        /Created hc_new/i,
      );
    });
  });

  it("renders diagnostics without provider probes", async () => {
    render(wrap(<PlatformObservabilityView section="diagnostics" />));

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Diagnostics" }),
      ).toBeTruthy();
      expect(screen.getByTestId("diag-readiness")).toBeTruthy();
    });

    expect(screen.getByTestId("diag-provider-execution").textContent).toContain(
      "Unavailable",
    );
    expect(screen.getByTestId("banner-grafana")).toBeTruthy();
  });

  it("shows controlled unavailable state for disabled service", async () => {
    setObserveClient({
      ...createMockObserveClient(),
      async getCapabilities() {
        throw new ObserveClientError({
          message: "Observability Platform HTTP API is not enabled",
          code: "OBSERVE_SERVICE_UNAVAILABLE",
          status: 503,
        });
      },
      healthChecks: {
        ...createMockObserveClient().healthChecks,
        async list() {
          throw new ObserveClientError({
            message: "Observability Platform HTTP API is not enabled",
            code: "OBSERVE_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
      },
    });

    render(wrap(<PlatformObservabilityView section="overview" />));

    await waitFor(() => {
      expect(screen.getByTestId("observability-unavailable")).toBeTruthy();
    });
  });

  it("hides manage actions when canManage is false", async () => {
    render(
      wrap(
        <PlatformObservabilityView section="health-checks" canManage={false} />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("hc_mock_1")).toBeTruthy();
    });
    expect(screen.queryByRole("button", { name: /^Create$/i })).toBeNull();
  });

  it("router resolves overview from pathname", async () => {
    render(wrap(<ObserveWorkspaceRouter />));
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { level: 1, name: "Overview" }),
      ).toBeTruthy();
    });
  });

  it("shows empty state when facet has no records", async () => {
    const empty = createMockObserveClient();
    setObserveClient({
      ...empty,
      healthChecks: {
        ...empty.healthChecks,
        async list() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getByTestId("observability-empty")).toBeTruthy();
    });
  });

  it("shows forbidden error state", async () => {
    const mock = createMockObserveClient();
    setObserveClient({
      ...mock,
      healthChecks: {
        ...mock.healthChecks,
        async list() {
          throw new ObserveClientError({
            message: "Forbidden",
            code: "FORBIDDEN",
            status: 403,
          });
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getByTestId("observability-forbidden")).toBeTruthy();
    });
  });
});
