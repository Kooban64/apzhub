import { randomUUID } from "node:crypto";

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

export interface AutomationInMemoryStores {
  automationImports: Map<string, AutomationImportRecord>;
  automatedExecutions: Map<string, AutomatedExecutionRecord>;
  automationRuns: Map<string, AutomationRunRecord>;
  automationResultItems: Map<string, AutomationResultItemRecord>;
  automationImportHistory: Map<string, AutomationImportHistoryRecord>;
  automationCoverageSnapshots: Map<string, AutomationCoverageSnapshotRecord>;
}

export function createEmptyAutomationInMemoryStores(): AutomationInMemoryStores {
  return {
    automationImports: new Map(),
    automatedExecutions: new Map(),
    automationRuns: new Map(),
    automationResultItems: new Map(),
    automationImportHistory: new Map(),
    automationCoverageSnapshots: new Map(),
  };
}

export function createInMemoryAutomationRepos(stores: AutomationInMemoryStores): {
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
    automationImports: createInMemoryCrudRepository<
      AutomationImportCreate,
      AutomationImportUpdate,
      AutomationImportRecord
    >({
      kind: "automation_import",
      store: stores.automationImports,
      searchFields: ["externalRunRef", "adapterKind", "status", "errorSummary"],
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
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
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
    }),

    automatedExecutions: createInMemoryCrudRepository<
      AutomatedExecutionCreate,
      AutomatedExecutionUpdate,
      AutomatedExecutionRecord
    >({
      kind: "automated_execution",
      store: stores.automatedExecutions,
      searchFields: ["externalRunRef", "importId", "adapterKind", "overallStatus"],
      validateCreate: (input) => {
        assertRequiredString(input.importId, "importId");
        assertRequiredString(input.externalRunRef, "externalRunRef");
        assertRequiredString(input.adapterKind, "adapterKind");
        validateAutomationType(String(input.automationType));
        validateExecutionStatus(String(input.status));
        validateNormalizedResultStatus(String(input.overallStatus));
        validateAutomationAdapterKind(String(input.adapterKind));
      },
      validateUpdate: (input) => {
        if (input.automationType !== undefined) {
          validateAutomationType(String(input.automationType));
        }
        if (input.status !== undefined) validateExecutionStatus(String(input.status));
        if (input.overallStatus !== undefined) {
          validateNormalizedResultStatus(String(input.overallStatus));
        }
        if (input.adapterKind !== undefined) {
          validateAutomationAdapterKind(String(input.adapterKind));
        }
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
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
    }),

    automationRuns: createInMemoryCrudRepository<
      AutomationRunCreate,
      AutomationRunUpdate,
      AutomationRunRecord
    >({
      kind: "automation_run",
      store: stores.automationRuns,
      searchFields: ["title", "suiteKey", "caseKey", "status"],
      validateCreate: (input) => {
        assertRequiredString(input.executionId, "executionId");
        assertRequiredString(input.title, "title");
        validateNormalizedResultStatus(String(input.status));
      },
      validateUpdate: (input) => {
        if (input.status !== undefined) {
          validateNormalizedResultStatus(String(input.status));
        }
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
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
    }),

    automationResultItems: createInMemoryCrudRepository<
      AutomationResultItemCreate,
      AutomationResultItemUpdate,
      AutomationResultItemRecord
    >({
      kind: "automation_result_item",
      store: stores.automationResultItems,
      searchFields: ["name", "status", "message"],
      validateCreate: (input) => {
        assertRequiredString(input.runId, "runId");
        validateNormalizedResultStatus(String(input.status));
      },
      validateUpdate: (input) => {
        if (input.status !== undefined) {
          validateNormalizedResultStatus(String(input.status));
        }
      },
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
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
        stores.automationImportHistory.set(record.id, record);
        return record;
      },
      async listByImport(ctx, importId, query) {
        assertPermission(ctx, "automation_import_history", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.automationImportHistory.values()].filter(
          (row) => row.tenantId === ctx.tenantId && row.importId === importId,
        );
        items = [...items].sort((a, b) =>
          compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
      async list(ctx, query) {
        assertPermission(ctx, "automation_import_history", "list");
        const q = normalizeListQuery(query);
        let items = [...stores.automationImportHistory.values()].filter(
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
        items = [...items].sort((a, b) =>
          compareValues(a.occurredAt, b.occurredAt, q.sort?.direction ?? "asc"),
        );
        return paginateItems(items, q.page, q.pageSize);
      },
      async get(ctx, id) {
        assertPermission(ctx, "automation_import_history", "get");
        const row = stores.automationImportHistory.get(id);
        if (!row || row.tenantId !== ctx.tenantId) return undefined;
        return row;
      },
    },

    automationCoverageSnapshots: createInMemoryCrudRepository<
      AutomationCoverageSnapshotCreate,
      AutomationCoverageSnapshotUpdate,
      AutomationCoverageSnapshotRecord
    >({
      kind: "automation_coverage_snapshot",
      store: stores.automationCoverageSnapshots,
      searchFields: ["importId", "executionId"],
      validateCreate: () => undefined,
      toRecord: (ctx, input, existing) => {
        const meta = baseMeta(ctx, input, existing);
        return {
          ...meta,
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
    }),
  };
}
