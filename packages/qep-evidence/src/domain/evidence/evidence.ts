import {
  EvidenceConcurrencyError,
  EvidenceConflictError,
  EvidenceIntegrityFailedError,
  EvidencePreconditionError,
} from "../../shared/errors";
import { EvidenceIntegrityService, EvidenceRetentionService } from "./domain-services";
import {
  buildEvidenceApprovedEvent,
  buildEvidenceArchivedEvent,
  buildEvidenceAssociatedEvent,
  buildEvidenceCapturedEvent,
  buildEvidenceClassifiedEvent,
  buildEvidenceContentReplacedEvent,
  buildEvidenceDisposedEvent,
  buildEvidenceIntegrityContentMissingEvent,
  buildEvidenceIntegrityEstablishedEvent,
  buildEvidenceIntegrityFailedEvent,
  buildEvidenceIntegrityVerifiedEvent,
  buildEvidenceLegalHoldAppliedEvent,
  buildEvidenceLegalHoldReleasedEvent,
  buildEvidenceQuarantinedEvent,
  buildEvidenceRejectedEvent,
  buildEvidenceRetainedEvent,
  buildEvidenceReviewRequestedEvent,
  buildEvidenceSealedEvent,
  buildEvidenceValidatedEvent,
  type EvidenceDomainEvent,
  type EventBase,
  type StatusChange,
} from "./events";
import {
  appendEvidenceHistory,
  createEmptyEvidenceHistory,
  type EvidenceHistory,
} from "./history";
import {
  ContentMutationPolicy,
  ContentPolicy,
  DisposePolicy,
  HoldPolicy,
  LifecyclePolicy,
  ReasonPolicy,
  SealPolicy,
} from "./policies";
import {
  createContentHash,
  createEvidenceClassification,
  createEvidenceContent,
  createEvidenceId,
  createEvidenceIntegrity,
  createEvidenceMetadata,
  createEvidenceOwnership,
  createEvidencePolicyReference,
  createEvidenceReference,
  createEvidenceRetention,
  createEvidenceSource,
  type EvidenceClassification,
  type EvidenceContent,
  type EvidenceIntegrity,
  type EvidenceMetadata,
  type EvidenceOwnership,
  type EvidencePolicyReference,
  type EvidenceReference,
  type EvidenceRetention,
  type EvidenceSource,
  type EvidenceStatus,
  type HashAlgorithm,
} from "./value-objects";
import {
  createDefaultLifecycleGovernance,
  type EvidenceLifecycleGovernance,
  type LifecycleGovernanceState,
} from "./lifecycle-governance";

export type EvidenceVersion = {
  readonly version: number;
  readonly content: EvidenceContent;
  readonly integrity: EvidenceIntegrity;
  readonly replacedAt: string;
  readonly replacedBy: string;
};

export type EvidenceDisposition = {
  readonly dispositionedAt: string;
  readonly dispositionedBy: string;
  readonly reason: string;
  readonly method: string;
};

export type EvidenceProvenanceEvent = {
  readonly kind: string;
  readonly occurredAt: string;
  readonly actorId: string;
  readonly detail?: string;
};

export type Evidence = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly status: EvidenceStatus;
  readonly source: EvidenceSource;
  readonly classification: EvidenceClassification | null;
  readonly content: EvidenceContent | null;
  readonly integrity: EvidenceIntegrity | null;
  readonly ownership: EvidenceOwnership;
  readonly retention: EvidenceRetention;
  readonly metadata: EvidenceMetadata;
  readonly policyReferences: readonly EvidencePolicyReference[];
  readonly version: number;
  readonly versions: readonly EvidenceVersion[];
  readonly disposition: EvidenceDisposition | null;
  readonly provenance: readonly EvidenceProvenanceEvent[];
  readonly relationshipIds: readonly string[];
  readonly sealedAt?: string;
  readonly sealedBy?: string;
  /** S06 — authoritative lifecycle governance state (catalogue). */
  readonly lifecycleGovernance: EvidenceLifecycleGovernance;
  readonly revision: number;
  readonly history: EvidenceHistory;
  readonly createdAt: string;
  readonly createdBy: string;
  readonly updatedAt: string;
  readonly updatedBy: string;
  readonly uncommittedEvents: readonly EvidenceDomainEvent[];
};

