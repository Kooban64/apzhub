import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support/support-api", () => ({
  getSupportAnalytics: vi.fn(),
}));

import { getSupportAnalytics } from "@/lib/support/support-api";

import { SupportAnalyticsView } from "./support-analytics-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("SupportAnalyticsView", () => {
  it("renders metrics and overdue heuristic label", async () => {
    vi.mocked(getSupportAnalytics).mockResolvedValue({
      data: {
        capturedAt: "2026-01-01T00:00:00.000Z",
        totalTickets: 10,
        openTickets: 4,
        closedTickets: 5,
        pendingTickets: 1,
        newTickets: 2,
        overdueTickets: 3,
        unassignedTickets: 1,
        byPriority: [{ key: "high", count: 2 }],
        byState: [{ key: "open", count: 4 }],
        byOrganization: [],
        byGroup: [],
        byOwner: [],
      },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportAnalyticsView />));
    await waitFor(() => expect(screen.getByTestId("support-analytics")).toBeTruthy());
    expect(screen.getByText("Overdue")).toBeTruthy();
    expect(screen.getByText(/not an SLA/i)).toBeTruthy();
    expect(screen.getByText("10")).toBeTruthy();
  });
});
