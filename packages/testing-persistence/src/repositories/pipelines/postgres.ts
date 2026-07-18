import { randomUUID } from "node:crypto";

import {
  testingPipeline,
  testingPipelineImport,
  testingPipelineImportHistory,
  testingPipelineRun,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, eq } from "drizzle-orm";

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
import { dateFromIso, isoFromDate, metaFromRow } from "../mappers/row-mappers";
import { compareValues, normalizeListQuery, paginateItems } from "../types";
import {
  createPostgresCrudRepository,
  type PostgresCrudTable,
} from "../postgres/generic-crud";

function pipelineToRow(record: PipelineRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    key: record.key,
    name: record.name,
    providerKind: record.providerKind,
    externalPipelineRef: record.externalPipelineRef ?? null,
    description: record.description ?? null,
    status: record.status,
    defaultBranch: record.defaultBranch ?? null,
    repositoryRef: record.repositoryRef ?? null,
    variablesJson: [...(record.variablesJson ?? [])],
    secretRefsJson: [...(record.secretRefsJson ?? [])],
    metadataJson: (record.metadataJson as Record<string, unknown>) ?? {},
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToPipeline(row: Record<string, unknown>): PipelineRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    key: String(row.key ?? ""),
    name: String(row.name ?? ""),
    providerKind: String(row.providerKind ?? "generic_ci"),
    externalPipelineRef: (row.externalPipelineRef as string | null) ?? undefined,
    description: (row.description as string | null) ?? undefined,
    status: String(row.status ?? "active") as PipelineRecord["status"],
    defaultBranch: (row.defaultBranch as string | null) ?? undefined,
    repositoryRef: (row.repositoryRef as string | null) ?? undefined,
    variablesJson: Array.isArray(row.variablesJson)
      ? (row.variablesJson as unknown[])
      : [],
    secretRefsJson: Array.isArray(row.secretRefsJson)
      ? (row.secretRefsJson as unknown[])
      : [],
    metadataJson: (row.metadataJson as Record<string, unknown> | null) ?? undefined,
  };
}

function pipelineImportToRow(record: PipelineImportRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    providerKind: record.providerKind,
    adapterVersion: record.adapterVersion,
    externalRunRef: record.externalRunRef,
    pipelineId: record.pipelineId ?? null,
    status: record.status,
    correlationId: record.correlationId ?? null,
    checksum: record.checksum ?? null,
    payloadFingerprint: record.payloadFingerprint ?? null,
    summary: (record.summary as Record<string, unknown>) ?? {},
    errorSummary: record.errorSummary ?? null,
    startedAt: dateFromIso(record.startedAt),
    completedAt: dateFromIso(record.completedAt),
    canonicalSnapshot: (record.canonicalSnapshot as Record<string, unknown>) ?? null,
    pipelineRunId: record.pipelineRunId ?? null,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToPipelineImport(row: Record<string, unknown>): PipelineImportRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    providerKind: String(row.providerKind ?? "generic_ci"),
    adapterVersion: String(row.adapterVersion ?? ""),
    externalRunRef: String(row.externalRunRef ?? ""),
    pipelineId: (row.pipelineId as string | null) ?? undefined,
    status: String(row.status ?? "pending"),
    correlationId: (row.correlationId as string | null) ?? undefined,
    checksum: (row.checksum as string | null) ?? undefined,
    payloadFingerprint: (row.payloadFingerprint as string | null) ?? undefined,
    summary: (row.summary as Record<string, unknown> | null) ?? undefined,
    errorSummary: (row.errorSummary as string | null) ?? undefined,
    startedAt: isoFromDate(row.startedAt as Date | null) ?? undefined,
    completedAt: isoFromDate(row.completedAt as Date | null) ?? undefined,
    canonicalSnapshot:
      (row.canonicalSnapshot as Record<string, unknown> | null) ?? undefined,
    pipelineRunId: (row.pipelineRunId as string | null) ?? undefined,
  };
}

