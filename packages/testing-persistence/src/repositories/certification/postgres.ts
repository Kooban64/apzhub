import { randomUUID } from "node:crypto";

import {
  testingCertificationAudit,
  testingCertificationGateDefinition,
  testingCertificationGateEvaluation,
  testingCertificationHistory,
  testingCertificationRule,
  type DatabaseExecutor,
} from "@apzhub/config";
import { and, eq } from "drizzle-orm";

import { assertPermission } from "../../authorization/testing-authorization";
import {
  assertRequiredString,
  validateCertificationGateOutcome,
} from "../../validation/persistence-validation";
import type {
  CertificationAuditRepository,
  CertificationGateDefinitionCreate,
  CertificationGateDefinitionUpdate,
  CertificationGateEvaluationCreate,
  CertificationGateEvaluationUpdate,
  CertificationHistoryRepository,
  CertificationRuleCreate,
  CertificationRuleUpdate,
} from "../interfaces";
import type {
  CertificationGateDefinitionRecord,
  CertificationGateEvaluationRecord,
  CertificationRuleRecord,
} from "../records";
import {
  certificationAuditToRow,
  certificationGateDefinitionToRow,
  certificationGateEvaluationToRow,
  certificationHistoryToRow,
  certificationRuleToRow,
  rowToCertificationAudit,
  rowToCertificationGateDefinition,
  rowToCertificationGateEvaluation,
  rowToCertificationHistory,
  rowToCertificationRule,
} from "../mappers/row-mappers";
import { normalizeListQuery, paginateItems } from "../types";
import {
  createPostgresCrudRepository,
  type PostgresCrudTable,
} from "../postgres/generic-crud";
import { baseMeta } from "../in-memory/generic-crud";

function asTable(table: unknown): PostgresCrudTable {
  return table as PostgresCrudTable;
}

