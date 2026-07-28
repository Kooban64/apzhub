import { describe, expect, it } from "vitest";

import { VerificationInvariantViolation } from "../../shared/errors";
import {
  assignVerification,
  cancelVerification,
  createVerification,
  expireVerification,
  rejectVerification,
  requestVerification,
  retireVerification,
  startVerification,
  supersedeVerification,
  updateMetadata,
  updatePriority,
  updateRationale,
  updateResultSummary,
  verifyVerification,
  withdrawVerification,
  type CreateVerificationInput,
  type Verification,
} from "./verification";
import {
  assertAuthority,
  assertHasSubject,
  assertImmutableWhenSupersededOrRetired,
  assertMutable,
  assertNoFinalOutcomeBeforeCompletion,
  assertOutcomeRequiredForCompletion,
  assertRationaleForOutcome,
  assertReference,
  assertSupersession,
  assertVersion,
} from "./verification-policy";
import {
  assertVerificationLifecycleTransition,
  canTransitionVerificationStatus,
  isTerminalVerificationStatus,
} from "./verification-lifecycle-state";
import {
  AuthorityService,
  OutcomeService,
  PolicyService,
  ValidationService,
  VerificationLifecycleService,
} from "./verification-domain-service";
import { createVerificationId } from "./verification-id";
import { createVerificationStatus } from "./verification-status";
import { createVerificationOutcome } from "./verification-outcome";
import { createVerificationSubject } from "./verification-subject";
import { createVerificationAuthority } from "./verification-authority";
import { createVerificationContext } from "./verification-context";
import { createVerificationRationale } from "./verification-rationale";
import { createVerificationReason } from "./verification-reason";
import { createVerificationComment } from "./verification-comment";
import { createVerificationTimestamp } from "./verification-timestamp";
import { createVerificationVersion } from "./verification-version";
import { createVerificationScope } from "./verification-scope";
import { createVerificationPriority } from "./verification-priority";
import { createVerificationOrigin } from "./verification-origin";
import { createVerificationResultSummary } from "./verification-result-summary";
import { createVerificationMetadata, mergeVerificationMetadata } from "./verification-metadata";
import { appendVerificationHistory, createEmptyVerificationHistory } from "./verification-history";
import { createVerificationDecision } from "./verification-decision";
import { VERIFICATION_DOMAIN_EVENT_TYPES } from "./verification-events";

const NOW = "2026-07-26T12:00:00.000Z";
const LATER = "2026-07-26T13:00:00.000Z";
const ACTOR = "user_1";
const TENANT = "tenant_1";
const CORR = "corr_1";

function baseCreate(overrides: Partial<CreateVerificationInput> = {}): Verification {
  return createVerification({
    id: "ver_1",
    tenantId: TENANT,
    subject: { kind: "requirement", artefactId: "req_1" },
    authority: { kind: "user", actorId: ACTOR },
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: CORR,
    ...overrides,
  });
}

