import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  actOnGovernedQualityAssist,
  assertQualityAssistNeverCertifies,
  createGovernedQualityAssist,
} from "./quality-assist-service";
import { resetQualityAssistStoreForTests } from "./quality-assist-store";

describe("Governed Quality Assist", () => {
  beforeEach(() => {
    resetQualityAssistStoreForTests();
  });

  it("refuses the live LLM path without the feature flag", async () => {
    const fetchFn = vi.fn<typeof fetch>();
    const session = await createGovernedQualityAssist({
      tenantId: "tenant-1",
      actorId: "user-1",
      correlationId: "corr-1",
      mode: "coverage_gaps",
      subjectRef: "chg-1",
      context: "regression evidence exists",
      liveLlmRequested: true,
      env: {
        APZHUB_QEP_AI_ASSIST: "false",
        OPENAI_API_KEY: "sk-test-not-used",
        NODE_ENV: "test",
      },
      fetchFn,
    });

    expect(fetchFn).not.toHaveBeenCalled();
    expect(session.provider).toBe("disabled");
    expect(session.status).toBe("disabled");
    expect(session.suggestions).toEqual([]);
    expect(session.providerReason).toContain("superseded by Phase 7");
  });

  it("produces audited deterministic suggestions for every governed mode", async () => {
    for (const mode of [
      "coverage_gaps",
      "failure_explain",
      "test_draft",
      "suite_recommend",
    ] as const) {
      const session = await createGovernedQualityAssist({
        tenantId: "tenant-1",
        actorId: "user-1",
        correlationId: `corr-${mode}`,
        mode,
        subjectRef: `subject-${mode}`,
        context: "Changed checkout validation with regression evidence",
        env: { NODE_ENV: "test" },
      });

      expect(session.provider).toBe("rule_based");
      expect(session.suggestions.length).toBeGreaterThan(0);
      expect(session.auditTrail.map((event) => event.action)).toEqual([
        "session_created",
        "provider_selected",
      ]);
      expect(session.advisoryOnly).toBe(true);
      expect(session.humanAcceptanceRequired).toBe(true);
    }
  });

  it("accepts a suggestion without making a certification decision", async () => {
    const session = await createGovernedQualityAssist({
      tenantId: "tenant-1",
      actorId: "user-1",
      correlationId: "corr-2",
      mode: "test_draft",
      subjectRef: "chg-2",
      context: "Changed checkout validation",
      env: { NODE_ENV: "test" },
    });
    const suggestionId = session.suggestions[0]?.suggestionId;
    expect(suggestionId).toBeTruthy();

    const updated = actOnGovernedQualityAssist({
      tenantId: "tenant-1",
      actorId: "reviewer-1",
      correlationId: "corr-3",
      sessionId: session.sessionId,
      suggestionId: suggestionId!,
      action: "accept",
    });

    expect(updated.suggestions[0]?.status).toBe("accepted");
    expect(updated.certificationDecision).toBeNull();
    expect(updated.auditTrail.at(-1)?.detail).toContain(
      "no certification action performed",
    );
  });

  it("enforces the never-certify guard", () => {
    expect(() => assertQualityAssistNeverCertifies("qep.certification.decide")).toThrow(
      "quality_assist.certification_forbidden",
    );
    expect(() => assertQualityAssistNeverCertifies("certification.no-go")).toThrow(
      "quality_assist.certification_forbidden",
    );
    expect(() =>
      assertQualityAssistNeverCertifies("quality_assist.suggest"),
    ).not.toThrow();
  });
});
