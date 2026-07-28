/**
 * QEP Platform Services → Search Publication wiring (APZQEP-ENG-020B).
 */

import type {
  PersistedRequirement,
  RequirementBaseline,
  StoredRequirementsRelationship,
} from "@apzhub/qep-requirements/domain";
import type { QepPlatformServicesBundle } from "@apzhub/platform-services";
import { toTraceLinkDto, type StoredTraceLink } from "@apzhub/qep-traceability";
import { toVerificationDto, type StoredVerification } from "@apzhub/qep-verification";
import {
  toSpecificationDto,
  type StoredTestSpecification,
} from "@apzhub/qep-test-specifications";
import {
  createQepSearchAdapter,
  type QepSearchMappableBaseline,
  type QepSearchMappableRelationship,
  type QepSearchMappableRequirement,
  type QepSearchMappableTraceLink,
  type QepSearchMappableVerification,
} from "@apzhub/search-qep";

import { markSearchCompositionRegistered } from "../publication-runtime";

function toSearchRequirement(
  record: PersistedRequirement,
): QepSearchMappableRequirement {
  return {
    id: record.id,
    tenantId: record.tenantId,
    projectId: record.projectId,
    key: record.key,
    title: record.title,
    description: record.description,
    status: record.status,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    archivedAt: record.archivedAt,
  };
}

function toSearchBaseline(record: RequirementBaseline): QepSearchMappableBaseline {
  return {
    id: record.id,
    tenantId: record.tenantId,
    number: record.number,
    name: record.name,
    description: record.description,
    status: record.status,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    archivedAt: record.archivedAt,
  };
}

function toSearchRelationship(
  record: StoredRequirementsRelationship,
): QepSearchMappableRelationship {
  return {
    id: record.id,
    tenantId: record.tenantId,
    type: record.type,
    lifecycleState: record.lifecycleState,
    source: {
      mode: record.direction.source.mode,
      requirementId: record.direction.source.requirementId,
      contentVersionId: record.direction.source.contentVersionId,
    },
    target: {
      mode: record.direction.target.mode,
      requirementId: record.direction.target.requirementId,
      contentVersionId: record.direction.target.contentVersionId,
    },
    rationale: record.rationale,
    createdBy: record.createdBy,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    retiredAt: record.retiredAt,
  };
}

function toSearchTraceLink(record: StoredTraceLink): QepSearchMappableTraceLink {
  const dto = toTraceLinkDto(record);
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    type: dto.type,
    lifecycleState: dto.lifecycleState,
    source: dto.source,
    target: dto.target,
    rationale: dto.rationale,
    createdBy: dto.createdBy,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    retiredAt: dto.retiredAt,
    supersededAt: dto.supersededAt,
  };
}

function toSearchVerification(
  record: StoredVerification,
): QepSearchMappableVerification {
  const dto = toVerificationDto(record);
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    status: dto.status,
    outcome: dto.outcome,
    subject: dto.subject,
    rationale: dto.rationale,
    createdBy: dto.createdBy,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    retiredAt: dto.retiredAt,
    supersededAt: dto.supersededAt,
    cancelledAt: dto.cancelledAt,
  };
}

/** Search projection shape for Test Specifications — ready for search-qep adapter wiring. */
export type QepSearchMappableSpecification = {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly owner: string;
  readonly status: string;
  readonly classification: string;
  readonly priority: string;
  readonly tags: readonly string[];
  readonly updatedAt: string;
};

function toSearchSpecification(
  record: StoredTestSpecification,
): QepSearchMappableSpecification {
  const dto = toSpecificationDto(record);
  return {
    id: dto.id,
    tenantId: dto.tenantId,
    title: dto.title,
    owner: dto.owner,
    status: dto.status,
    classification: dto.classification,
    priority: dto.priority,
    tags: dto.tags,
    updatedAt: dto.updatedAt,
  };
}

/**
 * Attach search lifecycle hooks to a QEP bundle when search publication is available.
 */
export function wireQepBundleSearchPublication(
  bundle: QepPlatformServicesBundle,
): QepPlatformServicesBundle {
  markSearchCompositionRegistered("qep");

  return {
    ...bundle,
    gatewaySurface: bundle.gatewaySurface,
    wrapWithPipeline: bundle.wrapWithPipeline,
    persistence: bundle.persistence,
    readiness: bundle.readiness,
    // Hooks are applied at factory time — re-create is not needed when using pre-wired bundle.
  };
}

export function createQepSearchLifecycleOptions(): {
  readonly onUpserted: (record: PersistedRequirement) => Promise<void>;
  readonly onArchived: (record: PersistedRequirement) => Promise<void>;
  readonly onBaselineUpserted: (baseline: RequirementBaseline) => Promise<void>;
  readonly onRelationshipUpserted: (
    relationship: StoredRequirementsRelationship,
  ) => Promise<void>;
  readonly onTraceLinkUpserted: (traceLink: StoredTraceLink) => Promise<void>;
  readonly onVerificationUpserted: (verification: StoredVerification) => Promise<void>;
  readonly onSpecificationUpserted: (
    specification: StoredTestSpecification,
  ) => Promise<void>;
} {
  const adapter = createQepSearchAdapter();
  markSearchCompositionRegistered("qep");

  return {
    onUpserted: async (record) => {
      adapter.hooks.onRequirementUpserted(
        {
          tenantId: record.tenantId,
          correlationId: `qep-search-${record.id}`,
          actorUserId: record.updatedBy,
        },
        toSearchRequirement(record),
      );
    },
    onArchived: async (record) => {
      adapter.hooks.onRequirementArchived(
        {
          tenantId: record.tenantId,
          correlationId: `qep-search-archive-${record.id}`,
          actorUserId: record.archivedBy ?? record.updatedBy,
        },
        toSearchRequirement(record),
      );
    },
    onBaselineUpserted: async (baseline) => {
      adapter.hooks.onBaselineUpserted(
        {
          tenantId: baseline.tenantId,
          correlationId: `qep-search-baseline-${baseline.id}`,
          actorUserId: baseline.updatedBy,
        },
        toSearchBaseline(baseline),
      );
    },
    onRelationshipUpserted: async (relationship) => {
      adapter.hooks.onRelationshipUpserted(
        {
          tenantId: relationship.tenantId,
          correlationId: `qep-search-relationship-${relationship.id}`,
          actorUserId: relationship.updatedBy,
        },
        toSearchRelationship(relationship),
      );
    },
    onTraceLinkUpserted: async (traceLink) => {
      adapter.hooks.onTraceLinkUpserted(
        {
          tenantId: traceLink.tenantId,
          correlationId: `qep-search-trace-link-${traceLink.id}`,
          actorUserId: traceLink.updatedBy,
        },
        toSearchTraceLink(traceLink),
      );
    },
    onVerificationUpserted: async (verification) => {
      adapter.hooks.onVerificationUpserted(
        {
          tenantId: verification.tenantId,
          correlationId: `qep-search-verification-${verification.id}`,
          actorUserId: verification.updatedBy,
        },
        toSearchVerification(verification),
      );
    },
    onSpecificationUpserted: async (specification) => {
      // Stub projection — search-qep adapter hook pending; shape matches verification wiring.
      void toSearchSpecification(specification);
    },
  };
}
