import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { createZammadAdapter } from "./zammad-factory";
import {
  buildCustomerReplyPayloadForTest,
  buildInternalNotePayloadForTest,
} from "./services/article-service";
import {
  mapZammadArticle,
  mapZammadArticleChannel,
  mapZammadBodyFormat,
} from "./mappers/article-mapper";
import {
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-zammad-api";
import {
  MOCK_ARTICLE_EMAIL,
  MOCK_ARTICLE_NOTE,
  MOCK_TICKET,
} from "./testing/mock-zammad-core-data";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };
const ticketId = `sreq_zammad_${MOCK_TICKET.id}`;

async function createAdapter(fetchOptions?: Parameters<typeof createMockZammadFetch>[0]) {
  return createZammadAdapter({
    zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "zammad-test-token",
    adapterOptions: { fetchFn: createMockZammadFetch(fetchOptions) },
  });
}

describe("Zammad article capability registration", () => {
  it("promotes articles to implemented core capabilities", async () => {
    const { adapter } = await createAdapter();
    const capabilities = adapter.core.discoverCapabilities();
    expect(capabilities.map((c) => c.serviceId)).toContain("articles");
    expect(capabilities.find((c) => c.serviceId === "articles")?.operations).toEqual(
      expect.arrayContaining(["list", "get", "create", "createNote", "createReply"]),
    );
    expect(adapter.listPlaceholderCapabilities()).not.toContain("articles");
    expect(adapter.core.articles).toBeDefined();
  });

  it("exposes article diagnostics without content", async () => {
    const { adapter } = await createAdapter();
    await adapter.initialise();
    await adapter.connect(ctx);
    const extension = adapter.zammadDiagnosticsExtension;
    expect(extension.articleServiceRegistered).toBe(true);
    expect(extension.attachmentMetadataSupport).toBe(true);
    expect(extension.binaryAttachmentSupport).toBe(false);
    expect(extension.unsupportedArticleMutations).toEqual(["update", "delete"]);
    expect(JSON.stringify(extension)).not.toMatch(/password|customer@example/i);
  });
});

describe("Zammad article listing", () => {
  it("lists articles for a ticket with deterministic ascending order", async () => {
    const { adapter } = await createAdapter();
    const listed = await adapter.core.articles.list(ctx, ticketId);
    expect(listed.items.length).toBeGreaterThan(0);
    const times = listed.items.map((item) => item.createdAt);
    expect(times).toEqual([...times].sort());
    expect(listed.items[0]?.id).toMatch(/^sart_zammad_/);
  });

  it("filters by visibility and channel and paginates", async () => {
    const { adapter } = await createAdapter();
    const internal = await adapter.core.articles.list(ctx, ticketId, {
      visibility: "internal",
    });
    expect(internal.items.every((item) => item.visibility === "internal")).toBe(true);

    const email = await adapter.core.articles.list(ctx, ticketId, { channel: "email" });
    expect(email.items.every((item) => item.channel === "email")).toBe(true);

    const paged = await adapter.core.articles.list(
      ctx,
      ticketId,
      {},
      { page: 1, perPage: 1 },
    );
    expect(paged.items).toHaveLength(1);
    expect(paged.hasNextPage).toBe(true);
  });

  it("returns empty list for ticket without articles", async () => {
    const { adapter } = await createAdapter({
      seedArticles: [],
    });
    const listed = await adapter.core.articles.list(ctx, "sreq_zammad_101");
    expect(listed.items).toHaveLength(0);
  });

  it("translates ticket not found and permission denied", async () => {
    const missing = await createAdapter();
    await expect(
      missing.adapter.core.articles.list(ctx, "sreq_zammad_99999"),
    ).rejects.toMatchObject({ category: "not_found" });

    const denied = await createAdapter({ articlesStatus: 403 });
    await expect(denied.adapter.core.articles.list(ctx, ticketId)).rejects.toMatchObject({
      category: "authorization",
    });
  });
});

