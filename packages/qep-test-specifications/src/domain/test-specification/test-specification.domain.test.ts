import { describe, expect, it } from "vitest";

import {
  TestSpecificationConflictError,
  TestSpecificationInvariantViolation,
} from "../../shared/errors";
import {
  addSpecificationRelationship,
  approveSpecification,
  cancelSpecification,
  createSuccessorDraft,
  createTestSpecification,
  getSpecificationId,
  getSpecificationVersion,
  isAuthoritativeSpecification,
  rejectSpecification,
  removeSpecificationRelationship,
  reassignSpecificationAuthor,
  retireSpecification,
  returnSpecificationToDraft,
  startSpecificationReview,
  supersedeSpecification,
  transferSpecificationOwnership,
  updateSpecificationContent,
  updateSpecificationMetadata,
  withdrawSpecification,
  type CreateTestSpecificationInput,
  type TestSpecification,
} from "./test-specification";
import {
  assertSpecificationLifecycleTransition,
  canTransitionSpecificationStatus,
  getAllowedSpecificationTransitions,
  isTerminalSpecificationStatus,
} from "./lifecycle-state";
import {
  ApprovalPolicy,
  ClassificationPolicy,
  DependencyPolicy,
  ImmutabilityPolicy,
  LifecyclePolicy,
  OwnershipPolicy,
  PriorityPolicy,
  RelationshipPolicy,
  ReviewPolicy,
  RiskPolicy,
  SupersessionPolicy,
  ValidationPolicy,
  VersionPolicy,
} from "./specification-policy";
import {
  SpecificationApprovalService,
  SpecificationLifecycleService,
  SpecificationPolicyService,
  SpecificationRelationshipService,
  SpecificationValidationService,
  SpecificationVersionService,
} from "./specification-domain-service";
import { createSpecificationId } from "./specification-id";
import { createSpecificationStatus, isEditableSpecificationStatus } from "./specification-status";
import {
  assertNotSelfReference,
  createSpecificationAcceptanceCriteria,
  createSpecificationAuthor,
  createSpecificationClassification,
  createSpecificationComplexity,
  createSpecificationDependency,
  createSpecificationDescription,
  createSpecificationNumber,
  createSpecificationObjective,
  createSpecificationOwner,
  createSpecificationPostconditions,
  createSpecificationPreconditions,
  createSpecificationPriority,
  createSpecificationReference,
  createSpecificationReferenceKind,
  createSpecificationReviewer,
  createSpecificationRisk,
  createSpecificationScope,
  createSpecificationTag,
  createSpecificationTimestamp,
  createSpecificationTitle,
  createSpecificationType,
  createSpecificationVersion,
  versionKey,
} from "./value-objects";
import {
  createSpecificationMetadata,
  mergeSpecificationMetadata,
} from "./specification-metadata";
import {
  appendSpecificationHistory,
  createEmptySpecificationHistory,
} from "./specification-history";
import { createSpecificationApproval } from "./specification-approval";
import {
  assertRelationshipBelongsTo,
  createSpecificationIdSafe,
  createSpecificationRelationship,
  createSpecificationRelationshipId,
} from "./specification-relationship";
import {
  createSpecificationRecord,
  withRecordVersion,
} from "./specification-record";
import { SPECIFICATION_DOMAIN_EVENT_TYPES } from "./specification-events";
import { SPECIFICATION_TYPES } from "./constants";

const NOW = "2026-07-26T12:00:00.000Z";
const LATER = "2026-07-26T13:00:00.000Z";
const ACTOR = "user_1";
const REVIEWER = "reviewer_1";
const TENANT = "tenant_1";
const CORR = "corr_1";

function baseCreate(
  overrides: Partial<CreateTestSpecificationInput> = {},
): TestSpecification {
  return createTestSpecification({
    id: "tsp_1",
    tenantId: TENANT,
    number: "TS-001",
    title: "Login authentication specification",
    description: "Specifies authentication verification scope",
    objective: "Confirm credential validation behaviour",
    scope: "Web authentication flows",
    type: "functional",
    classification: "security-critical",
    owner: "owner_1",
    author: "author_1",
    createdAt: NOW,
    createdBy: ACTOR,
    correlationId: CORR,
    ...overrides,
  });
}