export type CommandContext = {
  readonly actorId: string;
  readonly changedAt: string;
  readonly expectedRevision?: number;
  readonly correlationId?: string;
};

export type CaptureEvidenceInput = {
  readonly id: string;
  readonly tenantId: string;
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly ownerId: string;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly source: { readonly kind: string; readonly sourceSystemId?: string };
  readonly content: {
    readonly mediaType: string;
    readonly byteSize: number;
    readonly contentHash: string;
    readonly hashAlgorithm?: string;
    readonly storageLocator: string;
  };
  readonly retentionClass?: string;
  readonly retainUntil?: string;
  readonly metadata?: {
    readonly title?: string;
    readonly description?: string;
    readonly tags?: readonly string[];
  };
  readonly classification?: {
    readonly category: string;
    readonly sensitivityLabel?: string;
  };
  readonly correlationId?: string;
};

function assertRevision(evidence: Evidence, expected?: number): void {
  if (expected !== undefined && expected !== evidence.revision) {
    throw new EvidenceConcurrencyError(evidence.id, expected, evidence.revision);
  }
}

function beginCommand(evidence: Evidence, ctx: CommandContext): Evidence {
  assertRevision(evidence, ctx.expectedRevision);
  return { ...evidence, uncommittedEvents: [] };
}

function eventBase(evidence: Evidence, ctx: CommandContext): EventBase {
  return {
    aggregateId: evidence.id,
    tenantId: evidence.tenantId,
    occurredAt: ctx.changedAt,
    actorId: ctx.actorId,
    correlationId: ctx.correlationId,
    revision: evidence.revision + 1,
  };
}

function appendProvenance(
  evidence: Evidence,
  kind: string,
  ctx: CommandContext,
  detail?: string,
): readonly EvidenceProvenanceEvent[] {
  return [
    ...evidence.provenance,
    { kind, occurredAt: ctx.changedAt, actorId: ctx.actorId, detail },
  ];
}

function withMutation(
  evidence: Evidence,
  ctx: CommandContext,
  patch: Partial<Evidence>,
  command: string,
  summary: string,
  events: readonly EvidenceDomainEvent[],
  statusChange?: StatusChange,
): Evidence {
  return {
    ...evidence,
    ...patch,
    revision: evidence.revision + 1,
    updatedAt: ctx.changedAt,
    updatedBy: ctx.actorId,
    history: appendEvidenceHistory(evidence.history, {
      command,
      actorId: ctx.actorId,
      occurredAt: ctx.changedAt,
      summary,
      fromStatus: statusChange?.from,
      toStatus: statusChange?.to,
    }),
    uncommittedEvents: [...evidence.uncommittedEvents, ...events],
  };
}

