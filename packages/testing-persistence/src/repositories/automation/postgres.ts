import { randomUUID } from "node:crypto";

import {
  testingAutomationCoverageSnapshot,
  testingAutomationImport,
  testingAutomationImportHistory,
  testingAutomationResultItem,
  testingAutomationRun,
  testingAutomatedExecution,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, eq } from "drizzle-orm";

import { assertPermission } from "../../authorization/testing-authorization";
import {
  assertRequiredString,
  validateAutomationAdapterKind,
  validateAutomationImportStatus,
  validateAutomationType,
  validateExecutionStatus,
  validateNormalizedResultStatus,
} from "../../validation/persistence-validation";
import type {
  AutomationCoverageSnapshotCreate,
  AutomationCoverageSnapshotUpdate,
  AutomationImportCreate,
  AutomationImportHistoryRepository,
  AutomationImportUpdate,
  AutomationResultItemCreate,
  AutomationResultItemUpdate,
  AutomationRunCreate,
  AutomationRunUpdate,
  AutomatedExecutionCreate,
  AutomatedExecutionUpdate,
  CrudRepository,
} from "../interfaces";
import type {
  AutomationCoverageSnapshotRecord,
  AutomationImportHistoryRecord,
  AutomationImportRecord,
  AutomationResultItemRecord,
  AutomationRunRecord,
  AutomatedExecutionRecord,
} from "../records";
import {
  dateFromIso,
  isoFromDate,
  metaFromRow,
} from "../mappers/row-mappers";
import {
  compareValues,
  normalizeListQuery,
  paginateItems,
  type ListQuery,
} from "../types";
import {
  createPostgresCrudRepository,
  type PostgresCrudTable,
} from "../postgres/generic-crud";

function automationImportToRow(record: AutomationImportRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    adapterKind: record.adapterKind,
    adapterVersion: record.adapterVersion,
    externalRunRef: record.externalRunRef,
    status: record.status,
    correlationId: record.correlationId ?? null,
    checksum: record.checksum ?? null,
    payloadFingerprint: record.payloadFingerprint ?? null,
    summary: (record.summary as Record<string, unknown>) ?? {},
    errorSummary: record.errorSummary ?? null,
    startedAt: dateFromIso(record.startedAt),
    completedAt: dateFromIso(record.completedAt),
    canonicalSnapshot: (record.canonicalSnapshot as Record<string, unknown>) ?? null,
    automatedExecutionId: record.automatedExecutionId ?? null,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToAutomationImport(row: Record<string, unknown>): AutomationImportRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    adapterKind: String(row.adapterKind ?? ""),
    adapterVersion: String(row.adapterVersion ?? ""),
    externalRunRef: String(row.externalRunRef ?? ""),
    status: String(row.status ?? "pending"),
    correlationId: (row.correlationId as string | null) ?? undefined,
    checksum: (row.checksum as string | null) ?? undefined,
    payloadFingerprint: (row.payloadFingerprint as string | null) ?? undefined,
    summary: (row.summary as Record<string, unknown> | null) ?? undefined,
    errorSummary: (row.errorSummary as string | null) ?? undefined,
    startedAt: isoFromDate(row.startedAt as Date | null),
    completedAt: isoFromDate(row.completedAt as Date | null),
    canonicalSnapshot:
      (row.canonicalSnapshot as Record<string, unknown> | null) ?? undefined,
    automatedExecutionId: (row.automatedExecutionId as string | null) ?? undefined,
  };
}

