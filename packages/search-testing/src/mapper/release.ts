/**
 * ReleaseSearchMapper — release governance domain → SearchEntityDraft (APZSEARCH-013).
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type {
  Release,
  ReleaseApproval,
  ReleaseCandidate,
  ReleaseDecision,
  ReleaseManifest,
  ReleasePackage,
  ReleaseScope,
  ReleaseSummary,
} from "@apzhub/testing-contracts";

import type { TestingSearchPublicationContext } from "../context/testing-search-publication-context";
import {
  assertPlatformEntityId,
  assertTenant,
  navigationTarget,
  permissionTokens,
  resolveTestingClassification,
  type TestingSearchMappableEntity,
  type TestingSearchMappingExtras,
} from "./shared";

export type ReleaseMappableEntity = Extract<
  TestingSearchMappableEntity,
  {
    readonly entityType:
      | "release"
      | "release_candidate"
      | "release_package"
      | "release_scope"
      | "release_approval"
      | "release_decision"
      | "release_manifest"
      | "release_summary";
  }
>;

export class ReleaseSearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: ReleaseMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "release":
        return this.mapRelease(context, input.entity, input.extras);
      case "release_candidate":
        return this.mapReleaseCandidate(context, input.entity, input.extras);
      case "release_package":
        return this.mapReleasePackage(context, input.entity, input.extras);
      case "release_scope":
        return this.mapReleaseScope(context, input.entity, input.extras);
      case "release_approval":
        return this.mapReleaseApproval(context, input.entity, input.extras);
      case "release_decision":
        return this.mapReleaseDecision(context, input.entity, input.extras);
      case "release_manifest":
        return this.mapReleaseManifest(context, input.entity, input.extras);
      case "release_summary":
        return this.mapReleaseSummary(context, input.entity, input.extras);
    }
  }

  mapRelease(
    context: TestingSearchPublicationContext,
    release: Release,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(release.id, "release.id");
    assertTenant(release.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: release.status,
    });
    return {
      entityId: release.id,
      entityType: "release",
      title: release.name,
      summary: release.description,
      organisationId:
        release.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, release.status, classification),
      metadata: {
        key: release.key,
        status: release.status,
      },
      keywords: [release.name, release.key, release.status],
      createdAt: release.createdAt,
      updatedAt: release.updatedAt,
      navigationTarget: navigationTarget("release", release.id),
      sourceId: "testing:release",
      ownerUserId: release.createdBy ?? context.actorUserId,
    };
  }

  mapReleaseCandidate(
    context: TestingSearchPublicationContext,
    candidate: ReleaseCandidate,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(candidate.id, "release_candidate.id");
    assertTenant(candidate.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: candidate.status,
    });
    return {
      entityId: candidate.id,
      entityType: "release_candidate",
      title: candidate.label,
      summary: candidate.notes?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, candidate.status, classification),
      metadata: {
        status: candidate.status,
        releaseId: candidate.releaseId,
        label: candidate.label,
      },
      keywords: [candidate.label, candidate.status],
      createdAt: candidate.createdAt,
      updatedAt: candidate.updatedAt,
      navigationTarget: navigationTarget("release_candidate", candidate.id),
      sourceId: "testing:release_candidate",
      ownerUserId: candidate.createdBy ?? context.actorUserId,
    };
  }

  mapReleasePackage(
    context: TestingSearchPublicationContext,
    pkg: ReleasePackage,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(pkg.id, "release_package.id");
    assertTenant(pkg.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    return {
      entityId: pkg.id,
      entityType: "release_package",
      title: pkg.name,
      summary: pkg.description,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        releaseId: pkg.releaseId,
        versionLabel: pkg.versionLabel,
        name: pkg.name,
      },
      keywords: [pkg.name, pkg.versionLabel],
      createdAt: pkg.createdAt,
      updatedAt: pkg.updatedAt,
      navigationTarget: navigationTarget("release_package", pkg.id),
      sourceId: "testing:release_package",
      ownerUserId: pkg.createdBy ?? context.actorUserId,
      version: pkg.versionLabel,
    };
  }

  mapReleaseScope(
    context: TestingSearchPublicationContext,
    scope: ReleaseScope,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(scope.id, "release_scope.id");
    assertTenant(scope.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      scope.label?.trim() || extras?.title || `${scope.kind}:${scope.refId}`;
    return {
      entityId: scope.id,
      entityType: "release_scope",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        releaseId: scope.releaseId,
        scopeKind: scope.kind,
        refId: scope.refId,
        ...(scope.label ? { label: scope.label } : {}),
      },
      keywords: [title, scope.kind, scope.refId],
      createdAt: scope.createdAt,
      updatedAt: scope.updatedAt,
      navigationTarget: navigationTarget("release_scope", scope.id),
      sourceId: "testing:release_scope",
      ownerUserId: scope.createdBy ?? context.actorUserId,
    };
  }

  mapReleaseApproval(
    context: TestingSearchPublicationContext,
    approval: ReleaseApproval,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(approval.id, "release_approval.id");
    assertTenant(approval.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: approval.status,
    });
    const title =
      extras?.title ?? `Release approval ${approval.stageKind} (${approval.status})`;
    return {
      entityId: approval.id,
      entityType: "release_approval",
      title,
      summary: approval.comments?.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, approval.status, classification),
      metadata: {
        status: approval.status,
        releaseId: approval.releaseId,
        stageKind: approval.stageKind,
        ...(approval.decidedAt ? { decidedAt: approval.decidedAt } : {}),
        ...(approval.decidedByUserId
          ? { decidedByUserId: approval.decidedByUserId }
          : {}),
      },
      keywords: [title, approval.status, approval.stageKind],
      createdAt: approval.createdAt,
      updatedAt: approval.updatedAt,
      navigationTarget: navigationTarget("release_approval", approval.id),
      sourceId: "testing:release_approval",
      ownerUserId: approval.decidedByUserId ?? context.actorUserId,
    };
  }

  mapReleaseDecision(
    context: TestingSearchPublicationContext,
    decision: ReleaseDecision,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(decision.id, "release_decision.id");
    assertTenant(decision.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: decision.verdict,
    });
    const title = extras?.title ?? `Release decision ${decision.verdict}`;
    return {
      entityId: decision.id,
      entityType: "release_decision",
      title,
      summary: decision.rationale.slice(0, 280),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, decision.verdict, classification),
      metadata: {
        verdict: decision.verdict,
        releaseId: decision.releaseId,
        decidedAt: decision.decidedAt,
        decidedByUserId: decision.decidedByUserId,
        isAutomatic: "false",
        isDecision: "true",
      },
      keywords: [title, decision.verdict],
      createdAt: decision.createdAt,
      updatedAt: decision.updatedAt,
      navigationTarget: navigationTarget("release_decision", decision.id),
      sourceId: "testing:release_decision",
      ownerUserId: decision.decidedByUserId,
    };
  }

  mapReleaseManifest(
    context: TestingSearchPublicationContext,
    manifest: ReleaseManifest,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    const id = extras?.entityId ?? `manifest:${manifest.releaseId}`;
    assertPlatformEntityId(id, "release_manifest.id");
    const tenantId = extras?.tenantId ?? extras?.parentRelease?.tenantId;
    if (!tenantId) {
      throw new Error("tenantId is required via extras when mapping release_manifest");
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
    });
    const title =
      extras?.title ?? extras?.parentRelease?.name ?? `Manifest ${manifest.releaseId}`;
    return {
      entityId: id,
      entityType: "release_manifest",
      title,
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, undefined, classification),
      metadata: {
        releaseId: manifest.releaseId,
        isDecision: "false",
        caseCount: String(manifest.packageIds.length),
        immutable: "true",
      },
      keywords: [title, manifest.releaseId],
      createdAt: manifest.generatedAt,
      updatedAt: manifest.generatedAt,
      navigationTarget: navigationTarget("release_manifest", manifest.releaseId),
      sourceId: "testing:release_manifest",
      ownerUserId: context.actorUserId,
    };
  }

  mapReleaseSummary(
    context: TestingSearchPublicationContext,
    summary: ReleaseSummary,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(summary.id, "release_summary.id");
    const tenantId = extras?.tenantId ?? extras?.parentRelease?.tenantId;
    if (!tenantId) {
      throw new Error("tenantId is required via extras when mapping release_summary");
    }
    assertTenant(tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: summary.recommendationCode,
    });
    const title = extras?.title ?? `Release summary ${summary.recommendationCode}`;
    return {
      entityId: summary.id,
      entityType: "release_summary",
      title,
      summary: summary.recommendationReasons.slice(0, 3).join("; "),
      organisationId: extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(
        context,
        extras,
        summary.recommendationCode,
        classification,
      ),
      metadata: {
        releaseId: summary.releaseId,
        recommendationCode: summary.recommendationCode,
        isDecision: "false",
      },
      keywords: [title, summary.recommendationCode],
      createdAt: summary.computedAt,
      updatedAt: summary.computedAt,
      navigationTarget: navigationTarget("release_summary", summary.id),
      sourceId: "testing:release_summary",
      ownerUserId: context.actorUserId,
    };
  }
}
