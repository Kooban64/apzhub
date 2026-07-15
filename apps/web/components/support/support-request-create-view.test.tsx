import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("@/lib/support/support-api", () => ({
  createSupportRequest: vi.fn(),
  listSupportUsers: vi.fn(),
  listSupportOrganizations: vi.fn(),
  listSupportGroups: vi.fn(),
}));

import { SupportApiError } from "@/lib/support/errors";
import {
  createSupportRequest,
  listSupportGroups,
  listSupportOrganizations,
  listSupportUsers,
} from "@/lib/support/support-api";

import { SupportRequestCreateView } from "./support-request-create-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const emptyCollection = {
  data: [],
  page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
  meta: { requestId: "r1", correlationId: "c1" },
};

describe("SupportRequestCreateView", () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(createSupportRequest).mockReset();
    vi.mocked(listSupportUsers).mockResolvedValue(emptyCollection);
    vi.mocked(listSupportOrganizations).mockResolvedValue(emptyCollection);
    vi.mocked(listSupportGroups).mockResolvedValue(emptyCollection);
  });

  it("validates required fields before submit", () => {
    render(wrap(<SupportRequestCreateView />));

    // Bypass HTML5 constraint validation to exercise the app-level guard.
    fireEvent.submit(screen.getByTestId("support-request-create"));
    expect(screen.getByRole("alert").textContent).toMatch(
      /Title, customer, and group are required/i,
    );
    expect(createSupportRequest).not.toHaveBeenCalled();
  });

  it("creates a request and navigates to detail on success", async () => {
    const user = userEvent.setup();
    vi.mocked(createSupportRequest).mockResolvedValue({
      data: {
        id: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        tenantId: "t1",
        title: "VPN down",
        groupId: "sgrp_ffffffffffffffffffffffffffffffff",
        requesterId: "suser_11111111111111111111111111111111",
        status: "new",
        priority: "normal",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      meta: { requestId: "r2", correlationId: "c2" },
    });

    render(wrap(<SupportRequestCreateView />));

    await user.type(screen.getByTestId("support-create-title"), "VPN down");
    await user.type(
      screen.getByLabelText("Customer ID"),
      "suser_11111111111111111111111111111111",
    );
    await user.type(
      screen.getByLabelText("Group ID"),
      "sgrp_ffffffffffffffffffffffffffffffff",
    );
    await user.click(screen.getByTestId("support-create-submit"));

    await waitFor(() => {
      expect(createSupportRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "VPN down",
          requesterId: "suser_11111111111111111111111111111111",
          groupId: "sgrp_ffffffffffffffffffffffffffffffff",
          status: "new",
          priority: "normal",
        }),
      );
    });
    expect(push).toHaveBeenCalledWith(
      "/workspace/support/requests/sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    );
  });

  it("shows API error without provider leakage and supports cancel", async () => {
    const user = userEvent.setup();
    vi.mocked(createSupportRequest).mockRejectedValue(
      SupportApiError.fromHttp({
        status: 403,
        code: "FORBIDDEN",
        message: "zammad create denied",
      }),
    );

    render(wrap(<SupportRequestCreateView />));
    await user.type(screen.getByTestId("support-create-title"), "VPN down");
    await user.type(
      screen.getByLabelText("Customer ID"),
      "suser_11111111111111111111111111111111",
    );
    await user.type(
      screen.getByLabelText("Group ID"),
      "sgrp_ffffffffffffffffffffffffffffffff",
    );
    await user.click(screen.getByTestId("support-create-submit"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent?.toLowerCase()).not.toContain("zammad");

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(push).toHaveBeenCalledWith("/workspace/support/requests");
  });
});