function toUnderReview(spec = baseCreate()): TestSpecification {
  return startSpecificationReview(spec, REVIEWER, LATER, ACTOR);
}

function toApproved(spec = baseCreate()): TestSpecification {
  return approveSpecification(toUnderReview(spec), LATER, REVIEWER, "Looks good");
}

describe("Test Specification domain — create", () => {
  it("creates a valid draft Specification with required identity fields", () => {
    const spec = baseCreate();
    expect(spec.record.status).toBe("draft");
    expect(spec.record.id).toBe("tsp_1");
    expect(spec.record.title).toBe("Login authentication specification");
    expect(spec.record.objective).toBe("Confirm credential validation behaviour");
    expect(spec.record.owner).toBe("owner_1");
    expect(spec.record.classification).toBe("security-critical");
    expect(spec.record.version.label).toBe("0.1");
    expect(spec.record.isAuthoritative).toBe(false);
    expect(spec.revision).toBe(1);
    expect(spec.history.entries).toHaveLength(1);
    expect(spec.domainEvents).toHaveLength(1);
    expect(spec.domainEvents[0]?.type).toBe("qep.specification.created");
    expect(isAuthoritativeSpecification(spec)).toBe(false);
  });

  it("rejects invalid specification id", () => {
    expect(() => baseCreate({ id: "bad" })).toThrow(TestSpecificationInvariantViolation);
  });

  it("requires title, objective, owner, classification", () => {
    expect(() => baseCreate({ title: " " })).toThrow(TestSpecificationInvariantViolation);
    expect(() => baseCreate({ objective: " " })).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => baseCreate({ owner: " " })).toThrow(TestSpecificationInvariantViolation);
    expect(() => baseCreate({ classification: " " })).toThrow(
      TestSpecificationInvariantViolation,
    );
  });

  it("requires tenantId, createdBy, correlationId", () => {
    expect(() => baseCreate({ tenantId: " " })).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => baseCreate({ createdBy: " " })).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => baseCreate({ correlationId: " " })).toThrow(
      TestSpecificationInvariantViolation,
    );
  });

  it("rejects unknown type and priority", () => {
    expect(() => baseCreate({ type: "unknown" })).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => baseCreate({ priority: "urgent" })).toThrow(
      TestSpecificationInvariantViolation,
    );
  });

  it("supports all catalogue specification types", () => {
    for (const type of SPECIFICATION_TYPES) {
      const spec = baseCreate({ id: `tsp_${type}`, type });
      expect(spec.record.type).toBe(type);
    }
  });

  it("accepts preconditions, postconditions, criteria, risks, dependencies, tags", () => {
    const spec = baseCreate({
      preconditions: ["User exists"],
      postconditions: ["Session established"],
      acceptanceCriteria: ["Valid credentials succeed"],
      risks: [{ id: "risk_1", summary: "Credential stuffing", severity: "high" }],
      dependencies: [
        {
          id: "dep_1",
          summary: "Identity service",
          referenceKind: "requirement",
          referenceId: "req_1",
        },
      ],
      tags: ["auth", "login"],
    });
    expect(spec.record.preconditions.items).toEqual(["User exists"]);
    expect(spec.record.postconditions.items).toEqual(["Session established"]);
    expect(spec.record.acceptanceCriteria.items).toEqual(["Valid credentials succeed"]);
    expect(spec.record.risks[0]?.id).toBe("risk_1");
    expect(spec.record.dependencies[0]?.referenceId).toBe("req_1");
    expect(spec.record.tags).toEqual(["auth", "login"]);
  });
});