describe("Verification domain — create", () => {
  it("creates a valid draft Verification without an outcome", () => {
    const v = baseCreate();
    expect(v.status).toBe("draft");
    expect(v.outcome).toBeUndefined();
    expect(v.id).toBe("ver_1");
    expect(v.revision).toBe(1);
    expect(v.priority).toBe("medium");
    expect(v.origin).toBe("user");
    expect(v.scope.kind).toBe("tenant_global");
    expect(v.history.entries).toHaveLength(1);
    expect(v.domainEvents).toHaveLength(1);
    expect(v.domainEvents[0]?.type).toBe("qep.verification.created");
  });

  it("rejects invalid verification id", () => {
    expect(() => baseCreate({ id: "bad" })).toThrow(VerificationInvariantViolation);
  });

  it("requires tenantId", () => {
    expect(() => baseCreate({ tenantId: "  " })).toThrow(VerificationInvariantViolation);
  });

  it("requires createdBy", () => {
    expect(() => baseCreate({ createdBy: " " })).toThrow(VerificationInvariantViolation);
  });

  it("requires correlationId", () => {
    expect(() => baseCreate({ correlationId: " " })).toThrow(VerificationInvariantViolation);
  });

  it("requires a subject reference", () => {
    expect(() =>
      baseCreate({ subject: { kind: "requirement", artefactId: "  " } }),
    ).toThrow(VerificationInvariantViolation);
  });

  it("rejects unknown subject kind", () => {
    expect(() =>
      baseCreate({ subject: { kind: "not_a_kind", artefactId: "x_1" } }),
    ).toThrow(VerificationInvariantViolation);
  });

  it("requires authority actorId", () => {
    expect(() =>
      baseCreate({ authority: { kind: "user", actorId: "  " } }),
    ).toThrow(VerificationInvariantViolation);
  });

  it("rejects unknown authority kind", () => {
    expect(() =>
      baseCreate({ authority: { kind: "robot", actorId: ACTOR } }),
    ).toThrow(VerificationInvariantViolation);
  });

  it("accepts external_reference subjects with a valid URI", () => {
    const v = baseCreate({
      subject: {
        kind: "external_reference",
        artefactId: "ext_1",
        externalUri: "https://example.com/std/123",
      },
    });
    expect(v.subject.externalUri).toBe("https://example.com/std/123");
    expect(v.subject.owningDomain).toBe("cross_cutting");
  });

  it("rejects external_reference subjects without a URI", () => {
    expect(() =>
      baseCreate({ subject: { kind: "external_reference", artefactId: "ext_1" } }),
    ).toThrow(VerificationInvariantViolation);
  });

  it("defaults metadata to an empty record", () => {
    const v = baseCreate();
    expect(v.metadata.entries).toEqual({});
  });

  it("accepts optional rationale, reason, and comment on create", () => {
    const v = baseCreate({ rationale: "Because", reason: "Scheduled", comment: "fyi" });
    expect(v.rationale).toBe("Because");
    expect(v.reason).toBe("Scheduled");
    expect(v.comment).toBe("fyi");
  });
});

describe("Verification domain — happy path lifecycle", () => {
  it("progresses draft -> requested -> assigned -> in_progress -> verified", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    expect(v.status).toBe("requested");
    expect(v.domainEvents[0]?.type).toBe("qep.verification.requested");

    v = assignVerification(v, "user_2", NOW, ACTOR);
    expect(v.status).toBe("assigned");
    expect(v.assignedTo).toBe("user_2");
    expect(v.domainEvents[0]?.type).toBe("qep.verification.assigned");

    v = startVerification(v, NOW, "user_2");
    expect(v.status).toBe("in_progress");
    expect(v.startedBy).toBe("user_2");
    expect(v.outcome).toBeUndefined();

    v = verifyVerification(v, { outcome: "verified" }, LATER, "user_2");
    expect(v.status).toBe("verified");
    expect(v.outcome).toBe("verified");
    expect(v.decision?.outcome).toBe("verified");
    expect(v.completedAt).toBe(LATER);
    expect(v.completedBy).toBe("user_2");
    const types = v.domainEvents.map((e) => e.type);
    expect(types).toContain("qep.verification.verified");
    expect(types).toContain("qep.verification.completed");
  });

  it("bumps revision on every transition", () => {
    let v = baseCreate();
    expect(v.revision).toBe(1);
    v = requestVerification(v, NOW, ACTOR);
    expect(v.revision).toBe(2);
    v = assignVerification(v, "user_2", NOW, ACTOR);
    expect(v.revision).toBe(3);
  });

  it("allows verification directly from requested via in_progress skipping assignment", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    expect(v.status).toBe("in_progress");
  });
});

describe("Verification domain — reject path", () => {
  function toInProgress(): Verification {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    return v;
  }

  it("rejects with a failure outcome and rationale", () => {
    let v = toInProgress();
    v = rejectVerification(v, { outcome: "failed", rationale: "Test failed" }, LATER, ACTOR);
    expect(v.status).toBe("rejected");
    expect(v.outcome).toBe("failed");
    expect(v.decision?.rationale).toBe("Test failed");
    const types = v.domainEvents.map((e) => e.type);
    expect(types).toContain("qep.verification.rejected");
    expect(types).toContain("qep.verification.completed");
    expect(types).toContain("qep.verification.failed");
  });

  it("does not emit a failed event for inconclusive rejection", () => {
    let v = toInProgress();
    v = rejectVerification(v, { outcome: "inconclusive" }, LATER, ACTOR);
    const types = v.domainEvents.map((e) => e.type);
    expect(types).not.toContain("qep.verification.failed");
  });

  it("rejects with blocked outcome", () => {
    let v = toInProgress();
    v = rejectVerification(v, { outcome: "blocked" }, LATER, ACTOR);
    expect(v.outcome).toBe("blocked");
  });

  it("re-opens a rejected verification back to requested", () => {
    let v = toInProgress();
    v = rejectVerification(v, { outcome: "failed", rationale: "First attempt failed" }, LATER, ACTOR);
    v = requestVerification(v, LATER, ACTOR);
    expect(v.status).toBe("requested");
  });

  it("re-opens an expired verification back to requested", () => {
    let v = toInProgress();
    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    v = expireVerification(v, LATER, ACTOR);
    v = requestVerification(v, LATER, ACTOR);
    expect(v.status).toBe("requested");
  });
});

