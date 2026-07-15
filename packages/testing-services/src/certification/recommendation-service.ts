import type {
  CertificationRecommendation,
  CertificationRecommendationService,
} from "@apzhub/testing-contracts";
import {
  asCertificationGateEvaluationId,
  asCertificationRecommendationId,
  asCertificationRecordId,
  type CertificationGateOutcome,
  type CertificationRecommendationCode,
} from "@apzhub/testing-contracts";

import { toRepositoryContext } from "../mapping/context";
import { DomainRuleError, requireFound } from "../services/errors";
import type { ServiceRuntime } from "../services/types";
import { appendCertificationAudit } from "./audit-service";
import { mapGateOutcomesToRecommendation } from "./gate-evaluation";
import { assertHasPermission } from "./validation";

/**
 * Deterministic advisory recommendation engine.
 * NEVER calls approve. NEVER sets approved status.
 */
export function createCertificationRecommendationService(
  rt: ServiceRuntime,
): CertificationRecommendationService {
  return {
    mapFromGateOutcomes(outcomes) {
      return mapGateOutcomesToRecommendation(outcomes);
    },
    async recommend(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const rctx = toRepositoryContext(ctx);
      const record = requireFound(
        await rt.persistence.certificationRecords.get(rctx, certificationRecordId),
        "certification_record",
        certificationRecordId,
      );

      const evals = await rt.persistence.certificationGateEvaluations.list(rctx);
      const latest = new Map<
        string,
        { status: CertificationGateOutcome; id: string; required?: boolean }
      >();
      for (const e of evals.items.filter(
        (x) => x.certificationRecordId === certificationRecordId,
      )) {
        latest.set(e.gateKey, {
          status: e.status as CertificationGateOutcome,
          id: e.id,
        });
      }

      const rules = await rt.persistence.certificationRules.list(rctx);
      const rule =
        rules.items.find((r) => r.certificationRecordId === certificationRecordId) ??
        rules.items.find((r) => r.enabled);
      const requiredKeys = new Set(rule?.requiredGateKeys ?? []);

      const outcomes = [...latest.entries()].map(([gateKey, value]) => ({
        gateKey,
        status: value.status,
        required: requiredKeys.size === 0 ? true : requiredKeys.has(gateKey),
      }));

      const mapped = mapGateOutcomesToRecommendation(outcomes);
      // Hard guard: recommendation must never mutate to approved.
      if (
        mapped.code === ("approved" as CertificationRecommendationCode) ||
        (mapped as { autoApprove?: boolean }).autoApprove
      ) {
        throw new DomainRuleError(
          "recommendation_cannot_approve",
          "Recommendation engine must never approve certifications",
        );
      }

      const recommendation: CertificationRecommendation = {
        id: asCertificationRecommendationId(rt.id()),
        certificationRecordId: asCertificationRecordId(certificationRecordId),
        code: mapped.code,
        reasons: mapped.reasons,
        gateEvaluationIds: [...latest.values()].map((v) =>
          asCertificationGateEvaluationId(v.id),
        ),
        computedAt: rt.now(),
        advisoryOnly: true,
        detailsJson: { outcomeCount: outcomes.length },
      };

      await rt.persistence.certificationRecords.update(
        rctx,
        certificationRecordId,
        record.revision,
        {
          currentRecommendation: recommendation.code,
          recommendationJson: {
            id: recommendation.id,
            code: recommendation.code,
            reasons: [...recommendation.reasons],
            computedAt: recommendation.computedAt,
            advisoryOnly: true,
          },
        },
      );

      await appendCertificationAudit(rt, ctx, {
        certificationRecordId,
        action: "certification.recommended",
        summary: `Advisory recommendation: ${recommendation.code}`,
        detailsJson: { reasons: recommendation.reasons },
      });
      rt.events.record({
        eventType: "certification.recommended",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          certificationRecordId,
          code: recommendation.code,
          advisoryOnly: true,
        },
      });
      return recommendation;
    },
    async getLatest(ctx, certificationRecordId) {
      assertHasPermission(ctx, "certification.view");
      const record = requireFound(
        await rt.persistence.certificationRecords.get(
          toRepositoryContext(ctx),
          certificationRecordId,
        ),
        "certification_record",
        certificationRecordId,
      );
      if (!record.currentRecommendation || !record.recommendationJson) {
        return undefined;
      }
      const json = record.recommendationJson;
      return {
        id: asCertificationRecommendationId(String(json.id ?? "latest")),
        certificationRecordId: asCertificationRecordId(certificationRecordId),
        code: record.currentRecommendation as CertificationRecommendationCode,
        reasons: Array.isArray(json.reasons)
          ? json.reasons.map(String)
          : [],
        gateEvaluationIds: (record.gateEvaluationIds ?? []).map((id) =>
          asCertificationGateEvaluationId(id),
        ),
        computedAt: String(json.computedAt ?? record.updatedAt),
        advisoryOnly: true,
        detailsJson: json,
      };
    },
  };
}