export function captureEvidence(input: CaptureEvidenceInput): Evidence {
  const id = createEvidenceId(input.id);
  const ownership = createEvidenceOwnership({
    tenantId: input.tenantId,
    projectId: input.projectId,
    workspaceId: input.workspaceId,
    createdBy: input.createdBy,
    ownerId: input.ownerId,
  });
  const content = createEvidenceContent(input.content);
  const integrity = EvidenceIntegrityService.fromContent(content);
  const source = createEvidenceSource(input.source);
  EvidenceRetentionService.assertRetainUntilShape(input.retainUntil);
  const retention = createEvidenceRetention({
    retentionClass: input.retentionClass ?? "standard",
    retainUntil: input.retainUntil,
    legalHold: false,
  });
  const classification = input.classification
    ? createEvidenceClassification(input.classification)
    : null;
  const metadata = createEvidenceMetadata(input.metadata);

  const base: EventBase = {
    aggregateId: id,
    tenantId: ownership.tenantId,
    occurredAt: input.createdAt,
    actorId: ownership.createdBy,
    correlationId: input.correlationId,
    revision: 1,
  };

  return {
    id,
    tenantId: ownership.tenantId,
    projectId: ownership.projectId,
    workspaceId: ownership.workspaceId,
    status: "captured",
    source,
    classification,
    content,
    integrity,
    ownership,
    retention,
    metadata,
    policyReferences: [],
    version: 1,
    versions: [],
    disposition: null,
    provenance: [
      {
        kind: "created",
        occurredAt: input.createdAt,
        actorId: ownership.createdBy,
      },
    ],
    relationshipIds: [],
    lifecycleGovernance: createDefaultLifecycleGovernance({
      retentionClass: retention.retentionClass,
      retentionUntil: retention.retainUntil,
      legalHold: retention.legalHold,
    }),
    revision: 1,
    history: appendEvidenceHistory(createEmptyEvidenceHistory(), {
      command: "captureEvidence",
      actorId: ownership.createdBy,
      occurredAt: input.createdAt,
      summary: "Evidence captured",
      toStatus: "captured",
    }),
    createdAt: input.createdAt,
    createdBy: ownership.createdBy,
    updatedAt: input.createdAt,
    updatedBy: ownership.createdBy,
    uncommittedEvents: [
      buildEvidenceCapturedEvent(base, {
        projectId: ownership.projectId,
        source: source.kind,
        contentHash: content.contentHash,
      }),
    ],
  };
}

export function validateEvidence(evidence: Evidence, ctx: CommandContext): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertStatus(current.status, "captured", "validateEvidence");
  ContentPolicy.assertPresent(current.content, "validateEvidence");
  if (!current.integrity?.contentHash) {
    throw new EvidencePreconditionError("validateEvidence requires integrity hash");
  }
  return withMutation(
    current,
    ctx,
    {
      status: "validated",
      provenance: appendProvenance(current, "validated", ctx),
    },
    "validateEvidence",
    "Evidence validated",
    [buildEvidenceValidatedEvent(eventBase(current, ctx))],
    { from: "captured", to: "validated" },
  );
}

export function classifyEvidence(
  evidence: Evidence,
  ctx: CommandContext,
  input: { readonly category: string; readonly sensitivityLabel?: string },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertStatus(current.status, "validated", "classifyEvidence");
  const classification = createEvidenceClassification(input);
  return withMutation(
    current,
    ctx,
    {
      status: "classified",
      classification,
      provenance: appendProvenance(current, "classified", ctx, classification.category),
    },
    "classifyEvidence",
    "Evidence classified",
    [buildEvidenceClassifiedEvent(eventBase(current, ctx), classification.category)],
    { from: "validated", to: "classified" },
  );
}

/**
 * Update descriptive metadata only. Does not alter status, content, or integrity.
 */
export function updateEvidenceMetadata(
  evidence: Evidence,
  ctx: CommandContext,
  input: {
    readonly title?: string;
    readonly description?: string;
    readonly tags?: readonly string[];
  },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertNotTerminal(current.status, "updateEvidenceMetadata");
  const metadata = createEvidenceMetadata({
    title: input.title !== undefined ? input.title : current.metadata.title,
    description:
      input.description !== undefined
        ? input.description
        : current.metadata.description,
    tags: input.tags !== undefined ? input.tags : current.metadata.tags,
  });
  return withMutation(
    current,
    ctx,
    {
      metadata,
      provenance: appendProvenance(current, "metadata_updated", ctx),
    },
    "updateEvidenceMetadata",
    "Evidence metadata updated",
    [],
  );
}

