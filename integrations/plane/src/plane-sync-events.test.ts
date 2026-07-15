/**
 * OSS-101-08 — Plane synchronisation, events & production readiness tests.
 */
import { describe, expect, it } from "vitest";

import type { FetchFn } from "./internal/plane-fetch-client";
import { createPlaneAdapter, disposePlaneAdapter } from "./plane-factory";
import { MOCK_ISSUE, MOCK_PROJECT } from "./testing/mock-plane-core-data";
import { createMockPlaneCoreFetch } from "./testing/mock-plane-core-fetch";
import {
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-plane-api";
import { discoverPlaneCoreServiceCapabilities } from "./capabilities/service-capabilities";
import { createPlaneVendorErrorMapper, mapPlaneUnknownError } from "./plane-error-mapper";
import { PLANE_ADAPTER_VERSION, translatePlaneWebhookPayload } from "./index";

const ctx = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };

async function createAdapter(fetchFn: FetchFn = createMockPlaneCoreFetch()) {
  return createPlaneAdapter({
    plane: DEFAULT_TEST_PLANE_CONFIG,
    tenantId: TEST_TENANT_ID,
    apiToken: "plane-test-token",
    adapterOptions: { fetchFn },
  });
}

const errorContext = {
  correlationId: TEST_CORRELATION_ID,
  integrationId: "plane",
  adapterId: "plane-adapter",
  operation: "plane.webhooks.create",
  tenantId: TEST_TENANT_ID,
};

describe("OSS-101-08 capability registration", () => {
  it("registers events, webhooks, and synchronisation", () => {
    const capabilities = discoverPlaneCoreServiceCapabilities();
    expect(capabilities.map((entry) => entry.serviceId)).toEqual(
      expect.arrayContaining(["webhooks", "events", "synchronisation"]),
    );
    expect(capabilities).toHaveLength(15);
    expect(PLANE_ADAPTER_VERSION).toBe("0.6.0");
  });

  it("exposes sync/events diagnostics on the adapter", async () => {
    const { adapter, factory } = await createAdapter();
    expect(adapter.core.webhooks).toBeDefined();
    expect(adapter.core.events).toBeDefined();
    expect(adapter.core.synchronisation).toBeDefined();
    const diagnostics = adapter.planeDiagnosticsExtension;
    expect(diagnostics.syncEventsCapability.webhooksRegistered).toBe(true);
    expect(diagnostics.syncEventsCapability.eventsRegistered).toBe(true);
    expect(diagnostics.syncEventsCapability.synchronisationRegistered).toBe(true);
    expect(diagnostics.syncEventsCapability.supportedWebhookOperations).toContain("create");
    expect(diagnostics.syncEventsCapability.supportedEventTypes).toContain("issue");
    await disposePlaneAdapter(adapter, factory);
  });
});

describe("PlaneWebhookService", () => {
  it("lists, creates, updates, validates, and deletes webhooks", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    const listed = await adapter.core.webhooks.list(ctx);
    expect(listed[0]?.id).toBe("webhook_plane_webhook-001");
    expect(listed[0]?.secretPresent).toBe(true);
    expect(listed[0]?.eventTypes).toContain("project");

    const validation = adapter.core.webhooks.validateConfiguration({
      url: "https://hooks.example.com/apzhub",
      eventTypes: ["project", "issue"],
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
      eventTypes: ["project", "issue", "issue_comment"],
      isActive: true,
    });
    expect(created.url).toBe("https://hooks.example.com/apzhub");
    expect(created.eventTypes).toEqual(
      expect.arrayContaining(["project", "issue", "issue_comment"]),
    );

    const updated = await adapter.core.webhooks.update(ctx, created.id, {
      isActive: false,
      eventTypes: ["cycle"],
    });
    expect(updated.isActive).toBe(false);
    expect(updated.eventTypes).toContain("cycle");

    await adapter.core.webhooks.delete(ctx, updated.id);
    const afterDelete = await adapter.core.webhooks.list(ctx);
    expect(afterDelete.find((item) => item.id === updated.id)).toBeUndefined();

    await disposePlaneAdapter(adapter, factory);
  });

  it("maps webhook provider failures and rate limiting", async () => {
    const { adapter, factory } = await createAdapter(
      createMockPlaneCoreFetch({ rateLimitWebhooks: true }),
    );
    await adapter.initialise();

    await expect(adapter.core.webhooks.list(ctx)).rejects.toMatchObject({
      category: "rate_limited",
    });

    await disposePlaneAdapter(adapter, factory);

    const failing = await createAdapter(createMockPlaneCoreFetch({ webhookStatus: 503 }));
    await failing.adapter.initialise();
    await expect(failing.adapter.core.webhooks.list(ctx)).rejects.toMatchObject({
      category: "vendor_unavailable",
    });
    await disposePlaneAdapter(failing.adapter, failing.factory);
  });
});

