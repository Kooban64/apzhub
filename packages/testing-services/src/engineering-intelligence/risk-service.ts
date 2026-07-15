import type { EngineeringRiskService } from "@apzhub/testing-contracts";

import type { ServiceRuntime } from "../services/types";
import { aggregateRisk } from "./calculations";

export function createEngineeringRiskService(
  rt: ServiceRuntime,
): EngineeringRiskService {
  return {
    async aggregate(ctx, inputs) {
      const summary = aggregateRisk(inputs, rt.now());
      rt.events.record({
        eventType: "engineering.risk_aggregated",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        actorUserId: ctx.userId,
        payload: {
          overallScore: summary.overallScore,
          overallLevel: summary.overallLevel,
        },
      });
      return summary;
    },
  };
}
