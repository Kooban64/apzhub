/**
 * QEP Requirements → Search publication adapter (APZQEP-ENG-020B).
 */

import type {
  QepBaselineDto,
  QepRelationshipDto,
  QepRequirementDto,
  QepTraceLinkDto,
  QepVerificationDto,
} from "@apzhub/qep-contracts";
import {
  createSearchIntegration,
  createSearchIntegrationContext,
  type CreateSearchIntegrationOptions,
  type SearchEntityDraft,
  type SearchIntegrationFramework,
  type SearchIntegrationPublisher,
  type SearchPublicationResult,
} from "@apzhub/search-integration";

export const SEARCH_QEP_VERSION = "0.1.0";

export type QepSearchPublicationContext = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly correlationId: string;
  readonly actorUserId: string;
};

export type QepSearchMappableRequirement = Pick<
  QepRequirementDto,
  | "id"
  | "key"
  | "title"
  | "description"
  | "status"
  | "projectId"
  | "tenantId"
  | "updatedAt"
  | "createdAt"
  | "archivedAt"
>;

export function requirementToSearchDraft(
  requirement: QepSearchMappableRequirement,
): SearchEntityDraft {
  const lifecycleState = requirement.archivedAt
    ? ("archived" as const)
    : ("published" as const);
  return {
    entityId: requirement.id,
    entityType: "requirement",
    title: requirement.title,
    summary: requirement.description ?? requirement.key,
    metadata: {
      key: requirement.key,
      status: requirement.status,
      projectId: requirement.projectId,
    },
    keywords: [
      requirement.key,
      requirement.status,
      requirement.status.replace(/_/g, " "),
    ],
    createdAt: requirement.createdAt,
    updatedAt: requirement.updatedAt,
    lifecycleState,
    navigationTarget: `/workspace/qep/requirements/${encodeURIComponent(requirement.id)}`,
  };
}

