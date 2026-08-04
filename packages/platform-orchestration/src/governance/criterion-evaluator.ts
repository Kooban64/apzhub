/**
 * Declarative gate criterion evaluation (QO-007).
 * Consumes evidence references and selection/impact — never generates evidence.
 */

import type {
  ImpactCorrelationResult,
  RiskLevel,
} from "../contracts/impact-correlation";
import type {
  EvidenceReference,
  GateCriterion,
  HumanApprovalRecord,
} from "../contracts/governance";
import type { SelectionDecision } from "../contracts/policy-selection";

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

export interface CriterionContext {
  readonly selection?: SelectionDecision;
  readonly impact?: ImpactCorrelationResult;
  readonly evidenceRefs: readonly EvidenceReference[];
  readonly humanApprovals: readonly HumanApprovalRecord[];
}

export interface CriterionEvalResult {
  readonly satisfied: boolean;
  readonly pending: boolean;
  readonly summary: string;
  readonly evidenceRefs: readonly string[];
  readonly activities: readonly string[];
  readonly outstanding: readonly string[];
}

export function evaluateCriterion(
  criterion: GateCriterion,
  ctx: CriterionContext,
): CriterionEvalResult {
  switch (criterion.type) {
    case "always_satisfied":
      return ok(true, false, "always_satisfied");
    case "always_pending":
      return ok(false, true, "always_pending", [], [], ["Awaiting evaluation signal"]);
    case "evidence_ref_present": {
      const found = ctx.evidenceRefs.find(
        (e) =>
          e.evidenceId === criterion.refKey ||
          e.ref === criterion.refKey ||
          e.kind === criterion.refKey ||
          (e.relatedGateHints ?? []).includes(criterion.refKey),
      );
      return found
        ? ok(true, false, `evidence_ref_present(${criterion.refKey})`, [found.ref], [])
        : ok(
            false,
            false,
            `evidence_ref_present(${criterion.refKey}) missing`,
            [],
            [],
            [`Provide evidence reference for ${criterion.refKey}`],
          );
    }
    case "evidence_integrity_ok": {
      const refKey = criterion.refKey;
      const refs = refKey
        ? ctx.evidenceRefs.filter(
            (e) =>
              e.evidenceId === refKey ||
              e.ref === refKey ||
              (e.relatedGateHints ?? []).includes(refKey),
          )
        : ctx.evidenceRefs;
      if (refs.length === 0) {
        return ok(
          false,
          false,
          "evidence_integrity_ok — no refs",
          [],
          [],
          ["Provide evidence with integrityOk"],
        );
      }
      const bad = refs.filter((e) => e.integrityOk === false);
      const unknown = refs.filter((e) => e.integrityOk === undefined);
      if (bad.length) {
        return ok(
          false,
          false,
          "evidence_integrity_ok failed",
          bad.map((e) => e.ref),
          [],
          ["Repair or replace evidence failing integrity checks"],
        );
      }
      if (unknown.length === refs.length) {
        return ok(
          false,
          true,
          "evidence_integrity_ok pending",
          refs.map((e) => e.ref),
          [],
          ["Evidence integrity not yet asserted"],
        );
      }
      return ok(
        true,
        false,
        "evidence_integrity_ok",
        refs.map((e) => e.ref),
      );
    }
    case "activity_selected": {
      if (!ctx.selection) {
        return ok(
          false,
          true,
          "activity_selected — no selection",
          [],
          [],
          ["Selection decision required"],
        );
      }
      const pools = [
        ...ctx.selection.requiredActivities,
        ...ctx.selection.blockingActivities,
        ...(criterion.requireBlockingOrRequired
          ? []
          : [...ctx.selection.optionalActivities, ...ctx.selection.deferredActivities]),
      ];
      const hit = pools.find((a) => a.activityKind === criterion.activityKind);
      return hit
        ? ok(
            true,
            false,
            `activity_selected(${criterion.activityKind})`,
            [],
            [criterion.activityKind],
          )
        : ok(
            false,
            false,
            `activity_selected(${criterion.activityKind}) missing`,
            [],
            [],
            [`Select quality activity ${criterion.activityKind}`],
          );
    }
    case "impact_confidence_at_least": {
      if (!ctx.impact) {
        return ok(
          false,
          true,
          "impact_confidence — no impact",
          [],
          [],
          ["Impact correlation required"],
        );
      }
      const score = ctx.impact.confidence.score;
      return score >= criterion.threshold
        ? ok(
            true,
            false,
            `impact_confidence_at_least(${criterion.threshold}) — ${score}`,
          )
        : ok(
            false,
            false,
            `impact_confidence_at_least(${criterion.threshold}) — ${score}`,
            [],
            [],
            [`Raise impact confidence to ≥ ${criterion.threshold}`],
          );
    }
    case "impact_risk_at_most": {
      if (!ctx.impact) {
        return ok(
          false,
          true,
          "impact_risk — no impact",
          [],
          [],
          ["Impact correlation required"],
        );
      }
      const matched = RISK_ORDER[ctx.impact.risk.level] <= RISK_ORDER[criterion.level];
      return matched
        ? ok(true, false, `impact_risk_at_most(${criterion.level})`)
        : ok(
            false,
            false,
            `impact_risk_at_most(${criterion.level}) — actual ${ctx.impact.risk.level}`,
            [],
            [],
            [`Reduce residual risk to ≤ ${criterion.level}`],
          );
    }
    case "selection_expected_confidence_at_least": {
      if (!ctx.selection) {
        return ok(
          false,
          true,
          "selection_confidence — no selection",
          [],
          [],
          ["Selection decision required"],
        );
      }
      const score = ctx.selection.expectedConfidence;
      return score >= criterion.threshold
        ? ok(
            true,
            false,
            `selection_expected_confidence_at_least(${criterion.threshold}) — ${score}`,
          )
        : ok(
            false,
            false,
            `selection_expected_confidence_at_least(${criterion.threshold}) — ${score}`,
            [],
            [],
            [`Increase expected confidence to ≥ ${criterion.threshold}`],
          );
    }
    case "human_approval_recorded": {
      const approval = ctx.humanApprovals.find(
        (a) => a.approverRole === criterion.approverRole && a.outcome === "approved",
      );
      if (approval) {
        return ok(true, false, `human_approval_recorded(${criterion.approverRole})`);
      }
      const rejected = ctx.humanApprovals.find(
        (a) => a.approverRole === criterion.approverRole && a.outcome === "rejected",
      );
      if (rejected) {
        return ok(
          false,
          false,
          `human_approval_recorded(${criterion.approverRole}) rejected`,
          [],
          [],
          [`Obtain approval from ${criterion.approverRole}`],
        );
      }
      return ok(
        false,
        true,
        `human_approval_recorded(${criterion.approverRole}) pending`,
        [],
        [],
        [`Awaiting ${criterion.approverRole} approval (QO-008)`],
      );
    }
    case "and": {
      const parts = criterion.criteria.map((c) => evaluateCriterion(c, ctx));
      const satisfied = parts.every((p) => p.satisfied);
      const pending =
        !satisfied &&
        parts.some((p) => p.pending) &&
        !parts.some((p) => !p.satisfied && !p.pending);
      return {
        satisfied,
        pending: pending && !satisfied,
        summary: `and(${parts.map((p) => p.summary).join("; ")})`,
        evidenceRefs: parts.flatMap((p) => p.evidenceRefs),
        activities: parts.flatMap((p) => p.activities),
        outstanding: parts.flatMap((p) => p.outstanding),
      };
    }
    case "or": {
      const parts = criterion.criteria.map((c) => evaluateCriterion(c, ctx));
      const satisfied = parts.some((p) => p.satisfied);
      const pending =
        !satisfied &&
        parts.every((p) => p.pending || p.satisfied) &&
        parts.some((p) => p.pending);
      return {
        satisfied,
        pending: Boolean(pending),
        summary: `or(${parts.map((p) => p.summary).join("; ")})`,
        evidenceRefs: parts.flatMap((p) => p.evidenceRefs),
        activities: parts.flatMap((p) => p.activities),
        outstanding: satisfied ? [] : parts.flatMap((p) => p.outstanding),
      };
    }
    default: {
      const _exhaustive: never = criterion;
      return ok(false, false, `unknown(${JSON.stringify(_exhaustive)})`);
    }
  }
}

function ok(
  satisfied: boolean,
  pending: boolean,
  summary: string,
  evidenceRefs: readonly string[] = [],
  activities: readonly string[] = [],
  outstanding: readonly string[] = [],
): CriterionEvalResult {
  return { satisfied, pending, summary, evidenceRefs, activities, outstanding };
}
