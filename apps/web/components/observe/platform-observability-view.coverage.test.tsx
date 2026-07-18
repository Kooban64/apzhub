"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { createMockObserveClient } from "@/lib/observe/mock-observe-client";
import {
  ObserveClientError,
  resetObserveClient,
  setObserveClient,
} from "@/lib/observe";

import { PlatformObservabilityView } from "./platform-observability-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("PlatformObservabilityView coverage", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    resetObserveClient();
    setObserveClient(createMockObserveClient());
  });

  it("filters, updates, and retries facet panels", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformObservabilityView section="health-checks" />));

    await waitFor(() => {
      expect(screen.getAllByText("hc_mock_1").length).toBeGreaterThan(0);
    });

    await user.type(screen.getByLabelText(/Filter Health Checks/i), "missing");
    await waitFor(() => {
      expect(screen.getByTestId("observability-empty")).toBeTruthy();
    });

    await user.clear(screen.getByLabelText(/Filter Health Checks/i));
    await waitFor(() => {
      expect(screen.getAllByText("hc_mock_1").length).toBeGreaterThan(0);
    });

    await user.click(screen.getByRole("button", { name: /Save name/i }));
    await waitFor(() => {
      expect(screen.getByTestId("observability-status").textContent).toMatch(
        /Updated metadata/i,
      );
    });
  });

  it("covers create/update across representative facets", async () => {
    const user = userEvent.setup();
    for (const section of [
      "metric-definitions",
      "alert-definitions",
      "maintenance-windows",
      "metadata",
      "health-summaries",
    ] as const) {
      cleanup();
      resetObserveClient();
      setObserveClient(createMockObserveClient());
      render(wrap(<PlatformObservabilityView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId(`facet-${section}`)).toBeTruthy();
      });
      await user.click(screen.getByRole("button", { name: /^Create$/i }));
      await waitFor(() => {
        expect(screen.getByTestId("observability-status")).toBeTruthy();
      });
      await user.click(screen.getByRole("button", { name: /Save name/i }));
    }
  });

  it("covers remaining facet renders with interaction", async () => {
    const user = userEvent.setup();
    for (const section of [
      "readiness-checks",
      "liveness-checks",
      "service-health",
      "service-status",
      "component-status",
      "metric-samples",
      "alert-states",
      "dashboard-definitions",
      "log-sources",
      "trace-definitions",
      "trace-spans",
      "incident-references",
    ] as const) {
      cleanup();
      resetObserveClient();
      setObserveClient(createMockObserveClient());
      render(wrap(<PlatformObservabilityView section={section} />));
      await waitFor(() => {
        expect(screen.getByTestId(`facet-${section}`)).toBeTruthy();
      });
      const create = screen.queryByRole("button", { name: /^Create$/i });
      if (create) {
        await user.click(create);
        await waitFor(() => {
          expect(screen.getByTestId("observability-status")).toBeTruthy();
        });
      }
    }
  });

  it("covers unknown section and detail errors", async () => {
    render(wrap(<PlatformObservabilityView section={"unknown" as never} />));
    expect(screen.getByText(/Section not found/i)).toBeTruthy();

    cleanup();
    const mock = createMockObserveClient();
    setObserveClient({
      ...mock,
      healthChecks: {
        ...mock.healthChecks,
        async get() {
          throw new ObserveClientError({
            message: "missing",
            code: "NOT_FOUND",
            status: 404,
          });
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getByTestId("observability-not-found")).toBeTruthy();
    });
  });

  it("covers diagnostics unavailable and overview refresh", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformObservabilityView section="overview" />));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Refresh/i })).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Refresh/i }));

    cleanup();
    const base = createMockObserveClient();
    setObserveClient({
      ...base,
      // Keep capabilities healthy so overviewError does not short-circuit.
      async getCapabilities() {
        return base.getCapabilities();
      },
      async getHealth() {
        throw new ObserveClientError({
          message: "down",
          code: "OBSERVE_SERVICE_UNAVAILABLE",
          status: 503,
        });
      },
      async getReadiness() {
        throw new ObserveClientError({
          message: "down",
          code: "OBSERVE_SERVICE_UNAVAILABLE",
          status: 503,
        });
      },
      diagnostics: {
        ...base.diagnostics,
        async management() {
          throw new ObserveClientError({
            message: "down",
            code: "OBSERVE_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
        async health() {
          throw new ObserveClientError({
            message: "down",
            code: "OBSERVE_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
        async readiness() {
          throw new ObserveClientError({
            message: "down",
            code: "OBSERVE_SERVICE_UNAVAILABLE",
            status: 503,
          });
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("observability-unavailable")).toBeTruthy();
    });
    await user.click(screen.getByRole("button", { name: /Retry/i }));
  });

  it("covers overview unavailable retry and diagnostics loading", async () => {
    const user = userEvent.setup();
    const base = createMockObserveClient();
    setObserveClient({
      ...base,
      healthChecks: {
        ...base.healthChecks,
        async list() {
          throw new ObserveClientError({
            message: "down",
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
    await user.click(screen.getByRole("button", { name: /Retry/i }));

    cleanup();
    resetObserveClient();
    let resolveReadiness: ((value: unknown) => void) | undefined;
    const readinessPromise = new Promise((resolve) => {
      resolveReadiness = resolve;
    });
    const delayed = createMockObserveClient();
    setObserveClient({
      ...delayed,
      async getReadiness() {
        await readinessPromise;
        return delayed.getReadiness();
      },
      diagnostics: {
        ...delayed.diagnostics,
        async readiness() {
          await readinessPromise;
          return delayed.diagnostics.readiness();
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diag-readiness").textContent).toMatch(/Loading/i);
    });
    resolveReadiness?.(undefined);
    await waitFor(() => {
      expect(screen.getByTestId("diag-readiness").textContent).not.toMatch(/Loading/i);
    });
  });

  it("covers row keyboard selection, draft edits, update errors, and list unavailable retry", async () => {
    const user = userEvent.setup();
    const base = createMockObserveClient();
    const first = await base.healthChecks.get("hc_mock_1");
    const second = {
      ...first,
      id: "hc_mock_2",
      name: "Second health check",
    };
    setObserveClient({
      ...base,
      healthChecks: {
        ...base.healthChecks,
        async list() {
          return {
            items: [first, second],
            page: { limit: 2, hasMore: false },
          };
        },
        async get(id: string) {
          if (id === second.id) return second;
          return first;
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getAllByText("hc_mock_1").length).toBeGreaterThan(0);
      expect(screen.getAllByText("hc_mock_2").length).toBeGreaterThan(0);
    });

    const rows = screen.getAllByRole("row").filter((row) => row.tabIndex === 0);
    expect(rows.length).toBeGreaterThan(1);
    await user.click(rows[1]!);
    await waitFor(() => {
      expect(screen.getByTestId("observability-detail").textContent).toContain(
        "hc_mock_2",
      );
    });
    rows[0]!.focus();
    await user.keyboard("{Enter}");
    await waitFor(() => {
      expect(screen.getByTestId("observability-detail").textContent).toContain(
        "hc_mock_1",
      );
    });
    rows[1]!.focus();
    await user.keyboard(" ");
    await waitFor(() => {
      expect(screen.getByTestId("observability-detail").textContent).toContain(
        "hc_mock_2",
      );
    });

    await user.clear(screen.getByLabelText(/^name$/i));
    await user.type(screen.getByLabelText(/^name$/i), "Renamed check");

    cleanup();
    resetObserveClient();
    const updateFail = createMockObserveClient();
    setObserveClient({
      ...updateFail,
      healthChecks: {
        ...updateFail.healthChecks,
        async update() {
          throw new ObserveClientError({
            message: "conflict",
            code: "CONFLICT",
            status: 409,
          });
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getAllByText("hc_mock_1").length).toBeGreaterThan(0);
    });
    await user.click(screen.getByRole("button", { name: /Save name/i }));
    await waitFor(() => {
      expect(screen.getByTestId("observability-action-error").textContent).toMatch(
        /conflict/i,
      );
    });

    cleanup();
    resetObserveClient();
    let unavailable = true;
    const listFail = createMockObserveClient();
    setObserveClient({
      ...listFail,
      healthChecks: {
        ...listFail.healthChecks,
        async list() {
          if (unavailable) {
            throw new ObserveClientError({
              message: "down",
              code: "OBSERVE_SERVICE_UNAVAILABLE",
              status: 503,
            });
          }
          return listFail.healthChecks.list();
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getByTestId("observability-unavailable")).toBeTruthy();
    });
    unavailable = false;
    await user.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getAllByText("hc_mock_1").length).toBeGreaterThan(0);
    });
  });

  it("covers generic facet error retry", async () => {
    const user = userEvent.setup();
    let fail = true;
    const mock = createMockObserveClient();
    setObserveClient({
      ...mock,
      healthChecks: {
        ...mock.healthChecks,
        async list() {
          if (fail) {
            throw new ObserveClientError({
              message: "boom",
              code: "INTERNAL",
              status: 500,
            });
          }
          return mock.healthChecks.list();
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getByTestId("observability-error")).toBeTruthy();
    });
    fail = false;
    await user.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getAllByText("hc_mock_1").length).toBeGreaterThan(0);
    });
  });

  it("covers diagnostics list table and detail retry", async () => {
    const user = userEvent.setup();
    render(wrap(<PlatformObservabilityView section="diagnostics" />));
    await waitFor(() => {
      expect(screen.getByTestId("diag-readiness")).toBeTruthy();
      expect(screen.getByTestId("observability-table")).toBeTruthy();
    });

    cleanup();
    const mock = createMockObserveClient();
    let detailFail = true;
    setObserveClient({
      ...mock,
      healthChecks: {
        ...mock.healthChecks,
        async get() {
          if (detailFail) {
            throw new ObserveClientError({
              message: "temp",
              code: "INTERNAL",
              status: 500,
            });
          }
          return mock.healthChecks.get("hc_mock_1");
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getByTestId("observability-error")).toBeTruthy();
    });
    detailFail = false;
    await user.click(screen.getByRole("button", { name: /Retry/i }));
    await waitFor(() => {
      expect(screen.getByTestId("observability-detail")).toBeTruthy();
    });
  });

  it("covers mutation validation failure path", async () => {
    const user = userEvent.setup();
    const mock = createMockObserveClient();
    setObserveClient({
      ...mock,
      healthChecks: {
        ...mock.healthChecks,
        async create() {
          throw new ObserveClientError({
            message: "invalid",
            code: "VALIDATION_ERROR",
            status: 400,
          });
        },
      },
    });
    render(wrap(<PlatformObservabilityView section="health-checks" />));
    await waitFor(() => {
      expect(screen.getAllByText("hc_mock_1").length).toBeGreaterThan(0);
    });
    await user.click(screen.getByRole("button", { name: /^Create$/i }));
    await waitFor(() => {
      expect(screen.getByTestId("observability-action-error").textContent).toMatch(
        /invalid/i,
      );
    });
    expect(
      screen.getByRole("heading", { level: 1, name: "Health Checks" }),
    ).toBeTruthy();
  });
});
