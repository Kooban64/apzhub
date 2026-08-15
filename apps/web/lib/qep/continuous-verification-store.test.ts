import { beforeEach, describe, expect, it } from "vitest";

import {
  findContinuousVerificationSignal,
  listContinuousVerificationSignals,
  resetContinuousVerificationStoreForTests,
  upsertContinuousVerificationSignal,
} from "./continuous-verification-store";

describe("continuous-verification-store (SPR-APZQEP-230-A)", () => {
  beforeEach(() => {
    resetContinuousVerificationStoreForTests();
  });

  it("upserts a freshness heartbeat keyed by source+subjectRef", () => {
    const row = upsertContinuousVerificationSignal({
      source: "automation.playwright",
      subjectRef: "chg-1",
      actorId: "user-1",
      staleAfterHours: 12,
    });
    expect(row.signalId).toMatch(/^cvs_/);
    expect(row.status).toBe("fresh");
    expect(listContinuousVerificationSignals()).toHaveLength(1);
    expect(
      findContinuousVerificationSignal("automation.playwright", "chg-1")?.signalId,
    ).toBe(row.signalId);
  });

  it("marks stale and acknowledges without duplicating keys", () => {
    upsertContinuousVerificationSignal({
      source: "ci.github",
      subjectRef: "suite/login",
      actorId: "user-1",
    });
    const stale = upsertContinuousVerificationSignal({
      source: "ci.github",
      subjectRef: "suite/login",
      actorId: "user-2",
      status: "stale",
    });
    expect(listContinuousVerificationSignals()).toHaveLength(1);
    expect(stale.status).toBe("stale");

    const ack = upsertContinuousVerificationSignal({
      source: "ci.github",
      subjectRef: "suite/login",
      actorId: "user-3",
      status: "acknowledged",
      notes: "tracking ticket QE-9",
    });
    expect(ack.status).toBe("acknowledged");
    expect(ack.notes).toBe("tracking ticket QE-9");
  });
});
