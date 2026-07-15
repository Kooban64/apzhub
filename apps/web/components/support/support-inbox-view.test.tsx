import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/workspace/support/requests",
  useSearchParams: () => new URLSearchParams("status=open"),
}));

vi.mock("@/lib/support/support-api", () => ({
  listSupportRequests: vi.fn(),
}));

import { listSupportRequests } from "@/lib/support/support-api";

import { SupportInboxView } from "./support-inbox-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("SupportInboxView", () => {
  beforeEach(() => {
    vi.mocked(listSupportRequests).mockReset();
  });

  it("renders loading then rows", async () => {
    vi.mocked(listSupportRequests).mockResolvedValue({
      data: [
        {
          id: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          tenantId: "t1",
          displayId: "1001",
          title: "VPN down",
          groupId: "sgrp_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
          requesterId: "suser_cccccccccccccccccccccccccccccccc",
          status: "open",
          priority: "high",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportInboxView permissions={["support.*"]} />));
    expect(screen.getByTestId("support-loading")).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByText("VPN down")).toBeTruthy();
    });
    expect(screen.getByText("1001")).toBeTruthy();
    expect(screen.getByTestId("support-filter-status")).toBeTruthy();
  });

  it("shows error with retry", async () => {
    const user = userEvent.setup();
    vi.mocked(listSupportRequests)
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValueOnce({
        data: [],
        page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
        meta: { requestId: "r1", correlationId: "c1" },
      });

    render(wrap(<SupportInboxView permissions={["support.requests.list"]} />));
    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
    await user.click(screen.getByRole("button", { name: "Retry" }));
    await waitFor(() => expect(screen.getByTestId("support-empty")).toBeTruthy());
  });
});