describe("Zammad article retrieval", () => {
  it("gets an article and maps attachments without binary data", async () => {
    const { adapter } = await createAdapter();
    const article = await adapter.core.articles.get(
      ctx,
      ticketId,
      `sart_zammad_${MOCK_ARTICLE_EMAIL.id}`,
    );
    expect(article.body).toContain("password");
    expect(article.visibility).toBe("public");
    expect(article.channel).toBe("email");
    expect(article.attachments).toHaveLength(1);
    expect(article.attachments[0]?.filename).toBe("screenshot.png");
    expect(article.attachments[0]?.contentType).toBe("image/png");
    expect(JSON.stringify(article)).not.toContain("BINARY_SHOULD_NOT_LEAK");
  });

  it("rejects article not found, wrong ticket, and malformed responses", async () => {
    const { adapter } = await createAdapter();
    await expect(
      adapter.core.articles.get(ctx, ticketId, "sart_zammad_99999"),
    ).rejects.toMatchObject({ category: "not_found" });

    await expect(
      adapter.core.articles.get(ctx, "sreq_zammad_101", `sart_zammad_${MOCK_ARTICLE_NOTE.id}`),
    ).rejects.toMatchObject({ category: "not_found" });

    const malformed = await createAdapter({ malformedArticle: true });
    await expect(
      malformed.adapter.core.articles.get(ctx, ticketId, `sart_zammad_${MOCK_ARTICLE_NOTE.id}`),
    ).rejects.toBeTruthy();
  });

  it("maps unknown channel and missing author safely", () => {
    expect(mapZammadArticleChannel("twitter status")).toBe("unknown");
    expect(mapZammadBodyFormat("application/json")).toBe("unknown");
    const mapped = mapZammadArticle(
      {
        id: 9,
        ticket_id: 100,
        type: "weird-channel",
        body: "hello",
        created_at: "2026-07-11T00:00:00.000Z",
      },
      { tenantId: TEST_TENANT_ID },
    );
    expect(mapped.channel).toBe("unknown");
    expect(mapped.author.senderType).toBe("unknown");
    expect(mapped.author.userId).toBeUndefined();
  });
});

describe("Zammad internal notes", () => {
  it("creates an internal note and keeps visibility internal in request and result", async () => {
    const payload = buildInternalNotePayloadForTest({
      supportTicketId: ticketId,
      body: "Private note",
      bodyFormat: "text/plain",
    });
    expect(payload.internal).toBe(true);
    expect(payload.type).toBe("note");

    const { adapter } = await createAdapter();
    const created = await adapter.core.articles.createNote(ctx, {
      supportTicketId: ticketId,
      body: "Private note",
      bodyFormat: "text/plain",
      subject: "Ops",
    });
    expect(created.visibility).toBe("internal");
    expect(created.channel).toBe("note");
    expect(created.body).toBe("Private note");
  });

  it("supports HTML body and rejects empty body", async () => {
    const { adapter } = await createAdapter();
    const html = await adapter.core.articles.createNote(ctx, {
      supportTicketId: ticketId,
      body: "<b>secret</b>",
      bodyFormat: "text/html",
    });
    expect(html.bodyFormat).toBe("text/html");

    await expect(
      adapter.core.articles.createNote(ctx, {
        supportTicketId: ticketId,
        body: "",
      }),
    ).rejects.toThrow(/body is required/i);
  });
});

describe("Zammad customer replies", () => {
  it("creates a customer-visible reply with recipients and delivery status", async () => {
    const payload = buildCustomerReplyPayloadForTest({
      supportTicketId: ticketId,
      body: "We reset your password.",
      channel: "email",
      to: ["customer@example.com"],
      cc: ["ops@example.com"],
      subject: "Re: password",
    });
    expect(payload.internal).toBe(false);
    expect(payload.to).toBe("customer@example.com");

    const { adapter } = await createAdapter();
    const created = await adapter.core.articles.createReply(ctx, {
      supportTicketId: ticketId,
      body: "We reset your password.",
      channel: "email",
      to: ["customer@example.com"],
      cc: ["ops@example.com"],
      subject: "Re: password",
    });
    expect(created.visibility).toBe("public");
    expect(created.recipients?.to).toContain("customer@example.com");
    expect(created.deliveryStatus === "pending" || created.deliveryStatus === "unknown").toBe(
      true,
    );
  });

  it("rejects note channel for customer replies and permission failures", async () => {
    const { adapter } = await createAdapter();
    await expect(
      adapter.core.articles.createReply(ctx, {
        supportTicketId: ticketId,
        body: "hi",
        channel: "note" as unknown as "email",
      }),
    ).rejects.toMatchObject({ category: "validation" });

    const denied = await createAdapter({ articlesStatus: 403 });
    await expect(
      denied.adapter.core.articles.createReply(ctx, {
        supportTicketId: ticketId,
        body: "hi",
        channel: "email",
      }),
    ).rejects.toMatchObject({ category: "authorization" });
  });
});