export function createPostgresCertificationRepos(db: DatabaseExecutor) {
  const certificationGateDefinitions = createPostgresCrudRepository<
    CertificationGateDefinitionCreate,
    CertificationGateDefinitionUpdate,
    CertificationGateDefinitionRecord
  >({
    kind: "certification_gate_definition",
    db,
    table: asTable(testingCertificationGateDefinition),
    searchFields: ["gateKey", "name", "kind", "templateKey"],
    validateCreate: (input) => {
      assertRequiredString(input.gateKey, "gateKey");
      assertRequiredString(input.name, "name");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<CertificationGateDefinitionRecord>;
      return {
        ...meta,
        gateKey: String(existing?.gateKey ?? data.gateKey),
        name: String(data.name ?? existing?.name ?? ""),
        description: data.description ?? existing?.description,
        kind: String(data.kind ?? existing?.kind ?? "builtin"),
        required: Boolean(data.required ?? existing?.required ?? true),
        configJson: data.configJson ?? existing?.configJson,
        templateKey: data.templateKey ?? existing?.templateKey,
        ordinal: data.ordinal ?? existing?.ordinal,
        enabled: Boolean(data.enabled ?? existing?.enabled ?? true),
      };
    },
    toRow: (record) => certificationGateDefinitionToRow(record),
    rowToRecord: (row) => rowToCertificationGateDefinition(row as never),
  });

  const certificationGateEvaluations = createPostgresCrudRepository<
    CertificationGateEvaluationCreate,
    CertificationGateEvaluationUpdate,
    CertificationGateEvaluationRecord
  >({
    kind: "certification_gate_evaluation",
    db,
    table: asTable(testingCertificationGateEvaluation),
    searchFields: ["gateKey", "status", "reason"],
    validateCreate: (input) => {
      assertRequiredString(input.certificationRecordId, "certificationRecordId");
      assertRequiredString(input.gateKey, "gateKey");
      assertRequiredString(input.reason, "reason");
      validateCertificationGateOutcome(String(input.status));
    },
    validateUpdate: (input) => {
      if (input.status !== undefined) {
        validateCertificationGateOutcome(String(input.status));
      }
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<CertificationGateEvaluationRecord>;
      return {
        ...meta,
        certificationRecordId: String(
          existing?.certificationRecordId ?? data.certificationRecordId,
        ),
        gateDefinitionId: data.gateDefinitionId ?? existing?.gateDefinitionId,
        gateKey: String(existing?.gateKey ?? data.gateKey),
        status: String(data.status ?? existing?.status ?? "pending"),
        reason: String(data.reason ?? existing?.reason ?? ""),
        supportingEvidence:
          data.supportingEvidence ?? existing?.supportingEvidence ?? [],
        evaluatedAt: String(
          data.evaluatedAt ?? existing?.evaluatedAt ?? new Date().toISOString(),
        ),
        evaluatorUserId: data.evaluatorUserId ?? existing?.evaluatorUserId,
        traceabilityRefs: data.traceabilityRefs ?? existing?.traceabilityRefs ?? [],
        detailsJson: data.detailsJson ?? existing?.detailsJson,
      };
    },
    toRow: (record) => certificationGateEvaluationToRow(record),
    rowToRecord: (row) => rowToCertificationGateEvaluation(row as never),
  });

  const certificationRules = createPostgresCrudRepository<
    CertificationRuleCreate,
    CertificationRuleUpdate,
    CertificationRuleRecord
  >({
    kind: "certification_rule",
    db,
    table: asTable(testingCertificationRule),
    searchFields: ["key", "name", "productLabel"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input as { id?: string; organisationId?: string }, existing);
      const data = input as Partial<CertificationRuleRecord>;
      return {
        ...meta,
        key: String(existing?.key ?? data.key),
        name: String(data.name ?? existing?.name ?? ""),
        certificationRecordId:
          data.certificationRecordId ?? existing?.certificationRecordId,
        planId: data.planId ?? existing?.planId,
        productLabel: data.productLabel ?? existing?.productLabel,
        requiredGateKeys: data.requiredGateKeys ?? existing?.requiredGateKeys ?? [],
        optionalGateKeys: data.optionalGateKeys ?? existing?.optionalGateKeys ?? [],
        approvalStagesJson: data.approvalStagesJson ?? existing?.approvalStagesJson,
        enabled: Boolean(data.enabled ?? existing?.enabled ?? true),
        configJson: data.configJson ?? existing?.configJson,
      };
    },
    toRow: (record) => certificationRuleToRow(record),
    rowToRecord: (row) => rowToCertificationRule(row as never),
  });

  const certificationAudits: CertificationAuditRepository = {
    async append(ctx, input) {
      assertPermission(ctx, "certification_audit", "append");
      assertRequiredString(input.certificationRecordId, "certificationRecordId");
      assertRequiredString(input.action, "action");
      assertRequiredString(input.summary, "summary");
      const id =
        typeof input.id === "string" && input.id.length > 0
          ? input.id
          : randomUUID();
      const row = {
        id,
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        certificationRecordId: input.certificationRecordId,
        occurredAt: input.occurredAt ?? new Date().toISOString(),
        actorUserId: input.actorUserId ?? ctx.actorUserId,
        action: input.action,
        summary: input.summary,
        detailsJson: input.detailsJson,
        correlationId: input.correlationId ?? ctx.correlationId,
      };
      await db.insert(testingCertificationAudit).values(certificationAuditToRow(row));
      return row;
    },
    async listByCertification(ctx, certificationRecordId, query) {
      assertPermission(ctx, "certification_audit", "list");
      const q = normalizeListQuery(query);
      const rows = await db
        .select()
        .from(testingCertificationAudit)
        .where(
          and(
            eq(testingCertificationAudit.tenantId, ctx.tenantId),
            eq(
              testingCertificationAudit.certificationRecordId,
              certificationRecordId,
            ),
          ),
        );
      const items = rows
        .map((r) => rowToCertificationAudit(r as never))
        .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "certification_audit", "get");
      const rows = await db
        .select()
        .from(testingCertificationAudit)
        .where(
          and(
            eq(testingCertificationAudit.tenantId, ctx.tenantId),
            eq(testingCertificationAudit.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? rowToCertificationAudit(row as never) : undefined;
    },
  };

  const certificationHistory: CertificationHistoryRepository = {
    async append(ctx, input) {
      assertPermission(ctx, "certification_history", "append");
      assertRequiredString(input.certificationRecordId, "certificationRecordId");
      assertRequiredString(input.toStatus, "toStatus");
      const id =
        typeof input.id === "string" && input.id.length > 0
          ? input.id
          : randomUUID();
      const row = {
        id,
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        certificationRecordId: input.certificationRecordId,
        occurredAt: input.occurredAt ?? new Date().toISOString(),
        actorUserId: input.actorUserId ?? ctx.actorUserId,
        fromStatus: input.fromStatus,
        toStatus: input.toStatus,
        reason: input.reason,
        correlationId: input.correlationId ?? ctx.correlationId,
        detailsJson: input.detailsJson,
      };
      await db.insert(testingCertificationHistory).values(certificationHistoryToRow(row));
      return row;
    },
    async listByCertification(ctx, certificationRecordId, query) {
      assertPermission(ctx, "certification_history", "list");
      const q = normalizeListQuery(query);
      const rows = await db
        .select()
        .from(testingCertificationHistory)
        .where(
          and(
            eq(testingCertificationHistory.tenantId, ctx.tenantId),
            eq(
              testingCertificationHistory.certificationRecordId,
              certificationRecordId,
            ),
          ),
        );
      const items = rows
        .map((r) => rowToCertificationHistory(r as never))
        .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "certification_history", "get");
      const rows = await db
        .select()
        .from(testingCertificationHistory)
        .where(
          and(
            eq(testingCertificationHistory.tenantId, ctx.tenantId),
            eq(testingCertificationHistory.id, id),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? rowToCertificationHistory(row as never) : undefined;
    },
  };

  return {
    certificationGateDefinitions,
    certificationGateEvaluations,
    certificationRules,
    certificationAudits,
    certificationHistory,
  };
}
