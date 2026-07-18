import { describe, expect, it } from "vitest";

import {
  InMemoryAuthorizationAuditSink,
  type AuthorizationAuditEvent,
} from "./authorization-audit";

describe("PRH-016 authorization audit contract", () => {
  it("records allow and deny decisions with correlation metadata", () => {
    const sink = new InMemoryAuthorizationAuditSink();

    const allowEvent: AuthorizationAuditEvent = {
      type: "authorization.evaluated",
      timestamp: "2026-07-18T12:00:00.000Z",
      actorId: "user-1",
      effectiveActorId: "user-1",
      tenantId: "tenant-1",
      permission: "platform.operations.read",
      decision: "allow",
      impersonation: false,
      correlationId: "corr-allow-1",
      service: "platform-operations",
      operation: "diagnostics.get",
    };

    const denyEvent: AuthorizationAuditEvent = {
      type: "authorization.evaluated",
      timestamp: "2026-07-18T12:00:01.000Z",
      actorId: "user-2",
      effectiveActorId: "user-2",
      tenantId: "tenant-1",
      permission: "platform.admin.write",
      decision: "deny",
      denialReason: "missing_permission",
      denialCode: "FORBIDDEN",
      impersonation: false,
      correlationId: "corr-deny-1",
      service: "administration",
      operation: "modules.update",
    };

    sink.record(allowEvent);
    sink.record(denyEvent);

    expect(sink.events).toHaveLength(2);
    expect(sink.events[0]?.decision).toBe("allow");
    expect(sink.events[1]?.decision).toBe("deny");
    expect(sink.events.every((e) => e.type === "authorization.evaluated")).toBe(true);
    expect(sink.events.every((e) => e.correlationId.length > 0)).toBe(true);
    expect(sink.events.every((e) => e.tenantId.length > 0)).toBe(true);
  });
});
