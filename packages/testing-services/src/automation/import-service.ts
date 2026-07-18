import type {
  AutomationAdapterRegistry,
  AutomationCoverageService,
  AutomationEvidenceService,
  AutomationImport,
  AutomationImportOutcome,
  AutomationImportService,
  AutomationNormalizationService,
  AutomationTraceabilityService,
  AutomationValidationService,
  AutomationType,
  CanonicalAutomationResult,
} from "@apzhub/testing-contracts";
import {
  asAutomationImportId,
  asAutomatedExecutionId,
  isAutomationType,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError, requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { fingerprintPayload } from "./validation";

function mapOverallToExecutionStatus(
  overall: CanonicalAutomationResult["overallStatus"],
): "completed" | "failed" | "aborted" {
  if (overall === "cancelled") return "aborted";
  if (overall === "fail" || overall === "errored" || overall === "timed_out") {
    return "failed";
  }
  return "completed";
}

function toImportDomain(row: {
  id: string;
  tenantId: string;
  organisationId?: string;
  adapterKind: string;
  adapterVersion: string;
  externalRunRef: string;
  status: string;
  correlationId?: string;
  checksum?: string;
  payloadFingerprint?: string;
  summary?: Readonly<Record<string, unknown>>;
  errorSummary?: string;
  startedAt?: string;
  completedAt?: string;
  canonicalSnapshot?: Readonly<Record<string, unknown>>;
  automatedExecutionId?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  revision: number;
}): AutomationImport {
  return {
    id: asAutomationImportId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId,
    adapterKind: row.adapterKind as AutomationImport["adapterKind"],
    adapterVersion: row.adapterVersion,
    externalRunRef: row.externalRunRef,
    status: row.status as AutomationImport["status"],
    correlationId: row.correlationId,
    checksum: row.checksum,
    payloadFingerprint: row.payloadFingerprint,
    summary: row.summary,
    errorSummary: row.errorSummary,
    startedAt: row.startedAt,
    completedAt: row.completedAt,
    canonicalSnapshot: row.canonicalSnapshot,
    automatedExecutionId: row.automatedExecutionId
      ? asAutomatedExecutionId(row.automatedExecutionId)
      : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export interface AutomationImportServiceDeps {
  readonly runtime: ServiceRuntime;
  readonly registry: AutomationAdapterRegistry;
  readonly normalization: AutomationNormalizationService;
  readonly validation: AutomationValidationService;
  readonly evidence: AutomationEvidenceService;
  readonly traceability: AutomationTraceabilityService;
  readonly coverage: AutomationCoverageService;
}

export function createAutomationImportService(
  deps: AutomationImportServiceDeps,
): AutomationImportService {
  const {
    runtime: rt,
    registry,
    normalization,
    validation,
    evidence,
    traceability,
    coverage,
  } = deps;

  async function persistImport(
    ctx: Parameters<AutomationImportService["importResult"]>[0],
    input: Parameters<AutomationImportService["importResult"]>[1],
    options?: { readonly forceCorrect?: boolean; readonly priorImportId?: string },
  ): Promise<AutomationImportOutcome> {
    validation.assertImportAllowed(ctx);
    const rctx = toRepositoryContext(ctx);
    const adapterInput = {
      payload: input.payload,
      contentType: input.contentType,
      fileNameHint: input.fileNameHint,
      metadata: input.metadata,
    };
    const adapter = input.adapterKind
      ? requireFound(
          registry.get(input.adapterKind),
          "automation_adapter",
          input.adapterKind,
        )
      : registry.resolveForInput(adapterInput);

    const startedAt = rt.now();
    const fingerprint = fingerprintPayload(input.payload);
    const correlationId = input.correlationId ?? ctx.correlationId;

    // Parse + normalize early so duplicate detection uses the real externalRunRef.
    let normalized: CanonicalAutomationResult;
    try {
      const parsed = adapter.parse(adapterInput);
      normalized = normalization.normalizeResult(parsed);
      validation.validateCanonical(normalized);
    } catch (error) {
      rt.events.record({
        eventType: "automation.import_failed",
        tenantId: ctx.tenantId,
        correlationId,
        actorUserId: ctx.userId,
        payload: {
          message: error instanceof Error ? error.message : "parse failed",
        },
      });
      throw error;
    }

    rt.events.record({
      eventType: "automation.import_started",
      tenantId: ctx.tenantId,
      correlationId,
      actorUserId: ctx.userId,
      payload: { adapterKind: adapter.kind, externalRunRef: normalized.externalRunRef },
    });

    rt.events.record({
      eventType: "automation.result_normalized",
      tenantId: ctx.tenantId,
      correlationId,
      actorUserId: ctx.userId,
      payload: {
        adapterKind: normalized.adapterKind,
        overallStatus: normalized.overallStatus,
        externalRunRef: normalized.externalRunRef,
      },
    });

    if (!options?.forceCorrect) {
      const duplicate = await validation.detectDuplicate(ctx, {
        adapterKind: normalized.adapterKind,
        externalRunRef: normalized.externalRunRef,
        payloadFingerprint: fingerprint,
      });
      if (duplicate) {
        const dupRecord = await rt.persistence.automationImports.create(rctx, {
          adapterKind: adapter.kind,
          adapterVersion: adapter.version,
          externalRunRef: `${normalized.externalRunRef}#dup-${rt.id().slice(0, 8)}`,
          status: "duplicate",
          correlationId,
          payloadFingerprint: undefined,
          checksum: fingerprint,
          startedAt,
          completedAt: rt.now(),
          errorSummary: `Duplicate of ${duplicate.id}`,
          summary: { duplicateOf: duplicate.id },
          canonicalSnapshot: normalized as unknown as Record<string, unknown>,
        });
        await rt.persistence.automationImportHistory.append(rctx, {
          id: rt.id(),
          importId: dupRecord.id,
          eventType: "import_duplicate",
          actorUserId: ctx.userId,
          summary: `Duplicate of ${duplicate.id}`,
          details: { duplicateOf: duplicate.id },
          adapterVersion: adapter.version,
          correlationId,
        });
        rt.events.record({
          eventType: "automation.import_duplicate",
          tenantId: ctx.tenantId,
          correlationId,
          actorUserId: ctx.userId,
          payload: { importId: dupRecord.id, duplicateOf: duplicate.id },
        });
        if (input.allowDuplicateReturn !== false) {
          return {
            importRecord: toImportDomain(dupRecord),
            duplicateOf: duplicate,
          };
        }
        throw new DomainRuleError("DUPLICATE_IMPORT", "Duplicate automation import", {
          duplicateOf: duplicate.id,
        });
      }
    }

    let pending = await rt.persistence.automationImports.create(rctx, {
      adapterKind: adapter.kind,
      adapterVersion: adapter.version,
      externalRunRef: normalized.externalRunRef,
      status: "importing",
      correlationId,
      payloadFingerprint: fingerprint,
      checksum: fingerprint,
      startedAt,
      summary: {},
      canonicalSnapshot: normalized as unknown as Record<string, unknown>,
    });

    await rt.persistence.automationImportHistory.append(rctx, {
      id: rt.id(),
      importId: pending.id,
      eventType: "import_started",
      actorUserId: ctx.userId,
      summary: `Import started via ${adapter.kind}`,
      details: { adapterVersion: adapter.version },
      adapterVersion: adapter.version,
      correlationId,
    });

    try {
      const automationType: AutomationType =
        input.automationType && isAutomationType(input.automationType)
          ? input.automationType
          : (normalized.automationType ?? "other");

      const execution = await rt.persistence.automatedExecutions.create(rctx, {
        sessionId: input.sessionId,
        importId: pending.id,
        automationType,
        status: mapOverallToExecutionStatus(normalized.overallStatus),
        adapterSourceId: adapter.kind,
        externalRunRef: normalized.externalRunRef,
        environment: { ...normalized.environment },
        overallStatus: normalized.overallStatus,
        durationMs: normalized.durationMs,
        startedAt: normalized.startedAt,
        completedAt: normalized.completedAt ?? rt.now(),
        adapterKind: normalized.adapterKind,
      });

      const runs = [];
      for (const suite of normalized.suites) {
        for (const c of suite.cases) {
          const run = await rt.persistence.automationRuns.create(rctx, {
            executionId: execution.id,
            suiteKey: suite.key ?? c.suiteKey,
            caseKey: c.key,
            title: c.title,
            status: c.status,
            durationMs: c.durationMs,
            message: c.message,
            stack: c.stack,
            result: {
              tags: c.tags,
              requirementRefs: c.requirementRefs,
            },
            tags: c.tags ?? [],
            requirementRefs: c.requirementRefs ?? [],
          });
          runs.push(run);
          for (const step of c.steps ?? []) {
            await rt.persistence.automationResultItems.create(rctx, {
              runId: run.id,
              status: step.status,
              name: step.name,
              durationMs: step.durationMs,
              message: step.message,
              stepPayload: { ...step },
            });
          }
        }
      }

      const evidenceRegs =
        normalized.evidence.length > 0
          ? await evidence.registerFromCanonical(ctx, {
              executionId: asAutomatedExecutionId(execution.id),
              importId: asAutomationImportId(pending.id),
              evidence: normalized.evidence,
            })
          : [];

      await traceability.linkImportedResult(ctx, {
        importId: asAutomationImportId(pending.id),
        executionId: asAutomatedExecutionId(execution.id),
        result: normalized,
      });

      const coverageSnap = normalized.coverage
        ? await coverage.ingestSnapshot(ctx, {
            importId: asAutomationImportId(pending.id),
            executionId: asAutomatedExecutionId(execution.id),
            summary: normalized.coverage,
          })
        : undefined;

      const finalStatus = options?.forceCorrect ? "corrected" : "completed";
      pending = await rt.persistence.automationImports.update(
        rctx,
        pending.id,
        pending.revision,
        {
          status: finalStatus,
          completedAt: rt.now(),
          automatedExecutionId: execution.id,
          summary: {
            caseCount: runs.length,
            overallStatus: normalized.overallStatus,
            priorImportId: options?.priorImportId,
          },
        },
      );

      await rt.persistence.automationImportHistory.append(rctx, {
        id: rt.id(),
        importId: pending.id,
        eventType: options?.forceCorrect ? "import_corrected" : "import_completed",
        actorUserId: ctx.userId,
        summary: options?.forceCorrect
          ? "Import corrected and re-persisted"
          : "Import completed",
        details: {
          executionId: execution.id,
          caseCount: runs.length,
        },
        adapterVersion: adapter.version,
        normalizationNotes: `overall=${normalized.overallStatus}`,
        correlationId,
      });

      rt.events.record({
        eventType: options?.forceCorrect
          ? "automation.import_corrected"
          : "automation.import_completed",
        tenantId: ctx.tenantId,
        correlationId,
        actorUserId: ctx.userId,
        payload: {
          importId: pending.id,
          executionId: execution.id,
          caseCount: runs.length,
        },
      });

      return {
        importRecord: toImportDomain(pending),
        execution: {
          id: asAutomatedExecutionId(execution.id),
          tenantId: execution.tenantId,
          organisationId: execution.organisationId,
          sessionId: execution.sessionId as never,
          importId: asAutomationImportId(execution.importId),
          automationType: execution.automationType,
          status: execution.status,
          adapterSourceId: execution.adapterSourceId,
          externalRunRef: execution.externalRunRef,
          environment: execution.environment,
          overallStatus:
            execution.overallStatus as CanonicalAutomationResult["overallStatus"],
          durationMs: execution.durationMs,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          adapterKind:
            execution.adapterKind as CanonicalAutomationResult["adapterKind"],
          createdAt: execution.createdAt,
          updatedAt: execution.updatedAt,
          createdBy: execution.createdBy,
          updatedBy: execution.updatedBy,
          revision: execution.revision,
        },
        runs: runs.map((run) => ({
          id: run.id as never,
          tenantId: run.tenantId,
          organisationId: run.organisationId,
          executionId: asAutomatedExecutionId(run.executionId),
          suiteKey: run.suiteKey,
          caseKey: run.caseKey,
          title: run.title,
          status: run.status as CanonicalAutomationResult["overallStatus"],
          durationMs: run.durationMs,
          message: run.message,
          stack: run.stack,
          result: run.result,
          tags: run.tags,
          requirementRefs: run.requirementRefs,
          createdAt: run.createdAt,
          updatedAt: run.updatedAt,
          createdBy: run.createdBy,
          updatedBy: run.updatedBy,
          revision: run.revision,
        })),
        evidence: evidenceRegs,
        coverage: coverageSnap,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed";
      try {
        await rt.persistence.automationImports.update(
          rctx,
          pending.id,
          pending.revision,
          {
            status: "failed",
            completedAt: rt.now(),
            errorSummary: message,
          },
        );
      } catch {
        // best-effort
      }
      await rt.persistence.automationImportHistory.append(rctx, {
        id: rt.id(),
        importId: pending.id,
        eventType: "import_failed",
        actorUserId: ctx.userId,
        summary: message,
        details: {},
        adapterVersion: adapter.version,
        correlationId,
      });
      rt.events.record({
        eventType: "automation.import_failed",
        tenantId: ctx.tenantId,
        correlationId,
        actorUserId: ctx.userId,
        payload: { importId: pending.id, message },
      });
      throw error;
    }
  }

  return {
    importResult(ctx, input) {
      return persistImport(ctx, input);
    },
    async reimport(ctx, importId, input) {
      const rctx = toRepositoryContext(ctx);
      requireFound(
        await rt.persistence.automationImports.get(rctx, importId),
        "automation_import",
        importId,
      );
      return persistImport(ctx, {
        ...input,
        metadata: {
          ...input.metadata,
          reimportOf: importId,
        },
      });
    },
    async correct(ctx, importId, input) {
      const rctx = toRepositoryContext(ctx);
      requireFound(
        await rt.persistence.automationImports.get(rctx, importId),
        "automation_import",
        importId,
      );
      return persistImport(
        ctx,
        {
          ...input,
          metadata: {
            ...input.metadata,
            corrects: importId,
          },
        },
        { forceCorrect: true, priorImportId: importId },
      );
    },
  };
}
