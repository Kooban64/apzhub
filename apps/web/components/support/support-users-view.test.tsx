import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

vi.mock("@/lib/support/support-api", () => ({
  listSupportUsers: vi.fn(),
  getSupportUser: vi.fn(),
}));

import { SupportApiError } from "@/lib/support/errors";
import { getSupportUser, listSupportUsers } from "@/lib/support/support-api";

import { SupportUsersView } from "./support-users-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const userDto = {
  id: "suser_11111111111111111111111111111111",
  tenantId: "t1",
  displayName: "Pat Agent",
  email: "pat@example.com",
  login: "pat",
  role: "agent" as const,
  active: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

describe("SupportUsersView", () => {
  beforeEach(() => {
    push.mockReset();
    vi.mocked(listSupportUsers).mockReset();
    vi.mocked(getSupportUser).mockReset();
  });

  it("lists users read-only without create/delete and navigates on click", async () => {
    const user = userEvent.setup();
    vi.mocked(listSupportUsers).mockResolvedValue({
      data: [userDto],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportUsersView />));
    await waitFor(() => expect(screen.getByText("Pat Agent")).toBeTruthy());
    expect(screen.getByTestId("support-users-identity-banner")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /create/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
    await user.click(screen.getByText("Pat Agent"));
    expect(push).toHaveBeenCalledWith(
      "/workspace/support/users/suser_11111111111111111111111111111111",
    );
  });

  it("searches users and shows empty state", async () => {
    const user = userEvent.setup();
    vi.mocked(listSupportUsers).mockResolvedValue({
      data: [],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportUsersView />));
    await user.type(screen.getByTestId("support-users-search"), "nobody");
    await waitFor(() => {
      expect(listSupportUsers).toHaveBeenCalledWith(
        expect.objectContaining({ search: "nobody" }),
        expect.anything(),
      );
    });
    await waitFor(() => expect(screen.getByTestId("support-empty")).toBeTruthy());
  });

  it("shows forbidden list error messaging", async () => {
    vi.mocked(listSupportUsers).mockRejectedValue(
      SupportApiError.fromHttp({
        status: 403,
        code: "FORBIDDEN",
        message: "zammad forbidden",
      }),
    );

    render(wrap(<SupportUsersView />));
    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
    expect(screen.getByTestId("support-error").textContent).toMatch(/permission/i);
    expect(
      screen.getByTestId("support-error").textContent?.toLowerCase(),
    ).not.toContain("zammad");
  });

  it("renders user detail read-only", async () => {
    vi.mocked(getSupportUser).mockResolvedValue({
      data: userDto,
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(wrap(<SupportUsersView userId={userDto.id} />));
    await waitFor(() => expect(screen.getByTestId("support-user-detail")).toBeTruthy());
    expect(screen.getByText("pat@example.com")).toBeTruthy();
    expect(screen.getByText("agent")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /create/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /delete/i })).toBeNull();
  });

  it("shows detail not-found error", async () => {
    vi.mocked(getSupportUser).mockRejectedValue(
      SupportApiError.fromHttp({ status: 404, code: "NOT_FOUND" }),
    );

    render(wrap(<SupportUsersView userId={userDto.id} />));
    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
  });
});
