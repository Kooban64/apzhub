import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/lib/support/support-api", () => ({
  searchSupport: vi.fn(),
}));

import { searchSupport } from "@/lib/support/support-api";

import { SupportSearchView } from "./support-search-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("SupportSearchView", () => {
  it("searches and labels result kinds", async () => {
    const user = userEvent.setup();
    vi.mocked(searchSupport).mockResolvedValue({
      data: {
        query: "vpn",
        hits: [
          {
            id: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
            kind: "support_request",
            title: "VPN issue",
            snippet: "Cannot connect",
          },
          {
            id: "sorg_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            kind: "organization",
            title: "Acme",
          },
        ],
        totalCount: 2,
        page: 1,
        perPage: 30,
        hasNextPage: false,
      },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportSearchView />));
    await user.type(screen.getByTestId("support-search-q"), "vpn");
    await user.click(screen.getByTestId("support-search-submit"));

    await waitFor(() => expect(screen.getByTestId("support-search-results")).toBeTruthy());
    expect(screen.getAllByText("Request").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Organization").length).toBeGreaterThan(0);
    expect(screen.getByText("VPN issue")).toBeTruthy();
  });
});