describe("Test Specification domain — lifecycle", () => {
  it("allows draft -> under_review -> approved", () => {
    const reviewed = toUnderReview();
    expect(reviewed.domainEvents.map((e) => e.type)).toContain(
      "qep.specification.review.started",
    );
    const approved = approveSpecification(reviewed, LATER, REVIEWER, "Looks good");
    expect(approved.record.status).toBe("approved");
    expect(approved.record.isAuthoritative).toBe(true);
    expect(isAuthoritativeSpecification(approved)).toBe(true);
    expect(approved.domainEvents.map((e) => e.type)).toEqual([
      "qep.specification.review.completed",
      "qep.specification.approved",
    ]);
  });

  it("allows under_review -> rejected and rejected -> draft", () => {
    const rejected = rejectSpecification(
      toUnderReview(),
      LATER,
      REVIEWER,
      "Missing objective detail",
    );
    expect(rejected.record.status).toBe("rejected");
    expect(rejected.approval?.decision).toBe("rejected");
    const draft = returnSpecificationToDraft(rejected, LATER, ACTOR, "Reworking");
    expect(draft.record.status).toBe("draft");
  });

  it("forbids rejected -> approved", () => {
    const rejected = rejectSpecification(
      toUnderReview(),
      LATER,
      REVIEWER,
      "Incomplete",
    );
    expect(() =>
      approveSpecification(rejected, LATER, REVIEWER),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(canTransitionSpecificationStatus("rejected", "approved")).toBe(false);
  });

  it("allows approved -> superseded | withdrawn | retired", () => {
    const approved = toApproved();
    expect(getAllowedSpecificationTransitions("approved")).toEqual(
      expect.arrayContaining(["superseded", "withdrawn", "retired"]),
    );
    const superseded = supersedeSpecification(approved, "tsp_2", LATER, ACTOR);
    expect(superseded.record.status).toBe("superseded");
    expect(superseded.record.isAuthoritative).toBe(false);
    expect(superseded.record.successorSpecificationId).toBe("tsp_2");

    const withdrawn = withdrawSpecification(toApproved(), LATER, ACTOR);
    expect(withdrawn.record.status).toBe("withdrawn");

    const retired = retireSpecification(toApproved(), LATER, ACTOR);
    expect(retired.record.status).toBe("retired");
  });

  it("allows draft/under_review cancel and withdraw", () => {
    expect(cancelSpecification(baseCreate(), LATER, ACTOR).record.status).toBe(
      "cancelled",
    );
    expect(withdrawSpecification(baseCreate(), LATER, ACTOR).record.status).toBe(
      "withdrawn",
    );
    expect(cancelSpecification(toUnderReview(), LATER, ACTOR).record.status).toBe(
      "cancelled",
    );
  });

  it("treats terminal states as immutable transitions", () => {
    for (const status of ["withdrawn", "superseded", "cancelled", "retired"] as const) {
      expect(isTerminalSpecificationStatus(status)).toBe(true);
      expect(getAllowedSpecificationTransitions(status)).toEqual([]);
    }
  });

  it("rejects illegal lifecycle transitions", () => {
    expect(() =>
      assertSpecificationLifecycleTransition("draft", "approved"),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      assertSpecificationLifecycleTransition("approved", "draft"),
    ).toThrow(TestSpecificationInvariantViolation);
  });
});

describe("Test Specification domain — immutability and edit rules", () => {
  it("only Draft may be edited", () => {
    expect(isEditableSpecificationStatus("draft")).toBe(true);
    const approved = toApproved();
    expect(() =>
      updateSpecificationContent(approved, { title: "New" }, LATER, ACTOR),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      updateSpecificationMetadata(approved, { k: "v" }, LATER, ACTOR),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      addSpecificationRelationship(
        approved,
        { id: "tsr_1", kind: "requirement", artefactId: "req_1" },
        LATER,
        ACTOR,
      ),
    ).toThrow(TestSpecificationInvariantViolation);
  });

  it("updates draft content and emits updated event", () => {
    const updated = updateSpecificationContent(
      baseCreate(),
      {
        title: "Updated title",
        priority: "critical",
        complexity: "complex",
        tags: ["v2"],
      },
      LATER,
      ACTOR,
    );
    expect(updated.record.title).toBe("Updated title");
    expect(updated.record.priority).toBe("critical");
    expect(updated.record.complexity).toBe("complex");
    expect(updated.record.tags).toEqual(["v2"]);
    expect(updated.domainEvents[0]?.type).toBe("qep.specification.updated");
    expect(updated.history.entries.length).toBeGreaterThan(1);
  });

  it("keeps history append-only", () => {
    const a = updateSpecificationContent(baseCreate(), { title: "A" }, LATER, ACTOR);
    const b = updateSpecificationContent(a, { title: "B" }, LATER, ACTOR);
    expect(b.history.entries.map((e) => e.kind)).toEqual([
      "created",
      "updated",
      "updated",
    ]);
  });

  it("forbids content mutation of superseded and retired", () => {
    const superseded = supersedeSpecification(toApproved(), "tsp_x", LATER, ACTOR);
    const retired = retireSpecification(toApproved(), LATER, ACTOR);
    expect(() =>
      updateSpecificationContent(superseded, { title: "x" }, LATER, ACTOR),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      updateSpecificationContent(retired, { title: "x" }, LATER, ACTOR),
    ).toThrow(TestSpecificationInvariantViolation);
  });
});

describe("Test Specification domain — versioning", () => {
  it("bumps major and minor versions", () => {
    const v = createSpecificationVersion(1, 2);
    expect(SpecificationVersionService.bump(v, "minor").label).toBe("1.3");
    expect(SpecificationVersionService.bump(v, "major").label).toBe("2.0");
  });

  it("creates successor draft from approved and supersedes predecessor", () => {
    const approved = toApproved();
    const successor = createSuccessorDraft(approved, {
      id: "tsp_2",
      bump: "minor",
      createdAt: LATER,
      createdBy: ACTOR,
      correlationId: "corr_2",
      comparisonNotes: "Clarifies acceptance criteria",
    });
    expect(successor.record.version.label).toBe("0.2");
    expect(successor.record.predecessorSpecificationId).toBe("tsp_1");
    expect(successor.record.status).toBe("draft");

    const superseded = supersedeSpecification(approved, successor.record.id, LATER, ACTOR);
    expect(superseded.record.status).toBe("superseded");
    expect(superseded.domainEvents.some((e) => e.type === "qep.specification.superseded")).toBe(
      true,
    );
  });

  it("forbids successor creation from non-approved", () => {
    expect(() =>
      createSuccessorDraft(baseCreate(), {
        id: "tsp_2",
        bump: "minor",
        createdAt: LATER,
        createdBy: ACTOR,
        correlationId: CORR,
      }),
    ).toThrow(TestSpecificationInvariantViolation);
  });

  it("forbids self-supersession", () => {
    expect(() =>
      supersedeSpecification(toApproved(), "tsp_1", LATER, ACTOR),
    ).toThrow(TestSpecificationInvariantViolation);
  });

  it("enforces unique version labels in lineage", () => {
    expect(() =>
      VersionPolicy.assertUniqueVersionLabel(["0.1"], createSpecificationVersion(0, 1)),
    ).toThrow(TestSpecificationInvariantViolation);
  });
});

describe("Test Specification domain — relationships", () => {
  it("adds and removes reference-only relationships", () => {
    const withRel = addSpecificationRelationship(
      baseCreate(),
      {
        id: "tsr_1",
        kind: "requirement",
        artefactId: "req_1",
        owningDomain: "requirements",
        label: "REQ-1",
      },
      LATER,
      ACTOR,
    );
    expect(withRel.relationships).toHaveLength(1);
    expect(withRel.domainEvents[0]?.type).toBe("qep.specification.relationship.added");

    const removed = removeSpecificationRelationship(withRel, "tsr_1", LATER, ACTOR);
    expect(removed.relationships).toHaveLength(0);
    expect(removed.domainEvents[0]?.type).toBe(
      "qep.specification.relationship.removed",
    );
  });

  it("supports verification / trace / future case references", () => {
    let spec = baseCreate();
    for (const [id, kind, artefactId] of [
      ["tsr_v", "verification", "ver_1"],
      ["tsr_t", "trace_link", "trl_1"],
      ["tsr_c", "test_case", "tc_1"],
      ["tsr_s", "test_suite", "tsu_1"],
      ["tsr_e", "execution", "exec_1"],
      ["tsr_ev", "evidence", "ev_1"],
    ] as const) {
      spec = addSpecificationRelationship(
        spec,
        { id, kind, artefactId },
        LATER,
        ACTOR,
      );
    }
    expect(spec.relationships).toHaveLength(6);
  });

  it("forbids self-reference and duplicates", () => {
    expect(() =>
      addSpecificationRelationship(
        baseCreate(),
        { id: "tsr_1", kind: "external_reference", artefactId: "tsp_1" },
        LATER,
        ACTOR,
      ),
    ).toThrow(TestSpecificationInvariantViolation);

    const once = addSpecificationRelationship(
      baseCreate(),
      { id: "tsr_1", kind: "requirement", artefactId: "req_1" },
      LATER,
      ACTOR,
    );
    expect(() =>
      addSpecificationRelationship(
        once,
        { id: "tsr_2", kind: "requirement", artefactId: "req_1" },
        LATER,
        ACTOR,
      ),
    ).toThrow(TestSpecificationInvariantViolation);
  });

  it("fails when removing unknown relationship", () => {
    expect(() =>
      removeSpecificationRelationship(baseCreate(), "tsr_missing", LATER, ACTOR),
    ).toThrow(TestSpecificationInvariantViolation);
  });
});

describe("Test Specification domain — governance", () => {
  it("transfers ownership and reassigns author in draft", () => {
    const owned = transferSpecificationOwnership(baseCreate(), "owner_2", LATER, ACTOR);
    expect(owned.record.owner).toBe("owner_2");
    const authored = reassignSpecificationAuthor(owned, "author_2", LATER, ACTOR);
    expect(authored.record.author).toBe("author_2");
  });

  it("requires reviewer when starting review", () => {
    expect(() =>
      startSpecificationReview(baseCreate(), " ", LATER, ACTOR),
    ).toThrow(TestSpecificationInvariantViolation);
  });

  it("requires rejection comment", () => {
    expect(() =>
      createSpecificationApproval({
        decision: "rejected",
        decidedAt: NOW,
        decidedBy: REVIEWER,
      }),
    ).toThrow(TestSpecificationInvariantViolation);
  });
});

describe("Test Specification domain — value objects", () => {
  it("validates identifiers, text, timestamps, and catalogues", () => {
    expect(createSpecificationId("tsp_abc")).toBe("tsp_abc");
    expect(createSpecificationNumber("TS-9")).toBe("TS-9");
    expect(createSpecificationTitle("Title")).toBe("Title");
    expect(createSpecificationDescription("Desc")).toBe("Desc");
    expect(createSpecificationObjective("Obj")).toBe("Obj");
    expect(createSpecificationScope("Scope")).toBe("Scope");
    expect(createSpecificationClassification("class-a")).toBe("class-a");
    expect(createSpecificationOwner("o1")).toBe("o1");
    expect(createSpecificationReviewer("r1")).toBe("r1");
    expect(createSpecificationAuthor("a1")).toBe("a1");
    expect(createSpecificationTag("tag")).toBe("tag");
    expect(createSpecificationTimestamp(NOW)).toBe(NOW);
    expect(createSpecificationType("api")).toBe("api");
    expect(createSpecificationPriority("low")).toBe("low");
    expect(createSpecificationComplexity("epic")).toBe("epic");
    expect(createSpecificationStatus("under_review")).toBe("under_review");
    expect(createSpecificationVersion(1, 0).label).toBe("1.0");
    expect(versionKey(createSpecificationVersion(1, 0))).toBe("1.0");
    expect(createSpecificationPreconditions(["a"]).items).toEqual(["a"]);
    expect(createSpecificationPostconditions(["b"]).items).toEqual(["b"]);
    expect(createSpecificationAcceptanceCriteria(["c"]).items).toEqual(["c"]);
    expect(createSpecificationRisk({ id: "r", summary: "s" }).id).toBe("r");
    expect(createSpecificationDependency({ id: "d", summary: "s" }).id).toBe("d");
    expect(
      createSpecificationReference({ kind: "verification", artefactId: "ver_1" }).kind,
    ).toBe("verification");
  });

  it("rejects invalid value objects", () => {
    expect(() => createSpecificationId("x")).toThrow(TestSpecificationInvariantViolation);
    expect(() => createSpecificationTitle("")).toThrow(TestSpecificationInvariantViolation);
    expect(() => createSpecificationTimestamp("not-a-date")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => createSpecificationVersion(-1, 0)).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => createSpecificationStatus("bogus")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => createSpecificationComplexity("hard")).toThrow(
      TestSpecificationInvariantViolation,
    );
  });

  it("merges metadata and appends history", () => {
    const meta = createSpecificationMetadata({ a: "1" });
    expect(mergeSpecificationMetadata(meta, { b: "2" }).entries).toEqual({
      a: "1",
      b: "2",
    });
    const history = appendSpecificationHistory(createEmptySpecificationHistory(), {
      at: NOW,
      by: ACTOR,
      kind: "note",
      summary: "x",
    });
    expect(history.entries).toHaveLength(1);
  });
});