describe("Zammad article attachment metadata", () => {
  it("maps zero, one, and multiple attachments without binary fields", () => {
    const none = mapZammadArticle(
      { ...MOCK_ARTICLE_NOTE, attachments: [] },
      { tenantId: TEST_TENANT_ID },
    );
    expect(none.attachments).toHaveLength(0);

    const one = mapZammadArticle(MOCK_ARTICLE_EMAIL, { tenantId: TEST_TENANT_ID });
    expect(one.attachments).toHaveLength(1);
    expect(one.attachments[0]?.contentId).toBe("cid:shot1");
    expect(one.attachments[0]?.sizeBytes).toBe(2048);

    const multi = mapZammadArticle(
      {
        ...MOCK_ARTICLE_EMAIL,
        attachments: [
          { id: 1, filename: "a.txt", size: 1 },
          { id: 2, filename: "b.txt", size: -5, preferences: {} },
          { id: 3, filename: "", size: 3 },
        ],
      },
      { tenantId: TEST_TENANT_ID },
    );
    expect(multi.attachments).toHaveLength(3);
    expect(multi.attachments[1]?.sizeBytes).toBeUndefined();
    expect(multi.attachments[2]?.filename).toBe("attachment-3");
    expect(JSON.stringify(multi.attachments)).not.toMatch(/"data"/);
    expect(multi.attachments.every((a) => !("data" in a))).toBe(true);
  });
});

describe("Zammad article create helpers", () => {
  it("routes create() to note or reply based on visibility and channel", async () => {
    const { adapter } = await createAdapter();
    const note = await adapter.core.articles.create(ctx, {
      supportTicketId: ticketId,
      body: "via create",
      visibility: "internal",
    });
    expect(note.visibility).toBe("internal");

    const reply = await adapter.core.articles.create(ctx, {
      supportTicketId: ticketId,
      body: "public via create",
      visibility: "public",
      channel: "web",
    });
    expect(reply.visibility).toBe("public");
    expect(reply.channel).toBe("web");
  });

  it("rejects unsupported create channel and provider unavailable", async () => {
    const { adapter } = await createAdapter();
    await expect(
      adapter.core.articles.create(ctx, {
        supportTicketId: ticketId,
        body: "x",
        visibility: "public",
        channel: "unknown",
      }),
    ).rejects.toMatchObject({ category: "validation" });

    const down = await createAdapter({ failArticles: true });
    await expect(
      down.adapter.core.articles.createNote(ctx, {
        supportTicketId: ticketId,
        body: "x",
      }),
    ).rejects.toMatchObject({ category: "vendor_unavailable" });
  });

  it("filters by author and created date bounds", async () => {
    const { adapter } = await createAdapter();
    const byAuthor = await adapter.core.articles.list(ctx, ticketId, {
      authorId: "suser_zammad_3",
    });
    expect(byAuthor.items.every((a) => a.author.userId === "suser_zammad_3")).toBe(true);

    const bounded = await adapter.core.articles.list(ctx, ticketId, {
      createdAfter: "2026-06-01T09:20:00.000Z",
      createdBefore: "2026-06-01T10:00:00.000Z",
    });
    expect(bounded.items.length).toBeGreaterThan(0);
    expect(
      bounded.items.every(
        (a) =>
          a.createdAt >= "2026-06-01T09:20:00.000Z" &&
          a.createdAt <= "2026-06-01T10:00:00.000Z",
      ),
    ).toBe(true);
  });

  it("creates note with attachment metadata descriptors", async () => {
    const { adapter } = await createAdapter();
    const created = await adapter.core.articles.createNote(ctx, {
      supportTicketId: ticketId,
      body: "note with meta",
      attachments: [{ filename: "log.txt", contentType: "text/plain", dataBase64: "aGVsbG8=" }],
    });
    expect(created.attachments.length).toBeGreaterThanOrEqual(1);
    expect(created.attachments[0]?.filename).toBe("log.txt");
  });

  it("routes public create with note channel to internal note path", async () => {
    const { adapter } = await createAdapter();
    const created = await adapter.core.articles.create(ctx, {
      supportTicketId: ticketId,
      body: "forced note channel",
      visibility: "public",
      channel: "note",
    });
    expect(created.channel).toBe("note");
    expect(created.visibility).toBe("internal");
  });

  it("detects provider visibility corruption after create", async () => {
    const corruptNote = await createAdapter({ forceCreatedArticleInternal: false });
    await expect(
      corruptNote.adapter.core.articles.createNote(ctx, {
        supportTicketId: ticketId,
        body: "should stay internal",
      }),
    ).rejects.toMatchObject({ category: "mapping" });

    const corruptReply = await createAdapter({ forceCreatedArticleInternal: true });
    await expect(
      corruptReply.adapter.core.articles.createReply(ctx, {
        supportTicketId: ticketId,
        body: "should stay public",
        channel: "email",
      }),
    ).rejects.toMatchObject({ category: "mapping" });
  });

  it("supports descending sort and senderType filter", async () => {
    const { adapter } = await createAdapter();
    const desc = await adapter.core.articles.list(
      ctx,
      ticketId,
      {},
      {},
      [{ field: "createdAt", direction: "desc" }],
    );
    const times = desc.items.map((item) => item.createdAt);
    expect(times).toEqual([...times].sort().reverse());

    const agents = await adapter.core.articles.list(ctx, ticketId, {
      senderType: "agent",
    });
    expect(agents.items.every((item) => item.senderType === "agent")).toBe(true);
  });
});