describe("Event translation", () => {
  it("translates Plane webhook payloads into canonical events", () => {
    const created = translatePlaneWebhookPayload({
      event: "issue",
      action: "create",
      webhook_id: "wh-1",
      workspace_id: "ws-001",
      data: {
        id: MOCK_ISSUE.id,
        project: MOCK_PROJECT.id,
        updated_at: "2026-04-01T12:00:00.000Z",
        created_by: "user-001",
      },
    });
    expect(created.ignored).toBe(false);
    expect(created.event?.type).toBe("task.created");
    expect(created.event?.resourceId).toBe(`task_plane_${MOCK_ISSUE.id}`);

    const stateChange = translatePlaneWebhookPayload({
      event: "issue",
      action: "update",
      data: { id: MOCK_ISSUE.id, project: MOCK_PROJECT.id },
      activity: { field: "state", old_value: "a", new_value: "b" },
    });
    expect(stateChange.event?.type).toBe("task.state_changed");
    expect(stateChange.event?.action).toBe("state_changed");

    const comment = translatePlaneWebhookPayload({
      event: "issue_comment",
      action: "create",
      data: { id: "comment-001", project: MOCK_PROJECT.id },
    });
    expect(comment.event?.type).toBe("comment.created");
  });

  it("safely ignores unknown events with structured diagnostics", () => {
    const unknown = translatePlaneWebhookPayload({
      event: "galaxy",
      action: "explode",
      data: { id: "x" },
    });
    expect(unknown.ok).toBe(true);
    expect(unknown.ignored).toBe(true);
    expect(unknown.reason).toBe("unsupported_vendor_event");

    const malformed = translatePlaneWebhookPayload("not-json");
    expect(malformed.ignored).toBe(true);
    expect(malformed.reason).toBe("payload_not_object");
  });

  it("records translation via PlaneEventService", async () => {
    const { adapter, factory } = await createAdapter();
    const translated = adapter.core.events.translate(ctx, {
      event: "project",
      action: "update",
      data: { id: MOCK_PROJECT.id, updated_at: "2026-04-02T00:00:00.000Z" },
    });
    expect(translated.event?.type).toBe("project.updated");
    expect(adapter.core.events.getDiagnostics().eventsTranslated).toBe(1);

    adapter.core.events.translate(ctx, { event: "unknown_thing", action: "noop" });
    expect(adapter.core.events.getDiagnostics().eventsIgnored).toBe(1);

    await disposePlaneAdapter(adapter, factory);
  });
});

