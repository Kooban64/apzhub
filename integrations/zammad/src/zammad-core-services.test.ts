import { describe, expect, it } from "vitest";

import { createZammadAdapter } from "./zammad-factory";
import { discoverZammadCoreServiceCapabilities } from "./capabilities/service-capabilities";
import {
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-zammad-api";
import { MOCK_TICKET } from "./testing/mock-zammad-core-data";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

async function createAdapter(
  fetchOptions?: Parameters<typeof createMockZammadFetch>[0],
) {
  return createZammadAdapter({
    zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "zammad-test-token",
    adapterOptions: { fetchFn: createMockZammadFetch(fetchOptions) },
  });
}

describe("Zammad core service capabilities", () => {
  it("discovers support, organizations, groups, users, articles, search, history, analytics", () => {
    const capabilities = discoverZammadCoreServiceCapabilities();
    expect(capabilities.map((entry) => entry.serviceId)).toEqual([
      "support",
      "organizations",
      "groups",
      "users",
      "articles",
      "search",
      "history",
      "analytics",
      "webhooks",
      "events",
      "synchronisation",
    ]);
    expect(capabilities.every((entry) => entry.implemented)).toBe(true);
    expect(
      capabilities.find((entry) => entry.serviceId === "support")?.operations,
    ).toEqual(
      expect.arrayContaining([
        "list",
        "get",
        "create",
        "update",
        "close",
        "reopen",
        "changeState",
        "changePriority",
        "assignOwner",
        "removeOwner",
        "assignCustomer",
        "searchByTicketNumber",
        "searchByTitle",
      ]),
    );
  });

  it("exposes core services on adapter.core", async () => {
    const { adapter } = await createAdapter();
    expect(adapter.core.discoverCapabilities().length).toBe(11);
    expect(adapter.core.support).toBeDefined();
    expect(adapter.core.organizations).toBeDefined();
    expect(adapter.core.groups).toBeDefined();
    expect(adapter.core.users).toBeDefined();
    expect(adapter.core.articles).toBeDefined();
    expect(adapter.core.search).toBeDefined();
    expect(adapter.core.history).toBeDefined();
    expect(adapter.core.analytics).toBeDefined();
    expect(adapter.core.webhooks).toBeDefined();
    expect(adapter.core.events).toBeDefined();
    expect(adapter.core.synchronisation).toBeDefined();
  });
});

describe("Zammad support service lifecycle", () => {
  it("lists, gets, creates, updates, closes, and reopens support requests", async () => {
    const { adapter } = await createAdapter();

    const listed = await adapter.core.support.list(ctx);
    expect(listed.items.length).toBeGreaterThan(0);
    expect(listed.items[0]?.id).toMatch(/^sreq_zammad_/);

    const fetched = await adapter.core.support.get(
      ctx,
      `sreq_zammad_${MOCK_TICKET.id}`,
    );
    expect(fetched.title).toBe("Cannot reset password");
    expect(fetched.status).toBe("open");
    expect(fetched.priority).toBe("normal");
    expect(fetched.displayId).toBe("10001");

    const created = await adapter.core.support.create(ctx, {
      title: "New support request",
      groupId: "sgrp_zammad_1",
      requesterId: "suser_zammad_5",
      priority: "high",
    });
    expect(created.title).toBe("New support request");
    expect(created.priority).toBe("high");
    expect(created.id).toMatch(/^sreq_zammad_/);

    const updated = await adapter.core.support.update(ctx, created.id, {
      title: "Updated support request",
    });
    expect(updated.title).toBe("Updated support request");

    const closed = await adapter.core.support.close(ctx, created.id);
    expect(closed.status).toBe("closed");

    const reopened = await adapter.core.support.reopen(ctx, created.id);
    expect(reopened.status).toBe("open");
  });

  it("changes state and priority, assigns and removes owner, assigns customer", async () => {
    const { adapter } = await createAdapter();
    const id = `sreq_zammad_${MOCK_TICKET.id}`;

    const pending = await adapter.core.support.changeState(ctx, id, {
      status: "pending",
    });
    expect(pending.status).toBe("pending");

    const urgent = await adapter.core.support.changePriority(ctx, id, {
      priority: "urgent",
    });
    expect(urgent.priority).toBe("urgent");

    const assigned = await adapter.core.support.assignOwner(ctx, id, {
      assigneeId: "suser_zammad_3",
    });
    expect(assigned.assigneeId).toBe("suser_zammad_3");

    const unassigned = await adapter.core.support.removeOwner(ctx, id);
    expect(unassigned.assigneeId).toBeUndefined();

    const customer = await adapter.core.support.assignCustomer(ctx, id, {
      requesterId: "suser_zammad_5",
    });
    expect(customer.requesterId).toBe("suser_zammad_5");
  });

  it("searches by ticket number and title with pagination, filtering, and sorting", async () => {
    const { adapter } = await createAdapter();

    const byNumber = await adapter.core.support.searchByTicketNumber(ctx, "10001");
    expect(byNumber.items.some((item) => item.displayId === "10001")).toBe(true);

    const byTitle = await adapter.core.support.searchByTitle(ctx, "password");
    expect(byTitle.items.some((item) => item.title.includes("password"))).toBe(true);

    const paged = await adapter.core.support.list(ctx, {}, { page: 1, perPage: 1 });
    expect(paged.items).toHaveLength(1);
    expect(paged.perPage).toBe(1);
    expect(paged.hasNextPage).toBe(true);

    const filtered = await adapter.core.support.list(ctx, { status: "closed" });
    expect(filtered.items.every((item) => item.status === "closed")).toBe(true);

    const sorted = await adapter.core.support.list(ctx, {}, {}, [
      { field: "title", direction: "asc" },
    ]);
    const titles = sorted.items.map((item) => item.title);
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });

  it("validates create input", async () => {
    const { adapter } = await createAdapter();
    await expect(
      adapter.core.support.create(ctx, {
        title: "",
        groupId: "sgrp_zammad_1",
        requesterId: "suser_zammad_5",
      }),
    ).rejects.toThrow(/title is required/i);
  });

  it("translates provider and authentication failures through the operation runner", async () => {
    const providerFail = await createAdapter({ failTickets: true });
    await expect(providerFail.adapter.core.support.list(ctx)).rejects.toMatchObject({
      category: "vendor_unavailable",
    });

    const unauthorized = await createZammadAdapter({
      zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiToken: "zammad-test-token",
      adapterOptions: {
        fetchFn: createMockZammadFetch({ ticketsStatus: 401 }),
      },
    });
    await expect(unauthorized.adapter.core.support.list(ctx)).rejects.toMatchObject({
      category: "authentication",
    });
  });

  it("returns not_found for missing tickets", async () => {
    const { adapter } = await createAdapter();
    await expect(
      adapter.core.support.get(ctx, "sreq_zammad_99999"),
    ).rejects.toMatchObject({
      category: "not_found",
    });
  });
});

describe("Zammad organization service lifecycle", () => {
  it("lists, gets, creates, updates, and archives organizations", async () => {
    const { adapter } = await createAdapter();

    const listed = await adapter.core.organizations.list(ctx);
    expect(listed.items[0]?.name).toBe("Acme Corp");
    expect(listed.items[0]?.id).toMatch(/^sorg_zammad_/);

    const fetched = await adapter.core.organizations.get(ctx, "sorg_zammad_10");
    expect(fetched.domain).toBe("acme.example");

    const created = await adapter.core.organizations.create(ctx, {
      name: "Beta Ltd",
      domain: "beta.example",
    });
    expect(created.name).toBe("Beta Ltd");

    const updated = await adapter.core.organizations.update(ctx, created.id, {
      note: "Updated note",
    });
    expect(updated.note).toBe("Updated note");

    const archived = await adapter.core.organizations.archive(ctx, created.id);
    expect(archived.active).toBe(false);
  });

  it("validates organization create input", async () => {
    const { adapter } = await createAdapter();
    await expect(adapter.core.organizations.create(ctx, { name: "" })).rejects.toThrow(
      /name is required/i,
    );
  });
});

describe("Zammad group service lifecycle", () => {
  it("lists, gets, creates, and updates groups", async () => {
    const { adapter } = await createAdapter();

    const listed = await adapter.core.groups.list(ctx);
    expect(listed.items[0]?.name).toBe("Users");
    expect(listed.items[0]?.id).toMatch(/^sgrp_zammad_/);

    const fetched = await adapter.core.groups.get(ctx, "sgrp_zammad_1");
    expect(fetched.active).toBe(true);

    const created = await adapter.core.groups.create(ctx, { name: "Sales" });
    expect(created.name).toBe("Sales");

    const updated = await adapter.core.groups.update(ctx, created.id, {
      note: "Sales queue",
    });
    expect(updated.note).toBe("Sales queue");
  });
});

describe("Zammad user service lookup", () => {
  it("lists, gets, looks up, and searches support-domain users", async () => {
    const { adapter } = await createAdapter();

    const listed = await adapter.core.users.list(ctx);
    expect(listed.items.length).toBeGreaterThan(0);
    expect(listed.items[0]?.id).toMatch(/^suser_zammad_/);

    const agent = await adapter.core.users.get(ctx, "suser_zammad_3");
    expect(agent.role).toBe("agent");
    expect(agent.email).toBe("agent@example.com");

    const lookedUp = await adapter.core.users.lookup(ctx, {
      email: "customer@example.com",
    });
    expect(lookedUp?.role).toBe("customer");
    expect(lookedUp?.id).toBe("suser_zammad_5");

    const searched = await adapter.core.users.search(ctx, "agent");
    expect(searched.items.some((user) => user.email === "agent@example.com")).toBe(
      true,
    );
  });

  it("filters users by role", async () => {
    const { adapter } = await createAdapter();
    const agents = await adapter.core.users.list(ctx, { role: "agent" });
    expect(agents.items.every((user) => user.role === "agent")).toBe(true);
  });
});

describe("Zammad operation runner and capability registration", () => {
  it("executes operations through the runner without throwing on success", async () => {
    const { adapter } = await createAdapter();
    const listed = await adapter.core.support.list(ctx);
    expect(listed.totalCount).toBeGreaterThan(0);
  });

  it("registers core services including sync, events, and webhooks", async () => {
    const { adapter } = await createAdapter();
    const ids = adapter.core.discoverCapabilities().map((c) => c.serviceId);
    expect(ids).toEqual([
      "support",
      "organizations",
      "groups",
      "users",
      "articles",
      "search",
      "history",
      "analytics",
      "webhooks",
      "events",
      "synchronisation",
    ]);
    expect(ids).not.toContain("attachments");
  });
});
