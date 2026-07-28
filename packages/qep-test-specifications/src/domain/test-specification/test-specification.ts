import { TestSpecificationInvariantViolation } from "../../shared/errors";
import {
  createSpecificationApproval,
  createReviewerAssignment,
  type SpecificationApproval,
} from "./specification-approval";
import {
  SpecificationApprovalService,
  SpecificationPolicyService,
  SpecificationVersionService,
} from "./specification-domain-service";
import {
  buildSpecificationApprovedEvent,
  buildSpecificationCancelledEvent,
  buildSpecificationCreatedEvent,
  buildSpecificationRejectedEvent,
  buildSpecificationRelationshipAddedEvent,
  buildSpecificationRelationshipRemovedEvent,
  buildSpecificationRetiredEvent,
  buildSpecificationReviewCompletedEvent,
  buildSpecificationReviewStartedEvent,
  buildSpecificationSupersededEvent,
  buildSpecificationUpdatedEvent,
  buildSpecificationWithdrawnEvent,
  type SpecificationDomainEvent,
} from "./specification-events";
import {
  appendSpecificationHistory,
  createEmptySpecificationHistory,
  type SpecificationHistory,
} from "./specification-history";
import { createSpecificationId, type SpecificationId } from "./specification-id";
import { assertSpecificationLifecycleTransition } from "./lifecycle-state";
import {
  createSpecificationMetadata,
  mergeSpecificationMetadata,
  type SpecificationMetadata,
} from "./specification-metadata";
import {
  assertUniqueRelationship,
  createSpecificationRelationship,
  findRelationshipById,
  type SpecificationRelationship,
} from "./specification-relationship";
import {
  createSpecificationRecord,
  withRecordStatus,
  withRecordSuccessor,
  type CreateSpecificationRecordInput,
  type SpecificationRecord,
} from "./specification-record";
import {
  createSpecificationAcceptanceCriteria,
  createSpecificationAuthor,
  createSpecificationClassification,
  createSpecificationComplexity,
  createSpecificationDependency,
  createSpecificationDescription,
  createSpecificationObjective,
  createSpecificationOwner,
  createSpecificationPostconditions,
  createSpecificationPreconditions,
  createSpecificationPriority,
  createSpecificationRisk,
  createSpecificationScope,
  createSpecificationTag,
  createSpecificationTimestamp,
  createSpecificationTitle,
  createSpecificationType,
  type SpecificationVersion,
} from "./value-objects";
import {
  ImmutabilityPolicy,
  LifecyclePolicy,
  OwnershipPolicy,
  RelationshipPolicy,
  SupersessionPolicy,
} from "./specification-policy";

/**
 * TestSpecification aggregate root — authoritative business domain for a
 * Test Specification (APZQEP-ENG-050A / ARCH-011).
 */
export type TestSpecification = {
  readonly record: SpecificationRecord;
  readonly metadata: SpecificationMetadata;
  readonly history: SpecificationHistory;
  readonly relationships: readonly SpecificationRelationship[];
  readonly approval?: SpecificationApproval;
  readonly tenantId: string;
  readonly revision: number;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly correlationId: string;
  readonly versionLineage: readonly string[];
  readonly reviewStartedAt?: string;
  readonly reviewStartedBy?: string;
  readonly withdrawnAt?: string;
  readonly cancelledAt?: string;
  readonly retiredAt?: string;
  readonly supersededAt?: string;
  readonly domainEvents: readonly SpecificationDomainEvent[];
};

export type CreateTestSpecificationInput = CreateSpecificationRecordInput & {
  readonly tenantId: string;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly correlationId: string;
  readonly metadata?: Readonly<Record<string, string>>;
};

function clearEvents(spec: TestSpecification): TestSpecification {
  return { ...spec, domainEvents: [] };
}

function eventInput(spec: TestSpecification, occurredAt: string) {
  return {
    tenantId: spec.tenantId,
    specificationId: spec.record.id,
    correlationId: spec.correlationId,
    occurredAt,
  };
}

