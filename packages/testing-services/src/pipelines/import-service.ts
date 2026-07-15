import type {
  ArtifactReference,
  CanonicalPipelineResult,
  Pipeline,
  PipelineImport,
  PipelineImportHistory,
  PipelineImportService,
  PipelineJob,
  PipelineLinks,
  PipelineRun,
  PipelineStage,
} from "@apzhub/testing-contracts";
import {
  asCertificationRecordId,
  asEvidenceId,
  asPipelineId,
  asPipelineImportHistoryId,
  asPipelineImportId,
  asPipelineRunId,
  asReleaseId,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError, requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import type {
  PipelineAdapterRegistry,
  PipelineNormalizationService,
  PipelineValidationService,
} from "@apzhub/testing-contracts";
import { fingerprintPipelinePayload } from "./validation";

function toPipelineDomain(row: {
  id: string;
  tenantId: string;
  organisationId?: string;
  key: string;
  name: string;
  providerKind: string;
  externalPipelineRef?: string;
  description?: string;
  status: string;
  defaultBranch?: string;
  repositoryRef?: string;
  variablesJson: readonly unknown[];
  secretRefsJson: readonly unknown[];
  metadataJson?: Readonly<Record<string, unknown>>;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision: number;
  archivedAt?: string;
}): Pipeline {
  return {
    id: asPipelineId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    key: row.key,
    name: row.name,
    providerKind: row.providerKind as Pipeline["providerKind"],
    externalPipelineRef: row.externalPipelineRef,
    description: row.description,
    status: row.status as Pipeline["status"],
    defaultBranch: row.defaultBranch,
    repositoryRef: row.repositoryRef,
    variables: row.variablesJson as Pipeline["variables"],
    secretRefs: row.secretRefsJson as Pipeline["secretRefs"],
    metadata: row.metadataJson,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
    archivedAt: row.archivedAt,
  };
}

function toImportDomain(row: {
  id: string;
  tenantId: string;
  organisationId?: string;
  providerKind: string;
  adapterVersion: string;
  externalRunRef: string;
  pipelineId?: string;
  status: string;
  correlationId?: string;
  checksum?: string;
  payloadFingerprint?: string;
  summary?: Readonly<Record<string, unknown>>;
  errorSummary?: string;
  startedAt?: string;
  completedAt?: string;
  canonicalSnapshot?: Readonly<Record<string, unknown>>;
  pipelineRunId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision: number;
}): PipelineImport {
  return {
    id: asPipelineImportId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    providerKind: row.providerKind as PipelineImport["providerKind"],
    adapterVersion: row.adapterVersion,
    externalRunRef: row.externalRunRef,
    pipelineId: row.pipelineId ? asPipelineId(row.pipelineId) : undefined,
    status: row.status as PipelineImport["status"],
    correlationId: row.correlationId,
    checksum: row.checksum,
    payloadFingerprint: row.payloadFingerprint,
    summary: row.summary,
    errorSummary: row.errorSummary,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    canonicalSnapshot: row.canonicalSnapshot,
    pipelineRunId: row.pipelineRunId
      ? asPipelineRunId(row.pipelineRunId)
      : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function toRunDomain(row: {
  id: string;
  tenantId: string;
  organisationId?: string;
  pipelineId: string;
  importId: string;
  providerKind: string;
  externalRunRef: string;
  status: string;
  stagesJson: readonly unknown[];
  jobsJson: readonly unknown[];
  artifactsJson: readonly unknown[];
  approvalsJson: readonly unknown[];
  eventsJson: readonly unknown[];
  environmentJson: Readonly<Record<string, unknown>>;
  linksJson: Readonly<Record<string, unknown>>;
  summaryJson: Readonly<Record<string, unknown>>;
  metricsJson?: Readonly<Record<string, unknown>>;
  logsJson: readonly unknown[];
  variablesJson: readonly unknown[];
  secretRefsJson: readonly unknown[];
  triggerJson?: Readonly<Record<string, unknown>>;
  sourceJson?: Readonly<Record<string, unknown>>;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  correlationId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision: number;
}): PipelineRun {
  const links = row.linksJson as PipelineLinks;
  return {
    id: asPipelineRunId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    pipelineId: asPipelineId(row.pipelineId),
    importId: asPipelineImportId(row.importId),
    providerKind: row.providerKind as PipelineRun["providerKind"],
    externalRunRef: row.externalRunRef,
    status: row.status as PipelineRun["status"],
    stages: row.stagesJson as readonly PipelineStage[],
    jobs: row.jobsJson as readonly PipelineJob[],
    artifacts: row.artifactsJson as readonly ArtifactReference[],
    approvals: row.approvalsJson as PipelineRun["approvals"],
    events: row.eventsJson as PipelineRun["events"],
    environment: row.environmentJson as PipelineRun["environment"],
    links: {
      automationImportId: links.automationImportId,
      coverageMetricIds: links.coverageMetricIds,
      executionIds: links.executionIds,
      releaseId: links.releaseId
        ? asReleaseId(String(links.releaseId))
        : undefined,
      certificationRecordId: links.certificationRecordId
        ? asCertificationRecordId(String(links.certificationRecordId))
        : undefined,
      evidenceIds: links.evidenceIds?.map((id) => asEvidenceId(String(id))),
    },
    summary: row.summaryJson as unknown as PipelineRun["summary"],
    metrics: row.metricsJson as PipelineRun["metrics"],
    logs: row.logsJson as PipelineRun["logs"],
    variables: row.variablesJson as PipelineRun["variables"],
    secretRefs: row.secretRefsJson as PipelineRun["secretRefs"],
    trigger: row.triggerJson as PipelineRun["trigger"],
    source: row.sourceJson as PipelineRun["source"],
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    durationMs: row.durationMs,
    correlationId: row.correlationId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export interface PipelineImportServiceDeps {
  readonly runtime: ServiceRuntime;
  readonly registry: PipelineAdapterRegistry;
  readonly normalization: PipelineNormalizationService;
  readonly validation: PipelineValidationService;
}

export function createPipelineImportService(
  deps: PipelineImportServiceDeps,
): PipelineImportService {
  const { runtime: rt, registry, normalization, validation } = deps;

  async function resolveOrRegisterPipeline(
    ctx: Parameters<PipelineImportService["importRun"]>[0],
    result: CanonicalPipelineResult,
    explicitPipelineId?: string,
    pipelineKey?: string,
  ): Promise<Pipeline> {
    const rctx = toRepositoryContext(ctx);
    if (explicitPipelineId) {
      const existing = requireFound(
        await rt.persistence.pipelines.get(rctx, explicitPipelineId),
        "pipeline",
        explicitPipelineId,
      );
      return toPipelineDomain(existing);
    }
    const key =
      pipelineKey ??
      result.pipelineKey ??
      result.externalPipelineRef ??
      `${result.providerKind}-default`;
    const listed = await rt.persistence.pipelines.list(rctx, { pageSize: 500 });
    const found = listed.items.find((p) => p.key === key && p.status === "active");
    if (found) return toPipelineDomain(found);
    const created = await rt.persistence.pipelines.create(rctx, {
      key,
      name: result.pipelineName ?? key,
      providerKind: result.providerKind,
      externalPipelineRef: result.externalPipelineRef,
      status: "active",
      variablesJson: result.variables ?? [],
      secretRefsJson: result.secretRefs ?? [],
      metadataJson: result.metadata,
    });
    return toPipelineDomain(created);
  }

  async function persistRunFromCanonical(
    ctx: Parameters<PipelineImportService["importRun"]>[0],
    input: Parameters<PipelineImportService["importRun"]>[1],
    normalized: CanonicalPipelineResult,
    adapter: { kind: string; version: string },
    fingerprint: string,
  ) {
    const rctx = toRepositoryContext(ctx);
    const correlationId = input.correlationId ?? ctx.correlationId;
    const startedAt = rt.now();

    const duplicate = await validation.detectDuplicate(ctx, {
      providerKind: normalized.providerKind,
      externalRunRef: normalized.externalRunRef,
      payloadFingerprint: fingerprint,
    });
    if (duplicate) {
      const dupRecord = await rt.persistence.pipelineImports.create(rctx, {
        providerKind: adapter.kind,
        adapterVersion: adapter.version,
        externalRunRef: `${normalized.externalRunRef}#dup-${rt.id().slice(0, 8)}`,
        pipelineId: duplicate.pipelineId,
        status: "duplicate",
        correlationId,
        checksum: fingerprint,
        payloadFingerprint: undefined,
        startedAt,
        completedAt: rt.now(),
        errorSummary: `Duplicate of ${duplicate.id}`,
        summary: { duplicateOf: duplicate.id },
        canonicalSnapshot: normalized as unknown as Record<string, unknown>,
      });
      await rt.persistence.pipelineImportHistory.append(rctx, {
        id: rt.id(),
        importId: dupRecord.id,
        eventType: "import_duplicate",
        actorUserId: ctx.userId,
        summary: `Duplicate of ${duplicate.id}`,
        details: { duplicateOf: duplicate.id },
        adapterVersion: adapter.version,
        correlationId,
      });
      if (input.allowDuplicateReturn !== false) {
        return {
          importRecord: toImportDomain(dupRecord),
          duplicateOf: duplicate,
        };
      }
      throw new DomainRuleError(
        "DUPLICATE_IMPORT",
        `Duplicate pipeline run ${normalized.externalRunRef}`,
        { duplicateOf: duplicate.id },
      );
    }

    const pipeline = await resolveOrRegisterPipeline(
      ctx,
      normalized,
      input.pipelineId,
      input.pipelineKey,
    );

    const importRecord = await rt.persistence.pipelineImports.create(rctx, {
      providerKind: adapter.kind,
      adapterVersion: adapter.version,
      externalRunRef: normalized.externalRunRef,
      pipelineId: pipeline.id,
      status: "importing",
      correlationId,
      checksum: fingerprint,
      payloadFingerprint: fingerprint,
      startedAt,
      canonicalSnapshot: normalized as unknown as Record<string, unknown>,
      summary: {
        status: normalized.status,
        stages: normalized.stages.length,
        jobs: normalized.jobs.length,
      },
    });

    await rt.persistence.pipelineImportHistory.append(rctx, {
      id: rt.id(),
      importId: importRecord.id,
      eventType: "import_started",
      actorUserId: ctx.userId,
      summary: `Importing ${normalized.externalRunRef}`,
      details: {},
      adapterVersion: adapter.version,
      correlationId,
    });

    const run = await rt.persistence.pipelineRuns.create(rctx, {
      pipelineId: pipeline.id,
      importId: importRecord.id,
      providerKind: normalized.providerKind,
      externalRunRef: normalized.externalRunRef,
      status: normalized.status,
      stagesJson: normalized.stages,
      jobsJson: normalized.jobs,
      artifactsJson: normalized.artifacts,
      approvalsJson: normalized.approvals,
      eventsJson: normalized.events,
      environmentJson: normalized.environment as unknown as Record<string, unknown>,
      linksJson: {},
      summaryJson: normalized.summary as unknown as Record<string, unknown>,
      metricsJson: normalized.metrics as unknown as Record<string, unknown> | undefined,
      logsJson: normalized.logs,
      variablesJson: normalized.variables,
      secretRefsJson: normalized.secretRefs,
      triggerJson: normalized.trigger as unknown as Record<string, unknown> | undefined,
      sourceJson: normalized.source as unknown as Record<string, unknown> | undefined,
      startedAt: normalized.startedAt,
      completedAt: normalized.completedAt,
      durationMs: normalized.durationMs,
      correlationId,
    });

    const completed = await rt.persistence.pipelineImports.update(
      rctx,
      importRecord.id,
      importRecord.revision,
      {
        status: "completed",
        completedAt: rt.now(),
        pipelineRunId: run.id,
      },
    );

    await rt.persistence.pipelineImportHistory.append(rctx, {
      id: rt.id(),
      importId: importRecord.id,
      eventType: "import_completed",
      actorUserId: ctx.userId,
      summary: `Imported run ${run.id}`,
      details: { runId: run.id },
      adapterVersion: adapter.version,
      correlationId,
    });

    return {
      importRecord: toImportDomain(completed),
      run: toRunDomain(run),
      pipeline,
    };
  }

  return {
    async registerPipeline(ctx, input) {
      validation.assertImportAllowed(ctx);
      const rctx = toRepositoryContext(ctx);
      const created = await rt.persistence.pipelines.create(rctx, {
        key: input.key,
        name: input.name,
        providerKind: input.providerKind,
        externalPipelineRef: input.externalPipelineRef,
        description: input.description,
        defaultBranch: input.defaultBranch,
        repositoryRef: input.repositoryRef,
        status: "active",
        variablesJson: [],
        secretRefsJson: [],
        metadataJson: input.metadata,
        organisationId: input.organisationId,
      });
      return toPipelineDomain(created);
    },

    async synchroniseMetadata(ctx, input) {
      validation.assertImportAllowed(ctx);
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.pipelines.get(rctx, input.pipelineId),
        "pipeline",
        input.pipelineId,
      );
      const updated = await rt.persistence.pipelines.update(
        rctx,
        existing.id,
        existing.revision,
        {
          externalPipelineRef: input.externalPipelineRef,
          name: input.name,
          description: input.description,
          defaultBranch: input.defaultBranch,
          repositoryRef: input.repositoryRef,
          metadataJson: input.metadata,
        },
      );
      return toPipelineDomain(updated);
    },

    async importRun(ctx, input) {
      validation.assertImportAllowed(ctx);
      const fingerprint = fingerprintPipelinePayload(input.payload);
      const adapter = input.providerKind
        ? requireFound(
            registry.get(input.providerKind),
            "pipeline_adapter",
            input.providerKind,
          )
        : registry.resolveForInput(input.payload);

      const parsed = adapter.parse(input.payload);
      const normalized = normalization.normalizeResult(parsed);
      validation.validateCanonical(normalized);

      return persistRunFromCanonical(ctx, input, normalized, adapter, fingerprint);
    },

    async importExecutionSummary(ctx, input) {
      validation.assertImportAllowed(ctx);
      const rctx = toRepositoryContext(ctx);
      const pipeline = requireFound(
        await rt.persistence.pipelines.get(rctx, input.pipelineId),
        "pipeline",
        input.pipelineId,
      );
      const canonical: CanonicalPipelineResult = {
        providerKind: pipeline.providerKind as CanonicalPipelineResult["providerKind"],
        externalRunRef: input.externalRunRef,
        externalPipelineRef: pipeline.externalPipelineRef,
        pipelineKey: pipeline.key,
        pipelineName: pipeline.name,
        status: input.status,
        stages: [],
        jobs: [],
        artifacts: [],
        environment: {},
        approvals: [],
        events: [
          {
            kind: "completed",
            occurredAt: input.completedAt ?? rt.now(),
            message: "Execution summary imported",
          },
        ],
        summary: input.summary ?? { overallStatus: input.status },
        metrics: input.metrics,
        logs: [],
        variables: [],
        secretRefs: [],
        startedAt: input.startedAt,
        completedAt: input.completedAt,
        durationMs: input.durationMs,
        correlationId: input.correlationId ?? ctx.correlationId,
      };
      const normalized = normalization.normalizeResult(canonical);
      validation.validateCanonical(normalized);
      const fingerprint = fingerprintPipelinePayload(normalized);
      return persistRunFromCanonical(
        ctx,
        {
          payload: normalized,
          providerKind: normalized.providerKind,
          pipelineId: asPipelineId(pipeline.id),
          correlationId: input.correlationId,
        },
        normalized,
        { kind: pipeline.providerKind, version: "summary-1.0.0" },
        fingerprint,
      );
    },

    async linkArtifacts(ctx, runId, artifacts) {
      validation.assertImportAllowed(ctx);
      const rctx = toRepositoryContext(ctx);
      const run = requireFound(
        await rt.persistence.pipelineRuns.get(rctx, runId),
        "pipeline_run",
        runId,
      );
      const merged = [
        ...(run.artifactsJson as ArtifactReference[]),
        ...artifacts,
      ];
      const updated = await rt.persistence.pipelineRuns.update(
        rctx,
        run.id,
        run.revision,
        { artifactsJson: merged },
      );
      return toRunDomain(updated);
    },

    async linkEvidence(ctx, runId, evidenceIds) {
      const rctx = toRepositoryContext(ctx);
      const run = requireFound(
        await rt.persistence.pipelineRuns.get(rctx, runId),
        "pipeline_run",
        runId,
      );
      const links = { ...(run.linksJson as PipelineLinks) };
      const existing = [...(links.evidenceIds ?? [])];
      for (const id of evidenceIds) {
        if (!existing.includes(id)) existing.push(id);
      }
      const updated = await rt.persistence.pipelineRuns.update(
        rctx,
        run.id,
        run.revision,
        { linksJson: { ...links, evidenceIds: existing } },
      );
      return toRunDomain(updated);
    },

    async linkCertifications(ctx, runId, certificationRecordId) {
      const rctx = toRepositoryContext(ctx);
      const run = requireFound(
        await rt.persistence.pipelineRuns.get(rctx, runId),
        "pipeline_run",
        runId,
      );
      const links = { ...(run.linksJson as PipelineLinks) };
      const updated = await rt.persistence.pipelineRuns.update(
        rctx,
        run.id,
        run.revision,
        { linksJson: { ...links, certificationRecordId } },
      );
      return toRunDomain(updated);
    },

    async linkReleases(ctx, runId, releaseId) {
      const rctx = toRepositoryContext(ctx);
      const run = requireFound(
        await rt.persistence.pipelineRuns.get(rctx, runId),
        "pipeline_run",
        runId,
      );
      const links = { ...(run.linksJson as PipelineLinks) };
      const updated = await rt.persistence.pipelineRuns.update(
        rctx,
        run.id,
        run.revision,
        { linksJson: { ...links, releaseId } },
      );
      return toRunDomain(updated);
    },

    async updatePipeline(ctx, id, input) {
      validation.assertImportAllowed(ctx);
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.pipelines.get(rctx, id),
        "pipeline",
        id,
      );
      const updated = await rt.persistence.pipelines.update(
        rctx,
        existing.id,
        existing.revision,
        {
          name: input.name,
          description: input.description,
          externalPipelineRef: input.externalPipelineRef,
          defaultBranch: input.defaultBranch,
          repositoryRef: input.repositoryRef,
          metadataJson: input.metadata,
        },
      );
      return toPipelineDomain(updated);
    },

    async archivePipeline(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.pipelines.get(rctx, id),
        "pipeline",
        id,
      );
      const updated = await rt.persistence.pipelines.update(
        rctx,
        existing.id,
        existing.revision,
        { status: "archived" },
      );
      await rt.persistence.pipelines.archive(rctx, existing.id, updated.revision);
      return toPipelineDomain({ ...updated, status: "archived" });
    },

    async getRun(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const run = requireFound(
        await rt.persistence.pipelineRuns.get(rctx, id),
        "pipeline_run",
        id,
      );
      return toRunDomain(run);
    },

    async listRuns(ctx, pipelineId) {
      const rctx = toRepositoryContext(ctx);
      const listed = await rt.persistence.pipelineRuns.list(rctx, { pageSize: 500 });
      const items = pipelineId
        ? listed.items.filter((r) => r.pipelineId === pipelineId)
        : listed.items;
      return items.map(toRunDomain);
    },

    async listPipelines(ctx) {
      const rctx = toRepositoryContext(ctx);
      const listed = await rt.persistence.pipelines.list(rctx, { pageSize: 500 });
      return listed.items.map(toPipelineDomain);
    },

    async getPipeline(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const pipeline = requireFound(
        await rt.persistence.pipelines.get(rctx, id),
        "pipeline",
        id,
      );
      return toPipelineDomain(pipeline);
    },

    async listHistory(ctx, importId) {
      const rctx = toRepositoryContext(ctx);
      const history = await rt.persistence.pipelineImportHistory.listByImport(
        rctx,
        importId,
      );
      return history.items.map(
        (row): PipelineImportHistory => ({
          id: asPipelineImportHistoryId(row.id),
          tenantId: row.tenantId,
          organisationId: row.organisationId,
          importId: asPipelineImportId(row.importId),
          eventType: row.eventType,
          occurredAt: row.occurredAt,
          actorUserId: row.actorUserId,
          summary: row.summary,
          details: row.details,
          adapterVersion: row.adapterVersion,
          normalizationNotes: row.normalizationNotes,
          correlationId: row.correlationId,
        }),
      );
    },

    async getImport(ctx, id) {
      const rctx = toRepositoryContext(ctx);
      const imp = requireFound(
        await rt.persistence.pipelineImports.get(rctx, id),
        "pipeline_import",
        id,
      );
      return toImportDomain(imp);
    },

    async listImports(ctx) {
      const rctx = toRepositoryContext(ctx);
      const listed = await rt.persistence.pipelineImports.list(rctx, {
        pageSize: 500,
      });
      return listed.items.map(toImportDomain);
    },

    async listStages(ctx, runId) {
      const run = await this.getRun(ctx, runId);
      return run.stages;
    },

    async listJobs(ctx, runId) {
      const run = await this.getRun(ctx, runId);
      return run.jobs;
    },

    async getLinks(ctx, runId) {
      const run = await this.getRun(ctx, runId);
      return run.links;
    },

    async listProviders(ctx) {
      void ctx;
      return registry.list();
    },
  };
}

export { toPipelineDomain, toImportDomain, toRunDomain };