export function associateEvidence(
  evidence: Evidence,
  ctx: CommandContext,
  input: {
    readonly relationshipId: string;
    readonly targetCapability: string;
    readonly targetId: string;
    readonly relationType: string;
  },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertOneOf(
    current.status,
    ["classified", "associated", "approved", "sealed", "retained"],
    "associateEvidence",
  );
  LifecyclePolicy.assertNotTerminal(current.status, "associateEvidence");
  const relationshipIds = current.relationshipIds.includes(input.relationshipId)
    ? current.relationshipIds
    : [...current.relationshipIds, input.relationshipId];
  const nextStatus: EvidenceStatus =
    current.status === "classified" ? "associated" : current.status;
  const statusChange =
    nextStatus !== current.status
      ? { from: current.status, to: nextStatus }
      : undefined;
  return withMutation(
    current,
    ctx,
    {
      status: nextStatus,
      relationshipIds,
      provenance: appendProvenance(current, "associated", ctx, input.targetId),
    },
    "associateEvidence",
    "Evidence associated",
    [
      buildEvidenceAssociatedEvent(eventBase(current, ctx), {
        relationshipId: input.relationshipId,
        targetCapability: input.targetCapability,
        targetId: input.targetId,
        relationType: input.relationType,
      }),
    ],
    statusChange,
  );
}

export function requestReview(evidence: Evidence, ctx: CommandContext): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertOneOf(
    current.status,
    ["classified", "associated"],
    "requestReview",
  );
  return withMutation(
    current,
    ctx,
    {
      status: "in_review",
      provenance: appendProvenance(current, "review_requested", ctx),
    },
    "requestReview",
    "Evidence review requested",
    [buildEvidenceReviewRequestedEvent(eventBase(current, ctx))],
    { from: current.status, to: "in_review" },
  );
}

export function approveEvidence(evidence: Evidence, ctx: CommandContext): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertStatus(current.status, "in_review", "approveEvidence");
  return withMutation(
    current,
    ctx,
    {
      status: "approved",
      provenance: appendProvenance(current, "approved", ctx),
    },
    "approveEvidence",
    "Evidence approved",
    [buildEvidenceApprovedEvent(eventBase(current, ctx))],
    { from: "in_review", to: "approved" },
  );
}

export function rejectEvidence(
  evidence: Evidence,
  ctx: CommandContext,
  input: { readonly reason: string },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertStatus(current.status, "in_review", "rejectEvidence");
  const reason = ReasonPolicy.assertReason(input.reason, "rejectEvidence");
  return withMutation(
    current,
    ctx,
    {
      status: "rejected",
      provenance: appendProvenance(current, "rejected", ctx, reason),
    },
    "rejectEvidence",
    "Evidence rejected",
    [buildEvidenceRejectedEvent(eventBase(current, ctx), reason)],
    { from: "in_review", to: "rejected" },
  );
}

export function quarantineEvidence(
  evidence: Evidence,
  ctx: CommandContext,
  input: { readonly reason: string },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertNotTerminal(current.status, "quarantineEvidence");
  if (current.status === "sealed" || current.status === "disposed") {
    throw new EvidenceConflictError(
      "quarantineEvidence is not allowed after seal/dispose",
    );
  }
  const reason = ReasonPolicy.assertReason(input.reason, "quarantineEvidence");
  return withMutation(
    current,
    ctx,
    {
      status: "quarantined",
      lifecycleGovernance: {
        ...current.lifecycleGovernance,
        state: "RESTRICTED",
      },
      provenance: appendProvenance(current, "quarantined", ctx, reason),
    },
    "quarantineEvidence",
    "Evidence quarantined",
    [buildEvidenceQuarantinedEvent(eventBase(current, ctx), reason)],
    { from: current.status, to: "quarantined" },
  );
}

export function sealEvidence(evidence: Evidence, ctx: CommandContext): Evidence {
  const current = beginCommand(evidence, ctx);
  const integrity = current.integrity;
  if (!integrity) {
    throw new EvidencePreconditionError("sealEvidence requires integrity metadata");
  }
  SealPolicy.assertCanSeal(current.status, integrity);
  ContentPolicy.assertPresent(current.content, "sealEvidence");
  const sealedIntegrity = EvidenceIntegrityService.seal(integrity);
  return withMutation(
    current,
    ctx,
    {
      status: "sealed",
      integrity: sealedIntegrity,
      sealedAt: ctx.changedAt,
      sealedBy: ctx.actorId,
      provenance: appendProvenance(current, "sealed", ctx),
    },
    "sealEvidence",
    "Evidence sealed",
    [buildEvidenceSealedEvent(eventBase(current, ctx))],
    { from: "approved", to: "sealed" },
  );
}