function withChange(
  spec: TestSpecification,
  patch: Partial<TestSpecification> & { readonly record?: SpecificationRecord },
  changedAt: string,
  changedBy: string,
  historyKind: string,
  historySummary: string,
  events: readonly SpecificationDomainEvent[],
): TestSpecification {
  const at = createSpecificationTimestamp(changedAt);
  const by = changedBy.trim();
  if (!by) {
    throw new TestSpecificationInvariantViolation(
      "Specification change requires changedBy",
    );
  }
  return {
    ...spec,
    ...patch,
    revision: spec.revision + 1,
    updatedAt: at,
    updatedBy: by,
    history: appendSpecificationHistory(spec.history, {
      at,
      by,
      kind: historyKind,
      summary: historySummary,
    }),
    domainEvents: [...spec.domainEvents, ...events],
  };
}

function assertDraftEditable(spec: TestSpecification): void {
  SpecificationPolicyService.runEditPolicies(spec.record.status);
}

/**
 * Creates a Test Specification aggregate exclusively in `draft`.
 */
export function createTestSpecification(
  input: CreateTestSpecificationInput,
): TestSpecification {
  const tenantId = input.tenantId.trim();
  const createdAt = createSpecificationTimestamp(input.createdAt);
  const createdBy = input.createdBy.trim();
  const correlationId = input.correlationId.trim();
  if (!tenantId || !createdBy || !correlationId) {
    throw new TestSpecificationInvariantViolation(
      "Specification requires tenantId, createdBy, and correlationId",
    );
  }

  SpecificationPolicyService.runCreatePolicies({
    id: input.id,
    title: input.title,
    objective: input.objective,
    owner: input.owner,
    classification: input.classification,
  });

  const record = createSpecificationRecord(input);
  const metadata = createSpecificationMetadata(input.metadata);
  const history = appendSpecificationHistory(createEmptySpecificationHistory(), {
    at: createdAt,
    by: createdBy,
    kind: "created",
    summary: `Specification ${record.number} created as draft ${record.version.label}`,
  });

  const createdEvent = buildSpecificationCreatedEvent({
    tenantId,
    specificationId: record.id,
    correlationId,
    occurredAt: createdAt,
    status: "draft",
    version: record.version,
  });

  return {
    record,
    metadata,
    history,
    relationships: [],
    tenantId,
    revision: 1,
    createdAt,
    createdBy,
    updatedAt: createdAt,
    updatedBy: createdBy,
    correlationId,
    versionLineage: [record.version.label],
    domainEvents: [createdEvent],
  };
}

export function startSpecificationReview(
  spec: TestSpecification,
  reviewerId: string,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  SpecificationApprovalService.assertCanStartReview(base.record.status);
  SpecificationApprovalService.assertReviewerPresent(reviewerId);
  assertSpecificationLifecycleTransition(base.record.status, "under_review");
  const occurredAt = createSpecificationTimestamp(at);
  const reviewer = createReviewerAssignment(reviewerId);
  return withChange(
    base,
    {
      record: {
        ...withRecordStatus(base.record, "under_review", false),
        reviewer,
      },
      reviewStartedAt: occurredAt,
      reviewStartedBy: by.trim(),
    },
    at,
    by,
    "review_started",
    `Specification review started by ${reviewer}`,
    [
      buildSpecificationReviewStartedEvent({
        ...eventInput(base, occurredAt),
        reviewerId: reviewer,
      }),
    ],
  );
}

export function returnSpecificationToDraft(
  spec: TestSpecification,
  at: string,
  by: string,
  comment?: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertSpecificationLifecycleTransition(base.record.status, "draft");
  LifecyclePolicy.assertRejectedCannotBecomeApproved(base.record.status, "draft");
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    {
      record: withRecordStatus(base.record, "draft", false),
      approval: undefined,
    },
    at,
    by,
    "returned_to_draft",
    comment?.trim() || "Specification returned to draft",
    [
      buildSpecificationReviewCompletedEvent({
        ...eventInput(base, occurredAt),
        decision: "returned",
      }),
    ],
  );
}