describe("Verification domain — outcome/status independence", () => {
  it("keeps outcome undefined through draft, requested, assigned, in_progress", () => {
    let v = baseCreate();
    expect(v.outcome).toBeUndefined();
    v = requestVerification(v, NOW, ACTOR);
    expect(v.outcome).toBeUndefined();
    v = assignVerification(v, "user_2", NOW, ACTOR);
    expect(v.outcome).toBeUndefined();
    v = startVerification(v, NOW, ACTOR);
    expect(v.outcome).toBeUndefined();
  });

  it("requires an outcome to reach verified", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    // @ts-expect-error intentionally omitting outcome to prove runtime validation
    expect(() => verifyVerification(v, {}, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("requires an outcome to reach rejected", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    // @ts-expect-error intentionally omitting outcome to prove runtime validation
    expect(() => rejectVerification(v, {}, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("rejects success outcomes being passed to rejectVerification", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    expect(() =>
      rejectVerification(v, { outcome: "verified" }, LATER, ACTOR),
    ).toThrow(VerificationInvariantViolation);
  });

  it("rejects failure outcomes being passed to verifyVerification", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    expect(() =>
      verifyVerification(v, { outcome: "failed" }, LATER, ACTOR),
    ).toThrow(VerificationInvariantViolation);
  });
});

describe("Verification domain — rationale requirements", () => {
  function toInProgress(): Verification {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    return v;
  }

  it("requires rationale for waived outcome", () => {
    const v = toInProgress();
    expect(() => verifyVerification(v, { outcome: "waived" }, LATER, ACTOR)).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("accepts waived outcome with rationale", () => {
    const v = toInProgress();
    const decided = verifyVerification(v, { outcome: "waived", rationale: "Risk accepted" }, LATER, ACTOR);
    expect(decided.outcome).toBe("waived");
  });

  it("requires rationale for partially_verified outcome", () => {
    const v = toInProgress();
    expect(() =>
      verifyVerification(v, { outcome: "partially_verified" }, LATER, ACTOR),
    ).toThrow(VerificationInvariantViolation);
  });

  it("requires rationale for failed outcome", () => {
    const v = toInProgress();
    expect(() => rejectVerification(v, { outcome: "failed" }, LATER, ACTOR)).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("does not require rationale for plain verified outcome", () => {
    const v = toInProgress();
    const decided = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    expect(decided.outcome).toBe("verified");
  });

  it("does not require rationale for inconclusive rejection", () => {
    const v = toInProgress();
    const decided = rejectVerification(v, { outcome: "inconclusive" }, LATER, ACTOR);
    expect(decided.outcome).toBe("inconclusive");
  });
});

describe("Verification domain — invalid transitions", () => {
  it("rejects draft -> verified directly", () => {
    const v = baseCreate();
    expect(() => verifyVerification(v, { outcome: "verified" }, NOW, ACTOR)).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("rejects draft -> in_progress directly", () => {
    const v = baseCreate();
    expect(() => startVerification(v, NOW, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("rejects draft -> assigned directly", () => {
    const v = baseCreate();
    expect(() => assignVerification(v, "user_2", NOW, ACTOR)).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("rejects verified -> draft (no reverse transitions)", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    expect(() => requestVerification(v, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("rejects re-requesting from assigned", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = assignVerification(v, "user_2", NOW, ACTOR);
    expect(() => requestVerification(v, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });
});

describe("Verification domain — terminal states", () => {
  function toWithdrawn(): Verification {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = withdrawVerification(v, NOW, ACTOR);
    return v;
  }

  it("withdrawn is terminal — no further transitions", () => {
    const v = toWithdrawn();
    expect(() => requestVerification(v, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
    expect(() => cancelVerification(v, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("cancelled is terminal", () => {
    let v = baseCreate();
    v = cancelVerification(v, NOW, ACTOR);
    expect(v.status).toBe("cancelled");
    expect(() => requestVerification(v, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("retired is terminal", () => {
    let v = baseCreate();
    v = retireVerification(v, NOW, ACTOR);
    expect(v.status).toBe("retired");
    expect(() => requestVerification(v, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("superseded is terminal", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    v = supersedeVerification(v, "ver_2", LATER, ACTOR);
    expect(v.status).toBe("superseded");
    expect(v.successorVerificationId).toBe("ver_2");
    expect(() => retireVerification(v, LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("rejects supersession by self", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    expect(() => supersedeVerification(v, v.id, LATER, ACTOR)).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("terminal states reject rationale updates", () => {
    const v = toWithdrawn();
    expect(() => updateRationale(v, "new rationale", LATER, ACTOR)).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("verified state (completion) rejects further mutation updates", () => {
    let v = baseCreate();
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    expect(() => updatePriority(v, "high", LATER, ACTOR)).toThrow(VerificationInvariantViolation);
  });
});

describe("Verification domain — cancel / expire / withdraw / retire", () => {
  it("cancels from draft, requested, assigned, or in_progress", () => {
    expect(cancelVerification(baseCreate(), NOW, ACTOR).status).toBe("cancelled");

    let v = requestVerification(baseCreate(), NOW, ACTOR);
    expect(cancelVerification(v, NOW, ACTOR).status).toBe("cancelled");

    v = assignVerification(requestVerification(baseCreate(), NOW, ACTOR), "user_2", NOW, ACTOR);
    expect(cancelVerification(v, NOW, ACTOR).status).toBe("cancelled");
  });

  it("expires only from verified", () => {
    let v = baseCreate();
    expect(() => expireVerification(v, NOW, ACTOR)).toThrow(VerificationInvariantViolation);
    v = requestVerification(v, NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    v = expireVerification(v, LATER, ACTOR);
    expect(v.status).toBe("expired");
    expect(v.expiredAt).toBe(LATER);
  });

  it("withdraws from requested, assigned, in_progress, or verified", () => {
    let v = requestVerification(baseCreate(), NOW, ACTOR);
    expect(withdrawVerification(v, NOW, ACTOR).status).toBe("withdrawn");

    v = startVerification(requestVerification(baseCreate({ id: "ver_2" }), NOW, ACTOR), NOW, ACTOR);
    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    expect(withdrawVerification(v, LATER, ACTOR).status).toBe("withdrawn");
  });

  it("retires from draft, verified, rejected, or expired", () => {
    expect(retireVerification(baseCreate(), NOW, ACTOR).status).toBe("retired");

    let v = startVerification(requestVerification(baseCreate({ id: "ver_2" }), NOW, ACTOR), NOW, ACTOR);
    v = rejectVerification(v, { outcome: "inconclusive" }, LATER, ACTOR);
    expect(retireVerification(v, LATER, ACTOR).status).toBe("retired");
  });
});

describe("Verification domain — assignment", () => {
  it("requires a non-empty assigneeId", () => {
    const v = requestVerification(baseCreate(), NOW, ACTOR);
    expect(() => assignVerification(v, "  ", NOW, ACTOR)).toThrow(VerificationInvariantViolation);
  });

  it("records assignedAt and assignedTo", () => {
    const v = assignVerification(requestVerification(baseCreate(), NOW, ACTOR), "user_9", LATER, ACTOR);
    expect(v.assignedTo).toBe("user_9");
    expect(v.assignedAt).toBe(LATER);
  });
});

describe("Verification domain — history append-only growth", () => {
  it("grows history by exactly one entry per transition and preserves prior entries", () => {
    let v = baseCreate();
    expect(v.history.entries).toHaveLength(1);
    const firstEntry = v.history.entries[0];

    v = requestVerification(v, NOW, ACTOR);
    expect(v.history.entries).toHaveLength(2);
    expect(v.history.entries[0]).toEqual(firstEntry);

    v = startVerification(assignVerification(v, "user_2", NOW, ACTOR), NOW, ACTOR);
    expect(v.history.entries).toHaveLength(4);

    v = verifyVerification(v, { outcome: "verified" }, LATER, ACTOR);
    expect(v.history.entries).toHaveLength(5);
    expect(v.history.entries[4]?.kind).toBe("verified");
  });

  it("does not mutate the original history array on append", () => {
    const empty = createEmptyVerificationHistory();
    const appended = appendVerificationHistory(empty, {
      at: NOW,
      by: ACTOR,
      kind: "created",
      summary: "x",
    });
    expect(empty.entries).toHaveLength(0);
    expect(appended.entries).toHaveLength(1);
  });
});

describe("Verification domain — domainEvents are per-call, not cumulative", () => {
  it("clears prior events before recording new ones", () => {
    let v = baseCreate();
    expect(v.domainEvents).toHaveLength(1);
    v = requestVerification(v, NOW, ACTOR);
    expect(v.domainEvents).toHaveLength(1);
    expect(v.domainEvents[0]?.type).toBe("qep.verification.requested");
  });

  it("emits both verified and completed events with matching outcome", () => {
    let v = requestVerification(baseCreate(), NOW, ACTOR);
    v = startVerification(v, NOW, ACTOR);
    v = verifyVerification(v, { outcome: "partially_verified", rationale: "partial coverage" }, LATER, ACTOR);
    for (const event of v.domainEvents) {
      if (event.type === "qep.verification.verified" || event.type === "qep.verification.completed") {
        expect(event.outcome).toBe("partially_verified");
      }
    }
  });
});

describe("Verification domain — mutation helpers", () => {
  it("updates rationale while mutable", () => {
    const v = updateRationale(baseCreate(), "Updated rationale", NOW, ACTOR);
    expect(v.rationale).toBe("Updated rationale");
  });

  it("merges metadata without dropping existing keys", () => {
    let v = baseCreate({ metadata: { a: "1" } });
    v = updateMetadata(v, { b: "2" }, NOW, ACTOR);
    expect(v.metadata.entries).toEqual({ a: "1", b: "2" });
  });

  it("updates priority while mutable", () => {
    const v = updatePriority(baseCreate(), "critical", NOW, ACTOR);
    expect(v.priority).toBe("critical");
  });

  it("updates result summary while mutable", () => {
    const v = updateResultSummary(baseCreate(), "10/10 checks passed", NOW, ACTOR);
    expect(v.resultSummary).toBe("10/10 checks passed");
  });

  it("rejects an invalid priority value", () => {
    expect(() => updatePriority(baseCreate(), "urgent", NOW, ACTOR)).toThrow(
      VerificationInvariantViolation,
    );
  });
});

describe("Verification value objects — id / status / outcome", () => {
  it("createVerificationId accepts ver_ prefixed ids", () => {
    expect(createVerificationId("ver_abc-123")).toBe("ver_abc-123");
  });

  it("createVerificationId rejects ids without the prefix", () => {
    expect(() => createVerificationId("abc-123")).toThrow(VerificationInvariantViolation);
  });

  it("createVerificationStatus validates against the known set", () => {
    expect(createVerificationStatus("draft")).toBe("draft");
    expect(() => createVerificationStatus("bogus")).toThrow(VerificationInvariantViolation);
  });

  it("createVerificationOutcome validates against the known set", () => {
    expect(createVerificationOutcome("waived")).toBe("waived");
    expect(() => createVerificationOutcome("bogus")).toThrow(VerificationInvariantViolation);
  });
});

describe("Verification value objects — subject / authority / context / scope", () => {
  it("createVerificationSubject builds owningDomain by kind", () => {
    const subject = createVerificationSubject({ kind: "test_case", artefactId: "tc_1" });
    expect(subject.owningDomain).toBe("verification");
  });

  it("createVerificationAuthority validates kind and actorId", () => {
    expect(createVerificationAuthority({ kind: "delegated", actorId: "svc_1" }).kind).toBe(
      "delegated",
    );
    expect(() => createVerificationAuthority({ kind: "user", actorId: "" })).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("createVerificationContext marks baseline-bound contexts immutable", () => {
    const context = createVerificationContext({ baselineId: "rbl_1" });
    expect(context.immutable).toBe(true);
  });

  it("createVerificationContext defaults to mutable when no baseline", () => {
    const context = createVerificationContext();
    expect(context.immutable).toBe(false);
  });

  it("createVerificationScope requires referenceId except for tenant_global", () => {
    expect(createVerificationScope({ kind: "tenant_global" }).kind).toBe("tenant_global");
    expect(() => createVerificationScope({ kind: "project" })).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("createVerificationScope enforces rbl_ prefix for baseline scope", () => {
    expect(() =>
      createVerificationScope({ kind: "baseline", referenceId: "not-a-baseline" }),
    ).toThrow(VerificationInvariantViolation);
    expect(createVerificationScope({ kind: "baseline", referenceId: "rbl_1" }).referenceId).toBe(
      "rbl_1",
    );
  });
});

describe("Verification value objects — rationale / reason / comment / result summary", () => {
  it("rejects empty rationale", () => {
    expect(() => createVerificationRationale("   ")).toThrow(VerificationInvariantViolation);
  });

  it("rejects rationale exceeding the max length", () => {
    expect(() => createVerificationRationale("x".repeat(4_001))).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("accepts a valid reason", () => {
    expect(createVerificationReason("scheduled maintenance")).toBe("scheduled maintenance");
  });

  it("accepts a valid comment", () => {
    expect(createVerificationComment("looks fine")).toBe("looks fine");
  });

  it("accepts a valid result summary and rejects overly long ones", () => {
    expect(createVerificationResultSummary("42/42 passed")).toBe("42/42 passed");
    expect(() => createVerificationResultSummary("x".repeat(1_001))).toThrow(
      VerificationInvariantViolation,
    );
  });
});

describe("Verification value objects — timestamp / version / priority / origin", () => {
  it("accepts ISO-8601 timestamps", () => {
    expect(createVerificationTimestamp(NOW)).toBe(NOW);
  });

  it("rejects non-ISO timestamps", () => {
    expect(() => createVerificationTimestamp("not-a-date")).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("rejects empty timestamps", () => {
    expect(() => createVerificationTimestamp("  ")).toThrow(VerificationInvariantViolation);
  });

  it("createVerificationVersion requires a positive integer", () => {
    expect(createVerificationVersion(1)).toBe(1);
    expect(() => createVerificationVersion(0)).toThrow(VerificationInvariantViolation);
    expect(() => createVerificationVersion(1.5)).toThrow(VerificationInvariantViolation);
  });

  it("createVerificationPriority validates against the known set", () => {
    expect(createVerificationPriority("high")).toBe("high");
    expect(() => createVerificationPriority("urgent")).toThrow(VerificationInvariantViolation);
  });

  it("createVerificationOrigin validates against the known set", () => {
    expect(createVerificationOrigin("ai_suggestion")).toBe("ai_suggestion");
    expect(() => createVerificationOrigin("bogus")).toThrow(VerificationInvariantViolation);
  });
});

describe("Verification metadata", () => {
  it("defaults to empty and normalises keys/values", () => {
    const metadata = createVerificationMetadata({ "  key  ": "  value  " });
    expect(metadata.entries).toEqual({ key: "value" });
  });

  it("rejects more than the maximum number of entries", () => {
    const entries: Record<string, string> = {};
    for (let i = 0; i < 65; i += 1) {
      entries[`k${i}`] = "v";
    }
    expect(() => createVerificationMetadata(entries)).toThrow(VerificationInvariantViolation);
  });

  it("merges without mutating the original", () => {
    const original = createVerificationMetadata({ a: "1" });
    const merged = mergeVerificationMetadata(original, { b: "2" });
    expect(original.entries).toEqual({ a: "1" });
    expect(merged.entries).toEqual({ a: "1", b: "2" });
  });
});

describe("Verification decision", () => {
  it("requires decidedAt and decidedBy", () => {
    expect(() =>
      createVerificationDecision({ outcome: "verified", decidedAt: "", decidedBy: ACTOR }),
    ).toThrow(VerificationInvariantViolation);
    expect(() =>
      createVerificationDecision({ outcome: "verified", decidedAt: NOW, decidedBy: " " }),
    ).toThrow(VerificationInvariantViolation);
  });

  it("builds a valid decision", () => {
    const decision = createVerificationDecision({
      outcome: "verified",
      decidedAt: NOW,
      decidedBy: ACTOR,
    });
    expect(decision.outcome).toBe("verified");
  });
});

describe("Verification lifecycle-state module", () => {
  it("assertVerificationLifecycleTransition allows documented transitions", () => {
    expect(() => assertVerificationLifecycleTransition("draft", "requested")).not.toThrow();
    expect(() => assertVerificationLifecycleTransition("rejected", "requested")).not.toThrow();
  });

  it("assertVerificationLifecycleTransition rejects undocumented transitions", () => {
    expect(() => assertVerificationLifecycleTransition("draft", "verified")).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("isTerminalVerificationStatus flags terminal states correctly", () => {
    expect(isTerminalVerificationStatus("withdrawn")).toBe(true);
    expect(isTerminalVerificationStatus("cancelled")).toBe(true);
    expect(isTerminalVerificationStatus("retired")).toBe(true);
    expect(isTerminalVerificationStatus("superseded")).toBe(true);
    expect(isTerminalVerificationStatus("draft")).toBe(false);
    expect(isTerminalVerificationStatus("verified")).toBe(false);
  });

  it("canTransitionVerificationStatus reports possible transitions", () => {
    expect(canTransitionVerificationStatus("in_progress", "verified")).toBe(true);
    expect(canTransitionVerificationStatus("in_progress", "draft")).toBe(false);
  });
});

describe("Verification policy assertions", () => {
  it("assertAuthority requires a non-empty actorId", () => {
    expect(() => assertAuthority({ kind: "user", actorId: "" })).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertAuthority({ kind: "user", actorId: ACTOR })).not.toThrow();
  });

  it("assertHasSubject requires a subject with an artefactId", () => {
    expect(() => assertHasSubject(undefined)).toThrow(VerificationInvariantViolation);
    expect(() =>
      assertHasSubject(createVerificationSubject({ kind: "requirement", artefactId: "req_1" })),
    ).not.toThrow();
  });

  it("assertReference validates external_reference subjects", () => {
    const subject = createVerificationSubject({
      kind: "external_reference",
      artefactId: "ext_1",
      externalUri: "https://example.com",
    });
    expect(() => assertReference(subject)).not.toThrow();
  });

  it("assertOutcomeRequiredForCompletion enforces outcome on verified/rejected", () => {
    expect(() => assertOutcomeRequiredForCompletion("verified", undefined)).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertOutcomeRequiredForCompletion("rejected", undefined)).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertOutcomeRequiredForCompletion("draft", undefined)).not.toThrow();
    expect(() => assertOutcomeRequiredForCompletion("verified", "verified")).not.toThrow();
  });

  it("assertNoFinalOutcomeBeforeCompletion forbids outcomes on draft/requested/assigned", () => {
    expect(() => assertNoFinalOutcomeBeforeCompletion("draft", "verified")).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertNoFinalOutcomeBeforeCompletion("requested", "failed")).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertNoFinalOutcomeBeforeCompletion("assigned", "blocked")).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("assertNoFinalOutcomeBeforeCompletion allows interim outcomes only while in_progress", () => {
    expect(() => assertNoFinalOutcomeBeforeCompletion("in_progress", "blocked")).not.toThrow();
    expect(() => assertNoFinalOutcomeBeforeCompletion("in_progress", "deferred")).not.toThrow();
    expect(() => assertNoFinalOutcomeBeforeCompletion("in_progress", "verified")).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("assertNoFinalOutcomeBeforeCompletion allows completion outcomes on verified/rejected", () => {
    expect(() => assertNoFinalOutcomeBeforeCompletion("verified", "verified")).not.toThrow();
    expect(() => assertNoFinalOutcomeBeforeCompletion("rejected", "failed")).not.toThrow();
  });

  it("assertMutable forbids terminal immutable statuses", () => {
    expect(() => assertMutable("withdrawn")).toThrow(VerificationInvariantViolation);
    expect(() => assertMutable("cancelled")).toThrow(VerificationInvariantViolation);
    expect(() => assertMutable("retired")).toThrow(VerificationInvariantViolation);
    expect(() => assertMutable("superseded")).toThrow(VerificationInvariantViolation);
    expect(() => assertMutable("draft")).not.toThrow();
  });

  it("assertImmutableWhenSupersededOrRetired forbids superseded and retired only", () => {
    expect(() => assertImmutableWhenSupersededOrRetired("superseded")).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertImmutableWhenSupersededOrRetired("retired")).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertImmutableWhenSupersededOrRetired("verified")).not.toThrow();
  });

  it("assertSupersession forbids self-supersession", () => {
    expect(() => assertSupersession("ver_1", "ver_1")).toThrow(VerificationInvariantViolation);
    expect(() => assertSupersession("ver_1", "ver_2")).not.toThrow();
  });

  it("assertRationaleForOutcome requires rationale for failed/waived/partially_verified", () => {
    expect(() => assertRationaleForOutcome("failed", undefined)).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertRationaleForOutcome("waived", undefined)).toThrow(
      VerificationInvariantViolation,
    );
    expect(() => assertRationaleForOutcome("partially_verified", undefined)).toThrow(
      VerificationInvariantViolation,
    );
    expect(() =>
      assertRationaleForOutcome("failed", createVerificationRationale("because")),
    ).not.toThrow();
    expect(() => assertRationaleForOutcome("verified", undefined)).not.toThrow();
  });

  it("assertVersion enforces optimistic concurrency", () => {
    expect(() => assertVersion(1, 2)).toThrow(VerificationInvariantViolation);
    expect(() => assertVersion(1, 1)).not.toThrow();
  });
});

describe("Verification domain services", () => {
  it("VerificationLifecycleService wraps lifecycle helpers", () => {
    expect(VerificationLifecycleService.isTerminal("retired")).toBe(true);
    expect(VerificationLifecycleService.canTransition("draft", "requested")).toBe(true);
    expect(() => VerificationLifecycleService.assertTransition("draft", "verified")).toThrow(
      VerificationInvariantViolation,
    );
  });

  it("ValidationService.validateCreateInput enforces subject and authority", () => {
    const subject = createVerificationSubject({ kind: "requirement", artefactId: "req_1" });
    const authority = createVerificationAuthority({ kind: "user", actorId: ACTOR });
    expect(() => ValidationService.validateCreateInput({ subject, authority })).not.toThrow();
  });

  it("OutcomeService classifies outcomes", () => {
    expect(OutcomeService.isSuccessOutcome("verified")).toBe(true);
    expect(OutcomeService.isFailureOutcome("failed")).toBe(true);
    expect(OutcomeService.isInterimOutcome("deferred")).toBe(true);
    expect(OutcomeService.isSuccessOutcome("failed")).toBe(false);
  });

  it("AuthorityService.assertAuthorityPresent validates authority", () => {
    expect(() =>
      AuthorityService.assertAuthorityPresent({ kind: "system", actorId: "svc" }),
    ).not.toThrow();
    expect(() =>
      AuthorityService.assertAuthorityPresent({ kind: "system", actorId: "" }),
    ).toThrow(VerificationInvariantViolation);
  });

  it("PolicyService.runCompletePolicies validates outcome + rationale together", () => {
    expect(() =>
      PolicyService.runCompletePolicies("verified", "waived", undefined),
    ).toThrow(VerificationInvariantViolation);
    expect(() =>
      PolicyService.runCompletePolicies(
        "verified",
        "waived",
        createVerificationRationale("accepted risk"),
      ),
    ).not.toThrow();
  });
});

describe("Verification domain event catalogue", () => {
  it("declares all 13 domain event types", () => {
    expect(VERIFICATION_DOMAIN_EVENT_TYPES).toHaveLength(13);
    expect(VERIFICATION_DOMAIN_EVENT_TYPES).toEqual(
      expect.arrayContaining([
        "qep.verification.created",
        "qep.verification.requested",
        "qep.verification.assigned",
        "qep.verification.started",
        "qep.verification.completed",
        "qep.verification.verified",
        "qep.verification.failed",
        "qep.verification.rejected",
        "qep.verification.expired",
        "qep.verification.withdrawn",
        "qep.verification.superseded",
        "qep.verification.cancelled",
        "qep.verification.retired",
      ]),
    );
  });
});
