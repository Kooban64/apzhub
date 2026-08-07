import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/time/time-api", () => ({
  getTimeDiagnostics: vi.fn(),
  getTimeCapabilities: vi.fn(),
  getTimeReadiness: vi.fn(),
  getTimeCompatibility: vi.fn(),
  testTimeConnection: vi.fn(),
}));

import {
  getTimeCapabilities,
  getTimeCompatibility,
  getTimeDiagnostics,
  getTimeReadiness,
} from "@/lib/time/time-api";

import { TimeDiagnosticsView } from "./time-diagnostics-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TimeDiagnosticsView", () => {
  beforeEach(() => {
    vi.mocked(getTimeDiagnostics).mockResolvedValue({
      healthStatus: "ok",
      warnings: [],
      recommendations: [],
      foundationOnly: true,
    });
    vi.mocked(getTimeCapabilities).mockResolvedValue({ status: "ready" });
    vi.mocked(getTimeReadiness).mockResolvedValue({
      ready: true,
      classification: "ready",
    });
    vi.mocked(getTimeCompatibility).mockResolvedValue({
      compatibilityStatus: "compatible",
    });
  });

  it("presents operator summaries and safe developer disclosure", async () => {
    render(wrap(<TimeDiagnosticsView />));
    expect(screen.getByRole("heading", { name: "Platform readiness" })).toBeTruthy();
    expect(screen.getByText("Check platform readiness")).toBeTruthy();
    expect(screen.getByTestId("time-connection-test")).toHaveTextContent(
      "Run readiness check",
    );
    await waitFor(() => {
      expect(screen.getByTestId("time-capabilities-panel")).toBeTruthy();
    });
    const details = screen.getByTestId("time-capabilities-panel");
    expect(details.tagName.toLowerCase()).toBe("details");
  });
});