export function approveSpecification(
  spec: TestSpecification,
  at: string,
  by: string,
  approvalComment?: string,
): TestSpecification {
  const base = clearEvents(spec);
  SpecificationPolicyService.runApprovePolicies(base.record.status);
  assertSpecificationLifecycleTransition(base.record.status, "approved");
  const occurredAt = createSpecificationTimestamp(at);
  const approval = createSpecificationApproval({
    decision: "approved",
    decidedAt: occurredAt,
    decidedBy: by,
    approvalComment,
  });
  return withChange(
    base,
    {
      record: withRecordStatus(base.record, "approved", true),
      approval,
    },
    at,
    by,
    "approved",
    `Specification approved as authoritative ${base.record.version.label}`,
    [
      buildSpecificationReviewCompletedEvent({
        ...eventInput(base, occurredAt),
        decision: "approved",
      }),
      buildSpecificationApprovedEvent({
        ...eventInput(base, occurredAt),
        version: base.record.version,
      }),
    ],
  );
}

export function rejectSpecification(
  spec: TestSpecification,
  at: string,
  by: string,
  reviewComment: string,
): TestSpecification {
  const base = clearEvents(spec);
  SpecificationPolicyService.runRejectPolicies(base.record.status);
  assertSpecificationLifecycleTransition(base.record.status, "rejected");
  const occurredAt = createSpecificationTimestamp(at);
  const approval = createSpecificationApproval({
    decision: "rejected",
    decidedAt: occurredAt,
    decidedBy: by,
    reviewComment,
  });
  return withChange(
    base,
    {
      record: withRecordStatus(base.record, "rejected", false),
      approval,
    },
    at,
    by,
    "rejected",
    "Specification rejected",
    [
      buildSpecificationReviewCompletedEvent({
        ...eventInput(base, occurredAt),
        decision: "rejected",
      }),
      buildSpecificationRejectedEvent(eventInput(base, occurredAt)),
    ],
  );
}

export function withdrawSpecification(
  spec: TestSpecification,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertSpecificationLifecycleTransition(base.record.status, "withdrawn");
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    {
      record: withRecordStatus(base.record, "withdrawn", false),
      withdrawnAt: occurredAt,
    },
    at,
    by,
    "withdrawn",
    "Specification withdrawn",
    [buildSpecificationWithdrawnEvent(eventInput(base, occurredAt))],
  );
}

export function cancelSpecification(
  spec: TestSpecification,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertSpecificationLifecycleTransition(base.record.status, "cancelled");
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    {
      record: withRecordStatus(base.record, "cancelled", false),
      cancelledAt: occurredAt,
    },
    at,
    by,
    "cancelled",
    "Specification cancelled",
    [buildSpecificationCancelledEvent(eventInput(base, occurredAt))],
  );
}

export function retireSpecification(
  spec: TestSpecification,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertSpecificationLifecycleTransition(base.record.status, "retired");
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    {
      record: withRecordStatus(base.record, "retired", false),
      retiredAt: occurredAt,
    },
    at,
    by,
    "retired",
    "Specification retired",
    [buildSpecificationRetiredEvent(eventInput(base, occurredAt))],
  );
}

export function supersedeSpecification(
  spec: TestSpecification,
  successorSpecificationId: string,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  const successor = createSpecificationId(successorSpecificationId);
  SupersessionPolicy.assertCanSupersede(base.record.status);
  SupersessionPolicy.assertNotSelf(base.record.id, successor);
  assertSpecificationLifecycleTransition(base.record.status, "superseded");
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    {
      record: withRecordSuccessor(
        withRecordStatus(base.record, "superseded", false),
        successor,
      ),
      supersededAt: occurredAt,
    },
    at,
    by,
    "superseded",
    `Specification superseded by ${successor}`,
    [
      buildSpecificationSupersededEvent({
        ...eventInput(base, occurredAt),
        successorSpecificationId: successor,
      }),
    ],
  );
}

/**
 * Creates a successor draft from an approved Specification (does not mutate the predecessor).
 * Caller is responsible for superseding the predecessor with the returned aggregate id.
 */