export type QepSearchMappableEvidence = {
  readonly id: string;
  readonly projectId: string;
  readonly title?: string;
  readonly description?: string;
  readonly status: string;
  readonly sourceKind: string;
  readonly classification?: string;
  readonly tags: readonly string[];
  readonly ownerId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export function evidenceToSearchDraft(
  evidence: QepSearchMappableEvidence,
): SearchEntityDraft {
  return {
    entityId: evidence.id,
    entityType: "evidence",
    title: evidence.title?.trim() || `Evidence ${evidence.id}`,
    summary: evidence.description ?? `${evidence.sourceKind} evidence`,
    metadata: {
      projectId: evidence.projectId,
      status: evidence.status,
      sourceKind: evidence.sourceKind,
      classification: evidence.classification ?? "",
      owner: evidence.ownerId,
    },
    keywords: [
      evidence.status,
      evidence.sourceKind,
      evidence.classification ?? "",
      ...evidence.tags,
    ],
    createdAt: evidence.createdAt,
    updatedAt: evidence.updatedAt,
    lifecycleState: evidence.status === "archived" ? "archived" : "published",
    navigationTarget: `/workspace/qep/evidence/${encodeURIComponent(evidence.id)}`,
  };
}

export type QepSearchMappableDefect = {
  readonly defectId: string;
  readonly projectId?: string;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly severity: string;
  readonly priority: string;
  readonly assigneeId?: string;
  readonly reporterId: string;
  readonly tags: readonly string[];
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly archivedAt?: string;
};

export function defectToSearchDraft(
  defect: QepSearchMappableDefect,
): SearchEntityDraft {
  return {
    entityId: defect.defectId,
    entityType: "defect",
    title: defect.title,
    summary: defect.description,
    metadata: {
      projectId: defect.projectId ?? "",
      status: defect.status,
      severity: defect.severity,
      priority: defect.priority,
      owner: defect.assigneeId ?? defect.reporterId,
    },
    keywords: [
      defect.status,
      defect.severity,
      defect.priority,
      defect.assigneeId ?? "",
      ...defect.tags,
    ],
    createdAt: defect.createdAt,
    updatedAt: defect.updatedAt,
    lifecycleState:
      defect.archivedAt || defect.status === "archived" ? "archived" : "published",
    navigationTarget: `/workspace/qep/defects/${encodeURIComponent(defect.defectId)}`,
  };
}

export type QepSearchMappableBaseline = Pick<
  QepBaselineDto,
  | "id"
  | "tenantId"
  | "number"
  | "name"
  | "description"
  | "status"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "archivedAt"
>;

/**
 * Baselines are configuration-management records, not requirement content —
 * only baseline-level metadata is searchable; items are never indexed standalone.
 */
export function baselineToSearchDraft(
  baseline: QepSearchMappableBaseline,
): SearchEntityDraft {
  const lifecycleState = baseline.archivedAt
    ? ("archived" as const)
    : ("published" as const);
  return {
    entityId: baseline.id,
    entityType: "requirement_baseline",
    title: baseline.name,
    summary: baseline.description ?? `Baseline #${baseline.number}`,
    metadata: {
      number: String(baseline.number),
      status: baseline.status,
      owner: baseline.createdBy,
    },
    keywords: [
      String(baseline.number),
      baseline.status,
      baseline.name,
      baseline.createdBy,
    ],
    createdAt: baseline.createdAt,
    updatedAt: baseline.updatedAt,
    lifecycleState,
    navigationTarget: `/workspace/qep/requirements/baselines/${encodeURIComponent(baseline.id)}`,
  };
}

export type QepSearchMappableRelationship = Pick<
  QepRelationshipDto,
  | "id"
  | "tenantId"
  | "type"
  | "lifecycleState"
  | "source"
  | "target"
  | "rationale"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "retiredAt"
>;

/**
 * Relationships are governed semantic facts — only relationship-level metadata
 * is searchable; endpoint requirement content is never indexed standalone.
 */
export function relationshipToSearchDraft(
  relationship: QepSearchMappableRelationship,
): SearchEntityDraft {
  const lifecycleState = relationship.retiredAt
    ? ("archived" as const)
    : ("published" as const);
  const summary =
    relationship.rationale ??
    `${relationship.type}: ${relationship.source.requirementId} → ${relationship.target.requirementId}`;
  return {
    entityId: relationship.id,
    entityType: "requirement_relationship",
    title: `${relationship.type} relationship`,
    summary,
    metadata: {
      type: relationship.type,
      lifecycleState: relationship.lifecycleState,
      sourceRequirementId: relationship.source.requirementId,
      targetRequirementId: relationship.target.requirementId,
      owner: relationship.createdBy,
    },
    keywords: [
      relationship.type,
      relationship.lifecycleState,
      relationship.source.requirementId,
      relationship.target.requirementId,
      relationship.createdBy,
    ],
    createdAt: relationship.createdAt,
    updatedAt: relationship.updatedAt,
    lifecycleState,
    navigationTarget: `/workspace/qep/requirements/relationships/${encodeURIComponent(relationship.id)}`,
  };
}

export type QepSearchMappableTraceLink = Pick<
  QepTraceLinkDto,
  | "id"
  | "tenantId"
  | "type"
  | "lifecycleState"
  | "source"
  | "target"
  | "rationale"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "retiredAt"
  | "supersededAt"
>;

/**
 * Trace Links are governed traceability facts (APZQEP-ENG-030A Part 2) — only
 * link-level metadata is searchable; endpoint artefact content is never
 * indexed standalone. Retired/superseded links are removed from the index.
 */
export function traceLinkToSearchDraft(
  traceLink: QepSearchMappableTraceLink,
): SearchEntityDraft {
  const lifecycleState =
    traceLink.retiredAt || traceLink.supersededAt
      ? ("archived" as const)
      : ("published" as const);
  const summary =
    traceLink.rationale ??
    `${traceLink.type}: ${traceLink.source.artefactId} → ${traceLink.target.artefactId}`;
  return {
    entityId: traceLink.id,
    entityType: "trace_link",
    title: `${traceLink.type} trace link`,
    summary,
    metadata: {
      type: traceLink.type,
      lifecycleState: traceLink.lifecycleState,
      sourceKind: traceLink.source.kind,
      sourceArtefactId: traceLink.source.artefactId,
      targetKind: traceLink.target.kind,
      targetArtefactId: traceLink.target.artefactId,
      owner: traceLink.createdBy,
    },
    keywords: [
      traceLink.type,
      traceLink.lifecycleState,
      traceLink.source.artefactId,
      traceLink.target.artefactId,
      traceLink.createdBy,
    ],
    createdAt: traceLink.createdAt,
    updatedAt: traceLink.updatedAt,
    lifecycleState,
    navigationTarget: `/workspace/qep/traceability/trace-links/${encodeURIComponent(traceLink.id)}`,
  };
}

export type QepSearchMappableVerification = Pick<
  QepVerificationDto,
  | "id"
  | "tenantId"
  | "status"
  | "outcome"
  | "subject"
  | "rationale"
  | "createdBy"
  | "createdAt"
  | "updatedAt"
  | "retiredAt"
  | "supersededAt"
  | "cancelledAt"
>;

/**
 * Verifications are ARCH-009 governed decision records (APZQEP-ENG-040B
 * Part 2) — only Verification-level metadata is searchable; subject artefact
 * content is never indexed standalone. Retired/superseded/cancelled
 * Verifications are removed from the index.
 */
export function verificationToSearchDraft(
  verification: QepSearchMappableVerification,
): SearchEntityDraft {
  const lifecycleState =
    verification.retiredAt || verification.supersededAt || verification.cancelledAt
      ? ("archived" as const)
      : ("published" as const);
  const summary =
    verification.rationale ??
    `${verification.status} verification for ${verification.subject.kind}:${verification.subject.artefactId}`;
  return {
    entityId: verification.id,
    entityType: "verification_record",
    title: `${verification.subject.kind} verification`,
    summary,
    metadata: {
      status: verification.status,
      outcome: verification.outcome ?? "",
      subjectKind: verification.subject.kind,
      subjectArtefactId: verification.subject.artefactId,
      owner: verification.createdBy,
    },
    keywords: [
      verification.status,
      verification.outcome ?? "",
      verification.subject.kind,
      verification.subject.artefactId,
      verification.createdBy,
    ],
    createdAt: verification.createdAt,
    updatedAt: verification.updatedAt,
    lifecycleState,
    navigationTarget: `/workspace/qep/verification/${encodeURIComponent(verification.id)}`,
  };
}

export type QepSearchPublisherOptions = {
  readonly integrationPublisher: SearchIntegrationPublisher;
};

function toIntegrationContext(context: QepSearchPublicationContext) {
  return createSearchIntegrationContext({
    productId: "qep",
    searchContext: {
      tenantId: context.tenantId,
      organisationId: context.organisationId,
      correlationId: context.correlationId,
      actorUserId: context.actorUserId,
      permissions: [],
    },
  });
}

export class QepSearchPublisher {
  constructor(private readonly options: QepSearchPublisherOptions) {}

  getIntegrationPublisher(): SearchIntegrationPublisher {
    return this.options.integrationPublisher;
  }

  publish(
    context: QepSearchPublicationContext,
    requirement: QepSearchMappableRequirement,
  ): SearchPublicationResult {
    const draft = requirementToSearchDraft(requirement);
    return this.options.integrationPublisher.publish(
      toIntegrationContext(context),
      draft,
    );
  }

  remove(
    context: QepSearchPublicationContext,
    requirementId: string,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.remove(
      toIntegrationContext(context),
      requirementId,
    );
  }

  publishEvidence(
    context: QepSearchPublicationContext,
    evidence: QepSearchMappableEvidence,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.publish(
      toIntegrationContext(context),
      evidenceToSearchDraft(evidence),
    );
  }

  removeEvidence(
    context: QepSearchPublicationContext,
    evidenceId: string,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.remove(
      toIntegrationContext(context),
      evidenceId,
    );
  }

  publishDefect(
    context: QepSearchPublicationContext,
    defect: QepSearchMappableDefect,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.publish(
      toIntegrationContext(context),
      defectToSearchDraft(defect),
    );
  }

  removeDefect(
    context: QepSearchPublicationContext,
    defectId: string,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.remove(
      toIntegrationContext(context),
      defectId,
    );
  }

  publishBaseline(
    context: QepSearchPublicationContext,
    baseline: QepSearchMappableBaseline,
  ): SearchPublicationResult {
    const draft = baselineToSearchDraft(baseline);
    return this.options.integrationPublisher.publish(
      toIntegrationContext(context),
      draft,
    );
  }

  removeBaseline(
    context: QepSearchPublicationContext,
    baselineId: string,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.remove(
      toIntegrationContext(context),
      baselineId,
    );
  }

  publishRelationship(
    context: QepSearchPublicationContext,
    relationship: QepSearchMappableRelationship,
  ): SearchPublicationResult {
    const draft = relationshipToSearchDraft(relationship);
    return this.options.integrationPublisher.publish(
      toIntegrationContext(context),
      draft,
    );
  }

  removeRelationship(
    context: QepSearchPublicationContext,
    relationshipId: string,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.remove(
      toIntegrationContext(context),
      relationshipId,
    );
  }

  publishTraceLink(
    context: QepSearchPublicationContext,
    traceLink: QepSearchMappableTraceLink,
  ): SearchPublicationResult {
    const draft = traceLinkToSearchDraft(traceLink);
    return this.options.integrationPublisher.publish(
      toIntegrationContext(context),
      draft,
    );
  }

  removeTraceLink(
    context: QepSearchPublicationContext,
    traceLinkId: string,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.remove(
      toIntegrationContext(context),
      traceLinkId,
    );
  }

  publishVerification(
    context: QepSearchPublicationContext,
    verification: QepSearchMappableVerification,
  ): SearchPublicationResult {
    const draft = verificationToSearchDraft(verification);
    return this.options.integrationPublisher.publish(
      toIntegrationContext(context),
      draft,
    );
  }

  removeVerification(
    context: QepSearchPublicationContext,
    verificationId: string,
  ): SearchPublicationResult {
    return this.options.integrationPublisher.remove(
      toIntegrationContext(context),
      verificationId,
    );
  }
}

export type QepSearchLifecycleHooks = {
  onRequirementUpserted(
    context: QepSearchPublicationContext,
    requirement: QepSearchMappableRequirement,
  ): SearchPublicationResult;
  onRequirementArchived(
    context: QepSearchPublicationContext,
    requirement: QepSearchMappableRequirement,
  ): SearchPublicationResult;
  onBaselineUpserted(
    context: QepSearchPublicationContext,
    baseline: QepSearchMappableBaseline,
  ): SearchPublicationResult;
  onRelationshipUpserted(
    context: QepSearchPublicationContext,
    relationship: QepSearchMappableRelationship,
  ): SearchPublicationResult;
  onTraceLinkUpserted(
    context: QepSearchPublicationContext,
    traceLink: QepSearchMappableTraceLink,
  ): SearchPublicationResult;
  onVerificationUpserted(
    context: QepSearchPublicationContext,
    verification: QepSearchMappableVerification,
  ): SearchPublicationResult;
};

export function createQepSearchLifecycleHooks(
  publisher: QepSearchPublisher,
): QepSearchLifecycleHooks {
  return {
    onRequirementUpserted(context, requirement) {
      if (requirement.archivedAt) {
        return publisher.remove(context, requirement.id);
      }
      const prior = publisher.getIntegrationPublisher().getSink().get(requirement.id);
      if (prior && prior.lifecycleState !== "removed") {
        return publisher
          .getIntegrationPublisher()
          .update(toIntegrationContext(context), requirementToSearchDraft(requirement));
      }
      return publisher.publish(context, requirement);
    },
    onRequirementArchived(context, requirement) {
      return publisher.remove(context, requirement.id);
    },
    onBaselineUpserted(context, baseline) {
      if (baseline.archivedAt) {
        return publisher.removeBaseline(context, baseline.id);
      }
      const prior = publisher.getIntegrationPublisher().getSink().get(baseline.id);
      if (prior && prior.lifecycleState !== "removed") {
        return publisher
          .getIntegrationPublisher()
          .update(toIntegrationContext(context), baselineToSearchDraft(baseline));
      }
      return publisher.publishBaseline(context, baseline);
    },
    onRelationshipUpserted(context, relationship) {
      if (relationship.retiredAt) {
        return publisher.removeRelationship(context, relationship.id);
      }
      const prior = publisher.getIntegrationPublisher().getSink().get(relationship.id);
      if (prior && prior.lifecycleState !== "removed") {
        return publisher
          .getIntegrationPublisher()
          .update(
            toIntegrationContext(context),
            relationshipToSearchDraft(relationship),
          );
      }
      return publisher.publishRelationship(context, relationship);
    },
    onTraceLinkUpserted(context, traceLink) {
      if (traceLink.retiredAt || traceLink.supersededAt) {
        return publisher.removeTraceLink(context, traceLink.id);
      }
      const prior = publisher.getIntegrationPublisher().getSink().get(traceLink.id);
      if (prior && prior.lifecycleState !== "removed") {
        return publisher
          .getIntegrationPublisher()
          .update(toIntegrationContext(context), traceLinkToSearchDraft(traceLink));
      }
      return publisher.publishTraceLink(context, traceLink);
    },
    onVerificationUpserted(context, verification) {
      if (
        verification.retiredAt ||
        verification.supersededAt ||
        verification.cancelledAt
      ) {
        return publisher.removeVerification(context, verification.id);
      }
      const prior = publisher.getIntegrationPublisher().getSink().get(verification.id);
      if (prior && prior.lifecycleState !== "removed") {
        return publisher
          .getIntegrationPublisher()
          .update(
            toIntegrationContext(context),
            verificationToSearchDraft(verification),
          );
      }
      return publisher.publishVerification(context, verification);
    },
  };
}

export type CreateQepSearchAdapterOptions = {
  readonly integration?: SearchIntegrationFramework;
  readonly integrationPublisher?: SearchIntegrationPublisher;
  readonly searchIntegrationOptions?: CreateSearchIntegrationOptions;
};

export type QepSearchAdapter = {
  readonly publisher: QepSearchPublisher;
  readonly hooks: QepSearchLifecycleHooks;
  readonly integration: SearchIntegrationFramework;
};

export function createQepSearchAdapter(
  options: CreateQepSearchAdapterOptions = {},
): QepSearchAdapter {
  const integration =
    options.integration ?? createSearchIntegration(options.searchIntegrationOptions);
  const integrationPublisher = options.integrationPublisher ?? integration.publisher;

  const publisher = new QepSearchPublisher({ integrationPublisher });

  return {
    publisher,
    hooks: createQepSearchLifecycleHooks(publisher),
    integration,
  };
}

export function createQepSearchAdapterForTest(
  options: CreateQepSearchAdapterOptions = {},
): QepSearchAdapter {
  return createQepSearchAdapter(options);
}
