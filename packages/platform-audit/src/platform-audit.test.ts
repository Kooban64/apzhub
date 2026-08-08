import { describe, expect, it } from "vitest";

import {
  createMemoryAuditSourceProvider,
  createPlatformAuditService,
} from "./create-platform-audit-service";
import type { PlatformAuditEvent } from "./types";

describe("APE-Audit Platform Audit Service", () => {
  it("merges providers, filters by correlationId, and sorts newest first", async () => {
    const a: PlatformAuditEvent = {
      id: "a1",
      tenantId: "t1",
      source: "administration",
      product: "administration",
      action: "role.granted",
      occurredAt: "2026-08-01T10:00:00.000Z",
      correlationId: "corr-1",
    };
    const b: PlatformAuditEvent = {
      id: "b1",
      tenantId: "t1",
      source: "search",
      product: "search",
      action: "index.updated",
      occurredAt: "2026-08-02T10:00:00.000Z",
      correlationId: "corr-1",
    };
    const c: PlatformAuditEvent = {
      id: "c1",
      tenantId: "t1",
      source: "identity",
      action: "session.created",
      occurredAt: "2026-08-03T10:00:00.000Z",
      correlationId: "corr-other",
    };

    const service = createPlatformAuditService({
      providers: [
        createMemoryAuditSourceProvider("administration", [a]),
        createMemoryAuditSourceProvider("search", [b]),
        createMemoryAuditSourceProvider("identity", [c]),
      ],
    });

    const result = await service.list({
      tenantId: "t1",
      correlationId: "corr-1",
      limit: 10,
    });

    expect(service.engineId).toBe("ape-audit");
    expect(result.items.map((item) => item.id)).toEqual(["b1", "a1"]);
    expect(result.truncated).toBe(false);
  });

  it("does not invent events across tenants", async () => {
    const service = createPlatformAuditService({
      providers: [
        createMemoryAuditSourceProvider("notification", [
          {
            id: "n1",
            tenantId: "other",
            source: "notification",
            action: "delivered",
            occurredAt: "2026-08-01T00:00:00.000Z",
          },
        ]),
      ],
    });
    const result = await service.list({ tenantId: "t1" });
    expect(result.items).toEqual([]);
  });
});