export function createSuccessorDraft(
  predecessor: TestSpecification,
  input: {
    readonly id: string;
    readonly bump: "major" | "minor";
    readonly createdAt: string;
    readonly createdBy: string;
    readonly correlationId: string;
    readonly title?: string;
    readonly description?: string;
    readonly objective?: string;
    readonly comparisonNotes?: string;
  },
): TestSpecification {
  if (predecessor.record.status !== "approved") {
    throw new TestSpecificationInvariantViolation(
      "Successor drafts may only be created from Approved Specifications",
    );
  }
  const nextVersion = SpecificationVersionService.bump(
    predecessor.record.version,
    input.bump,
  );
  SpecificationVersionService.assertUnique(predecessor.versionLineage, nextVersion);

  return createTestSpecification({
    id: input.id,
    tenantId: predecessor.tenantId,
    number: predecessor.record.number,
    title: input.title ?? predecessor.record.title,
    description: input.description ?? predecessor.record.description,
    objective: input.objective ?? predecessor.record.objective,
    scope: predecessor.record.scope,
    type: predecessor.record.type,
    priority: predecessor.record.priority,
    complexity: predecessor.record.complexity,
    classification: predecessor.record.classification,
    owner: predecessor.record.owner,
    author: predecessor.record.author,
    majorVersion: nextVersion.major,
    minorVersion: nextVersion.minor,
    preconditions: predecessor.record.preconditions.items,
    postconditions: predecessor.record.postconditions.items,
    acceptanceCriteria: predecessor.record.acceptanceCriteria.items,
    risks: predecessor.record.risks,
    dependencies: predecessor.record.dependencies,
    tags: predecessor.record.tags,
    predecessorSpecificationId: predecessor.record.id,
    comparisonNotes:
      input.comparisonNotes ??
      `Successor of ${predecessor.record.id} ${predecessor.record.version.label}`,
    createdAt: input.createdAt,
    createdBy: input.createdBy,
    correlationId: input.correlationId,
    metadata: { ...predecessor.metadata.entries },
  });
}

export type UpdateSpecificationContentInput = {
  readonly title?: string;
  readonly description?: string;
  readonly objective?: string;
  readonly scope?: string;
  readonly type?: string;
  readonly priority?: string;
  readonly complexity?: string;
  readonly classification?: string;
  readonly preconditions?: readonly string[];
  readonly postconditions?: readonly string[];
  readonly acceptanceCriteria?: readonly string[];
  readonly risks?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly severity?: string;
  }[];
  readonly dependencies?: readonly {
    readonly id: string;
    readonly summary: string;
    readonly referenceKind?: string;
    readonly referenceId?: string;
  }[];
  readonly tags?: readonly string[];
};

export function updateSpecificationContent(
  spec: TestSpecification,
  patch: UpdateSpecificationContentInput,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertDraftEditable(base);
  ImmutabilityPolicy.assertApprovedImmutableForContent(base.record.status);

  const next: SpecificationRecord = {
    ...base.record,
    ...(patch.title !== undefined
      ? { title: createSpecificationTitle(patch.title) }
      : {}),
    ...(patch.description !== undefined
      ? { description: createSpecificationDescription(patch.description) }
      : {}),
    ...(patch.objective !== undefined
      ? { objective: createSpecificationObjective(patch.objective) }
      : {}),
    ...(patch.scope !== undefined
      ? { scope: createSpecificationScope(patch.scope) }
      : {}),
    ...(patch.type !== undefined ? { type: createSpecificationType(patch.type) } : {}),
    ...(patch.priority !== undefined
      ? { priority: createSpecificationPriority(patch.priority) }
      : {}),
    ...(patch.complexity !== undefined
      ? { complexity: createSpecificationComplexity(patch.complexity) }
      : {}),
    ...(patch.classification !== undefined
      ? { classification: createSpecificationClassification(patch.classification) }
      : {}),
    ...(patch.preconditions !== undefined
      ? { preconditions: createSpecificationPreconditions(patch.preconditions) }
      : {}),
    ...(patch.postconditions !== undefined
      ? { postconditions: createSpecificationPostconditions(patch.postconditions) }
      : {}),
    ...(patch.acceptanceCriteria !== undefined
      ? {
          acceptanceCriteria: createSpecificationAcceptanceCriteria(
            patch.acceptanceCriteria,
          ),
        }
      : {}),
    ...(patch.risks !== undefined
      ? { risks: patch.risks.map(createSpecificationRisk) }
      : {}),
    ...(patch.dependencies !== undefined
      ? { dependencies: patch.dependencies.map(createSpecificationDependency) }
      : {}),
    ...(patch.tags !== undefined
      ? { tags: patch.tags.map(createSpecificationTag) }
      : {}),
  };

  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    { record: next },
    at,
    by,
    "updated",
    "Specification content updated",
    [buildSpecificationUpdatedEvent(eventInput(base, occurredAt))],
  );
}

