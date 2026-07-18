import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support/support-api", () => ({
  getSupportRequest: vi.fn(),
  listSupportArticles: vi.fn(),
  listSupportHistory: vi.fn(),
  closeSupportRequest: vi.fn(),
  reopenSupportRequest: vi.fn(),
  changeSupportRequestState: vi.fn(),
  changeSupportRequestPriority: vi.fn(),
  assignSupportRequestOwner: vi.fn(),
  removeSupportRequestOwner: vi.fn(),
  changeSupportRequestCustomer: vi.fn(),
  createInternalNote: vi.fn(),
  createCustomerReply: vi.fn(),
}));

import { SupportApiError } from "@/lib/support/errors";
import {
  getSupportRequest,
  listSupportArticles,
  listSupportHistory,
} from "@/lib/support/support-api";

import { SupportRequestDetailView } from "./support-request-detail-view";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const request = {
  id: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  tenantId: "t1",
  displayId: "42",
  title: "Cannot login",
  groupId: "sgrp_bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
  requesterId: "suser_cccccccccccccccccccccccccccccccc",
  assigneeId: "suser_dddddddddddddddddddddddddddddddd",
  organizationId: "sorg_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
  status: "open" as const,
  priority: "normal" as const,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

const article = {
  id: "sart_dddddddddddddddddddddddddddddddd",
  tenantId: "t1",
  supportTicketId: request.id,
  body: "Hello",
  bodyFormat: "text/plain" as const,
  channel: "email" as const,
  visibility: "public" as const,
  senderType: "customer" as const,
  author: { senderType: "customer" as const, displayName: "Pat" },
  deliveryStatus: "sent" as const,
  attachments: [],
  createdAt: "2026-01-01T01:00:00.000Z",
  updatedAt: "2026-01-01T01:00:00.000Z",
};

describe("SupportRequestDetailView", () => {
  beforeEach(() => {
    vi.mocked(getSupportRequest).mockReset();
    vi.mocked(listSupportArticles).mockReset();
    vi.mocked(listSupportHistory).mockReset();
  });

  it("renders request fields and conversation", async () => {
    vi.mocked(getSupportRequest).mockResolvedValue({
      data: request,
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(listSupportArticles).mockResolvedValue({
      data: [article],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r2", correlationId: "c2" },
    });

    render(
      wrap(
        <SupportRequestDetailView
          supportRequestId={request.id}
          permissions={["support.*"]}
        />,
      ),
    );

    await waitFor(() => expect(screen.getByText("Cannot login")).toBeTruthy());
    expect(screen.getByTestId("support-request-detail")).toBeTruthy();
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByTestId("support-internal-note-composer")).toBeTruthy();
    expect(screen.getByTestId("support-customer-reply-composer")).toBeTruthy();
    expect(screen.getByTestId("support-request-commands")).toBeTruthy();
  });

  it("shows forbidden request error without provider leakage", async () => {
    vi.mocked(getSupportRequest).mockRejectedValue(
      SupportApiError.fromHttp({
        status: 403,
        code: "FORBIDDEN",
        message: "zammad forbidden",
      }),
    );

    render(
      wrap(
        <SupportRequestDetailView
          supportRequestId={request.id}
          permissions={["support.*"]}
        />,
      ),
    );

    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
    expect(screen.getByTestId("support-error").textContent).toMatch(/permission/i);
    expect(
      screen.getByTestId("support-error").textContent?.toLowerCase(),
    ).not.toContain("zammad");
  });

  it("hides composers when article create permission is denied", async () => {
    vi.mocked(getSupportRequest).mockResolvedValue({
      data: request,
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(listSupportArticles).mockResolvedValue({
      data: [article],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r2", correlationId: "c2" },
    });

    render(
      wrap(
        <SupportRequestDetailView
          supportRequestId={request.id}
          permissions={["support.requests.list", "support.articles.list"]}
        />,
      ),
    );

    await waitFor(() => expect(screen.getByText("Cannot login")).toBeTruthy());
    expect(screen.queryByTestId("support-internal-note-composer")).toBeNull();
    expect(screen.queryByTestId("support-customer-reply-composer")).toBeNull();
  });

  it("loads history tab events", async () => {
    const user = userEvent.setup();
    vi.mocked(getSupportRequest).mockResolvedValue({
      data: request,
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(listSupportArticles).mockResolvedValue({
      data: [],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r2", correlationId: "c2" },
    });
    vi.mocked(listSupportHistory).mockResolvedValue({
      data: [
        {
          id: "shist_1",
          supportTicketId: request.id,
          action: "updated",
          summary: "Priority changed",
          actor: { kind: "agent", displayName: "Pat" },
          occurredAt: "2026-01-01T02:00:00.000Z",
        },
      ],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r3", correlationId: "c3" },
    });

    render(
      wrap(
        <SupportRequestDetailView
          supportRequestId={request.id}
          permissions={["support.*"]}
        />,
      ),
    );

    await waitFor(() => expect(screen.getByText("Cannot login")).toBeTruthy());
    await user.click(screen.getByTestId("support-tab-history"));
    await waitFor(() => expect(screen.getByText("Priority changed")).toBeTruthy());
    expect(listSupportHistory).toHaveBeenCalled();
  });

  it("shows unavailable history error messaging", async () => {
    const user = userEvent.setup();
    vi.mocked(getSupportRequest).mockResolvedValue({
      data: request,
      meta: { requestId: "r1", correlationId: "c1" },
    });
    vi.mocked(listSupportArticles).mockResolvedValue({
      data: [],
      page: { cursor: null, nextCursor: null, limit: 50, hasMore: false },
      meta: { requestId: "r2", correlationId: "c2" },
    });
    vi.mocked(listSupportHistory).mockRejectedValue(
      SupportApiError.fromHttp({
        status: 503,
        code: "UNAVAILABLE",
        message: "provider down",
      }),
    );

    render(
      wrap(
        <SupportRequestDetailView
          supportRequestId={request.id}
          permissions={["support.*"]}
        />,
      ),
    );

    await waitFor(() => expect(screen.getByText("Cannot login")).toBeTruthy());
    await user.click(screen.getByTestId("support-tab-history"));
    await waitFor(() => expect(screen.getByTestId("support-error")).toBeTruthy());
    expect(screen.getByTestId("support-error").textContent).toMatch(/unavailable/i);
  });
});
