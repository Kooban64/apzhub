import type {
  CertificationGateDefinition,
  CertificationGateEvaluation,
  CertificationGateService,
} from "@apzhub/testing-contracts";
import {
  asCertificationGateDefinitionId,
  asCertificationGateEvaluationId,
  asCertificationRecordId,
  CERTIFICATION_GATE_KEYS,
  type CertificationGateOutcome,
} from "@apzhub/testing-contracts";
import type {
  CertificationGateDefinitionRecord,
  CertificationGateEvaluationRecord,
} from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { appendCertificationAudit } from "./audit-service";
import { evaluateCertificationGate } from "./gate-evaluation";
import {
  assertHasPermission,
  assertNonEmptyString,
  assertTenantOrganisationMatch,
  evidenceLinksFromJson,
} from "./validation";

function defToDomain(
  row: CertificationGateDefinitionRecord,
): CertificationGateDefinition {
  return {
    id: asCertificationGateDefinitionId(row.id),
    tenantId: row.tenantId,
    gateKey: row.gateKey,
    name: row.name,
    description: row.description,
    kind: row.kind,
    required: row.required,
    configJson: row.configJson,
    templateKey: row.templateKey,
    ordinal: row.ordinal,
    enabled: row.enabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function evalToDomain(
  row: CertificationGateEvaluationRecord,
): CertificationGateEvaluation {
  return {
    id: asCertificationGateEvaluationId(row.id),
    tenantId: row.tenantId,
    certificationRecordId: asCertificationRecordId(row.certificationRecordId),
    gateDefinitionId: row.gateDefinitionId
      ? asCertificationGateDefinitionId(row.gateDefinitionId)
      : undefined,
    gateKey: row.gateKey,
    status: row.status as CertificationGateOutcome,
    reason: row.reason,
    supportingEvidence: row.supportingEvidence,
    evaluatedAt: row.evaluatedAt,
    evaluatorUserId: row.evaluatorUserId,
    traceabilityRefs: row.traceabilityRefs,
    detailsJson: row.detailsJson,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

async function resolveGateInputs(
  rt: ServiceRuntime,
  ctx: Parameters<CertificationGateService["evaluateGate"]>[0],
  certificationRecordId: string,
) {
  const rctx = toRepositoryContext(ctx);
  const record = requireFound(
    await rt.persistence.certificationRecords.get(rctx, certificationRecordId),
    "certification_record",
    certificationRecordId,
  );
  assertTenantOrganisationMatch(ctx, record);
  const links = evidenceLinksFromJson(record.evidenceLinksJson);

  const coveragePage = await rt.persistence.coverageRecords.list(rctx);
  const coverage = coveragePage.items.find(
    (c) =>
      links.coverageIds.includes(c.id) || (record.planId && c.planId === record.planId),
  );

  const defects = await rt.persistence.defectLinks.list(rctx);
  const openCritical = defects.items.filter(
    (d) =>
      (links.defectIds.includes(d.id) || !links.defectIds.length) &&
      (d.status === "open" || d.status === "reopened" || d.status === "in_progress") &&
      (d.severity === "critical" || d.severity === "blocker"),
  ).length;

  const approvals = await rt.persistence.approvals.list(rctx);
  const pendingApprovals = approvals.items.filter(
    (a) => a.certificationRecordId === certificationRecordId && a.status === "pending",
  ).length;

  const executions = await rt.persistence.manualExecutions.list(rctx);
  const relevantExecs = executions.items.filter(
    (e) =>
      links.executionIds.includes(e.id) ||
      (record.planId ? true : links.executionIds.length === 0),
  );
  const completedLike = relevantExecs.filter((e) =>
    ["completed", "approved", "under_review", "archived"].includes(e.status),
  );
  const executionCompletePercent =
    relevantExecs.length === 0
      ? undefined
      : Math.round((completedLike.length / relevantExecs.length) * 100);

  return {
    record,
    links,
    coveragePercent: coverage?.percentage,
    openCriticalDefectCount:
      links.defectIds.length || defects.items.length ? openCritical : undefined,
    pendingApprovalCount: pendingApprovals,
    executionCompletePercent,
    manualCompletePercent: executionCompletePercent,
    automationCompletePercent: undefined as number | undefined,
    highRiskUnresolvedCount: undefined as number | undefined,
    dataAvailable: true as boolean | undefined,
  };
}

export function createCertificationGateService(
  rt: ServiceRuntime,
): CertificationGateService {
  return {
    async listGateDefinitions(ctx) {
      assertHasPermission(ctx, "certification.view");
      const page = await rt.persistence.certificationGateDefinitions.list(
        toRepositoryContext(ctx),
      );
      return page.items.map(defToDomain);
    },
    async defineGate(ctx, input) {
      assertHasPermission(ctx, "certification.admin");
      assertNonEmptyString(input.gateKey, "gateKey");
      assertNonEmptyString(input.name, "name");
      const row = await rt.persistence.certificationGateDefinitions.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          gateKey: input.gateKey,
          name: input.name,
          description: input.description,
          kind: input.kind ?? "builtin",
          required: input.required ?? true,
          configJson: input.configJson,
          templateKey: input.templateKey,
          ordinal: input.ordinal,
          enabled: input.enabled ?? true,
          organisationId: ctx.organisationId,
        },
      );
      return defToDomain(row);
    },
    async updateGateDefinition(ctx, id, patch) {
      assertHasPermission(ctx, "certification.admin");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.certificationGateDefinitions.get(rctx, id),
        "certification_gate_definition",
        id,
      );
      const row = await rt.persistence.certificationGateDefinitions.update(
        rctx,
        id,
        existing.revision,
        patch,
      );
      return defToDomain(row);
    },
    async evaluateGate(ctx, certificationRecordId, gateKey) {
      assertHasPermission(ctx, "certification.gates.evaluate");
      assertNonEmptyString(gateKey, "gateKey");
      const inputs = await resolveGateInputs(rt, ctx, certificationRecordId);
      const defs = await rt.persistence.certificationGateDefinitions.list(
        toRepositoryContext(ctx),
      );
      const def = defs.items.find((d) => d.gateKey === gateKey && d.enabled);
      const threshold =
        typeof def?.configJson?.threshold === "number" ? def.configJson.threshold : 80;

      const result = evaluateCertificationGate({
        gateKey,
        required: def?.required ?? true,
        evidenceLinks: inputs.links,
        coveragePercent: inputs.coveragePercent,
        coverageThreshold: threshold,
        openCriticalDefectCount: inputs.openCriticalDefectCount,
        executionCompletePercent: inputs.executionCompletePercent,
        manualCompletePercent: inputs.manualCompletePercent,
        automationCompletePercent: inputs.automationCompletePercent,
        pendingApprovalCount: inputs.pendingApprovalCount,
        highRiskUnresolvedCount: inputs.highRiskUnresolvedCount,
        dataAvailable: inputs.dataAvailable,
      });

      const now = rt.now();
      const row = await rt.persistence.certificationGateEvaluations.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          certificationRecordId,
          gateDefinitionId: def?.id,
          gateKey,
          status: result.status,
          reason: result.reason,
          supportingEvidence: result.supportingEvidence,
          evaluatedAt: now,
          evaluatorUserId: ctx.userId,
          traceabilityRefs: result.traceabilityRefs,
          detailsJson: result.details,
          organisationId: ctx.organisationId,
        },
      );

      const evalIds = [...(inputs.record.gateEvaluationIds ?? []), row.id];
      await rt.persistence.certificationRecords.update(
        toRepositoryContext(ctx),
        certificationRecordId,
        inputs.record.revision,
        { gateEvaluationIds: evalIds },
      );

      await appendCertificationAudit(rt, ctx, {
        certificationRecordId: certificationRecordId as never,
        action: "certification.gate_evaluated",
        summary: `Evaluated gate ${gateKey}: ${result.status}`,
        detailsJson: { reason: result.reason },
      });
      rt.events.record({
        eventType: "certification.gate_evaluated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          certificationRecordId,
          gateKey,
          status: result.status,
          evaluationId: row.id,
        },
      });
      rt.events.record({
        eventType: "quality_gate.evaluated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { gateKey, status: result.status },
      });
      return evalToDomain(row);
    },
    async evaluateAll(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.gates.evaluate");
      const defs = await rt.persistence.certificationGateDefinitions.list(
        toRepositoryContext(ctx),
      );
      const keys =
        defs.items.filter((d) => d.enabled).map((d) => d.gateKey).length > 0
          ? defs.items.filter((d) => d.enabled).map((d) => d.gateKey)
          : [
              ...(rt.configuration?.certification.defaultGateKeys ??
                CERTIFICATION_GATE_KEYS),
            ];
      const unique = [...new Set(keys)];
      const results: CertificationGateEvaluation[] = [];
      for (const gateKey of unique) {
        results.push(await this.evaluateGate(ctx, certificationRecordId, gateKey));
      }
      return results;
    },
    async listEvaluations(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const page = await rt.persistence.certificationGateEvaluations.list(
        toRepositoryContext(ctx),
      );
      return page.items
        .filter((e) => e.certificationRecordId === certificationRecordId)
        .map(evalToDomain);
    },
  };
}
