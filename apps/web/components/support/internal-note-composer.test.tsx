import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/support/support-api", () => ({
  createInternalNote: vi.fn(),
}));

import { createInternalNote } from "@/lib/support/support-api";

import { InternalNoteComposer } from "./internal-note-composer";

function wrap(children: ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("InternalNoteComposer", () => {
  it("requires body and keeps visibility internal", async () => {
    const user = userEvent.setup();
    vi.mocked(createInternalNote).mockResolvedValue({
      data: {
        id: "sart_dddddddddddddddddddddddddddddddd",
        tenantId: "t1",
        supportTicketId: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        body: "note",
        bodyFormat: "text/plain",
        channel: "note",
        visibility: "internal",
        senderType: "agent",
        author: { senderType: "agent" },
        deliveryStatus: "none",
        attachments: [],
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
      meta: { requestId: "r1", correlationId: "c1" },
    });

    render(
      wrap(
        <InternalNoteComposer supportRequestId="sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" />,
      ),
    );

    expect(screen.getByDisplayValue("internal")).toBeTruthy();
    const submit = screen.getByTestId("support-internal-note-submit");
    expect(submit).toHaveProperty("disabled", true);

    await user.type(screen.getByTestId("support-internal-note-body"), "Private note");
    await user.click(submit);

    await waitFor(() => {
      expect(createInternalNote).toHaveBeenCalledWith(
        "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        { body: "Private note" },
      );
    });
  });
});