function automatedExecutionToRow(record: AutomatedExecutionRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    sessionId: record.sessionId ?? null,
    importId: record.importId,
    automationType: record.automationType,
    status: record.status,
    adapterSourceId: record.adapterSourceId ?? null,
    externalRunRef: record.externalRunRef,
    environment: record.environment as Record<string, unknown>,
    overallStatus: record.overallStatus,
    durationMs: record.durationMs ?? null,
    startedAt: dateFromIso(record.startedAt),
    completedAt: dateFromIso(record.completedAt),
    adapterKind: record.adapterKind,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToAutomatedExecution(
  row: Record<string, unknown>,
): AutomatedExecutionRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    sessionId: (row.sessionId as string | null) ?? undefined,
    importId: String(row.importId ?? ""),
    automationType: row.automationType as AutomatedExecutionRecord["automationType"],
    status: row.status as AutomatedExecutionRecord["status"],
    adapterSourceId: (row.adapterSourceId as string | null) ?? undefined,
    externalRunRef: String(row.externalRunRef ?? ""),
    environment: (row.environment as Record<string, unknown>) ?? {},
    overallStatus: String(row.overallStatus ?? "unknown"),
    durationMs: (row.durationMs as number | null) ?? undefined,
    startedAt: isoFromDate(row.startedAt as Date | null),
    completedAt: isoFromDate(row.completedAt as Date | null),
    adapterKind: String(row.adapterKind ?? ""),
  };
}

function automationRunToRow(record: AutomationRunRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    executionId: record.executionId,
    suiteKey: record.suiteKey ?? null,
    caseKey: record.caseKey ?? null,
    title: record.title,
    status: record.status,
    durationMs: record.durationMs ?? null,
    message: record.message ?? null,
    stack: record.stack ?? null,
    result: (record.result as Record<string, unknown>) ?? null,
    tags: [...record.tags],
    requirementRefs: [...record.requirementRefs],
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToAutomationRun(row: Record<string, unknown>): AutomationRunRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    executionId: String(row.executionId ?? ""),
    suiteKey: (row.suiteKey as string | null) ?? undefined,
    caseKey: (row.caseKey as string | null) ?? undefined,
    title: String(row.title ?? ""),
    status: String(row.status ?? "unknown"),
    durationMs: (row.durationMs as number | null) ?? undefined,
    message: (row.message as string | null) ?? undefined,
    stack: (row.stack as string | null) ?? undefined,
    result: (row.result as Record<string, unknown> | null) ?? undefined,
    tags: (row.tags as string[] | null) ?? [],
    requirementRefs: (row.requirementRefs as string[] | null) ?? [],
  };
}

function automationResultItemToRow(record: AutomationResultItemRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    runId: record.runId,
    status: record.status,
    stepPayload: (record.stepPayload as Record<string, unknown>) ?? null,
    name: record.name ?? null,
    durationMs: record.durationMs ?? null,
    message: record.message ?? null,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToAutomationResultItem(
  row: Record<string, unknown>,
): AutomationResultItemRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    runId: String(row.runId ?? ""),
    status: String(row.status ?? "unknown"),
    stepPayload: (row.stepPayload as Record<string, unknown> | null) ?? undefined,
    name: (row.name as string | null) ?? undefined,
    durationMs: (row.durationMs as number | null) ?? undefined,
    message: (row.message as string | null) ?? undefined,
  };
}

function coverageSnapshotToRow(record: AutomationCoverageSnapshotRecord) {
  return {
    id: record.id,
    tenantId: record.tenantId,
    organisationId: record.organisationId ?? null,
    importId: record.importId ?? null,
    executionId: record.executionId ?? null,
    summary: record.summary as Record<string, unknown>,
    coveredCount: record.coveredCount ?? null,
    totalCount: record.totalCount ?? null,
    percentage: record.percentage ?? null,
    revision: record.revision,
    createdAt: dateFromIso(record.createdAt) ?? new Date(),
    updatedAt: dateFromIso(record.updatedAt) ?? new Date(),
    createdBy: record.createdBy ?? null,
    updatedBy: record.updatedBy ?? null,
    archivedAt: dateFromIso(record.archivedAt),
  };
}

function rowToCoverageSnapshot(
  row: Record<string, unknown>,
): AutomationCoverageSnapshotRecord {
  const meta = metaFromRow(row as never);
  return {
    ...meta,
    importId: (row.importId as string | null) ?? undefined,
    executionId: (row.executionId as string | null) ?? undefined,
    summary: (row.summary as Record<string, unknown>) ?? {},
    coveredCount: (row.coveredCount as number | null) ?? undefined,
    totalCount: (row.totalCount as number | null) ?? undefined,
    percentage: (row.percentage as number | null) ?? undefined,
  };
}

