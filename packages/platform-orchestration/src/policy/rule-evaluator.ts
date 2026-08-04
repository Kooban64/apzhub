/**
 * Declarative rule condition evaluation (QO-006).
 * Pure functions — no side effects, no execution.
 */

import type {
  ChangeMagnitude,
  ImpactCorrelationResult,
  RiskLevel,
} from "../contracts/impact-correlation";
import type { PolicyProfileId, RuleCondition } from "../contracts/policy-selection";

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

const MAGNITUDE_ORDER: Record<ChangeMagnitude, number> = {
  trivial: 1,
  small: 2,
  medium: 3,
  large: 4,
  massive: 5,
};

export interface EvaluationContext {
  readonly impact: ImpactCorrelationResult;
  readonly profileId: PolicyProfileId;
}

export interface ConditionResult {
  readonly matched: boolean;
  readonly summary: string;
}

export function evaluateCondition(
  condition: RuleCondition,
  ctx: EvaluationContext,
): ConditionResult {
  switch (condition.type) {
    case "always":
      return { matched: true, summary: "always" };
    case "risk_at_least": {
      const matched = RISK_ORDER[ctx.impact.risk.level] >= RISK_ORDER[condition.level];
      return {
        matched,
        summary: `risk_at_least(${condition.level}) — actual ${ctx.impact.risk.level}`,
      };
    }
    case "confidence_below": {
      const matched = ctx.impact.confidence.score < condition.threshold;
      return {
        matched,
        summary: `confidence_below(${condition.threshold}) — actual ${ctx.impact.confidence.score}`,
      };
    }
    case "confidence_at_least": {
      const matched = ctx.impact.confidence.score >= condition.threshold;
      return {
        matched,
        summary: `confidence_at_least(${condition.threshold}) — actual ${ctx.impact.confidence.score}`,
      };
    }
    case "impact_includes_asset_type": {
      const matched = ctx.impact.graph.nodes.some(
        (n) => n.assetType === condition.assetType,
      );
      return {
        matched,
        summary: `impact_includes_asset_type(${condition.assetType})`,
      };
    }
    case "impact_node_count_at_least": {
      const matched = ctx.impact.graph.nodes.length >= condition.count;
      return {
        matched,
        summary: `impact_node_count_at_least(${condition.count}) — actual ${ctx.impact.graph.nodes.length}`,
      };
    }
    case "magnitude_at_least": {
      const mag = ctx.impact.change.magnitude ?? "medium";
      const matched = MAGNITUDE_ORDER[mag] >= MAGNITUDE_ORDER[condition.magnitude];
      return {
        matched,
        summary: `magnitude_at_least(${condition.magnitude}) — actual ${mag}`,
      };
    }
    case "profile_is": {
      const matched = ctx.profileId === condition.profileId;
      return {
        matched,
        summary: `profile_is(${condition.profileId}) — actual ${ctx.profileId}`,
      };
    }
    case "and": {
      const parts = condition.conditions.map((c) => evaluateCondition(c, ctx));
      const matched = parts.every((p) => p.matched);
      return {
        matched,
        summary: `and(${parts.map((p) => p.summary).join("; ")})`,
      };
    }
    case "or": {
      const parts = condition.conditions.map((c) => evaluateCondition(c, ctx));
      const matched = parts.some((p) => p.matched);
      return {
        matched,
        summary: `or(${parts.map((p) => p.summary).join("; ")})`,
      };
    }
    default: {
      const _exhaustive: never = condition;
      return { matched: false, summary: `unknown(${JSON.stringify(_exhaustive)})` };
    }
  }
}
