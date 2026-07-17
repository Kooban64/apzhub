/**
 * CertificationSearchMapper — certification domain → SearchEntityDraft (APZSEARCH-013).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  Approval,
  CertificationGateDefinition,
  CertificationRecord,
  QualityGate,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  assertTenant,
  isCertificationRecord,
  isQualityGate,
  navigationTarget,
  permissionTokens,
  resolveTestingClassification,
  type CertificationDecisionSearchInput,
  type CertificationEvidenceSearchInput,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export type CertificationMappableEntity = Extract<
  TestingSearchMappableEntity,
  { readonly entityType: "certification" | "certification_gate" | "certification_approval" | "certification_evidence" | "certification_decision" }
>;

export class CertificationSearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: CertificationMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "certification":
        return this.mapCertification(context, input.entity, input.extras);
      case "certification_gate":
        return this.mapCertificationGate(context, input.entity, input.extras);
      case "certification_approval":
        return this.mapApproval(context, input.entity, "certification_approval", input.extras);
      case "certification_evidence":
        return this.mapCertificationEvidence(context, input.entity, input.extras);
      case "certification_decision":
        return this.mapCertificationDecision(context, input.entity, input.extras);
    }
  }

  mapCertification(
    context: TestingSearchPublicationContext,
    record: CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(record.id, "certification.id");
    assertTenant(record.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: record.status,
    });
    return {
      entityId: record.id,
      entityType: "certification",
      title: record.name,
      summary: record.conditions?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        record.status,
        classification,
      ),
      metadata: {
        key: record.key,
        status: record.status,
        ...(record.planId ? { planId: record.planId } : {}),
        ...(record.productLabel ? { productLabel: record.productLabel } : {}),
        ...(record.releaseLabel ? { releaseLabel: record.releaseLabel } : {}),
        ...(record.currentRecommendation
          ? { recommendationCode: record.currentRecommendation }
          : {}),
      },
      keywords: [record.name, record.key, record.status],
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      navigationTarget: navigationTarget("certification", record.id),
      sourceId: "testing:certification",
      ownerUserId: record.createdBy ?? context.actorUserId,
    };
  }

  mapCertificationGate(
    context: TestingSearchPublicationContext,
    gate: QualityGate | CertificationGateDefinition,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(gate.id, "certification_gate.id");
    assertTenant(gate.tenantId, context);
    if (isQualityGate(gate)) {
      const classification = resolveTestingClassification(context, {
        explicit: extras?.classification,
        status: gate.status,
      });
      return {
        entityId: gate.id,
        entityType: "certification_gate",
        title: gate.name,
        summary: gate.description,
        organisationId: extras?.organisationId ?? context.organisationId,
        classification,
        permissions: permissionTokens(
          context,
          extras,
          gate.status,
          classification,
        ),
        metadata: {
          key: gate.key,
          status: gate.status,
          kind: "quality_gate",
          ...(gate.certificationRecordId
            ? { certificationRecordId: gate.certificationRecordId }
            : {}),
        },
        keywords: [gate.name, gate.key, gate.status],
        createdAt: gate.createdAt,
        updatedAt: gate.updatedAt,
        navigationTarget: navigationTarget("certification_gate", gate.id),
        sourceId: "testing:certification_gate",
        ownerUserId: gate.createdBy ?? context.actorUserId,
      };
    }
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    return {
      entityId: gate.id,
      entityType: "certification_gate",
      title: gate.name,
      summary: gate.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        gateKey: gate.gateKey,
        kind: gate.kind,
        required: gate.required ? "true" : "false",
        enabled: gate.enabled ? "true" : "false",
      },
      keywords: [gate.name, gate.gateKey, gate.kind],
      createdAt: gate.createdAt,
      updatedAt: gate.updatedAt,
      navigationTarget: navigationTarget("certification_gate", gate.id),
      sourceId: "testing:certification_gate",
      ownerUserId: gate.createdBy ?? context.actorUserId,
    };
  }

  mapApproval(
    context: TestingSearchPublicationContext,
    approval: Approval,
    entityType: "approval" | "certification_approval",
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(approval.id, `${entityType}.id`);
    assertTenant(approval.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: approval.status,
    });
    const title =
      extras?.title ??
      `Approval ${approval.status} (${approval.id.slice(0, 12)})`;
    return {
      entityId: approval.id,
      entityType,
      title,
      summary: approval.comments?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        approval.status,
        classification,
      ),
      metadata: {
        status: approval.status,
        certificationRecordId: approval.certificationRecordId,
        ...(approval.gateId ? { gateId: approval.gateId } : {}),
        ...(approval.subjectKind ? { subjectKind: approval.subjectKind } : {}),
        ...(approval.subjectId ? { subjectId: approval.subjectId } : {}),
        ...(approval.decidedAt ? { decidedAt: approval.decidedAt } : {}),
        ...(approval.decidedByUserId
          ? { decidedByUserId: approval.decidedByUserId }
          : {}),
      },
      keywords: [title, approval.status],
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      navigationTarget: navigationTarget(entityType, approval.id),
      sourceId: `testing:${entityType}`,
      ownerUserId:
        approval.approverUserId ??
        approval.authorUserId ??
        context.actorUserId,
    };
  }

  mapCertificationEvidence(
    context: TestingSearchPublicationContext,
    input: CertificationEvidenceSearchInput,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(input.id, "certification_evidence.id");
    const tenantId = input.tenantId ?? extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required when mapping certification_evidence",
      );
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const links = input.links;
    const linkCount = links
      ? links.requirementIds.length +
        links.planIds.length +
        links.suiteIds.length +
        links.caseIds.length +
        links.executionIds.length +
        links.evidenceIds.length +
        links.coverageIds.length +
        links.defectIds.length +
        links.riskIds.length
      : 0;
    return {
      entityId: input.id,
      entityType: "certification_evidence",
      title: input.title,
      summary: input.labels?.join(", "),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        linkCount: String(linkCount),
        ...(input.certificationRecordId
          ? { certificationRecordId: input.certificationRecordId }
          : {}),
        ...(links ? { evidenceCount: String(links.evidenceIds.length) } : {}),
        ...(links
          ? { requirementCount: String(links.requirementIds.length) }
          : {}),
      },
      keywords: [input.title, ...(input.labels ?? [])],
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      navigationTarget: navigationTarget("certification_evidence", input.id),
      sourceId: "testing:certification_evidence",
      ownerUserId: context.actorUserId,
    };
  }

  mapCertificationDecision(
    context: TestingSearchPublicationContext,
    entity: CertificationDecisionSearchInput | CertificationRecord,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    if (isCertificationRecord(entity)) {
      assertPlatformEntityId(entity.id, "certification_decision.id");
      assertTenant(entity.tenantId, context);
      const classification = resolveTestingClassification(context, {
        explicit: extras?.classification,
        status: entity.status,
      });
      return {
        entityId: entity.id,
        entityType: "certification_decision",
        title: extras?.title ?? `${entity.name} decision`,
        organisationId: extras?.organisationId ?? context.organisationId,
        classification,
        permissions: permissionTokens(
          context,
          extras,
          entity.status,
          classification,
        ),
        metadata: {
          decisionStatus: entity.status,
          certificationRecordId: entity.id,
          status: entity.status,
          ...(entity.certifiedAt ? { decidedAt: entity.certifiedAt } : {}),
          ...(entity.currentRecommendation
            ? { recommendationCode: entity.currentRecommendation }
            : {}),
        },
        keywords: [entity.name, entity.status],
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        navigationTarget: navigationTarget("certification_decision", entity.id),
        sourceId: "testing:certification_decision",
        ownerUserId: entity.createdBy ?? context.actorUserId,
      };
    }
    assertPlatformEntityId(entity.id, "certification_decision.id");
    const tenantId = entity.tenantId ?? extras?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required when mapping certification_decision",
      );
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: entity.status,
    });
    const title =
      entity.title ?? extras?.title ?? `Decision ${entity.status}`;
    return {
      entityId: entity.id,
      entityType: "certification_decision",
      title,
      summary: entity.summary,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        entity.status,
        classification,
      ),
      metadata: {
        decisionStatus: entity.status,
        status: entity.status,
        certificationRecordId: entity.certificationRecordId,
        ...(entity.decidedAt ? { decidedAt: entity.decidedAt } : {}),
        ...(entity.decidedByUserId
          ? { decidedByUserId: entity.decidedByUserId }
          : {}),
      },
      keywords: [title, entity.status],
      createdAt: entity.decidedAt ?? new Date(0).toISOString(),
      updatedAt: entity.decidedAt ?? new Date(0).toISOString(),
      navigationTarget: navigationTarget("certification_decision", entity.id),
      sourceId: "testing:certification_decision",
      ownerUserId: entity.decidedByUserId ?? context.actorUserId,
    };
  }
}