export function replaceContent(
  evidence: Evidence,
  ctx: CommandContext,
  input: {
    readonly mediaType: string;
    readonly byteSize: number;
    readonly contentHash: string;
    readonly hashAlgorithm?: string;
    readonly storageLocator: string;
  },
): Evidence {
  const current = beginCommand(evidence, ctx);
  ContentMutationPolicy.assertMutable(
    current.status,
    current.integrity?.sealed === true,
    "replaceContent",
  );
  const previousContent = ContentPolicy.assertPresent(
    current.content,
    "replaceContent",
  );
  const previousIntegrity = current.integrity;
  if (!previousIntegrity) {
    throw new EvidencePreconditionError("replaceContent requires prior integrity");
  }
  const nextContent = createEvidenceContent(input);
  const nextIntegrity = EvidenceIntegrityService.fromContent(nextContent);
  const nextVersion = current.version + 1;
  const versions: EvidenceVersion[] = [
    ...current.versions,
    {
      version: current.version,
      content: previousContent,
      integrity: previousIntegrity,
      replacedAt: ctx.changedAt,
      replacedBy: ctx.actorId,
    },
  ];
  return withMutation(
    current,
    ctx,
    {
      content: nextContent,
      integrity: nextIntegrity,
      version: nextVersion,
      versions,
      provenance: appendProvenance(
        current,
        "content_replaced",
        ctx,
        String(nextVersion),
      ),
    },
    "replaceContent",
    "Evidence content replaced",
    [buildEvidenceContentReplacedEvent(eventBase(current, ctx), nextVersion)],
  );
}

export function applyLegalHold(
  evidence: Evidence,
  ctx: CommandContext,
  input: { readonly reason: string },
): Evidence {
  const current = beginCommand(evidence, ctx);
  HoldPolicy.assertCanApply(current.status, input.reason);
  if (current.retention.legalHold) {
    throw new EvidenceConflictError("legalHold is already applied");
  }
  const reason = ReasonPolicy.assertReason(input.reason, "applyLegalHold");
  const retention = createEvidenceRetention({
    retentionClass: current.retention.retentionClass,
    retainUntil: current.retention.retainUntil,
    legalHold: true,
    holdReason: reason,
  });
  return withMutation(
    current,
    ctx,
    {
      retention,
      lifecycleGovernance: {
        ...current.lifecycleGovernance,
        holdStatus: "HELD",
      },
      provenance: appendProvenance(current, "legal_hold_applied", ctx, reason),
    },
    "applyLegalHold",
    "Legal hold applied",
    [buildEvidenceLegalHoldAppliedEvent(eventBase(current, ctx), reason)],
  );
}

export function releaseLegalHold(evidence: Evidence, ctx: CommandContext): Evidence {
  const current = beginCommand(evidence, ctx);
  HoldPolicy.assertCanRelease(current.status, current.retention.legalHold);
  const retention = createEvidenceRetention({
    retentionClass: current.retention.retentionClass,
    retainUntil: current.retention.retainUntil,
    legalHold: false,
  });
  return withMutation(
    current,
    ctx,
    {
      retention,
      lifecycleGovernance: {
        ...current.lifecycleGovernance,
        holdStatus: "NOT_HELD",
      },
      provenance: appendProvenance(current, "legal_hold_released", ctx),
    },
    "releaseLegalHold",
    "Legal hold released",
    [buildEvidenceLegalHoldReleasedEvent(eventBase(current, ctx))],
  );
}

export function markRetained(evidence: Evidence, ctx: CommandContext): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertOneOf(current.status, ["approved", "sealed"], "markRetained");
  return withMutation(
    current,
    ctx,
    {
      status: "retained",
      provenance: appendProvenance(current, "retained", ctx),
    },
    "markRetained",
    "Evidence retained",
    [buildEvidenceRetainedEvent(eventBase(current, ctx))],
    { from: current.status, to: "retained" },
  );
}

