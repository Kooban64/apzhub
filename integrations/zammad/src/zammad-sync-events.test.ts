/**
 * OSS-102-06 — Zammad synchronisation, events & webhooks tests.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { createZammadAdapter } from "./zammad-factory";
import { discoverZammadCoreServiceCapabilities } from "./capabilities/service-capabilities";
import { translateZammadWebhookPayload } from "./events/event-translator";
import { createZammadVendorErrorMapper } from "./zammad-error-mapper";
import { ZAMMAD_ADAPTER_VERSION } from "./zammad-adapter";
import {
  createMockZammadFetch,
  DEFAULT_TEST_ZAMMAD_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-zammad-api";
import { MOCK_TICKET, MOCK_WEBHOOK } from "./testing/mock-zammad-core-data";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

async function createAdapter(fetchOptions?: Parameters<typeof createMockZammadFetch>[0]) {
  return createZammadAdapter({
    zammad: DEFAULT_TEST_ZAMMAD_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "zammad-test-token",
    adapterOptions: { fetchFn: createMockZammadFetch(fetchOptions) },
  });
}

describe("OSS-102-06 capability registration", () => {
  it("promotes events, webhooks, and synchronisation", () => {
    const capabilities = discoverZammadCoreServiceCapabilities();
    expect(capabilities.map((entry) => entry.serviceId)).toEqual(
      expect.arrayContaining(["webhooks", "events", "synchronisation"]),
    );
    expect(capabilities).toHaveLength(11);
    expect(ZAMMAD_ADAPTER_VERSION).toBe("0.6.0");
  });

  it("exposes sync/events/webhooks on adapter.core and diagnostics", async () => {
    const { adapter } = await createAdapter();
    expect(adapter.core.webhooks).toBeDefined();
    expect(adapter.core.events).toBeDefined();
    expect(adapter.core.synchronisation).toBeDefined();
    expect(adapter.listPlaceholderCapabilities()).toEqual(["attachments"]);

    await adapter.initialise();
    await adapter.connect(ctx);
    const extension = adapter.zammadDiagnosticsExtension;
    expect(extension.syncEventsCapability.webhooksRegistered).toBe(true);
    expect(extension.syncEventsCapability.eventsRegistered).toBe(true);
    expect(extension.syncEventsCapability.synchronisationRegistered).toBe(true);
    expect(extension.syncEventsCapability.supportedWebhookOperations).toContain("create");
    expect(extension.syncEventsCapability.supportedEventTypes).toContain("ticket");
    expect(extension.syncEventsCapability.syncReadiness).toBe(true);
    expect(extension.syncEventsCapability.webhookReadiness).toBe(true);
    expect(JSON.stringify(extension)).not.toMatch(/secret-token|zammad-test-token/i);
  });
});

describe("ZammadWebhookService", () => {
  it("lists, creates, updates, validates, and deletes webhooks", async () => {
    const { adapter } = await createAdapter();

    const listed = await adapter.core.webhooks.list(ctx);
    expect(listed[0]?.id).toBe(`webhook_zammad_${MOCK_WEBHOOK.id}`);
    expect(listed[0]?.secretPresent).toBe(true);
    expect(listed[0]?.eventTypes).toContain("ticket");

    const validation = adapter.core.webhooks.validateConfiguration({
      url: "https://hooks.example.com/apzhub",
      eventTypes: ["ticket", "article"],
    });
    expect(validation.ok).toBe(true);

    const invalid = adapter.core.webhooks.validateConfiguration({
      url: "not-a-url",
      eventTypes: ["unknown_event"],
    });
    expect(invalid.ok).toBe(false);
    expect(invalid.issues.length).toBeGreaterThan(0);

    const created = await adapter.core.webhooks.create(ctx, {
      url: "https://hooks.example.com/apzhub",
      eventTypes: ["ticket", "article", "organization"],
      isActive: true,
    });
    expect(created.url).toBe("https://hooks.example.com/apzhub");
    expect(created.eventTypes).toEqual(
      expect.arrayContaining(["ticket", "article", "organization"]),
    );

    const updated = await adapter.core.webhooks.update(ctx, created.id, {
      isActive: false,
      eventTypes: ["group"],
    });
    expect(updated.isActive).toBe(false);
    expect(updated.eventTypes).toContain("group");

    await adapter.core.webhooks.delete(ctx, updated.id);
    const afterDelete = await adapter.core.webhooks.list(ctx);
    expect(afterDelete.find((item) => item.id === updated.id)).toBeUndefined();
  });

  it("maps webhook provider failures and rate limiting", async () => {
    const rateLimited = await createAdapter({ rateLimitWebhooks: true });
    await expect(rateLimited.adapter.core.webhooks.list(ctx)).rejects.toMatchObject({
      category: "rate_limited",
    });

    const failed = await createAdapter({ failWebhooks: true });
    await expect(failed.adapter.core.webhooks.list(ctx)).rejects.toMatchObject({
      category: expect.any(String),
    });
  });
});

describe("ZammadEventService", () => {
  it("translates ticket create/update/close/assignment/priority events", () => {
    const created = translateZammadWebhookPayload({
      event: "ticket",
      action: "create",
      ticket: { id: MOCK_TICKET.id, title: "Cannot reset password" },
    });
    expect(created.ok).toBe(true);
    expect(created.ignored).toBe(false);
    expect(created.event?.type).toBe("support_request.created");
    expect(created.event?.resource).toBe("support_request");
    expect(created.event?.supportTicketId).toMatch(/^sreq_zammad_/);

    const closed = translateZammadWebhookPayload({
      event: "ticket",
      action: "close",
      ticket: { id: 100 },
    });
    expect(closed.event?.type).toBe("support_request.closed");

    const assigned = translateZammadWebhookPayload({
      event: "ticket",
      action: "assignment",
      ticket: { id: 100 },
    });
    expect(assigned.event?.type).toBe("support_request.assigned");

    const priority = translateZammadWebhookPayload({
      ticket: { id: 100, updated_at: "2026-07-11T10:00:00.000Z" },
      changes: { priority: ["2 normal", "3 high"] },
    });
    expect(priority.event?.type).toBe("support_request.priority_changed");
  });

  it("translates article and attachment metadata events", () => {
    const article = translateZammadWebhookPayload({
      event: "article",
      action: "create",
      ticket: { id: 100 },
      article: { id: 1001 },
    });
    expect(article.event?.type).toBe("article.created");
    expect(article.event?.supportTicketId).toMatch(/^sreq_zammad_/);

    const attachment = translateZammadWebhookPayload({
      event: "attachment",
      action: "create",
      ticket: { id: 100 },
      article: { id: 1001 },
    });
    expect(attachment.event?.type).toBe("attachment.metadata_recorded");
  });

  it("translates organization, group, user, and state events", () => {
    expect(
      translateZammadWebhookPayload({
        event: "organization",
        action: "create",
        organization: { id: 10 },
      }).event?.type,
    ).toBe("organization.created");

    expect(
      translateZammadWebhookPayload({
        event: "group",
        action: "update",
        group: { id: 1 },
      }).event?.type,
    ).toBe("group.updated");

    expect(
      translateZammadWebhookPayload({
        event: "user",
        action: "create",
        user: { id: 3 },
      }).event?.type,
    ).toBe("support_user.created");

    expect(
      translateZammadWebhookPayload({
        event: "state",
        action: "update",
        ticket: { id: 100 },
      }).event?.type,
    ).toBe("support_request.state_changed");

    expect(
      translateZammadWebhookPayload({
        event: "ticket",
        action: "reopen",
        ticket: { id: 100 },
      }).event?.type,
    ).toBe("support_request.reopened");

    const unmapped = translateZammadWebhookPayload({
      event: "ticket",
      action: "weird-custom",
      ticket: { id: 100 },
    });
    expect(unmapped.ignored).toBe(true);
    expect(unmapped.reason).toBe("unmapped_action");
  });

  it("safely ignores unknown events and records diagnostics", async () => {
    const unknown = translateZammadWebhookPayload({
      event: "macro",
      action: "execute",
    });
    expect(unknown.ok).toBe(true);
    expect(unknown.ignored).toBe(true);
    expect(unknown.reason).toBe("unsupported_vendor_event");

    const { adapter } = await createAdapter();
    const ignored = adapter.core.events.translate(ctx, {
      event: "macro",
      action: "execute",
    });
    expect(ignored.ignored).toBe(true);
    expect(adapter.core.events.getDiagnostics().eventsIgnored).toBeGreaterThan(0);

    const invalid = adapter.core.events.translate(ctx, "not-an-object");
    expect(invalid.ignored).toBe(true);
    expect(adapter.core.events.getDiagnostics().translationFailures).toBeGreaterThan(0);
  });
});

describe("ZammadSyncService", () => {
  it("runs full and incremental sync with status and statistics", async () => {
    const { adapter } = await createAdapter();

    const full = await adapter.core.synchronisation.runFullSync(ctx);
    expect(full.status.status).toBe("succeeded");
    expect(full.recordsProcessed).toBeGreaterThan(0);
    expect(full.resources.support_requests).toBeGreaterThan(0);
    expect(full.durationMs).toBeGreaterThanOrEqual(0);

    const state = adapter.core.synchronisation.getSyncState();
    expect(state.lastSuccessfulSyncAt).toBeDefined();
    expect(state.recordsProcessed).toBe(full.recordsProcessed);

    const incremental = await adapter.core.synchronisation.runIncrementalSync(ctx, {
      since: "2026-01-01T00:00:00.000Z",
    });
    expect(incremental.status.status).toBe("succeeded");
    expect(adapter.core.synchronisation.getDiagnostics().supportsIncremental).toBe(true);
  });

  it("supports safe restart and resume tokens after failure", async () => {
    const { adapter } = await createAdapter({ syncInterruptAfterCalls: 0 });
    await expect(adapter.core.synchronisation.runFullSync(ctx)).rejects.toBeTruthy();
    const failed = adapter.core.synchronisation.getSyncState();
    expect(failed.status).toBe("failed");
    expect(failed.lastFailedSyncAt).toBeDefined();
    expect(failed.cursor.resumeToken).toBeDefined();
    expect(adapter.core.synchronisation.getDiagnostics().retryCounts).toBeGreaterThan(0);

    (adapter.core.synchronisation as unknown as { status: { status: string } }).status = {
      ...(adapter.core.synchronisation.getSyncState() as object),
      status: "running",
    } as never;
    const restarted = adapter.core.synchronisation.safeRestart();
    expect(restarted.status).toBe("idle");
    expect(restarted.errors).toContain("safe_restart_cleared_running_state");
  });

  it("resumes with an explicit resume token on a healthy provider", async () => {
    const failing = await createAdapter({ failSync: true });
    await expect(failing.adapter.core.synchronisation.runFullSync(ctx)).rejects.toBeTruthy();
    const token = failing.adapter.core.synchronisation.getSyncState().cursor.resumeToken;
    expect(token).toBeTruthy();

    const healthy = await createAdapter();
    const resumed = await healthy.adapter.core.synchronisation.runFullSync(ctx, {
      resumeToken: token,
    });
    expect(resumed.status.status).toBe("succeeded");
  });
});

describe("OSS-102-06 error translation", () => {
  it("maps sync/webhook/rate-limit vendor codes", () => {
    const mapper = createZammadVendorErrorMapper();
    expect(
      mapper.map({
        vendorCode: "WEBHOOK_NOT_FOUND",
        context: {
          correlationId: TEST_CORRELATION_ID,
          integrationId: "zammad",
          adapterId: "zammad-adapter",
          operation: "zammad.webhooks.get",
          tenantId: TEST_TENANT_ID,
        },
      })?.error.category,
    ).toBe("not_found");

    expect(
      mapper.map({
        vendorCode: "SYNC_FAILED",
        context: {
          correlationId: TEST_CORRELATION_ID,
          integrationId: "zammad",
          adapterId: "zammad-adapter",
          operation: "zammad.sync.full",
          tenantId: TEST_TENANT_ID,
        },
      })?.error.category,
    ).toBe("vendor_unavailable");

    expect(
      mapper.map({
        vendorCode: "RATE_LIMITED",
        statusCode: 429,
        context: {
          correlationId: TEST_CORRELATION_ID,
          integrationId: "zammad",
          adapterId: "zammad-adapter",
          operation: "zammad.webhooks.list",
          tenantId: TEST_TENANT_ID,
        },
      })?.error.category,
    ).toBe("rate_limited");
  });
});

describe("OSS-102-06 architecture boundaries", () => {
  it("does not introduce PlatformService, HTTP ingress, Event Bus, workers, or persistence", () => {
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
    expect(joined).not.toMatch(/\bregisterWebhookIngress\b|\bcreateServer\b/);
    expect(joined).not.toMatch(/from ["']@apzhub\/platform-event/);
    expect(joined).not.toMatch(/setInterval|node:worker_threads|BullMQ|pg\.|prisma/i);
  });
});
