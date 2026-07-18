import type { Risk, RiskService } from "@apzhub/testing-contracts";
import {
  asRequirementId,
  asRiskId,
  type BusinessCriticality,
  type Impact,
  type Likelihood,
  type RegressionImportance,
  type RequirementId,
  type RiskId,
  type Severity,
} from "@apzhub/testing-contracts";
import type { RiskRecord } from "@apzhub/testing-persistence";

import { toRepositoryContext } from "../mapping/context";
import { assertNonEmpty, assertValidLikelihood } from "../validation/domain-validation";
import { requireFound } from "./errors";
import type { ServiceRuntime } from "./types";

function toDomain(row: RiskRecord): Risk {
  return {
    id: asRiskId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    title: row.title,
    description: row.description,
    level: row.level,
    requirementIds: row.requirementIds.map((id) => asRequirementId(id)),
    mitigationSummary: row.mitigationSummary,
    severity: row.severity,
    likelihood: row.likelihood,
    impact: row.impact,
    businessCriticality: row.businessCriticality,
    regressionImportance: row.regressionImportance,
    ownerId: row.ownerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function createRiskService(rt: ServiceRuntime): RiskService {
  return {
    async list(ctx) {
      const page = await rt.persistence.risks.list(toRepositoryContext(ctx));
      return page.items.map(toDomain);
    },
    async get(ctx, id) {
      return toDomain(
        requireFound(
          await rt.persistence.risks.get(toRepositoryContext(ctx), id),
          "risk",
          id,
        ),
      );
    },
    async create(ctx, input) {
      assertNonEmpty(input.key, "key");
      assertNonEmpty(input.title, "title");
      if (input.likelihood) assertValidLikelihood(input.likelihood);
      const row = await rt.persistence.risks.create(toRepositoryContext(ctx), {
        key: input.key,
        title: input.title,
        description: input.description,
        level: input.level,
        mitigationSummary: input.mitigationSummary,
        requirementIds: (input.requirementIds as readonly string[]) ?? [],
        severity: input.severity,
        likelihood: input.likelihood,
        impact: input.impact,
        businessCriticality: input.businessCriticality,
        regressionImportance: input.regressionImportance,
        ownerId: input.ownerId,
        organisationId: ctx.organisationId,
      });
      rt.events.record({
        eventType: "risk.created",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { riskId: row.id },
      });
      return toDomain(row);
    },
    async update(ctx, id, input) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.risks.get(rctx, id),
        "risk",
        id,
      );
      if (input.likelihood) assertValidLikelihood(input.likelihood);
      const row = await rt.persistence.risks.update(rctx, id, existing.revision, {
        title: input.title,
        description: input.description,
        level: input.level,
        mitigationSummary: input.mitigationSummary,
        requirementIds: input.requirementIds as readonly string[] | undefined,
        severity: input.severity,
        likelihood: input.likelihood,
        impact: input.impact,
        businessCriticality: input.businessCriticality,
        regressionImportance: input.regressionImportance,
        ownerId: input.ownerId,
      });
      rt.events.record({
        eventType: "risk.updated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: { riskId: row.id },
      });
      return toDomain(row);
    },
    async archive(ctx, id: RiskId) {
      const rctx = toRepositoryContext(ctx);
      const existing = requireFound(
        await rt.persistence.risks.get(rctx, id),
        "risk",
        id,
      );
      return toDomain(await rt.persistence.risks.archive(rctx, id, existing.revision));
    },
    async setSeverity(ctx, id, severity: Severity) {
      return this.update(ctx, id, { severity });
    },
    async setLikelihood(ctx, id, likelihood: Likelihood) {
      return this.update(ctx, id, { likelihood });
    },
    async setImpact(ctx, id, impact: Impact) {
      return this.update(ctx, id, { impact });
    },
    async setBusinessCriticality(ctx, id, businessCriticality: BusinessCriticality) {
      return this.update(ctx, id, { businessCriticality });
    },
    async setRegressionImportance(ctx, id, regressionImportance: RegressionImportance) {
      return this.update(ctx, id, { regressionImportance });
    },
    async linkRequirement(ctx, id, requirementId: RequirementId) {
      const current = await this.get(ctx, id);
      if (current.requirementIds.includes(requirementId)) return current;
      return this.update(ctx, id, {
        requirementIds: [...current.requirementIds, requirementId],
      });
    },
    async unlinkRequirement(ctx, id, requirementId: RequirementId) {
      const current = await this.get(ctx, id);
      return this.update(ctx, id, {
        requirementIds: current.requirementIds.filter((r) => r !== requirementId),
      });
    },
  };
}