export function archiveEvidence(evidence: Evidence, ctx: CommandContext): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertOneOf(
    current.status,
    ["approved", "sealed", "retained"],
    "archiveEvidence",
  );
  return withMutation(
    current,
    ctx,
    {
      status: "archived",
      lifecycleGovernance: {
        ...current.lifecycleGovernance,
        state: "ARCHIVED",
        archivedAt: ctx.changedAt,
        archivedBy: ctx.actorId,
        archiveReason: "archiveEvidence",
      },
      provenance: appendProvenance(current, "archived", ctx),
    },
    "archiveEvidence",
    "Evidence archived",
    [buildEvidenceArchivedEvent(eventBase(current, ctx))],
    { from: current.status, to: "archived" },
  );
}

export function disposeEvidence(
  evidence: Evidence,
  ctx: CommandContext,
  input: {
    readonly reason: string;
    readonly method?: string;
    readonly confirm: boolean;
  },
): Evidence {
  const current = beginCommand(evidence, ctx);
  if (!input.confirm) {
    throw new EvidencePreconditionError("disposeEvidence requires confirm=true");
  }
  DisposePolicy.assertCanDispose({
    status: current.status,
    legalHold: current.retention.legalHold,
    retainUntil: current.retention.retainUntil,
    now: ctx.changedAt,
    reason: input.reason,
  });
  const reason = ReasonPolicy.assertReason(input.reason, "disposeEvidence");
  const disposition: EvidenceDisposition = {
    dispositionedAt: ctx.changedAt,
    dispositionedBy: ctx.actorId,
    reason,
    method: input.method?.trim() || "logical_deletion",
  };
  return withMutation(
    current,
    ctx,
    {
      status: "disposed",
      disposition,
      lifecycleGovernance: {
        ...current.lifecycleGovernance,
        state: "LOGICALLY_DELETED",
        logicallyDeletedAt: ctx.changedAt,
        logicallyDeletedBy: ctx.actorId,
        logicalDeleteReason: reason,
      },
      provenance: appendProvenance(current, "disposed", ctx, reason),
    },
    "disposeEvidence",
    "Evidence logically deleted",
    [buildEvidenceDisposedEvent(eventBase(current, ctx), reason)],
    { from: current.status, to: "disposed" },
  );
}

/**
 * Apply a governed lifecycle state transition (S06).
 * Does not delete content bytes. Does not bypass Dispose/Hold policies for
 * LOGICALLY_DELETED — callers must evaluate policy first.
 */