function pipelineRunToRow(record: PipelineRunRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    pipelineId: record.pipelineId,
    importId: record.importId,
    providerKind: record.providerKind,
    externalRunRef: record.externalRunRef,
    status: record.status,
    stagesJson: [...(record.stagesJson ?? [])],
    jobsJson: [...(record.jobsJson ?? [])],
    artifactsJson: [...(record.artifactsJson ?? [])],
    approvalsJson: [...(record.approvalsJson ?? [])],
    eventsJson: [...(record.eventsJson ?? [])],
    environmentJson: { ...(record.environmentJson ?? {}) },
    linksJson: { ...(record.linksJson ?? {}) },
    summaryJson: { ...(record.summaryJson ?? {}) },
    metricsJson: record.metricsJson
      ? { ...(record.metricsJson as Record<string, unknown>) }
      : null,
    logsJson: [...(record.logsJson ?? [])],
    variablesJson: [...(record.variablesJson ?? [])],
    secretRefsJson: [...(record.secretRefsJson ?? [])],
    triggerJson: record.triggerJson
      ? { ...(record.triggerJson as Record<string, unknown>) }
      : null,
    sourceJson: record.sourceJson
      ? { ...(record.sourceJson as Record<string, unknown>) }
      : null,
    startedAt: dateFromIso(record.startedAt),
    completedAt: dateFromIso(record.completedAt),
    durationMs: record.durationMs ?? null,
    correlationId: record.correlationId ?? null,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToPipelineRun(row: Record<string, unknown>): PipelineRunRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    pipelineId: String(row.pipelineId ?? ""),
    importId: String(row.importId ?? ""),
    providerKind: String(row.providerKind ?? "generic_ci"),
    externalRunRef: String(row.externalRunRef ?? ""),
    status: String(row.status ?? "unknown"),
    stagesJson: Array.isArray(row.stagesJson) ? (row.stagesJson as unknown[]) : [],
    jobsJson: Array.isArray(row.jobsJson) ? (row.jobsJson as unknown[]) : [],
    artifactsJson: Array.isArray(row.artifactsJson)
      ? (row.artifactsJson as unknown[])
      : [],
    approvalsJson: Array.isArray(row.approvalsJson)
      ? (row.approvalsJson as unknown[])
      : [],
    eventsJson: Array.isArray(row.eventsJson) ? (row.eventsJson as unknown[]) : [],
    environmentJson: (row.environmentJson as Record<string, unknown> | null) ?? {},
    linksJson: (row.linksJson as Record<string, unknown> | null) ?? {},
    summaryJson: (row.summaryJson as Record<string, unknown> | null) ?? {},
    metricsJson: (row.metricsJson as Record<string, unknown> | null) ?? undefined,
    logsJson: Array.isArray(row.logsJson) ? (row.logsJson as unknown[]) : [],
    variablesJson: Array.isArray(row.variablesJson)
      ? (row.variablesJson as unknown[])
      : [],
    secretRefsJson: Array.isArray(row.secretRefsJson)
      ? (row.secretRefsJson as unknown[])
      : [],
    triggerJson: (row.triggerJson as Record<string, unknown> | null) ?? undefined,
    sourceJson: (row.sourceJson as Record<string, unknown> | null) ?? undefined,
    startedAt: isoFromDate(row.startedAt as Date | null) ?? undefined,
    completedAt: isoFromDate(row.completedAt as Date | null) ?? undefined,
    durationMs: (row.durationMs as number | null) ?? undefined,
    correlationId: (row.correlationId as string | null) ?? undefined,
  };
}

function asTable<T>(table: T): PostgresCrudTable {
  return table as unknown as PostgresCrudTable;
}

