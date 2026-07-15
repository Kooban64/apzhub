import { randomUUID } from "node:crypto";

import { assertPermission } from "../../authorization/testing-authorization";
import {
  assertRequiredString,
  validatePipelineImportStatus,
  validatePipelineProviderKind,
  validatePipelineRunStatus,
} from "../../validation/persistence-validation";
import type {
  CrudRepository,
  PipelineCreate,
  PipelineImportCreate,
  PipelineImportHistoryRepository,
  PipelineImportUpdate,
  PipelineRunCreate,
  PipelineRunUpdate,
  PipelineUpdate,
} from "../interfaces";
import type {
  PipelineImportHistoryRecord,
  PipelineImportRecord,
  PipelineRecord,
  PipelineRunRecord,
} from "../records";
import {
  compareValues,
  matchesFilters,
  matchesSearch,
  normalizeListQuery,
  paginateItems,
} from "../types";
import {
  baseMeta,
  createInMemoryCrudRepository,
} from "../in-memory/generic-crud";

export interface PipelineInMemoryStores {
  pipelines: Map<string, PipelineRecord>;
  pipelineImports: Map<string, PipelineImportRecord>;
  pipelineRuns: Map<string, PipelineRunRecord>;
  pipelineImportHistory: Map<string, PipelineImportHistoryRecord>;
}

export function createEmptyPipelineInMemoryStores(): PipelineInMemoryStores {
  return {
    pipelines: new Map(),
    pipelineImports: new Map(),
    pipelineRuns: new Map(),
    pipelineImportHistory: new Map(),
  };
}

