import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import type { SupportArticle } from "@/lib/support/types";

import { SupportConversation } from "./support-conversation";

const base = {
  tenantId: "t1",
  supportTicketId: "sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  bodyFormat: "text/plain" as const,
  author: { senderType: "agent" as const, displayName: "Agent" },
  deliveryStatus: "none" as const,
  attachments: [],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("SupportConversation", () => {
  it("distinguishes internal, public, and system articles with labels", () => {
    const articles: SupportArticle[] = [
      {
        ...base,
        id: "sart_11111111111111111111111111111111",
        body: "Internal only",
        channel: "note",
        visibility: "internal",
        senderType: "agent",
      },
      {
        ...base,
        id: "sart_22222222222222222222222222222222",
        body: "Customer sees this",
        channel: "email",
        visibility: "public",
        senderType: "agent",
        createdAt: "2026-01-01T01:00:00.000Z",
        updatedAt: "2026-01-01T01:00:00.000Z",
      },
      {
        ...base,
        id: "sart_33333333333333333333333333333333",
        body: "System event",
        channel: "unknown",
        visibility: "internal",
        senderType: "system",
        createdAt: "2026-01-01T02:00:00.000Z",
        updatedAt: "2026-01-01T02:00:00.000Z",
        author: { senderType: "system" },
      },
    ];

    render(
      <SupportConversation
        supportRequestId="sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        articles={articles}
      />,
    );
    const items = screen.getAllByTestId("support-conversation-item");
    expect(items).toHaveLength(3);
    expect(screen.getAllByText("Internal note").length).toBeGreaterThan(0);
    expect(screen.getByText("Customer-visible")).toBeTruthy();
    expect(screen.getByText("System")).toBeTruthy();
    expect(screen.getByText("Internal only")).toBeTruthy();
    expect(screen.queryByText(/<script/i)).toBeNull();
  });

  it("sanitizes HTML article bodies to text", () => {
    render(
      <SupportConversation
        supportRequestId="sreq_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        articles={[
          {
            ...base,
            id: "sart_44444444444444444444444444444444",
            body: "<b>Bold</b><script>alert(1)</script>",
            bodyFormat: "text/html",
            channel: "web",
            visibility: "public",
            senderType: "customer",
          },
        ]}
      />,
    );
    expect(screen.getByText("Bold")).toBeTruthy();
    expect(screen.queryByText(/alert/)).toBeNull();
  });
});