export function updateSpecificationMetadata(
  spec: TestSpecification,
  patch: Readonly<Record<string, string>>,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertDraftEditable(base);
  const metadata = mergeSpecificationMetadata(base.metadata, patch);
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    { metadata },
    at,
    by,
    "metadata_changed",
    "Specification metadata updated",
    [buildSpecificationUpdatedEvent(eventInput(base, occurredAt))],
  );
}

export function transferSpecificationOwnership(
  spec: TestSpecification,
  newOwner: string,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertDraftEditable(base);
  OwnershipPolicy.assertTransferActor(by);
  const owner = createSpecificationOwner(newOwner);
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    { record: { ...base.record, owner } },
    at,
    by,
    "ownership_transferred",
    `Specification ownership transferred to ${owner}`,
    [buildSpecificationUpdatedEvent(eventInput(base, occurredAt))],
  );
}

export function reassignSpecificationAuthor(
  spec: TestSpecification,
  newAuthor: string,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertDraftEditable(base);
  const author = createSpecificationAuthor(newAuthor);
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    { record: { ...base.record, author } },
    at,
    by,
    "author_changed",
    `Specification author set to ${author}`,
    [buildSpecificationUpdatedEvent(eventInput(base, occurredAt))],
  );
}

export function addSpecificationRelationship(
  spec: TestSpecification,
  input: {
    readonly id: string;
    readonly kind: string;
    readonly artefactId: string;
    readonly owningDomain?: string;
    readonly label?: string;
  },
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertDraftEditable(base);
  RelationshipPolicy.assertNotSelf(base.record.id, input.artefactId);
  const occurredAt = createSpecificationTimestamp(at);
  const relationship = createSpecificationRelationship({
    id: input.id,
    specificationId: base.record.id,
    kind: input.kind,
    artefactId: input.artefactId,
    owningDomain: input.owningDomain,
    label: input.label,
    createdAt: occurredAt,
    createdBy: by,
  });
  assertUniqueRelationship(base.relationships, relationship.reference);
  return withChange(
    base,
    { relationships: [...base.relationships, relationship] },
    at,
    by,
    "relationship_added",
    `Relationship added ${relationship.reference.kind}:${relationship.reference.artefactId}`,
    [
      buildSpecificationRelationshipAddedEvent({
        ...eventInput(base, occurredAt),
        referenceKind: relationship.reference.kind,
        artefactId: relationship.reference.artefactId,
      }),
    ],
  );
}

export function removeSpecificationRelationship(
  spec: TestSpecification,
  relationshipId: string,
  at: string,
  by: string,
): TestSpecification {
  const base = clearEvents(spec);
  assertDraftEditable(base);
  const existing = findRelationshipById(base.relationships, relationshipId);
  if (!existing) {
    throw new TestSpecificationInvariantViolation(
      `Specification relationship ${relationshipId} not found`,
    );
  }
  const occurredAt = createSpecificationTimestamp(at);
  return withChange(
    base,
    {
      relationships: base.relationships.filter((r) => r.id !== existing.id),
    },
    at,
    by,
    "relationship_removed",
    `Relationship removed ${existing.reference.kind}:${existing.reference.artefactId}`,
    [
      buildSpecificationRelationshipRemovedEvent({
        ...eventInput(base, occurredAt),
        referenceKind: existing.reference.kind,
        artefactId: existing.reference.artefactId,
      }),
    ],
  );
}

export function getSpecificationId(spec: TestSpecification): SpecificationId {
  return spec.record.id;
}

export function getSpecificationVersion(spec: TestSpecification): SpecificationVersion {
  return spec.record.version;
}

export function isAuthoritativeSpecification(spec: TestSpecification): boolean {
  return spec.record.isAuthoritative && spec.record.status === "approved";
}
