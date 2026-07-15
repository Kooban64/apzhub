import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support/support-api", () => ({
  createCustomerReply: vi.fn(),
}));

import { createCustomerReply } from "@/lib/support/support-api";

import { CustomerReplyComposer } from "./customer-reply-composer";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("CustomerReplyComposer", () => {
  it("shows customer-visible warning and never posts as note", async () => {
    const user = userEvent.setup();
    vi.mocked(createCustomerReply).mockResolvedValue({
      data: {
        id: "sart_eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
        tenantId: "t1",
        supportTicketId: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        body: "reply",
        bodyFormat: "text/plain",
        channel: "email",
        visibility: "public",
        senderType: "agent",
        author: { senderType: "agent" },
        deliveryStatus: "pending",
        attachments: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(
      wrap(
        <CustomerReplyComposer supportRequestId="sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" />,
      ),
    );

    expect(screen.getByTestId("support-customer-reply-warning").textContent).toMatch(
      /customer-visible/i,
    );
    const channel = screen.getByTestId("support-customer-reply-channel") as HTMLSelectElement;
    expect([...channel.options].map((o) => o.value)).not.toContain("note");

    await user.type(screen.getByTestId("support-customer-reply-body"), "Public reply");
    await user.selectOptions(channel, "chat");
    await user.click(screen.getByTestId("support-customer-reply-submit"));

    await waitFor(() => {
      expect(createCustomerReply).toHaveBeenCalledWith(
        "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        { body: "Public reply", channel: "chat" },
      );
    });
  });
});