describe("Test Specification domain — policies and services", () => {
  it("exposes lifecycle service helpers", () => {
    expect(SpecificationLifecycleService.canTransition("draft", "under_review")).toBe(
      true,
    );
    expect(SpecificationLifecycleService.isTerminal("retired")).toBe(true);
    expect(SpecificationLifecycleService.allowedTransitions("draft")).toContain(
      "under_review",
    );
  });

  it("runs validation and approval policies", () => {
    expect(() =>
      SpecificationValidationService.validateCreateInput({
        id: "tsp_1",
        title: "t",
        objective: "o",
        owner: "own",
        classification: "c",
      }),
    ).not.toThrow();
    expect(() =>
      SpecificationValidationService.validateCreateInput({ id: "tsp_1" }),
    ).toThrow(TestSpecificationInvariantViolation);

    expect(() => ApprovalPolicy.assertCanApprove("under_review")).not.toThrow();
    expect(() => ApprovalPolicy.assertCanApprove("draft")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => ReviewPolicy.assertCanStartReview("draft")).not.toThrow();
    expect(() => OwnershipPolicy.assertOwnerPresent(" ")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => ClassificationPolicy.assertPresent(" ")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => PriorityPolicy.assertKnownPriority("medium")).not.toThrow();
    expect(() => RiskPolicy.assertRiskIdentity("r", "s")).not.toThrow();
    expect(() => DependencyPolicy.assertDependencyIdentity(" ", "s")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() =>
      RelationshipPolicy.assertNotSelf(createSpecificationId("tsp_1"), "tsp_1"),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() => ImmutabilityPolicy.assertMutable("approved")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => SupersessionPolicy.assertCanSupersede("draft")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() =>
      ValidationPolicy.assertRequiredIdentity({
        id: "tsp_1",
        title: "t",
        objective: "o",
        owner: "o1",
        classification: "c",
      }),
    ).not.toThrow();
    expect(() =>
      VersionPolicy.assertBump(
        createSpecificationVersion(1, 0),
        createSpecificationVersion(1, 1),
        "minor",
      ),
    ).not.toThrow();
    expect(() =>
      VersionPolicy.assertBump(
        createSpecificationVersion(1, 0),
        createSpecificationVersion(1, 2),
        "minor",
      ),
    ).toThrow(TestSpecificationInvariantViolation);

    SpecificationApprovalService.assertCanStartReview("draft");
    SpecificationRelationshipService.assertNotSelf(
      createSpecificationId("tsp_1"),
      "req_1",
    );
    SpecificationPolicyService.runCreatePolicies({
      id: "tsp_1",
      title: "t",
      objective: "o",
      owner: "o1",
      classification: "c",
    });
    expect(
      SpecificationVersionService.latestApprovedLabel([
        toApproved().record,
      ]),
    ).toBe("0.1");
  });

  it("lists the full domain event catalogue", () => {
    expect(SPECIFICATION_DOMAIN_EVENT_TYPES).toHaveLength(12);
  });

  it("exposes aggregate accessors", () => {
    const spec = baseCreate();
    expect(getSpecificationId(spec)).toBe("tsp_1");
    expect(getSpecificationVersion(spec).label).toBe("0.1");
  });
});

