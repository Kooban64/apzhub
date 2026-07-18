"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  createMockMetricsClient,
  resetMetricsClient,
  setMetricsClient,
  METRICS_SECTIONS,
  MetricsClientError,
  type MetricsSection,
} from "@/lib/metrics";

import { PlatformMetricsView } from "./platform-metrics-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformMetricsView coverage", () => {
  afterEach(() => cleanup());
  beforeEach(() => {
    resetMetricsClient();
    setMetricsClient(createMockMetricsClient());
  });

  it("renders every section without crash", async () => {
    for (const section of METRICS_SECTIONS) {
      cleanup();
      render(wrap(<PlatformMetricsView section={section as MetricsSection} />));
      await waitFor(() => {
        expect(screen.getByTestId("metrics-page")).toBeTruthy();
      });
    }
  });

  it("supports filter, create, and save on metrics facet", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformMetricsView section="metrics" />));
    await waitFor(() => {
      expect(screen.getByTestId("facet-metrics")).toBeTruthy();
    });
    await user.type(screen.getByLabelText(/Filter Metrics/i), "missing");
    await waitFor(() => {
      expect(screen.getByTestId("metrics-empty")).toBeTruthy();
    });
    await user.clear(screen.getByLabelText(/Filter Metrics/i));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-table")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-status")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-status").textContent).toMatch(
        /Updated metadata/i,
      );
    });
  });

  it("covers create across representative facets", async () => {
    const user = userEvent.setup();
    for (const section of [
      "definitions",
      "versions",
      "formulas",
      "kpis",
      "metadata",
      "thresholds",
      "aggregations",
      "owners",
      "consumers",
      "retention-policies",
      "classifications",
      "dependencies",
      "relationships",
      "kpi-groups",
      "kpi-targets",
      "categories",
      "groups",
      "dimensions",
      "labels",
      "units",
    ] as const) {
      cleanup();
      resetMetricsClient();
      setMetricsClient(createMockMetricsClient());
      render(wrap(<PlatformMetricsView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId(`facet-${section}`)).toBeTruthy();
      });
      await user.click(screen.getByRole("button", { name: /^Create$/i }));
      await waitFor(() => {
        expect(screen.getByTestId("metrics-status")).toBeTruthy();
      });
    }
  });

  it("covers unknown section and detail errors", async () => {
    render(wrap(<PlatformMetricsView section={"unknown" as never} />));
    expect(screen.getByText(/Section not found/i)).toBeTruthy();

    cleanup();
    const mock = createMockMetricsClient();
    setMetricsClient({
      ...mock,
      metrics: {
        ...mock.metrics,
        async get() {
          throw new MetricsClientError({
            message: "missing",
            code: "NOT_FOUND",
            status: 404,
          });
        },
      },
    });
    render(wrap(<PlatformMetricsView section="metrics" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-not-found")).toBeTruthy();
    });
  });

  it("covers forbidden facet list errors and retry", async () => {
    const user = userEvent.setup();
    const mock = createMockMetricsClient();
    setMetricsClient({
      ...mock,
      formulas: {
        ...mock.formulas,
        async list() {
          throw new MetricsClientError({
            message: "denied",
            code: "FORBIDDEN",
            status: 403,
          });
        },
      },
    });
    render(wrap(<PlatformMetricsView section="formulas" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-forbidden")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));
  });

  it("covers facet unavailable and create error paths", async () => {
    const user = userEvent.setup();
    const mock = createMockMetricsClient();
    setMetricsClient({
      ...mock,
      kpis: {
        ...mock.kpis,
        async list() {
          throw new MetricsClientError({
            message: "disabled",
            code: "METRICS_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
      },
    });
    render(wrap(<PlatformMetricsView section="kpis" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-unavailable")).toBeTruthy();
    });

    cleanup();
    setMetricsClient({
      ...createMockMetricsClient(),
      metrics: {
        ...createMockMetricsClient().metrics,
        async create() {
          throw new MetricsClientError({
            message: "bad",
            code: "VALIDATION_ERROR",
            status: 400,
          });
        },
      },
    });
    render(wrap(<PlatformMetricsView section="metrics" />));
    await waitFor(() => {
      expect(screen.getByTestId("facet-metrics")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-action-error")).toBeTruthy();
    });
  });

  it("covers overview refresh and diagnostics unavailable", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformMetricsView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("card-metrics-count")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Refresh/i }));

    cleanup();
    const unavailable = async () => {
      throw new MetricsClientError({
        message: "disabled",
        code: "METRICS_SERVICE_UNAVAILABLE",
        status: 503,
      });
    };
    const base = createMockMetricsClient();
    setMetricsClient({
      ...base,
      getCapabilities: unavailable,
      getHealth: unavailable,
      getReadiness: unavailable,
      diagnostics: {
        ...base.diagnostics,
        health: unavailable,
        readiness: unavailable,
        capabilities: unavailable,
        management: unavailable,
      },
    });
    render(wrap(<PlatformMetricsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-unavailable")).toBeTruthy();
    });
  });

  it("covers keyboard row selection and draft field edits", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformMetricsView section="metrics" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-table")).toBeTruthy();
    });
    const rows = screen.getAllByRole("row");
    const dataRow = rows.find((row) => row.getAttribute("tabindex") === "0");
    if (dataRow) {
      dataRow.focus();
      await user.keyboard("{Enter}");
      dataRow.focus();
      await user.keyboard(" ");
    }
    const nameField = screen.getByLabelText("name");
    await user.clear(nameField);
    await user.type(nameField, "Renamed");
    expect((nameField as HTMLInputElement).value).toBe("Renamed");
  });

  it("covers overview unavailable retry and update mutation errors", async () => {
    const user = userEvent.setup();
    const unavailable = async () => {
      throw new MetricsClientError({
        message: "disabled",
        code: "METRICS_SERVICE_UNAVAILABLE",
        status: 503,
      });
    };
    setMetricsClient({
      ...createMockMetricsClient(),
      metrics: {
        ...createMockMetricsClient().metrics,
        list: unavailable,
      },
      getCapabilities: unavailable,
    });
    render(wrap(<PlatformMetricsView section="overview" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-unavailable")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    cleanup();
    setMetricsClient({
      ...createMockMetricsClient(),
      metrics: {
        ...createMockMetricsClient().metrics,
        async update() {
          throw new MetricsClientError({
            message: "conflict",
            code: "CONFLICT",
            status: 409,
          });
        },
      },
    });
    render(wrap(<PlatformMetricsView section="metrics" />));
    await waitFor(() => {
      expect(screen.getByTestId("facet-metrics")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: "Save" }));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-action-error")).toBeTruthy();
    });
  });

  it("covers generic facet errors and detail unavailable retry", async () => {
    const user = userEvent.setup();
    setMetricsClient({
      ...createMockMetricsClient(),
      versions: {
        ...createMockMetricsClient().versions,
        async list() {
          throw new MetricsClientError({
            message: "boom",
            code: "INTERNAL",
            status: 500,
          });
        },
      },
    });
    render(wrap(<PlatformMetricsView section="versions" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-error")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    cleanup();
    setMetricsClient({
      ...createMockMetricsClient(),
      definitions: {
        ...createMockMetricsClient().definitions,
        async get() {
          throw new MetricsClientError({
            message: "disabled",
            code: "METRICS_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
      },
    });
    render(wrap(<PlatformMetricsView section="definitions" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-unavailable")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));
  });

  it("covers diagnostics unavailable retry", async () => {
    const user = userEvent.setup();
    const unavailable = async () => {
      throw new MetricsClientError({
        message: "disabled",
        code: "METRICS_SERVICE_UNAVAILABLE",
        status: 503,
      });
    };
    const base = createMockMetricsClient();
    // Keep capabilities healthy so the early overview/diagnostics guard is skipped;
    // fail health/readiness so the diagnostics-specific unavailable path runs.
    setMetricsClient({
      ...base,
      getHealth: unavailable,
      getReadiness: unavailable,
      diagnostics: {
        ...base.diagnostics,
        health: unavailable,
        readiness: unavailable,
      },
    });
    render(wrap(<PlatformMetricsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("metrics-unavailable")).toBeTruthy();
      expect(screen.getByText(/Safe readiness metadata only/i)).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));
  });

  it("covers readiness not-ready card and empty detail selection", async () => {
    const base = createMockMetricsClient();
    setMetricsClient({
      ...base,
      getReadiness: async () => ({
        ready: false,
        metricsEnabled: true as const,
        persistenceMode: "memory" as const,
        formulaExecutionEnabled: false as const,
        kpiExecutionEnabled: false as const,
        providerIntegrationEnabled: false as const,
        capabilities: [],
      }),
      diagnostics: {
        ...base.diagnostics,
        readiness: async () => ({
          ready: false,
          metricsEnabled: true as const,
          persistenceMode: "memory" as const,
          formulaExecutionEnabled: false as const,
          kpiExecutionEnabled: false as const,
          providerIntegrationEnabled: false as const,
          capabilities: [],
        }),
      },
      metrics: {
        ...base.metrics,
        async list() {
          return { items: [], page: { limit: 0, hasMore: false } };
        },
      },
    });
    render(wrap(<PlatformMetricsView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diag-readiness").textContent).toMatch(/Not ready/i);
    });

    cleanup();
    setMetricsClient(createMockMetricsClient());
    render(wrap(<PlatformMetricsView section="metrics" canManage={false} />));
    await waitFor(() => {
      expect(screen.getByTestId("facet-metrics")).toBeTruthy();
    });
  });
});
