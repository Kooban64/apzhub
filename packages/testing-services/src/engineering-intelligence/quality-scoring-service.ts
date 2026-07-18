import type {
  QualityScoreWeights,
  QualityScoringService,
} from "@apzhub/testing-contracts";

import type { ServiceRuntime } from "../services/types";
import { createEngineeringAggregationService } from "./aggregation-service";
import { computeQualityScore } from "./calculations";

export function createQualityScoringService(rt: ServiceRuntime): QualityScoringService {
  const aggregation = createEngineeringAggregationService(rt);
  return {
    async score(ctx, inputs, scope, weights?: QualityScoreWeights) {
      return computeQualityScore({
        id: rt.id(),
        scope: scope ?? { tenantId: ctx.tenantId, organisationId: ctx.organisationId },
        inputs: {
          coverage: inputs.coverage,
          automation: inputs.automation,
          manualExecution: inputs.manualExecution,
          failedTests: inputs.failedTests,
          openDefects: inputs.openDefects,
          certification: inputs.certification,
          approvals: inputs.approvals,
          releaseReadiness: inputs.releaseReadiness,
        },
        weights,
        computedAt: rt.now(),
      });
    },
    async scoreFromScope(ctx, scope, weights?: QualityScoreWeights) {
      const inputs = await aggregation.gatherInputs(ctx, scope);
      return this.score(ctx, inputs, scope, weights);
    },
  };
}
