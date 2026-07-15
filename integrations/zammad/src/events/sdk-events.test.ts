import { describe, expect, it } from "vitest";

import { asWebhookManager } from "@apzhub/integration-sdk/events";

import {
  asZammadWebhookManager,
  createZammadPollingSource,
  toZammadPollingCursor,
  translateZammadWebhookToSourceEvent,
  ZAMMAD_PROVIDER_ID,
  ZAMMAD_POLLING_SOURCE_DEFINITION,
} from "../index";
import type { ZammadWebhookService } from "../services/webhook-service";
import type { ZammadSyncService } from "../services/sync-service";

describe("Zammad OSS-100-08 SDK adoption", () => {
  it("exports webhook manager adapter factory", () => {
    const service = {
      list: async () => [],
      get: async (_c: unknown, id: string) => ({
        id,
        url: "https://example.com/hook",
        isActive: true,
        eventTypes: ["ticket.create"],
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
    } as unknown as ZammadWebhookService;

    const manager = asZammadWebhookManager(service);
    expect(manager.supportedOperations()).toContain("list");
    expect(ZAMMAD_PROVIDER_ID).toBe("zammad");
    expect(
      asWebhookManager(service as never, {
        integrationId: "zammad",
        providerId: "zammad",
      }).supportedOperations(),
    ).toContain("enable");
  });

  it("translates webhook payloads to IntegrationSourceEvent", () => {
    const { translation, sourceEvent } = translateZammadWebhookToSourceEvent(
      {
        event: "ticket",
        action: "create",
        ticket: { id: 42, updated_at: "2024-01-01T00:00:00.000Z" },
      },
      { deliveryId: "d1", correlationId: "c1", tenantId: "t1" },
    );
    expect(translation.ok).toBe(true);
    expect(sourceEvent?.providerId).toBe("zammad");
    expect(sourceEvent?.deliveryMechanism).toBe("webhook");
  });

  it("creates polling source from sync service", () => {
    const sync = {
      getSyncState: () => ({ cursor: { resumeToken: "tok" } }),
      runFullSync: async () => ({
        recordsProcessed: 0,
        status: { cursor: {} },
      }),
      runIncrementalSync: async () => ({
        recordsProcessed: 0,
        status: { cursor: {} },
      }),
    } as unknown as ZammadSyncService;

    const source = createZammadPollingSource(sync);
    expect(source.definition).toEqual(ZAMMAD_POLLING_SOURCE_DEFINITION);
    const cursor = toZammadPollingCursor({ resumeToken: "tok" });
    expect(cursor.kind).toBe("opaque");
  });
});