describe("Zammad article mapper edge cases", () => {
  it("maps delivery failure, email without prefs, and recipient splits", () => {
    const failed = mapZammadArticle(
      {
        id: 11,
        ticket_id: 100,
        type: "email",
        sender: "Agent",
        from: "a@example.com; b@example.com",
        to: "c@example.com, d@example.com",
        cc: "",
        body: "x",
        content_type: "text",
        created_at: "2026-07-11T00:00:00.000Z",
        preferences: { delivery_status: "failed" },
      },
      { tenantId: TEST_TENANT_ID },
    );
    expect(failed.deliveryStatus).toBe("failed");
    expect(failed.recipients?.to).toEqual(["c@example.com", "d@example.com"]);
    expect(failed.bodyFormat).toBe("text/plain");

    const pending = mapZammadArticle(
      {
        id: 12,
        ticket_id: 100,
        type: "email",
        created_at: "2026-07-11T00:00:00.000Z",
        body: "y",
        preferences: { delivery_status: "queued" },
      },
      { tenantId: TEST_TENANT_ID },
    );
    expect(pending.deliveryStatus).toBe("pending");
  });

  it("throws on missing required article fields", () => {
    expect(() =>
      mapZammadArticle(
        { id: 1, ticket_id: 1, created_at: "" } as never,
        { tenantId: TEST_TENANT_ID },
      ),
    ).toThrow(/created_at/i);
  });
});

  describe("Zammad article architecture boundaries", () => {
  it("forbids platform-services, gateway, mapping-store, plane comment reuse, and public API types", () => {
    const root = join(process.cwd(), "integrations/zammad/src");
    const files: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) files.push(full);
      }
    };
    walk(root);

    const joined = files.map((file) => readFileSync(file, "utf8")).join("\n");
    expect(joined).not.toMatch(/@apzhub\/platform-services/);
    expect(joined).not.toMatch(/PlatformServiceGateway/);
    expect(joined).not.toMatch(/EntityMappingStore/);
    expect(joined).not.toMatch(/from ["']@apzhub\/integration-plane/);
    expect(joined).not.toMatch(/PlaneCommentService|mapPlaneComment/);

    const index = readFileSync(join(root, "index.ts"), "utf8");
    expect(index).not.toMatch(/ZammadArticleRecord/);
    expect(index).not.toMatch(/zammad-api-types/);

    const fetchClient = readFileSync(join(root, "internal/zammad-fetch-client.ts"), "utf8");
    expect(fetchClient).toMatch(/@apzhub\/integration-sdk\/client/);
    const services = files
      .filter((file) => file.includes("/services/"))
      .map((file) => readFileSync(file, "utf8"))
      .join("\n");
    expect(services).not.toMatch(/\bfetch\s*\(/);
  });
});