describe("PlaneSyncService", () => {
  it("runs full and incremental sync and exposes status", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    const full = await adapter.core.synchronisation.runFullSync(ctx);
    expect(full.recordsProcessed).toBeGreaterThanOrEqual(2);
    expect(full.resources.projects).toBeGreaterThanOrEqual(1);
    expect(full.resources.tasks).toBeGreaterThanOrEqual(1);
    expect(full.status.status).toBe("succeeded");
    expect(full.status.lastSuccessfulSyncAt).toBeDefined();

    const state = adapter.core.synchronisation.getSyncState();
    expect(state.cursor.lastSyncAt).toBeDefined();
    expect(adapter.core.synchronisation.getLastSyncTimestamp()).toBe(state.lastSuccessfulSyncAt);

    const incremental = await adapter.core.synchronisation.runIncrementalSync(ctx, {
      since: "2099-01-01T00:00:00.000Z",
    });
    expect(incremental.status.status).toBe("succeeded");
    expect(incremental.recordsProcessed).toBe(0);

    await disposePlaneAdapter(adapter, factory);
  });

  it("supports resume tokens and safe restart", async () => {
    const { adapter, factory } = await createAdapter();
    await adapter.initialise();

    const limited = await adapter.core.synchronisation.runFullSync(ctx, { maxRecords: 1 });
    expect(limited.recordsProcessed).toBe(1);

    const resumed = await adapter.core.synchronisation.runFullSync(ctx, {
      resumeToken: Buffer.from(
        JSON.stringify({ mode: "full", recordsProcessed: 0, projectIndex: 0 }),
        "utf8",
      ).toString("base64url"),
    });
    expect(resumed.status.status).toBe("succeeded");

    // Force running then safe-restart
    (adapter.core.synchronisation as unknown as { status: { status: string } }).status = {
      ...(adapter.core.synchronisation.getSyncState() as object),
      status: "running",
    } as never;
    const restarted = adapter.core.synchronisation.safeRestart();
    expect(restarted.status).toBe("idle");
    expect(restarted.errors).toContain("safe_restart_cleared_running_state");

    await disposePlaneAdapter(adapter, factory);
  });

  it("records sync failures and provider errors", async () => {
    const { adapter, factory } = await createAdapter(
      createMockPlaneCoreFetch({ syncStatus: 503 }),
    );
    await adapter.initialise();

    await expect(adapter.core.synchronisation.runFullSync(ctx)).rejects.toMatchObject({
      category: "vendor_unavailable",
    });
    const state = adapter.core.synchronisation.getSyncState();
    expect(state.status).toBe("failed");
    expect(state.lastFailedSyncAt).toBeDefined();
    expect(state.cursor.resumeToken).toBeDefined();
    expect(adapter.core.synchronisation.getDiagnostics().syncHealth).toBe("unhealthy");
    expect(adapter.core.synchronisation.getDiagnostics().retryCounts).toBeGreaterThanOrEqual(1);

    await disposePlaneAdapter(adapter, factory);
  });
});

describe("OSS-101-08 error translation", () => {
  const mapper = createPlaneVendorErrorMapper();

  it("maps webhook, sync, translation, timeout, and retry exhaustion", () => {
    expect(
      mapper.map({
        statusCode: 404,
        body: { error_code: "WEBHOOK_NOT_FOUND" },
        context: errorContext,
      })?.error.message,
    ).toBe("Plane webhook was not found");

    expect(
      mapper.map({
        statusCode: 503,
        body: { error_code: "SYNC_FAILED" },
        context: { ...errorContext, operation: "plane.sync.full" },
      })?.error.message,
    ).toBe("Plane synchronisation failed");

    expect(
      mapper.map({
        body: { error_code: "EVENT_TRANSLATION_FAILED" },
        context: { ...errorContext, operation: "plane.events.translate" },
      })?.error.category,
    ).toBe("mapping");

    expect(
      mapper.map({
        body: { error_code: "PROVIDER_TIMEOUT" },
        timeout: true,
        context: errorContext,
      })?.error.category,
    ).toBe("timeout");

    expect(
      mapper.map({
        body: { error_code: "RETRY_EXHAUSTED" },
        context: { ...errorContext, operation: "plane.sync.incremental" },
      })?.error.category,
    ).toBe("vendor_unavailable");

    expect(
      mapper.map({
        statusCode: 429,
        body: { error_code: "RATE_LIMITED" },
        context: errorContext,
      })?.error.category,
    ).toBe("rate_limited");
  });

  it("maps unknown errors with vendor codes", () => {
    const translated = mapPlaneUnknownError(
      Object.assign(new Error("retry exhausted"), {
        statusCode: 503,
        body: { error_code: "RETRY_EXHAUSTED" },
        vendorCode: "RETRY_EXHAUSTED",
      }),
      { ...errorContext, operation: "plane.sync.full" },
    );
    expect(translated.error.code).toBe("plane.retry_exhausted");
  });
});
