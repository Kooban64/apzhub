import type {
  CertificationRule,
  CertificationRuleService,
} from "@apzhub/testing-contracts";
import {
  asCertificationRecordId,
  asCertificationRuleId,
  asTestPlanId,
  type ApprovalStageConfig,
} from "@apzhub/testing-contracts";
import type { CertificationRuleRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { appendCertificationAudit } from "./audit-service";
import { assertHasPermission, assertNonEmptyString } from "./validation";

function toDomain(row: CertificationRuleRecord): CertificationRule {
  return {
    id: asCertificationRuleId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    name: row.name,
    certificationRecordId: row.certificationRecordId
      ? asCertificationRecordId(row.certificationRecordId)
      : undefined,
    planId: row.planId ? asTestPlanId(row.planId) : undefined,
    productLabel: row.productLabel,
    requiredGateKeys: row.requiredGateKeys,
    optionalGateKeys: row.optionalGateKeys,
    approvalStages: row.approvalStagesJson as ApprovalStageConfig[] | undefined,
    enabled: row.enabled,
    configJson: row.configJson,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createCertificationRuleService(
  rt: ServiceRuntime,
): CertificationRuleService {
  return {
    async listRules(ctx) {
      assertHasPermission(ctx, "certification.view");
      const page = await rt.persistence.certificationRules.list(
        toRepositoryContext(ctx),
      );
      return page.items.map(toDomain);
    },
    async getRule(ctx, id) {
      assertHasPermission(ctx, "certification.view");
      return toDomain(
        requireFound(
          await rt.persistence.certificationRules.get(toRepositoryContext(ctx), id),
          "certification_rule",
          id,
        ),
      );
    },
    async configureRule(ctx, input) {
      assertHasPermission(ctx, "certification.admin");
      assertNonEmptyString(input.key, "key");
      assertNonEmptyString(input.name, "name");
      const row = await rt.persistence.certificationRules.create(
        toRepositoryContext(ctx),
        {
          id: rt.id(),
          key: input.key,
          name: input.name,
          certificationRecordId: input.certificationRecordId,
          planId: input.planId,
          productLabel: input.productLabel,
          requiredGateKeys: input.requiredGateKeys ?? [],
          optionalGateKeys: input.optionalGateKeys ?? [],
          approvalStagesJson: input.approvalStages as
            Record<string, unknown>[] | undefined,
          enabled: input.enabled ?? true,
          configJson: input.configJson,
          organisationId: ctx.organisationId,
        },
      );
      if (input.certificationRecordId) {
        await appendCertificationAudit(rt, ctx, {
          certificationRecordId: input.certificationRecordId,
          action: "certification.rule_configured",
          summary: `Configured rule ${row.key}`,
        });
      }
      rt.events.record({
        eventType: "certification.rule_configured",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { ruleId: row.id, key: row.key },
      });
      return toDomain(row);
    },
    async updateRule(ctx, id, patch) {
      assertHasPermission(ctx, "certification.admin");
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.certificationRules.get(rctx, id),
        "certification_rule",
        id,
      );
      const row = await rt.persistence.certificationRules.update(
        rctx,
        id,
        existing.revision,
        {
          name: patch.name,
          certificationRecordId: patch.certificationRecordId,
          planId: patch.planId,
          productLabel: patch.productLabel,
          requiredGateKeys: patch.requiredGateKeys,
          optionalGateKeys: patch.optionalGateKeys,
          approvalStagesJson: patch.approvalStages as
            Record<string, unknown>[] | undefined,
          enabled: patch.enabled,
          configJson: patch.configJson,
        },
      );
      return toDomain(row);
    },
    async listRulesForCertification(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const page = await rt.persistence.certificationRules.list(
        toRepositoryContext(ctx),
      );
      return page.items
        .filter(
          (r) =>
            r.certificationRecordId === certificationRecordId ||
            !r.certificationRecordId,
        )
        .map(toDomain);
    },
  };
}
