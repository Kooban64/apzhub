/**
 * PipelineSearchMapper — CI/CD pipeline metadata → SearchEntityDraft (APZSEARCH-013).
 *
 * Metadata only — NEVER logs, artifacts, secrets, credentials, provider ids,
 * checksum hex, or payload fingerprints in searchable metadata.
 */

import type { SearchEntityDraft } from "@apzhub/search-integration";
import type { Pipeline, PipelineImport, PipelineRun } from "@apzhub/testing-contracts";

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

export type PipelineMappableEntity = Extract<
  TestingSearchMappableEntity,
  {
    readonly entityType: "pipeline" | "pipeline_run" | "pipeline_import";
  }
>;

export class PipelineSearchMapper {
  map(
    context: TestingSearchPublicationContext,
    input: PipelineMappableEntity,
  ): SearchEntityDraft {
    switch (input.entityType) {
      case "pipeline":
        return this.mapPipeline(context, input.entity, input.extras);
      case "pipeline_run":
        return this.mapPipelineRun(context, input.entity, input.extras);
      case "pipeline_import":
        return this.mapPipelineImport(context, input.entity, input.extras);
    }
  }

  mapPipeline(
    context: TestingSearchPublicationContext,
    pipeline: Pipeline,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(String(pipeline.id), "pipeline.id");
    assertTenant(pipeline.tenantId, context);
    // NEVER variables, secretRefs, provider ids as searchable content
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: pipeline.status,
    });
    return {
      entityId: String(pipeline.id),
      entityType: "pipeline",
      title: pipeline.name,
      summary: pipeline.description?.slice(0, 280),
      organisationId:
        pipeline.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, pipeline.status, classification),
      metadata: {
        key: pipeline.key,
        status: pipeline.status,
        providerKind: pipeline.providerKind,
        secretsPresent: pipeline.secretRefs?.length ? "true" : "false",
        ...(pipeline.defaultBranch ? { defaultBranch: pipeline.defaultBranch } : {}),
        ...(pipeline.revision !== undefined
          ? { revision: String(pipeline.revision) }
          : {}),
      },
      keywords: [pipeline.name, pipeline.key, pipeline.status],
      createdAt: pipeline.createdAt,
      updatedAt: pipeline.updatedAt,
      navigationTarget: navigationTarget("pipeline", String(pipeline.id)),
      sourceId: "testing:pipeline",
      ownerUserId: pipeline.createdBy ?? context.actorUserId,
      version: pipeline.revision !== undefined ? String(pipeline.revision) : undefined,
    };
  }

  mapPipelineRun(
    context: TestingSearchPublicationContext,
    run: PipelineRun,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(String(run.id), "pipeline_run.id");
    assertTenant(run.tenantId, context);
    // NEVER logs, artifacts, secretRefs, variables, stages/jobs payloads
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: run.status,
    });
    const title =
      extras?.title ?? `Pipeline run ${run.status} (${String(run.id).slice(0, 12)})`;
    return {
      entityId: String(run.id),
      entityType: "pipeline_run",
      title,
      organisationId:
        run.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, run.status, classification),
      metadata: {
        status: run.status,
        pipelineId: String(run.pipelineId),
        importId: String(run.importId),
        providerKind: run.providerKind,
        externalRunRef: run.externalRunRef,
        stageCount: String(run.stages.length),
        jobCount: String(run.jobs.length),
        artifactCount: String(run.artifacts.length),
        logsPresent: run.logs?.length ? "true" : "false",
        secretsPresent: run.secretRefs?.length ? "true" : "false",
        ...(run.startedAt ? { startedAt: run.startedAt } : {}),
        ...(run.completedAt ? { completedAt: run.completedAt } : {}),
        ...(run.durationMs !== undefined ? { durationMs: String(run.durationMs) } : {}),
        ...(run.summary?.overallStatus
          ? { overallResult: run.summary.overallStatus }
          : {}),
        ...(run.revision !== undefined ? { revision: String(run.revision) } : {}),
      },
      keywords: [title, run.status, run.providerKind],
      createdAt: run.createdAt,
      updatedAt: run.updatedAt,
      navigationTarget: navigationTarget("pipeline_run", String(run.id)),
      sourceId: "testing:pipeline_run",
      ownerUserId: run.createdBy ?? context.actorUserId,
      version: run.revision !== undefined ? String(run.revision) : undefined,
    };
  }

  /**
   * Pipeline import metadata — status/timestamps only.
   * NEVER checksum hex, payloadFingerprint, or canonicalSnapshot bodies.
   */
  mapPipelineImport(
    context: TestingSearchPublicationContext,
    imported: PipelineImport,
    extras?: TestingSearchMappingExtras,
  ): SearchEntityDraft {
    assertPlatformEntityId(String(imported.id), "pipeline_import.id");
    assertTenant(imported.tenantId, context);
    const classification = resolveTestingClassification(context, {
      explicit: extras?.classification,
      status: imported.status,
    });
    const title =
      extras?.title ??
      `Pipeline import ${imported.providerKind} ${imported.externalRunRef}`.slice(
        0,
        120,
      );
    return {
      entityId: String(imported.id),
      entityType: "pipeline_import",
      title,
      summary: imported.errorSummary?.slice(0, 280),
      organisationId:
        imported.organisationId ?? extras?.organisationId ?? context.organisationId,
      classification,
      permissions: permissionTokens(context, extras, imported.status, classification),
      metadata: {
        status: imported.status,
        providerKind: imported.providerKind,
        adapterKind: imported.adapterVersion,
        externalRunRef: imported.externalRunRef,
        checksumPresent: imported.checksum ? "true" : "false",
        ...(imported.pipelineId ? { pipelineId: String(imported.pipelineId) } : {}),
        ...(imported.pipelineRunId ? { runId: String(imported.pipelineRunId) } : {}),
        ...(imported.startedAt ? { startedAt: imported.startedAt } : {}),
        ...(imported.completedAt ? { completedAt: imported.completedAt } : {}),
        ...(imported.revision !== undefined
          ? { revision: String(imported.revision) }
          : {}),
      },
      keywords: [title, imported.status, imported.providerKind],
      createdAt: imported.createdAt,
      updatedAt: imported.updatedAt,
      navigationTarget: navigationTarget("pipeline_import", String(imported.id)),
      sourceId: "testing:pipeline_import",
      ownerUserId: imported.createdBy ?? context.actorUserId,
      version: imported.revision !== undefined ? String(imported.revision) : undefined,
    };
  }
}