export function applyLifecycleGovernanceTransition(
  evidence: Evidence,
  ctx: CommandContext,
  input: {
    readonly targetState: LifecycleGovernanceState;
    readonly reason?: string;
    readonly successorEvidenceId?: string;
    readonly workflowStatus?: EvidenceStatus;
  },
): Evidence {
  const current = beginCommand(evidence, ctx);
  const governance: EvidenceLifecycleGovernance = {
    ...current.lifecycleGovernance,
    state: input.targetState,
    archiveEligibleAt:
      input.targetState === "ARCHIVE_ELIGIBLE"
        ? ctx.changedAt
        : current.lifecycleGovernance.archiveEligibleAt,
    archivedAt:
      input.targetState === "ARCHIVED"
        ? ctx.changedAt
        : current.lifecycleGovernance.archivedAt,
    archivedBy:
      input.targetState === "ARCHIVED"
        ? ctx.actorId
        : current.lifecycleGovernance.archivedBy,
    archiveReason:
      input.targetState === "ARCHIVED"
        ? input.reason
        : current.lifecycleGovernance.archiveReason,
    disposalEligibleAt:
      input.targetState === "DISPOSAL_ELIGIBLE"
        ? ctx.changedAt
        : current.lifecycleGovernance.disposalEligibleAt,
    supersededByEvidenceId:
      input.targetState === "SUPERSEDED"
        ? input.successorEvidenceId
        : current.lifecycleGovernance.supersededByEvidenceId,
    logicallyDeletedAt:
      input.targetState === "LOGICALLY_DELETED"
        ? ctx.changedAt
        : current.lifecycleGovernance.logicallyDeletedAt,
    logicallyDeletedBy:
      input.targetState === "LOGICALLY_DELETED"
        ? ctx.actorId
        : current.lifecycleGovernance.logicallyDeletedBy,
    logicalDeleteReason:
      input.targetState === "LOGICALLY_DELETED"
        ? input.reason
        : current.lifecycleGovernance.logicalDeleteReason,
  };

  let nextStatus: EvidenceStatus | undefined = input.workflowStatus;
  let nextDisposition: EvidenceDisposition | undefined;
  if (!nextStatus) {
    if (input.targetState === "RESTRICTED") nextStatus = "quarantined";
    else if (input.targetState === "ARCHIVED") nextStatus = "archived";
    else if (input.targetState === "LOGICALLY_DELETED") {
      nextStatus = "disposed";
      nextDisposition = {
        dispositionedAt: ctx.changedAt,
        dispositionedBy: ctx.actorId,
        reason: input.reason ?? "logical_deletion",
        method: "logical_deletion",
      };
    } else if (input.targetState === "ACTIVE" && current.status === "quarantined") {
      nextStatus = "classified";
    }
  }

  return withMutation(
    current,
    ctx,
    {
      lifecycleGovernance: governance,
      provenance: appendProvenance(
        current,
        `lifecycle_${input.targetState.toLowerCase()}`,
        ctx,
        input.reason,
      ),
      ...(nextStatus ? { status: nextStatus } : {}),
      ...(nextDisposition ? { disposition: nextDisposition } : {}),
    },
    "lifecycleTransition",
    `Lifecycle → ${input.targetState}`,
    [],
    nextStatus ? { from: current.status, to: nextStatus } : undefined,
  );
}

/**
 * Establish content integrity metadata from a hash computed outside Domain.
 * Idempotent when the same digest is already recorded. Does not replace a
 * differing established digest (Application must treat that as mismatch).
 */
export function establishIntegrity(
  evidence: Evidence,
  ctx: CommandContext,
  input: {
    readonly contentHash: string;
    readonly hashAlgorithm?: string;
    readonly byteSize?: number;
  },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertNotTerminal(current.status, "establishIntegrity");
  if (!current.content?.storageLocator) {
    throw new EvidencePreconditionError("establishIntegrity requires stored content");
  }

  const nextHash = createContentHash(
    input.contentHash,
    (input.hashAlgorithm as HashAlgorithm | undefined) ?? "sha256",
  );

  if (current.integrity) {
    if (current.integrity.contentHash === nextHash) {
      // Idempotent: same baseline — no duplicate record.
      return current;
    }
    throw new EvidenceIntegrityFailedError(
      "Integrity baseline already established with a different digest",
      {
        evidenceId: current.id,
        expectedDigest: current.integrity.contentHash,
        actualDigest: nextHash,
      },
    );
  }

  const content =
    input.byteSize !== undefined && input.byteSize !== current.content.byteSize
      ? {
          ...current.content,
          byteSize: input.byteSize,
          contentHash: nextHash,
          hashAlgorithm: (input.hashAlgorithm as HashAlgorithm | undefined) ?? "sha256",
        }
      : {
          ...current.content,
          contentHash: nextHash,
          hashAlgorithm: (input.hashAlgorithm as HashAlgorithm | undefined) ?? "sha256",
        };

  const integrity = EvidenceIntegrityService.fromContent(content);
  return withMutation(
    current,
    ctx,
    {
      content,
      integrity,
      provenance: appendProvenance(current, "integrity_established", ctx),
    },
    "establishIntegrity",
    "Evidence content integrity established",
    [
      buildEvidenceIntegrityEstablishedEvent(eventBase(current, ctx), {
        algorithm: integrity.hashAlgorithm,
      }),
    ],
  );
}

