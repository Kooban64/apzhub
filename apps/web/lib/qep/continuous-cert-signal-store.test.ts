import { beforeEach, describe, expect, it } from "vitest";

import {
  createContinuousCertSignal,
  getContinuousCertSignal,
  listContinuousCertSignals,
  resetContinuousCertStoreForTests,
  updateContinuousCertSignalStatus,
} from "./continuous-cert-signal-store";

describe("continuous-cert-signal-store (SPR-APZQEP-230-B)", () => {
  beforeEach(() => {
    resetContinuousCertStoreForTests();
  });

  it("creates an open advisory expiry signal", () => {
    const row = createContinuousCertSignal({
      evaluationId: "eval-1",
      kind: "expiry",
      detail: "Evidence pack older than policy window",
      actorId: "user-1",
      expiresAt: "2026-09-01T00:00:00.000Z",
    });
    expect(row.signalId).toMatch(/^ccs_/);
    expect(row.status).toBe("open");
    expect(listContinuousCertSignals()).toHaveLength(1);
    expect(getContinuousCertSignal(row.signalId)?.kind).toBe("expiry");
  });

  it("acknowledges and escalates without certifying", () => {
    const row = createContinuousCertSignal({
      evaluationId: "eval-2",
      kind: "drift",
      detail: "Suite mapping drifted after SCM sync",
      actorId: "user-1",
    });
    const ack = updateContinuousCertSignalStatus({
      signalId: row.signalId,
      status: "acknowledged",
      actorId: "user-2",
    });
    expect(ack?.status).toBe("acknowledged");
    const escalated = updateContinuousCertSignalStatus({
      signalId: row.signalId,
      status: "escalated",
      actorId: "user-3",
    });
    expect(escalated?.status).toBe("escalated");
    expect(escalated?.updatedBy).toBe("user-3");
  });
});