export function createInMemoryPipelineRepos(stores: PipelineInMemoryStores): {
  pipelines: CrudRepository<PipelineCreate, PipelineUpdate, PipelineRecord>;
  pipelineImports: CrudRepository<
    PipelineImportCreate,
    PipelineImportUpdate,
    PipelineImportRecord
  >;
  pipelineRuns: CrudRepository<PipelineRunCreate, PipelineRunUpdate, PipelineRunRecord>;
  pipelineImportHistory: PipelineImportHistoryRepository;
} {
  return {
    pipelines: createInMemoryCrudRepository<
      PipelineCreate,
      PipelineUpdate,
      PipelineRecord
    >({
      kind: "pipeline",
      store: stores.pipelines,
      searchFields: ["key", "name", "providerKind", "status", "description"],
      validateCreate: (input) => {
        assertRequiredString(input.key, "key");
        assertRequiredString(input.name, "name");
        validatePipelineProviderKind(String(input.providerKind));
      },
      validateUpdate: (input) => {
        if (input.providerKind !== undefined) {
          validatePipelineProviderKind(String(input.providerKind));
        }
        if (input.status !== undefined) {
          const status = String(input.status);
          if (status !== "active" && status !== "archived") {
            validatePipelineRunStatus(status);
          }
        }
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          key: String(existing?.key ?? input.key),
          name: String(input.name ?? existing?.name ?? ""),
          providerKind: String(
            input.providerKind ?? existing?.providerKind ?? "generic_ci",
          ),
          externalPipelineRef:
            (input.externalPipelineRef as string | undefined) ??
            existing?.externalPipelineRef,
          description:
            (input.description as string | undefined) ?? existing?.description,
          status:
            (input.status as PipelineRecord["status"]) ??
            existing?.status ??
            "active",
          defaultBranch:
            (input.defaultBranch as string | undefined) ?? existing?.defaultBranch,
          repositoryRef:
            (input.repositoryRef as string | undefined) ?? existing?.repositoryRef,
          variablesJson:
            (input.variablesJson as readonly unknown[]) ??
            existing?.variablesJson ??
            [],
          secretRefsJson:
            (input.secretRefsJson as readonly unknown[]) ??
            existing?.secretRefsJson ??
            [],
          metadataJson:
            (input.metadataJson as Readonly<Record<string, unknown>> | undefined) ??
            existing?.metadataJson,
        };
      },
    }),

    pipelineImports: createInMemoryCrudRepository<
      PipelineImportCreate,
      PipelineImportUpdate,
      PipelineImportRecord
    >({
      kind: "pipeline_import",
      store: stores.pipelineImports,
      searchFields: ["externalRunRef", "providerKind", "status", "errorSummary"],
      validateCreate: (input) => {
        assertRequiredString(input.providerKind, "providerKind");
        assertRequiredString(input.adapterVersion, "adapterVersion");
        assertRequiredString(input.externalRunRef, "externalRunRef");
        validatePipelineProviderKind(String(input.providerKind));
        validatePipelineImportStatus(String(input.status));
      },
      validateUpdate: (input) => {
        if (input.providerKind !== undefined) {
          validatePipelineProviderKind(String(input.providerKind));
        }
        if (input.status !== undefined) {
          validatePipelineImportStatus(String(input.status));
        }
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          providerKind: String(
            input.providerKind ?? existing?.providerKind ?? "generic_ci",
          ),
          adapterVersion: String(
            input.adapterVersion ?? existing?.adapterVersion ?? "",
          ),
          externalRunRef: String(
            input.externalRunRef ?? existing?.externalRunRef ?? "",
          ),
          pipelineId:
            (input.pipelineId as string | undefined) ?? existing?.pipelineId,
          status: String(input.status ?? existing?.status ?? "pending"),
          correlationId:
            (input.correlationId as string | undefined) ?? existing?.correlationId,
          checksum: (input.checksum as string | undefined) ?? existing?.checksum,
          payloadFingerprint:
            (input.payloadFingerprint as string | undefined) ??
            existing?.payloadFingerprint,
          summary:
            (input.summary as Readonly<Record<string, unknown>> | undefined) ??
            existing?.summary,
          errorSummary:
            (input.errorSummary as string | undefined) ?? existing?.errorSummary,
          startedAt: (input.startedAt as string | undefined) ?? existing?.startedAt,
          completedAt:
            (input.completedAt as string | undefined) ?? existing?.completedAt,
          canonicalSnapshot:
            (input.canonicalSnapshot as
              | Readonly<Record<string, unknown>>
              | undefined) ?? existing?.canonicalSnapshot,
          pipelineRunId:
            (input.pipelineRunId as string | undefined) ?? existing?.pipelineRunId,
        };
      },
    }),

    pipelineRuns: createInMemoryCrudRepository<
      PipelineRunCreate,
      PipelineRunUpdate,
      PipelineRunRecord
    >({
      kind: "pipeline_run",
      store: stores.pipelineRuns,
      searchFields: ["externalRunRef", "providerKind", "status", "pipelineId"],
      validateCreate: (input) => {
        assertRequiredString(input.pipelineId, "pipelineId");
        assertRequiredString(input.importId, "importId");
        assertRequiredString(input.externalRunRef, "externalRunRef");
        validatePipelineProviderKind(String(input.providerKind));
        validatePipelineRunStatus(String(input.status));
      },
      validateUpdate: (input) => {
        if (input.providerKind !== undefined) {
          validatePipelineProviderKind(String(input.providerKind));
        }
        if (input.status !== undefined) {
          validatePipelineRunStatus(String(input.status));
        }
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
          pipelineId: String(existing?.pipelineId ?? input.pipelineId),
          importId: String(existing?.importId ?? input.importId),
          providerKind: String(
            input.providerKind ?? existing?.providerKind ?? "generic_ci",
          ),
          externalRunRef: String(
            input.externalRunRef ?? existing?.externalRunRef ?? "",
          ),
          status: String(input.status ?? existing?.status ?? "unknown"),
          stagesJson:
            (input.stagesJson as readonly unknown[]) ?? existing?.stagesJson ?? [],
          jobsJson:
            (input.jobsJson as readonly unknown[]) ?? existing?.jobsJson ?? [],
          artifactsJson:
            (input.artifactsJson as readonly unknown[]) ??
            existing?.artifactsJson ??
            [],
          approvalsJson:
            (input.approvalsJson as readonly unknown[]) ??
            existing?.approvalsJson ??
            [],
          eventsJson:
            (input.eventsJson as readonly unknown[]) ?? existing?.eventsJson ?? [],
          environmentJson:
            (input.environmentJson as Readonly<Record<string, unknown>>) ??
            existing?.environmentJson ??
            {},
          linksJson:
            (input.linksJson as Readonly<Record<string, unknown>>) ??
            existing?.linksJson ??
            {},
          summaryJson:
            (input.summaryJson as Readonly<Record<string, unknown>>) ??
            existing?.summaryJson ??
            {},
          metricsJson:
            (input.metricsJson as Readonly<Record<string, unknown>> | undefined) ??
            existing?.metricsJson,
          logsJson:
            (input.logsJson as readonly unknown[]) ?? existing?.logsJson ?? [],
          variablesJson:
            (input.variablesJson as readonly unknown[]) ??
            existing?.variablesJson ??
            [],
          secretRefsJson:
            (input.secretRefsJson as readonly unknown[]) ??
            existing?.secretRefsJson ??
            [],
          triggerJson:
            (input.triggerJson as Readonly<Record<string, unknown>> | undefined) ??
            existing?.triggerJson,
          sourceJson:
            (input.sourceJson as Readonly<Record<string, unknown>> | undefined) ??
            existing?.sourceJson,
          startedAt: (input.startedAt as string | undefined) ?? existing?.startedAt,
          completedAt:
            (input.completedAt as string | undefined) ?? existing?.completedAt,
          durationMs:
            (input.durationMs as number | undefined) ?? existing?.durationMs,
          correlationId:
            (input.correlationId as string | undefined) ?? existing?.correlationId,
        };
      },
    }),

    pipelineImportHistory: {
      async append(ctx, input) {
        assertPermission(ctx, "pipeline_import_history", "append");
        assertRequiredString(input.importId, "importId");
        assertRequiredString(input.eventType, "eventType");
        assertRequiredString(input.summary, "summary");
        const record: PipelineImportHistoryRecord = {
          id: input.id || randomUUID(),
          tenantId: input.tenantId ?? ctx.tenantId,
          organisationId: input.organisationId ?? ctx.organisationId,
          importId: input.importId,
          eventType: input.eventType,
          occurredAt: input.occurredAt ?? new Date().toISOString(),
          actorUserId: input.actorUserId ?? ctx.actorUserId,
          summary: input.summary,
          details: input.details ?? {},
          adapterVersion: input.adapterVersion,
          normalizationNotes: input.normalizationNotes,
          correlationId: input.correlationId ?? ctx.correlationId,
        };
        stores.pipelineImportHistory.set(record.id, record);
        return record;
      },
      async listByImport(ctx, importId, query) {
        assertPermission(ctx, "pipeline_import_history", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.pipelineImportHistory.values()].filter(
          (row) => row.tenantId === ctx.tenantId && row.importId === importId,
        );
        items = items.filter((row) =>
          matchesSearch(row as unknown as Record<string, unknown>, q.search, [
            "summary",
            "eventType",
          ]),
        );
        items = items.filter((row) =>
          matchesFilters(row as unknown as Record<string, unknown>, q.filters),
        );
        items = [...items].sort((a, b) =>
          compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
      async list(ctx, query) {
        assertPermission(ctx, "pipeline_import_history", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.pipelineImportHistory.values()].filter(
          (row) => row.tenantId === ctx.tenantId,
        );
        items = items.filter((row) =>
          matchesSearch(row as unknown as Record<string, unknown>, q.search, [
            "summary",
            "eventType",
          ]),
        );
        items = items.filter((row) =>
          matchesFilters(row as unknown as Record<string, unknown>, q.filters),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
      async get(ctx, id) {
        assertPermission(ctx, "pipeline_import_history", "get");
        const row = stores.pipelineImportHistory.get(id);
        if (!row || row.tenantId !== ctx.tenantId) return undefined;
        return row;
      },
    },
  };
}