describe("Test Specification domain — LifecyclePolicy helpers", () => {
  it("enforces authoritative only when approved", () => {
    expect(() =>
      LifecyclePolicy.assertAuthoritativeOnlyWhenApproved("draft", true),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      LifecyclePolicy.assertAuthoritativeOnlyWhenApproved("approved", true),
    ).not.toThrow();
  });
});

describe("Test Specification domain — coverage gaps", () => {
  it("covers metadata validation failures", () => {
    expect(() =>
      createSpecificationMetadata(
        Object.fromEntries(
          Array.from({ length: 65 }, (_, i) => [`k${i}`, "v"]),
        ),
      ),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() => createSpecificationMetadata({ " ": "v" })).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() =>
      createSpecificationMetadata({ k: "x".repeat(513) }),
    ).toThrow(TestSpecificationInvariantViolation);
  });

  it("covers relationship helpers and id validation", () => {
    expect(createSpecificationRelationshipId("tsr_1")).toBe("tsr_1");
    expect(() => createSpecificationRelationshipId("bad")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(createSpecificationIdSafe("tsp_9")).toBe("tsp_9");
    const rel = createSpecificationRelationship({
      id: "tsr_9",
      specificationId: createSpecificationId("tsp_1"),
      kind: "requirement",
      artefactId: "req_9",
      createdAt: NOW,
      createdBy: ACTOR,
    });
    expect(() =>
      assertRelationshipBelongsTo(rel, createSpecificationId("tsp_other")),
    ).toThrow(TestSpecificationInvariantViolation);
    assertRelationshipBelongsTo(rel, createSpecificationId("tsp_1"));
    expect(() =>
      createSpecificationRelationship({
        id: "tsr_10",
        specificationId: createSpecificationId("tsp_1"),
        kind: "requirement",
        artefactId: "req_10",
        createdAt: NOW,
        createdBy: " ",
      }),
    ).toThrow(TestSpecificationInvariantViolation);
  });

  it("covers approval decision validation and conflict error", () => {
    expect(() =>
      createSpecificationApproval({
        decision: "maybe",
        decidedAt: NOW,
        decidedBy: REVIEWER,
      }),
    ).toThrow(TestSpecificationInvariantViolation);
    const conflict = new TestSpecificationConflictError("conflict");
    expect(conflict.code).toBe("CONFLICT");
  });

  it("covers policy service supersession and version helpers", () => {
    SpecificationPolicyService.runSupersedePolicies("approved", "tsp_1", "tsp_2");
    expect(() =>
      SpecificationPolicyService.runSupersedePolicies("draft", "tsp_1", "tsp_2"),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      SpecificationPolicyService.runSupersedePolicies("approved", "tsp_1", "tsp_1"),
    ).toThrow(TestSpecificationInvariantViolation);
    SpecificationPolicyService.runEditPolicies("draft");
    expect(() => SpecificationPolicyService.runEditPolicies("approved")).toThrow(
      TestSpecificationInvariantViolation,
    );
    SpecificationPolicyService.runPriorityPolicy("high");
    SpecificationPolicyService.runRiskPolicy("r1", "summary");
    SpecificationPolicyService.runDependencyPolicy("d1", "summary");

    const approved = toApproved();
    SpecificationVersionService.assertAuthoritative(approved.record);
    expect(SpecificationVersionService.latestApprovedLabel([])).toBeUndefined();
    expect(
      SpecificationVersionService.latestApprovedLabel([
        createSpecificationRecord({
          id: "tsp_a",
          number: "TS-A",
          title: "A",
          description: "A",
          objective: "A",
          scope: "A",
          type: "web",
          classification: "c",
          owner: "o",
          author: "a",
          majorVersion: 1,
          minorVersion: 0,
        }),
      ]),
    ).toBeUndefined();

    const bumped = withRecordVersion(
      approved.record,
      createSpecificationVersion(2, 0),
    );
    expect(bumped.version.label).toBe("2.0");
  });

  it("covers remaining value-object and policy branches", () => {
    expect(createSpecificationReferenceKind("trace_link")).toBe("trace_link");
    expect(() => createSpecificationReferenceKind("nope")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(
      createSpecificationReference({
        kind: "external_reference",
        artefactId: "ext_1",
        owningDomain: "cross",
        label: "External",
      }).label,
    ).toBe("External");
    expect(() =>
      assertNotSelfReference(createSpecificationId("tsp_1"), {
        kind: "requirement",
        artefactId: "tsp_1",
      }),
    ).toThrow(TestSpecificationInvariantViolation);

    expect(() => ApprovalPolicy.assertCanReject("draft")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => ReviewPolicy.assertReviewerPresent(undefined)).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() =>
      RelationshipPolicy.assertReferencePresent(undefined),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() => PriorityPolicy.assertKnownPriority("urgent")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() => RiskPolicy.assertRiskIdentity(" ", "s")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() =>
      ImmutabilityPolicy.assertNotSupersededOrRetired("superseded"),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      ImmutabilityPolicy.assertApprovedImmutableForContent("approved"),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      LifecyclePolicy.assertRejectedCannotBecomeApproved("rejected", "approved"),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() => LifecyclePolicy.assertEditable("under_review")).toThrow(
      TestSpecificationInvariantViolation,
    );
    expect(() =>
      VersionPolicy.assertBump(
        createSpecificationVersion(1, 0),
        createSpecificationVersion(3, 0),
        "major",
      ),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() => OwnershipPolicy.assertTransferActor(" ")).toThrow(
      TestSpecificationInvariantViolation,
    );
  });

  it("updates all draft content facets and ownership guards", () => {
    const updated = updateSpecificationContent(
      baseCreate(),
      {
        description: "D2",
        objective: "O2",
        scope: "S2",
        type: "api",
        classification: "C2",
        preconditions: ["P"],
        postconditions: ["Q"],
        acceptanceCriteria: ["AC"],
        risks: [{ id: "r2", summary: "R2", severity: "low" }],
        dependencies: [{ id: "d2", summary: "D2", referenceKind: "verification", referenceId: "ver_9" }],
      },
      LATER,
      ACTOR,
    );
    expect(updated.record.description).toBe("D2");
    expect(updated.record.type).toBe("api");
    expect(updated.record.risks[0]?.severity).toBe("low");
    expect(updated.record.dependencies[0]?.referenceKind).toBe("verification");

    expect(() =>
      transferSpecificationOwnership(baseCreate(), "owner_x", LATER, " "),
    ).toThrow(TestSpecificationInvariantViolation);
    expect(() =>
      updateSpecificationContent(baseCreate(), { title: "X" }, LATER, " "),
    ).toThrow(TestSpecificationInvariantViolation);

    const meta = updateSpecificationMetadata(
      baseCreate(),
      { env: "lab" },
      LATER,
      ACTOR,
    );
    expect(meta.metadata.entries.env).toBe("lab");
  });

  it("returns under_review to draft and creates major successor", () => {
    const returned = returnSpecificationToDraft(toUnderReview(), LATER, ACTOR);
    expect(returned.record.status).toBe("draft");
    expect(returned.domainEvents[0]?.type).toBe("qep.specification.review.completed");

    const major = createSuccessorDraft(toApproved(), {
      id: "tsp_major",
      bump: "major",
      createdAt: LATER,
      createdBy: ACTOR,
      correlationId: "corr_major",
      title: "Major rewrite",
    });
    expect(major.record.version.label).toBe("1.0");
    expect(major.record.title).toBe("Major rewrite");
  });
});
