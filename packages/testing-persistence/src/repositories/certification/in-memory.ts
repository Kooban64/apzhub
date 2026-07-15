import { randomUUID } from "node:crypto";

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
  CrudRepository,
} from "../interfaces";
import type {
  CertificationAuditRecord,
  CertificationGateDefinitionRecord,
  CertificationGateEvaluationRecord,
  CertificationHistoryRecord,
  CertificationRuleRecord,
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

export interface CertificationInMemoryStores {
  certificationGateDefinitions: Map<string, CertificationGateDefinitionRecord>;
  certificationGateEvaluations: Map<string, CertificationGateEvaluationRecord>;
  certificationRules: Map<string, CertificationRuleRecord>;
  certificationAudits: Map<string, CertificationAuditRecord>;
  certificationHistory: Map<string, CertificationHistoryRecord>;
}

export function createEmptyCertificationInMemoryStores(): CertificationInMemoryStores {
  return {
    certificationGateDefinitions: new Map(),
    certificationGateEvaluations: new Map(),
    certificationRules: new Map(),
    certificationAudits: new Map(),
    certificationHistory: new Map(),
  };
}

export function createInMemoryCertificationRepos(stores: CertificationInMemoryStores) {
  const certificationGateDefinitions = createInMemoryCrudRepository<
    CertificationGateDefinitionCreate,
    CertificationGateDefinitionUpdate,
    CertificationGateDefinitionRecord
  >({
    kind: "certification_gate_definition",
    store: stores.certificationGateDefinitions,
    searchFields: ["gateKey", "name", "kind", "templateKey"],
    validateCreate: (input) => {
      assertRequiredString(input.gateKey, "gateKey");
      assertRequiredString(input.name, "name");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        gateKey: String(existing?.gateKey ?? input.gateKey),
        name: String(input.name ?? existing?.name ?? ""),
        description:
          (input.description as string | undefined) ?? existing?.description,
        kind: String(input.kind ?? existing?.kind ?? "builtin"),
        required: Boolean(input.required ?? existing?.required ?? true),
        configJson:
          (input.configJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.configJson,
        templateKey:
          (input.templateKey as string | undefined) ?? existing?.templateKey,
        ordinal: (input.ordinal as number | undefined) ?? existing?.ordinal,
        enabled: Boolean(input.enabled ?? existing?.enabled ?? true),
      };
    },
  });

  const certificationGateEvaluations = createInMemoryCrudRepository<
    CertificationGateEvaluationCreate,
    CertificationGateEvaluationUpdate,
    CertificationGateEvaluationRecord
  >({
    kind: "certification_gate_evaluation",
    store: stores.certificationGateEvaluations,
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
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        certificationRecordId: String(
          existing?.certificationRecordId ?? input.certificationRecordId,
        ),
        gateDefinitionId:
          (input.gateDefinitionId as string | undefined) ??
          existing?.gateDefinitionId,
        gateKey: String(existing?.gateKey ?? input.gateKey),
        status: String(input.status ?? existing?.status ?? "pending"),
        reason: String(input.reason ?? existing?.reason ?? ""),
        supportingEvidence:
          (input.supportingEvidence as readonly string[]) ??
          existing?.supportingEvidence ??
          [],
        evaluatedAt: String(
          input.evaluatedAt ?? existing?.evaluatedAt ?? new Date().toISOString(),
        ),
        evaluatorUserId:
          (input.evaluatorUserId as string | undefined) ??
          existing?.evaluatorUserId,
        traceabilityRefs:
          (input.traceabilityRefs as readonly string[]) ??
          existing?.traceabilityRefs ??
          [],
        detailsJson:
          (input.detailsJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.detailsJson,
      };
    },
  });

  const certificationRules = createInMemoryCrudRepository<
    CertificationRuleCreate,
    CertificationRuleUpdate,
    CertificationRuleRecord
  >({
    kind: "certification_rule",
    store: stores.certificationRules,
    searchFields: ["key", "name", "productLabel"],
    validateCreate: (input) => {
      assertRequiredString(input.key, "key");
      assertRequiredString(input.name, "name");
    },
    toRecord: (ctx, input, existing) => {
      const meta = baseMeta(ctx, input, existing);
      return {
        ...meta,
        key: String(existing?.key ?? input.key),
        name: String(input.name ?? existing?.name ?? ""),
        certificationRecordId:
          (input.certificationRecordId as string | undefined) ??
          existing?.certificationRecordId,
        planId: (input.planId as string | undefined) ?? existing?.planId,
        productLabel:
          (input.productLabel as string | undefined) ?? existing?.productLabel,
        requiredGateKeys:
          (input.requiredGateKeys as readonly string[]) ??
          existing?.requiredGateKeys ??
          [],
        optionalGateKeys:
          (input.optionalGateKeys as readonly string[]) ??
          existing?.optionalGateKeys ??
          [],
        approvalStagesJson:
          (input.approvalStagesJson as
            | readonly Readonly<Record<string, unknown>>[]
            | undefined) ?? existing?.approvalStagesJson,
        enabled: Boolean(input.enabled ?? existing?.enabled ?? true),
        configJson:
          (input.configJson as Readonly<Record<string, unknown>> | undefined) ??
          existing?.configJson,
      };
    },
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
      const row: CertificationAuditRecord = {
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
      stores.certificationAudits.set(id, row);
      return row;
    },
    async listByCertification(ctx, certificationRecordId, query) {
      assertPermission(ctx, "certification_audit", "list");
      const q = normalizeListQuery(query);
      let items = [...stores.certificationAudits.values()].filter(
        (row) =>
          row.tenantId === ctx.tenantId &&
          row.certificationRecordId === certificationRecordId,
      );
      if (q.search) {
        items = items.filter((row) =>
          matchesSearch(row as unknown as Record<string, unknown>, q.search, [
            "action",
            "summary",
          ]),
        );
      }
      items = items.filter((row) =>
        matchesFilters(row as unknown as Record<string, unknown>, q.filters),
      );
      items.sort((a, b) => compareValues(a.occurredAt, b.occurredAt, "desc"));
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "certification_audit", "get");
      const row = stores.certificationAudits.get(id);
      if (!row || row.tenantId !== ctx.tenantId) return undefined;
      return row;
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
      const row: CertificationHistoryRecord = {
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
      stores.certificationHistory.set(id, row);
      return row;
    },
    async listByCertification(ctx, certificationRecordId, query) {
      assertPermission(ctx, "certification_history", "list");
      const q = normalizeListQuery(query);
      let items = [...stores.certificationHistory.values()].filter(
        (row) =>
          row.tenantId === ctx.tenantId &&
          row.certificationRecordId === certificationRecordId,
      );
      items = items.filter((row) =>
        matchesFilters(row as unknown as Record<string, unknown>, q.filters),
      );
      items.sort((a, b) => compareValues(a.occurredAt, b.occurredAt, "desc"));
      return paginateItems(items, q.page, q.pageSize);
    },
    async get(ctx, id) {
      assertPermission(ctx, "certification_history", "get");
      const row = stores.certificationHistory.get(id);
      if (!row || row.tenantId !== ctx.tenantId) return undefined;
      return row;
    },
  };

  return {
    certificationGateDefinitions,
    certificationGateEvaluations,
    certificationRules,
    certificationAudits,
    certificationHistory,
  } satisfies {
    certificationGateDefinitions: CrudRepository<
      CertificationGateDefinitionCreate,
      CertificationGateDefinitionUpdate,
      CertificationGateDefinitionRecord
    >;
    certificationGateEvaluations: CrudRepository<
      CertificationGateEvaluationCreate,
      CertificationGateEvaluationUpdate,
      CertificationGateEvaluationRecord
    >;
    certificationRules: CrudRepository<
      CertificationRuleCreate,
      CertificationRuleUpdate,
      CertificationRuleRecord
    >;
    certificationAudits: CertificationAuditRepository;
    certificationHistory: CertificationHistoryRepository;
  };
}
