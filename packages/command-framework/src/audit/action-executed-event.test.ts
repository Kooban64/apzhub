import { describe, expect, it, vi } from "vitest";

import type { ActionAuditEntry } from "../types/action-audit";
import {
  CAPABILITY_ACTION_EXECUTED_CATEGORY,
  CAPABILITY_ACTION_EXECUTED_EVENT_ID,
  CAPABILITY_ACTION_EXECUTED_PUBLISHER,
  buildActionExecutedEventEnvelope,
} from "./action-executed-event";
import { publishActionExecutedEvent } from "./publish-action-executed-event";

const SUCCESS_ENTRY: ActionAuditEntry = {
  auditReference: "action-audit:workbench.view.open:123:abc",
  actionId: "workbench.view.open",
  actor: "user",
  timestamp: "2026-07-04T12:00:00.000Z",
  ok: true,
  code: "SUCCESS",
  durationMs: 12,
  userId: "user-1",
};

const FAILURE_ENTRY: ActionAuditEntry = {
  ...SUCCESS_ENTRY,
  ok: false,
  code: "NOT_FOUND",
};

describe("buildActionExecutedEventEnvelope", () => {
  it("builds capability.action.executed with actor and result metadata", () => {
    const envelope = buildActionExecutedEventEnvelope(SUCCESS_ENTRY, {
      envelopeId: "11111111-1111-4111-8111-111111111111",
      correlationId: "22222222-2222-4222-8222-222222222222",
    });

    expect(envelope).toMatchObject({
      envelopeId: "11111111-1111-4111-8111-111111111111",
      eventId: CAPABILITY_ACTION_EXECUTED_EVENT_ID,
      eventVersion: "1.0.0",
      category: CAPABILITY_ACTION_EXECUTED_CATEGORY,
      publisher: CAPABILITY_ACTION_EXECUTED_PUBLISHER,
      correlationId: "22222222-2222-4222-8222-222222222222",
      actorId: "user-1",
      sourceService: CAPABILITY_ACTION_EXECUTED_PUBLISHER,
    });

    expect(envelope?.payload).toMatchObject({
      actionId: "workbench.view.open",
      actor: "user",
      resultCode: "SUCCESS",
      ok: true,
      durationMs: 12,
      auditReference: SUCCESS_ENTRY.auditReference,
      userId: "user-1",
    });
  });

  it("returns undefined for unsuccessful audit entries", () => {
    expect(buildActionExecutedEventEnvelope(FAILURE_ENTRY)).toBeUndefined();
  });
});

describe("publishActionExecutedEvent", () => {
  it("skips publish when action did not succeed", () => {
    const publish = vi.fn();
    const result = publishActionExecutedEvent({ publish }, FAILURE_ENTRY);

    expect(result.ok).toBe(true);
    expect(result.skipped).toBe(true);
    expect(publish).not.toHaveBeenCalled();
  });

  it("publishes envelope for successful audit entries", () => {
    const publish = vi.fn().mockReturnValue({ ok: true });
    const result = publishActionExecutedEvent({ publish }, SUCCESS_ENTRY);

    expect(result.ok).toBe(true);
    expect(result.skipped).toBeUndefined();
    expect(publish).toHaveBeenCalledOnce();
    expect(publish.mock.calls[0]?.[0].eventId).toBe(
      CAPABILITY_ACTION_EXECUTED_EVENT_ID,
    );
  });
});
