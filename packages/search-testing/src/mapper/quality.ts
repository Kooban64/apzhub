/**
 * QualitySearchMapper — quality intelligence → SearchEntityDraft (APZSEARCH-013).
 *
 * Never provider defect payloads — thin metadata / aggregates only.
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  CoverageMetric,
  DefectLink,
  QualitySummary,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  assertTenant,
  isDefectLink,
  navigationTarget,
  permissionTokens,
  resolveTestingClassification,
  type DefectSummarySearchInput,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export type QualityMappableEntity = Extract<
  TestingSearchMappableEntity,
  {
    readonly entityType:
      | "quality_summary"
      | "quality_coverage_summary"
      | "defect_summary";
  }
>;

export class QualitySearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: QualityMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "quality_summary":
        return this.mapQualitySummary(context, input.entity, input.extras);
      case "quality_coverage_summary":
        return this.mapQualityCoverageSummary(
          context,
          input.entity,
          input.extras,
        );
      case "defect_summary":
        return this.mapDefectSummary(context, input.entity, input.extras);
    }
  }

  mapQualitySummary(
    context: TestingSearchPublicationContext,
    summary: QualitySummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    const id =
      extras?.entityId ??
      summary.snapshot?.id ??
      undefined;
    if (!id) {
      throw new Error(
        "quality_summary requires extras.entityId or summary.snapshot.id",
      );
    }
    assertPlatformEntityId(String(id), "quality_summary.id");
    const tenantId =
      extras?.tenantId ??
      summary.scope.tenantId ??
      summary.snapshot?.tenantId;
    if (!tenantId) {
      throw new Error(
        "tenantId is required via extras, scope, or snapshot when mapping quality_summary",
      );
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: summary.readiness?.suggestedStatus,
    });
    const openTotal = Object.values(summary.openDefectsByStatus).reduce(
      (a, b) => a + (b ?? 0),
      0,
    );
    const title =
      extras?.title ??
      summary.snapshot?.label?.trim() ??
      `Quality summary ${String(id).slice(0, 12)}`;
    return {
      entityId: String(id),
      entityType: "quality_summary",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        coverageMetricCount: String(summary.coverageMetrics.length),
        openDefectCount: String(openTotal),
        computedAt: summary.computedAt,
        ...(summary.readiness
          ? {
              overallScore: String(summary.readiness.overallScore),
              recommendationCode: summary.readiness.suggestedStatus,
            }
          : {}),
        ...(summary.scope.planId
          ? { planId: String(summary.scope.planId) }
          : {}),
        ...(summary.scope.releaseLabel
          ? { releaseLabel: summary.scope.releaseLabel }
          : {}),
      },
      keywords: [title, "quality"],
      createdAt: summary.snapshot?.createdAt ?? summary.computedAt,
      updatedAt: summary.snapshot?.updatedAt ?? summary.computedAt,
      navigationTarget: navigationTarget("quality_summary", String(id)),
      sourceId: "testing:quality_summary",
      ownerUserId: context.actorUserId,
    };
  }

  mapQualityCoverageSummary(
    context: TestingSearchPublicationContext,
    metric: CoverageMetric,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(String(metric.id), "quality_coverage_summary.id");
    assertTenant(metric.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      extras?.title ??
      `Quality coverage ${metric.percentage}% (${metric.kind})`;
    return {
      entityId: String(metric.id),
      entityType: "quality_coverage_summary",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        kind: metric.kind,
        subjectId: metric.subjectId,
        coveredCount: String(metric.coveredCount),
        totalCount: String(metric.totalCount),
        percentage: String(metric.percentage),
        ...(metric.planId ? { planId: String(metric.planId) } : {}),
        ...(metric.suiteId ? { suiteId: String(metric.suiteId) } : {}),
        computedAt: metric.computedAt,
      },
      keywords: [title, metric.kind],
      createdAt: metric.createdAt,
      updatedAt: metric.updatedAt,
      navigationTarget: navigationTarget(
        "quality_coverage_summary",
        String(metric.id),
      ),
      sourceId: "testing:quality_coverage_summary",
      ownerUserId: metric.createdBy ?? context.actorUserId,
    };
  }

  /**
   * Thin defect_summary aggregate — NEVER provider defect payloads / URLs.
   * Accepts DefectSummarySearchInput or aggregates counts from DefectLink metadata.
   */
  mapDefectSummary(
    context: TestingSearchPublicationContext,
    entity: DefectSummarySearchInput | DefectLink,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    if (isDefectLink(entity)) {
      assertPlatformEntityId(entity.id, "defect_summary.id");
      assertTenant(entity.tenantId, context);
      const classification = resolveTestingClassification(context, {
        explicit: extras?.classification,
        severity: entity.severity,
        status: entity.status,
      });
      const title =
        entity.summary?.trim() ||
        extras?.title ||
        `Defect summary ${entity.id.slice(0, 12)}`;
      return {
        entityId: entity.id,
        entityType: "defect_summary",
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
          status: entity.status,
          providerKind: entity.providerKind,
          openCount: "1",
          totalCount: "1",
          ...(entity.severity ? { severity: entity.severity } : {}),
          ...(entity.priority ? { priority: entity.priority } : {}),
        },
        keywords: [title, entity.status],
        createdAt: entity.createdAt,
        updatedAt: entity.updatedAt,
        navigationTarget: navigationTarget("defect_summary", entity.id),
        sourceId: "testing:defect_summary",
        ownerUserId: entity.ownerUserId ?? entity.createdBy ?? context.actorUserId,
      };
    }

    assertPlatformEntityId(entity.id, "defect_summary.id");
    const tenantId = entity.tenantId ?? extras?.tenantId;
    if (!tenantId) {
      throw new Error("tenantId is required when mapping defect_summary");
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: entity.status,
    });
    const title =
      entity.title?.trim() ||
      entity.summary?.trim() ||
      extras?.title ||
      `Defect summary ${entity.id.slice(0, 12)}`;
    return {
      entityId: entity.id,
      entityType: "defect_summary",
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
        ...(entity.status ? { status: entity.status } : {}),
        ...(entity.openCount !== undefined
          ? { openCount: String(entity.openCount) }
          : {}),
        ...(entity.totalCount !== undefined
          ? { totalCount: String(entity.totalCount) }
          : {}),
      },
      keywords: [title, ...(entity.status ? [entity.status] : [])],
      createdAt: new Date(0).toISOString(),
      updatedAt: new Date(0).toISOString(),
      navigationTarget: navigationTarget("defect_summary", entity.id),
      sourceId: "testing:defect_summary",
      ownerUserId: context.actorUserId,
    };
  }
}
