import { describe, expect, it } from "vitest";

import { asWebhookManager } from "@apzhub/integration-sdk/events";

import {
  asPlaneWebhookManager,
  createPlanePollingSource,
  toPlanePollingCursor,
  translatePlaneWebhookToSourceEvent,
  PLANE_PROVIDER_ID,
  PLANE_POLLING_SOURCE_DEFINITION,
} from "../index";
import type { PlaneWebhookService } from "../services/webhook-service";
import type { PlaneSyncService } from "../services/sync-service";

describe("Plane OSS-100-08 SDK adoption", () => {
  it("exports webhook manager adapter factory", () => {
    const service = {
      list: async () => [],
      get: async (_c: unknown, id: string) => ({
        id,
        url: "https://example.com/hook",
        isActive: true,
        eventTypes: ["issue"],
        secretPresent: false,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
      }),
      create: async () => {
        throw new Error("unused");
      },
      update: async () => {
        throw new Error("unused");
      },
      delete: async () => undefined,
      validateConfiguration: () => ({ ok: true, issues: [] as string[] }),
      supportedOperations: () => ["list", "get", "create", "update", "delete", "validate"],
    } as unknown as PlaneWebhookService;

    const manager = asPlaneWebhookManager(service);
    expect(manager.supportedOperations()).toContain("list");
    expect(PLANE_PROVIDER_ID).toBe("plane");
    // Same wrapping path as SDK asWebhookManager
    expect(asWebhookManager(service as never, {
      integrationId: "plane",
      providerId: "plane",
    }).supportedOperations()).toContain("enable");
  });

  it("translates webhook payloads to IntegrationSourceEvent", () => {
    const { translation, sourceEvent } = translatePlaneWebhookToSourceEvent(
      {
        event: "issue",
        action: "create",
        data: { id: "abc", project: "proj1", updated_at: "2024-01-01T00:00:00.000Z" },
      },
      { deliveryId: "d1", correlationId: "c1", tenantId: "t1" },
    );
    expect(translation.ok).toBe(true);
    expect(translation.ignored).toBe(false);
    expect(sourceEvent?.deliveryMechanism).toBe("webhook");
    expect(sourceEvent?.providerId).toBe("plane");
  });

  it("creates polling source from sync service", () => {
    const sync = {
      getSyncState: () => ({ cursor: { lastSyncAt: "2024-01-01T00:00:00.000Z" } }),
      runFullSync: async () => ({
        recordsProcessed: 0,
        status: { cursor: { lastSyncAt: "2024-01-01T00:00:00.000Z" } },
      }),
      runIncrementalSync: async () => ({
        recordsProcessed: 0,
        status: { cursor: { lastSyncAt: "2024-01-01T00:00:00.000Z" } },
      }),
    } as unknown as PlaneSyncService;

    const source = createPlanePollingSource(sync);
    expect(source.definition).toEqual(PLANE_POLLING_SOURCE_DEFINITION);
    const cursor = toPlanePollingCursor({ lastSyncAt: "2024-01-01T00:00:00.000Z" });
    expect(cursor.kind).toBe("timestamp");
  });
});