/**
 * Integrity verification using a hash computed outside Domain (no crypto here).
 */
export function verifyIntegrity(
  evidence: Evidence,
  ctx: CommandContext,
  input: { readonly providedActualHash: string },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertNotTerminal(current.status, "verifyIntegrity");
  if (!current.integrity) {
    throw new EvidencePreconditionError("verifyIntegrity requires integrity metadata");
  }
  const result = EvidenceIntegrityService.compare({
    integrity: current.integrity,
    providedActualHash: input.providedActualHash,
    verifiedAt: ctx.changedAt,
  });
  if (!result.matched) {
    return withMutation(
      current,
      ctx,
      {
        integrity: result.integrity,
        provenance: appendProvenance(current, "integrity_failed", ctx),
      },
      "verifyIntegrity",
      "Evidence integrity verification failed",
      [buildEvidenceIntegrityFailedEvent(eventBase(current, ctx))],
    );
  }
  return withMutation(
    current,
    ctx,
    {
      integrity: result.integrity,
      provenance: appendProvenance(current, "integrity_verified", ctx),
    },
    "verifyIntegrity",
    "Evidence integrity verified",
    [buildEvidenceIntegrityVerifiedEvent(eventBase(current, ctx))],
  );
}

/**
 * Record that authoritative integrity exists but content bytes are missing.
 * Does not delete the integrity record or overwrite the expected digest.
 */
export function recordIntegrityContentMissing(
  evidence: Evidence,
  ctx: CommandContext,
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertNotTerminal(current.status, "recordIntegrityContentMissing");
  if (!current.integrity) {
    throw new EvidencePreconditionError(
      "recordIntegrityContentMissing requires integrity metadata",
    );
  }
  const integrity = createEvidenceIntegrity({
    contentHash: current.integrity.contentHash,
    hashAlgorithm: current.integrity.hashAlgorithm,
    verificationState: "content_missing",
    lastVerifiedAt: ctx.changedAt,
    sealed: current.integrity.sealed,
  });
  return withMutation(
    current,
    ctx,
    {
      integrity,
      provenance: appendProvenance(current, "integrity_content_missing", ctx),
    },
    "recordIntegrityContentMissing",
    "Evidence content missing during integrity verification",
    [buildEvidenceIntegrityContentMissingEvent(eventBase(current, ctx))],
  );
}

export function bindPolicyReference(
  evidence: Evidence,
  ctx: CommandContext,
  input: {
    readonly policyId: string;
    readonly policyKind: "retention" | "classification" | "access";
  },
): Evidence {
  const current = beginCommand(evidence, ctx);
  LifecyclePolicy.assertNotTerminal(current.status, "bindPolicyReference");
  const ref = createEvidencePolicyReference(input);
  if (current.policyReferences.some((item) => item.policyId === ref.policyId)) {
    return current;
  }
  return withMutation(
    current,
    ctx,
    {
      policyReferences: [...current.policyReferences, ref],
    },
    "bindPolicyReference",
    "Policy reference bound",
    [],
  );
}

export function toEvidenceReference(
  evidence: Evidence,
  input?: { readonly uriOrHandle?: string; readonly capabilityLocalId?: string },
): EvidenceReference {
  if (!evidence.content || !evidence.integrity) {
    throw new EvidencePreconditionError(
      "EvidenceReference requires content and integrity",
    );
  }
  return createEvidenceReference({
    evidenceId: evidence.id,
    contentHash: evidence.integrity.contentHash,
    uriOrHandle: input?.uriOrHandle,
    capabilityLocalId: input?.capabilityLocalId,
  });
}

export function assertContentDeliveryAllowed(evidence: Evidence): void {
  if (evidence.status === "disposed") {
    throw new EvidenceConflictError("Content delivery denied for disposed evidence");
  }
  if (evidence.integrity?.verificationState === "failed") {
    throw new EvidenceIntegrityFailedError(
      "Content delivery denied when integrity verification failed",
    );
  }
}