export function createPostgresPipelineRepos(db: DatabaseExecutor): {
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
    pipelines: createPostgresCrudRepository<
      PipelineCreate,
      PipelineUpdate,
      PipelineRecord
    >({
      kind: "pipeline",
      db,
      table: asTable(testingPipeline),
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
      },
      toRecord: (ctx, input, existing) => {
        const meta = {
          id: String(existing?.id ?? input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId:
            (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
        };
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
            (input.status as PipelineRecord["status"]) ?? existing?.status ?? "active",
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
      toRow: (record) => pipelineToRow(record),
      rowToRecord: (row) => rowToPipeline(row as never),
    }),

    pipelineImports: createPostgresCrudRepository<
      PipelineImportCreate,
      PipelineImportUpdate,
      PipelineImportRecord
    >({
      kind: "pipeline_import",
      db,
      table: asTable(testingPipelineImport),
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
        const meta = {
          id: String(existing?.id ?? input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId:
            (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
        };
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
          pipelineId: (input.pipelineId as string | undefined) ?? existing?.pipelineId,
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
              Readonly<Record<string, unknown>> | undefined) ??
            existing?.canonicalSnapshot,
          pipelineRunId:
            (input.pipelineRunId as string | undefined) ?? existing?.pipelineRunId,
        };
      },
      toRow: (record) => pipelineImportToRow(record),
      rowToRecord: (row) => rowToPipelineImport(row as never),
    }),

    pipelineRuns: createPostgresCrudRepository<
      PipelineRunCreate,
      PipelineRunUpdate,
      PipelineRunRecord
    >({
      kind: "pipeline_run",
      db,
      table: asTable(testingPipelineRun),
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
        const meta = {
          id: String(existing?.id ?? input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId:
            (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
        };
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
          jobsJson: (input.jobsJson as readonly unknown[]) ?? existing?.jobsJson ?? [],
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
          logsJson: (input.logsJson as readonly unknown[]) ?? existing?.logsJson ?? [],
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
          durationMs: (input.durationMs as number | undefined) ?? existing?.durationMs,
          correlationId:
            (input.correlationId as string | undefined) ?? existing?.correlationId,
        };
      },
      toRow: (record) => pipelineRunToRow(record),
      rowToRecord: (row) => rowToPipelineRun(row as never),
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
        await db.insert(testingPipelineImportHistory).values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          importId: record.importId,
          eventType: record.eventType,
          occurredAt: dateFromIso(record.occurredAt) ?? new Date(),
          actorUserId: record.actorUserId ?? null,
          summary: record.summary,
          details: { ...(record.details as Record<string, unknown>) },
          adapterVersion: record.adapterVersion ?? null,
          normalizationNotes: record.normalizationNotes ?? null,
          correlationId: record.correlationId ?? null,
        });
        return record;
      },
      async listByImport(ctx, importId, query) {
        assertPermission(ctx, "pipeline_import_history", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingPipelineImportHistory)
          .where(
            and(
              eq(testingPipelineImportHistory.tenantId, ctx.tenantId),
              eq(testingPipelineImportHistory.importId, importId),
            ),
          );
        let items = rows.map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          importId: row.importId,
          eventType: row.eventType,
          occurredAt: isoFromDate(row.occurredAt)!,
          actorUserId: row.actorUserId ?? undefined,
          summary: row.summary,
          details: (row.details as Record<string, unknown>) ?? {},
          adapterVersion: row.adapterVersion ?? undefined,
          normalizationNotes: row.normalizationNotes ?? undefined,
          correlationId: row.correlationId ?? undefined,
        }));
        items = [...items].sort((a, b) =>
          compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
      async list(ctx, query) {
        assertPermission(ctx, "pipeline_import_history", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingPipelineImportHistory)
          .where(eq(testingPipelineImportHistory.tenantId, ctx.tenantId));
        const items = rows.map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          importId: row.importId,
          eventType: row.eventType,
          occurredAt: isoFromDate(row.occurredAt)!,
          actorUserId: row.actorUserId ?? undefined,
          summary: row.summary,
          details: (row.details as Record<string, unknown>) ?? {},
          adapterVersion: row.adapterVersion ?? undefined,
          normalizationNotes: row.normalizationNotes ?? undefined,
          correlationId: row.correlationId ?? undefined,
        }));
        return paginateItems(items, q.page, q.pageSize);
      },
      async get(ctx, id) {
        assertPermission(ctx, "pipeline_import_history", "get");
        const rows = await db
          .select()
          .from(testingPipelineImportHistory)
          .where(
            and(
              eq(testingPipelineImportHistory.tenantId, ctx.tenantId),
              eq(testingPipelineImportHistory.id, id),
            ),
          )
          .limit(1);
        const row = rows[0];
        if (!row) return undefined;
        return {
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          importId: row.importId,
          eventType: row.eventType,
          occurredAt: isoFromDate(row.occurredAt)!,
          actorUserId: row.actorUserId ?? undefined,
          summary: row.summary,
          details: (row.details as Record<string, unknown>) ?? {},
          adapterVersion: row.adapterVersion ?? undefined,
          normalizationNotes: row.normalizationNotes ?? undefined,
          correlationId: row.correlationId ?? undefined,
        };
      },
    },
  };
}

export {
  pipelineToRow,
  rowToPipeline,
  pipelineImportToRow,
  rowToPipelineImport,
  pipelineRunToRow,
  rowToPipelineRun,
};