export function createPostgresAutomationRepos(db: DatabaseExecutor): {
  automationImports: CrudRepository<
    AutomationImportCreate,
    AutomationImportUpdate,
    AutomationImportRecord
  >;
  automatedExecutions: CrudRepository<
    AutomatedExecutionCreate,
    AutomatedExecutionUpdate,
    AutomatedExecutionRecord
  >;
  automationRuns: CrudRepository<
    AutomationRunCreate,
    AutomationRunUpdate,
    AutomationRunRecord
  >;
  automationResultItems: CrudRepository<
    AutomationResultItemCreate,
    AutomationResultItemUpdate,
    AutomationResultItemRecord
  >;
  automationImportHistory: AutomationImportHistoryRepository;
  automationCoverageSnapshots: CrudRepository<
    AutomationCoverageSnapshotCreate,
    AutomationCoverageSnapshotUpdate,
    AutomationCoverageSnapshotRecord
  >;
} {
  return {
    automationImports: createPostgresCrudRepository({
      kind: "automation_import",
      db,
      table: testingAutomationImport as unknown as PostgresCrudTable,
      searchFields: ["externalRunRef", "adapterKind", "status"],
      validateCreate: (input) => {
        assertRequiredString(input.adapterKind, "adapterKind");
        assertRequiredString(input.adapterVersion, "adapterVersion");
        assertRequiredString(input.externalRunRef, "externalRunRef");
        validateAutomationAdapterKind(String(input.adapterKind));
        validateAutomationImportStatus(String(input.status));
      },
      validateUpdate: (input) => {
        if (input.adapterKind !== undefined) {
          validateAutomationAdapterKind(String(input.adapterKind));
        }
        if (input.status !== undefined) {
          validateAutomationImportStatus(String(input.status));
        }
      },
      toRecord: (ctx, input, existing) => {
        const now = new Date().toISOString();
        return {
          id: existing?.id ?? String(input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId: (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
          adapterKind: String(input.adapterKind ?? existing?.adapterKind ?? ""),
          adapterVersion: String(
            input.adapterVersion ?? existing?.adapterVersion ?? "",
          ),
          externalRunRef: String(
            input.externalRunRef ?? existing?.externalRunRef ?? "",
          ),
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
          automatedExecutionId:
            (input.automatedExecutionId as string | undefined) ??
            existing?.automatedExecutionId,
        };
      },
      toRow: automationImportToRow,
      rowToRecord: rowToAutomationImport,
    }),

    automatedExecutions: createPostgresCrudRepository({
      kind: "automated_execution",
      db,
      table: testingAutomatedExecution as unknown as PostgresCrudTable,
      searchFields: ["externalRunRef", "importId", "adapterKind"],
      validateCreate: (input) => {
        assertRequiredString(input.importId, "importId");
        assertRequiredString(input.externalRunRef, "externalRunRef");
        validateAutomationType(String(input.automationType));
        validateExecutionStatus(String(input.status));
        validateNormalizedResultStatus(String(input.overallStatus));
        validateAutomationAdapterKind(String(input.adapterKind));
      },
      toRecord: (ctx, input, existing) => {
        const now = new Date().toISOString();
        return {
          id: existing?.id ?? String(input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId: (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
          sessionId: (input.sessionId as string | undefined) ?? existing?.sessionId,
          importId: String(existing?.importId ?? input.importId),
          automationType:
            (input.automationType as AutomatedExecutionRecord["automationType"]) ??
            existing?.automationType ??
            "other",
          status:
            (input.status as AutomatedExecutionRecord["status"]) ??
            existing?.status ??
            "completed",
          adapterSourceId:
            (input.adapterSourceId as string | undefined) ?? existing?.adapterSourceId,
          externalRunRef: String(
            input.externalRunRef ?? existing?.externalRunRef ?? "",
          ),
          environment:
            (input.environment as Readonly<Record<string, unknown>>) ??
            existing?.environment ??
            {},
          overallStatus: String(
            input.overallStatus ?? existing?.overallStatus ?? "unknown",
          ),
          durationMs: (input.durationMs as number | undefined) ?? existing?.durationMs,
          startedAt: (input.startedAt as string | undefined) ?? existing?.startedAt,
          completedAt:
            (input.completedAt as string | undefined) ?? existing?.completedAt,
          adapterKind: String(input.adapterKind ?? existing?.adapterKind ?? ""),
        };
      },
      toRow: automatedExecutionToRow,
      rowToRecord: rowToAutomatedExecution,
    }),

    automationRuns: createPostgresCrudRepository({
      kind: "automation_run",
      db,
      table: testingAutomationRun as unknown as PostgresCrudTable,
      searchFields: ["title", "suiteKey", "caseKey", "status"],
      validateCreate: (input) => {
        assertRequiredString(input.executionId, "executionId");
        assertRequiredString(input.title, "title");
        validateNormalizedResultStatus(String(input.status));
      },
      toRecord: (ctx, input, existing) => {
        const now = new Date().toISOString();
        return {
          id: existing?.id ?? String(input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId: (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
          executionId: String(existing?.executionId ?? input.executionId),
          suiteKey: (input.suiteKey as string | undefined) ?? existing?.suiteKey,
          caseKey: (input.caseKey as string | undefined) ?? existing?.caseKey,
          title: String(input.title ?? existing?.title ?? ""),
          status: String(input.status ?? existing?.status ?? "unknown"),
          durationMs: (input.durationMs as number | undefined) ?? existing?.durationMs,
          message: (input.message as string | undefined) ?? existing?.message,
          stack: (input.stack as string | undefined) ?? existing?.stack,
          result:
            (input.result as Readonly<Record<string, unknown>> | undefined) ??
            existing?.result,
          tags: (input.tags as readonly string[]) ?? existing?.tags ?? [],
          requirementRefs:
            (input.requirementRefs as readonly string[]) ??
            existing?.requirementRefs ??
            [],
        };
      },
      toRow: automationRunToRow,
      rowToRecord: rowToAutomationRun,
    }),

    automationResultItems: createPostgresCrudRepository({
      kind: "automation_result_item",
      db,
      table: testingAutomationResultItem as unknown as PostgresCrudTable,
      searchFields: ["name", "status", "message"],
      validateCreate: (input) => {
        assertRequiredString(input.runId, "runId");
        validateNormalizedResultStatus(String(input.status));
      },
      toRecord: (ctx, input, existing) => {
        const now = new Date().toISOString();
        return {
          id: existing?.id ?? String(input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId: (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
          runId: String(existing?.runId ?? input.runId),
          status: String(input.status ?? existing?.status ?? "unknown"),
          stepPayload:
            (input.stepPayload as Readonly<Record<string, unknown>> | undefined) ??
            existing?.stepPayload,
          name: (input.name as string | undefined) ?? existing?.name,
          durationMs: (input.durationMs as number | undefined) ?? existing?.durationMs,
          message: (input.message as string | undefined) ?? existing?.message,
        };
      },
      toRow: automationResultItemToRow,
      rowToRecord: rowToAutomationResultItem,
    }),

    automationImportHistory: {
      async append(ctx, input) {
        assertPermission(ctx, "automation_import_history", "append");
        assertRequiredString(input.importId, "importId");
        assertRequiredString(input.eventType, "eventType");
        assertRequiredString(input.summary, "summary");
        const record: AutomationImportHistoryRecord = {
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
        await db.insert(testingAutomationImportHistory).values({
          id: record.id,
          tenantId: record.tenantId,
          organisationId: record.organisationId ?? null,
          importId: record.importId,
          eventType: record.eventType,
          occurredAt: dateFromIso(record.occurredAt) ?? new Date(),
          actorUserId: record.actorUserId ?? null,
          summary: record.summary,
          details: record.details as Record<string, unknown>,
          adapterVersion: record.adapterVersion ?? null,
          normalizationNotes: record.normalizationNotes ?? null,
          correlationId: record.correlationId ?? null,
        });
        return record;
      },
      async listByImport(ctx, importId, query?: ListQuery) {
        assertPermission(ctx, "automation_import_history", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingAutomationImportHistory)
          .where(
            and(
              eq(testingAutomationImportHistory.tenantId, ctx.tenantId),
              eq(testingAutomationImportHistory.importId, importId),
            ),
          );
        const items = rows
          .map((row) => ({
            id: row.id,
            tenantId: row.tenantId,
            organisationId: row.organisationId ?? undefined,
            importId: row.importId,
            eventType: row.eventType,
            occurredAt: isoFromDate(row.occurredAt) ?? new Date().toISOString(),
            actorUserId: row.actorUserId ?? undefined,
            summary: row.summary,
            details: (row.details as Record<string, unknown>) ?? {},
            adapterVersion: row.adapterVersion ?? undefined,
            normalizationNotes: row.normalizationNotes ?? undefined,
            correlationId: row.correlationId ?? undefined,
          }))
          .sort((a, b) =>
            compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
          );
        return paginateItems(items, q.page, q.pageSize);
      },
      async list(ctx, query?: ListQuery) {
        assertPermission(ctx, "automation_import_history", "list");
        const q = normalizeListQuery(query);
        const rows = await db
          .select()
          .from(testingAutomationImportHistory)
          .where(eq(testingAutomationImportHistory.tenantId, ctx.tenantId));
        const items = rows.map((row) => ({
          id: row.id,
          tenantId: row.tenantId,
          organisationId: row.organisationId ?? undefined,
          importId: row.importId,
          eventType: row.eventType,
          occurredAt: isoFromDate(row.occurredAt) ?? new Date().toISOString(),
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
        assertPermission(ctx, "automation_import_history", "get");
        const rows = await db
          .select()
          .from(testingAutomationImportHistory)
          .where(
            and(
              eq(testingAutomationImportHistory.tenantId, ctx.tenantId),
              eq(testingAutomationImportHistory.id, id),
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
          occurredAt: isoFromDate(row.occurredAt) ?? new Date().toISOString(),
          actorUserId: row.actorUserId ?? undefined,
          summary: row.summary,
          details: (row.details as Record<string, unknown>) ?? {},
          adapterVersion: row.adapterVersion ?? undefined,
          normalizationNotes: row.normalizationNotes ?? undefined,
          correlationId: row.correlationId ?? undefined,
        };
      },
    },

    automationCoverageSnapshots: createPostgresCrudRepository({
      kind: "automation_coverage_snapshot",
      db,
      table: testingAutomationCoverageSnapshot as unknown as PostgresCrudTable,
      searchFields: ["importId", "executionId"],
      toRecord: (ctx, input, existing) => {
        const now = new Date().toISOString();
        return {
          id: existing?.id ?? String(input.id ?? randomUUID()),
          tenantId: ctx.tenantId,
          organisationId: (input.organisationId as string | undefined) ??
            existing?.organisationId ??
            ctx.organisationId,
          revision: existing ? existing.revision + 1 : 1,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
          createdBy: existing?.createdBy ?? ctx.actorUserId,
          updatedBy: ctx.actorUserId,
          archivedAt: existing?.archivedAt,
          importId: (input.importId as string | undefined) ?? existing?.importId,
          executionId:
            (input.executionId as string | undefined) ?? existing?.executionId,
          summary:
            (input.summary as Readonly<Record<string, unknown>>) ??
            existing?.summary ??
            {},
          coveredCount:
            (input.coveredCount as number | undefined) ?? existing?.coveredCount,
          totalCount: (input.totalCount as number | undefined) ?? existing?.totalCount,
          percentage: (input.percentage as number | undefined) ?? existing?.percentage,
        };
      },
      toRow: coverageSnapshotToRow,
      rowToRecord: rowToCoverageSnapshot,
    }),
  };
}
