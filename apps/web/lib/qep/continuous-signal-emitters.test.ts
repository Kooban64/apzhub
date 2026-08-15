import { describe, expect, it, beforeEach } from "vitest";

import {
  listContinuousCertSignals,
  resetContinuousCertStoreForTests,
} from "./continuous-cert-signal-store";
import {
  listContinuousVerificationSignals,
  resetContinuousVerificationStoreForTests,
} from "./continuous-verification-store";
import {
  emitAutomationVerificationHeartbeat,
  emitCertFreshnessSignal,
  resolveAutomationSubjectRef,
} from "./continuous-signal-emitters";

describe("continuous-signal-emitters (SPR-APZQEP-230 residual)", () => {
  beforeEach(() => {
    resetContinuousVerificationStoreForTests();
    resetContinuousCertStoreForTests();
  });

  it("emits a verification heartbeat from automation ingest", () => {
    emitAutomationVerificationHeartbeat({
      providerId: "vitest",
      subjectRef: "chg-1",
      actorId: "user-1",
      notes: "ci ingest",
    });
    const rows = listContinuousVerificationSignals();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.source).toBe("automation.vitest");
    expect(rows[0]?.subjectRef).toBe("chg-1");
    expect(rows[0]?.status).toBe("fresh");
  });

  it("emits advisory cert freshness without deciding GO", () => {
    emitCertFreshnessSignal({
      evaluationId: "eval-9",
      changeEventId: "chg-9",
      readiness: "BLOCKED",
      actorId: "user-2",
    });
    const rows = listContinuousCertSignals();
    expect(rows).toHaveLength(1);
    expect(rows[0]?.kind).toBe("freshness");
    expect(rows[0]?.status).toBe("open");
  });

  it("prefers changeEventId as subjectRef", () => {
    expect(
      resolveAutomationSubjectRef({
        changeEventId: "chg-a",
        targetName: "suite",
        executionId: "exec-1",
      }),
    ).toBe("chg-a");
  });
});
