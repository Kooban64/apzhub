import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support/support-api", () => ({
  closeSupportRequest: vi.fn(),
  reopenSupportRequest: vi.fn(),
  changeSupportRequestState: vi.fn(),
  changeSupportRequestPriority: vi.fn(),
  assignSupportRequestOwner: vi.fn(),
  removeSupportRequestOwner: vi.fn(),
  changeSupportRequestCustomer: vi.fn(),
}));

import { SupportApiError } from "@/lib/support/errors";
import {
  assignSupportRequestOwner,
  changeSupportRequestCustomer,
  changeSupportRequestPriority,
  changeSupportRequestState,
  closeSupportRequest,
  removeSupportRequestOwner,
  reopenSupportRequest,
} from "@/lib/support/support-api";
import type { SupportRequest } from "@/lib/support/types";

import { SupportRequestCommands } from "./support-request-commands";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const openRequest: SupportRequest = {
  id: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  tenantId: "t1",
  title: "Cannot login",
  groupId: "sgrp_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  requesterId: "suser_cccccccccccccccccccccccccccccccc",
  assigneeId: "suser_dddddddddddddddddddddddddddddddd",
  status: "open",
  priority: "normal",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const closedRequest: SupportRequest = {
  ...openRequest,
  status: "closed",
};

describe("SupportRequestCommands", () => {
  beforeEach(() => {
    vi.mocked(closeSupportRequest).mockReset();
    vi.mocked(reopenSupportRequest).mockReset();
    vi.mocked(changeSupportRequestState).mockReset();
    vi.mocked(changeSupportRequestPriority).mockReset();
    vi.mocked(assignSupportRequestOwner).mockReset();
    vi.mocked(removeSupportRequestOwner).mockReset();
    vi.mocked(changeSupportRequestCustomer).mockReset();
  });

  it("hides all actions when permissions are empty", () => {
    render(wrap(<SupportRequestCommands request={openRequest} permissions={[]} />));
    expect(screen.queryByTestId("support-command-close")).toBeNull();
    expect(screen.queryByTestId("support-command-state")).toBeNull();
    expect(screen.queryByTestId("support-command-priority")).toBeNull();
    expect(screen.queryByTestId("support-command-owner")).toBeNull();
    expect(screen.queryByTestId("support-command-customer")).toBeNull();
  });

  it("closes via confirm dialog", async () => {
    const user = userEvent.setup();
    const onUpdated = vi.fn();
    vi.mocked(closeSupportRequest).mockResolvedValue({
      data: closedRequest,
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(
      wrap(
        <SupportRequestCommands
          request={openRequest}
          permissions={["support.*"]}
          onUpdated={onUpdated}
        />,
      ),
    );

    await user.click(screen.getByTestId("support-command-close"));
    await user.click(screen.getByTestId("support-confirm-dialog-confirm"));
    await waitFor(() => {
      expect(closeSupportRequest).toHaveBeenCalledWith(openRequest.id);
    });
    expect(onUpdated).toHaveBeenCalled();
  });

  it("reopens closed requests", async () => {
    const user = userEvent.setup();
    vi.mocked(reopenSupportRequest).mockResolvedValue({
      data: openRequest,
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(
      wrap(
        <SupportRequestCommands request={closedRequest} permissions={["support.*"]} />,
      ),
    );

    await user.click(screen.getByTestId("support-command-reopen"));
    await waitFor(() => {
      expect(reopenSupportRequest).toHaveBeenCalledWith(closedRequest.id);
    });
  });

  it("applies state, priority, owner, and customer changes", async () => {
    const user = userEvent.setup();
    vi.mocked(changeSupportRequestState).mockResolvedValue({
      data: { ...openRequest, status: "pending" },
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(changeSupportRequestPriority).mockResolvedValue({
      data: { ...openRequest, priority: "high" },
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(assignSupportRequestOwner).mockResolvedValue({
      data: openRequest,
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(removeSupportRequestOwner).mockResolvedValue({
      data: { ...openRequest, assigneeId: undefined },
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(changeSupportRequestCustomer).mockResolvedValue({
      data: openRequest,
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(
      wrap(
        <SupportRequestCommands request={openRequest} permissions={["support.*"]} />,
      ),
    );

    await user.selectOptions(screen.getByTestId("support-command-state"), "pending");
    await user.click(screen.getByTestId("support-command-state-apply"));
    await waitFor(() => {
      expect(changeSupportRequestState).toHaveBeenCalledWith(openRequest.id, "pending");
    });

    await user.selectOptions(screen.getByTestId("support-command-priority"), "high");
    await user.click(screen.getByTestId("support-command-priority-apply"));
    await waitFor(() => {
      expect(changeSupportRequestPriority).toHaveBeenCalledWith(openRequest.id, "high");
    });

    const owner = screen.getByTestId("support-command-owner");
    await user.clear(owner);
    await user.type(owner, "suser_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee");
    await user.click(screen.getByTestId("support-command-owner-assign"));
    await waitFor(() => {
      expect(assignSupportRequestOwner).toHaveBeenCalledWith(
        openRequest.id,
        "suser_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      );
    });

    await user.click(screen.getByTestId("support-command-owner-remove"));
    await waitFor(() => {
      expect(removeSupportRequestOwner).toHaveBeenCalledWith(openRequest.id);
    });

    const customer = screen.getByTestId("support-command-customer");
    await user.clear(customer);
    await user.type(customer, "suser_ffffffffffffffffffffffffffffffff");
    await user.click(screen.getByTestId("support-command-customer-apply"));
    await waitFor(() => {
      expect(changeSupportRequestCustomer).toHaveBeenCalledWith(
        openRequest.id,
        "suser_ffffffffffffffffffffffffffffffff",
      );
    });
  });

  it("surfaces API command errors without provider leakage", async () => {
    const user = userEvent.setup();
    vi.mocked(reopenSupportRequest).mockRejectedValue(
      SupportApiError.fromHttp({
        status: 409,
        code: "CONFLICT",
        message: "zammad conflict",
      }),
    );

    render(
      wrap(
        <SupportRequestCommands request={closedRequest} permissions={["support.*"]} />,
      ),
    );

    await user.click(screen.getByTestId("support-command-reopen"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("alert").textContent?.toLowerCase()).not.toContain("zammad");
  });
});
