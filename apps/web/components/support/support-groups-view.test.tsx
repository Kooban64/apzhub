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
  listSupportGroups: vi.fn(),
  getSupportGroup: vi.fn(),
  createSupportGroup: vi.fn(),
  updateSupportGroup: vi.fn(),
}));

import { SupportApiError } from "@/lib/support/errors";
import {
  createSupportGroup,
  getSupportGroup,
  listSupportGroups,
  updateSupportGroup,
} from "@/lib/support/support-api";

import { SupportGroupsView } from "./support-groups-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const group = {
  id: "sgrp_ffffffffffffffffffffffffffffffff",
  tenantId: "t1",
  name: "Tier 1",
  note: "Primary queue",
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("SupportGroupsView", () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(listSupportGroups).mockReset();
    vi.mocked(getSupportGroup).mockReset();
    vi.mocked(createSupportGroup).mockReset();
    vi.mocked(updateSupportGroup).mockReset();
  });

  it("lists groups and has no delete control", async () => {
    const user = userEvent.setup();
    vi.mocked(listSupportGroups).mockResolvedValue({
      data: [group],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportGroupsView permissions={["support.*"]} />));
    await waitFor(() => expect(screen.getByText("Tier 1")).toBeTruthy());
    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
    await user.click(screen.getByText("Tier 1"));
    expect(push).toHaveBeenCalledWith(
      "/workspace/support/groups/sgrp_ffffffffffffffffffffffffffffffff",
    );
  });

  it("creates a group and navigates to detail", async () => {
    const user = userEvent.setup();
    vi.mocked(listSupportGroups).mockResolvedValue({
      data: [],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(createSupportGroup).mockResolvedValue({
      data: group,
      meta: { requestId: "r2", correlationId: "c2" },
    });

    render(wrap(<SupportGroupsView permissions={["support.*"]} />));
    await waitFor(() => expect(screen.getByTestId("support-empty")).toBeTruthy());
    await user.type(screen.getAllByRole("textbox")[0]!, "Tier 1");
    await user.click(screen.getByRole("button", { name: "Create" }));
    await waitFor(() => {
      expect(createSupportGroup).toHaveBeenCalledWith({
        name: "Tier 1",
        note: undefined,
      });
    });
    expect(push).toHaveBeenCalledWith(
      "/workspace/support/groups/sgrp_ffffffffffffffffffffffffffffffff",
    );
  });

  it("hides create without permissions and shows unavailable messaging", async () => {
    vi.mocked(listSupportGroups).mockRejectedValue(
      SupportApiError.fromHttp({
        status: 503,
        code: "UNAVAILABLE",
        message: "provider timeout",
      }),
    );

    render(wrap(<SupportGroupsView permissions={[]} />));
    expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
    expect(screen.getByTestId("support-error").textContent).toMatch(/unavailable/i);
    expect(screen.getByTestId("support-error").textContent?.toLowerCase()).not.toContain(
      "provider",
    );
  });

  it("updates group detail when permitted", async () => {
    const user = userEvent.setup();
    vi.mocked(getSupportGroup).mockResolvedValue({
      data: group,
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(updateSupportGroup).mockResolvedValue({
      data: { ...group, name: "Tier 2" },
      meta: { requestId: "r2", correlationId: "c2" },
    });

    render(
      wrap(<SupportGroupsView groupId={group.id} permissions={["support.*"]} />),
    );
    await waitFor(() => expect(screen.getByTestId("support-group-detail")).toBeTruthy());
    expect(screen.getByText("Primary queue")).toBeTruthy();

    const nameInput = screen.getByDisplayValue("Tier 1");
    fireEvent.change(nameInput, { target: { value: "Tier 2" } });
    await user.click(screen.getByRole("button", { name: "Update" }));
    await waitFor(() => {
      expect(updateSupportGroup).toHaveBeenCalledWith(group.id, { name: "Tier 2" });
    });
  });

  it("hides update without permissions", async () => {
    vi.mocked(getSupportGroup).mockResolvedValue({
      data: group,
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportGroupsView groupId={group.id} permissions={[]} />));
    await waitFor(() => expect(screen.getByTestId("support-group-detail")).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Update" })).toBeNull();
  });
});
