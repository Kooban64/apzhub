import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const pathnameMock = vi.fn(() => "/workspace/time");

vi.mock("next/navigation", () => ({
  usePathname: () => pathnameMock(),
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/time/time-api", () => ({
  listTimesheets: vi.fn(),
}));

vi.mock("@/lib/search/search-client", () => ({
  createHttpSearchClient: () => ({
    getHealth: vi.fn(async () => ({ status: "ok" })),
    getDiagnostics: vi.fn(async () => ({ status: "ok" })),
    listAudit: vi.fn(async () => ({ items: [] })),
  }),
}));

import { listTimesheets } from "@/lib/time/time-api";

import { TimeWorkspaceRouter } from "./time-workspace-router";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("TimeWorkspaceRouter", () => {
  beforeEach(() => {
    vi.mocked(listTimesheets).mockReset();
    pathnameMock.mockReturnValue("/workspace/time");
  });

  it("renders dashboard view for /workspace/time", async () => {
    vi.mocked(listTimesheets).mockResolvedValue({
      items: [
        {
          id: "tts_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          tenantId: "tenant_e2e",
          userId: "user_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          description: "Morning work",
          status: "running",
          durationMinutes: 30,
          startedAt: "2026-07-19T08:00:00.000Z",
          tagIds: [],
          billable: true,
          createdAt: "2026-07-19T08:00:00.000Z",
          updatedAt: "2026-07-19T08:30:00.000Z",
        },
      ],
      page: { limit: 10, hasMore: false },
    });

    render(wrap(<TimeWorkspaceRouter permissions={["time.*"]} />));
    expect(screen.getByTestId("time-page")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getAllByText("Morning work").length).toBeGreaterThan(0);
    });
    expect(screen.getByTestId("time-context-panel")).toBeTruthy();
  });

  it("renders unknown route empty state", () => {
    pathnameMock.mockReturnValue("/workspace/time/not-a-real-section");
    render(wrap(<TimeWorkspaceRouter permissions={["time.*"]} />));
    expect(screen.getByTestId("time-page")).toBeTruthy();
    expect(screen.getByText("Unknown APZ Time route")).toBeTruthy();
  });

  it("denies create route without APZHUB Time permissions", () => {
    pathnameMock.mockReturnValue("/workspace/time/timesheets/new");
    render(wrap(<TimeWorkspaceRouter permissions={["time.view"]} />));
    expect(screen.getByTestId("time-empty")).toHaveTextContent("Permission required");
  });

  it("denies operator surfaces without time.admin", () => {
    pathnameMock.mockReturnValue("/workspace/time/diagnostics");
    render(wrap(<TimeWorkspaceRouter permissions={["time.view"]} />));
    expect(screen.getByTestId("time-empty")).toHaveTextContent("Permission required");
  });

  it("renders help for viewers", () => {
    pathnameMock.mockReturnValue("/workspace/time/help");
    render(wrap(<TimeWorkspaceRouter permissions={["time.view"]} />));
    expect(screen.getByTestId("time-help")).toBeTruthy();
  });
});
