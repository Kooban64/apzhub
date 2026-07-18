import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support/support-api", () => ({
  listSupportUsers: vi.fn(),
  listSupportOrganizations: vi.fn(),
  listSupportGroups: vi.fn(),
}));

import {
  listSupportGroups,
  listSupportOrganizations,
  listSupportUsers,
} from "@/lib/support/support-api";

import { SupportLookupSelect } from "./support-lookup-select";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("SupportLookupSelect", () => {
  beforeEach(() => {
    vi.mocked(listSupportUsers).mockReset();
    vi.mocked(listSupportOrganizations).mockReset();
    vi.mocked(listSupportGroups).mockReset();
  });

  it("searches users and updates selected id", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    vi.mocked(listSupportUsers).mockResolvedValue({
      data: [
        {
          id: "suser_11111111111111111111111111111111",
          tenantId: "t1",
          displayName: "Pat Agent",
          email: "pat@example.com",
          role: "agent",
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(
      wrap(
        <SupportLookupSelect
          kind="users"
          label="Customer"
          value=""
          onChange={onChange}
          required
        />,
      ),
    );

    expect(screen.getByTestId("support-lookup-users")).toBeTruthy();
    await user.type(screen.getByPlaceholderText("Search…"), "pat");
    await waitFor(() => {
      expect(listSupportUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: "pat" }),
        expect.anything(),
      );
    });

    await user.type(
      screen.getByLabelText("Customer ID"),
      "suser_11111111111111111111111111111111",
    );
    expect(onChange).toHaveBeenCalled();
  });

  it("loads organization and group options", async () => {
    vi.mocked(listSupportOrganizations).mockResolvedValue({
      data: [
        {
          id: "sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
          tenantId: "t1",
          name: "Acme",
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(listSupportGroups).mockResolvedValue({
      data: [
        {
          id: "sgrp_ffffffffffffffffffffffffffffffff",
          tenantId: "t1",
          name: "Tier 1",
          active: true,
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-02T00:00:00.000Z",
        },
      ],
      page: { cursor: null, nextCursor: null, limit: 20, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    const { rerender } = render(
      wrap(
        <SupportLookupSelect
          kind="organizations"
          label="Organization"
          value=""
          onChange={vi.fn()}
        />,
      ),
    );
    await waitFor(() => expect(listSupportOrganizations).toHaveBeenCalled());

    rerender(
      wrap(
        <SupportLookupSelect kind="groups" label="Group" value="" onChange={vi.fn()} />,
      ),
    );
    await waitFor(() => expect(listSupportGroups).toHaveBeenCalled());
  });

  it("shows lookup unavailable on error", async () => {
    vi.mocked(listSupportUsers).mockRejectedValue(new Error("boom"));

    render(
      wrap(
        <SupportLookupSelect kind="users" label="Owner" value="" onChange={vi.fn()} />,
      ),
    );

    await waitFor(() => {
      expect(screen.getByText("Lookup unavailable.")).toBeTruthy();
    });
  });
});
