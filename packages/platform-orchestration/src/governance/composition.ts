/**
 * Declarative gate composition evaluation (QO-007).
 * 100% mode coverage required by certification target.
 */

import type {
  GateComposition,
  GateEvaluationResult,
  GateStatus,
} from "../contracts/governance";

export interface CompositionResult {
  readonly satisfied: boolean;
  readonly evaluatedGateIds: readonly string[];
  readonly summary: string;
}

function isSatisfiedStatus(status: GateStatus): boolean {
  return status === "satisfied" || status === "waived" || status === "not_applicable";
}

function isBlockingFailure(status: GateStatus): boolean {
  return status === "failed" || status === "expired" || status === "cancelled";
}

export function evaluateComposition(
  composition: GateComposition,
  byGateId: ReadonlyMap<string, GateEvaluationResult>,
): CompositionResult {
  switch (composition.mode) {
    case "all": {
      const ids = composition.gateIds;
      const satisfied = ids.every((id) => {
        const g = byGateId.get(id);
        return g ? isSatisfiedStatus(g.status) : false;
      });
      return {
        satisfied,
        evaluatedGateIds: ids,
        summary: `ALL — ${satisfied ? "satisfied" : "not satisfied"} (${ids.length} gates)`,
      };
    }
    case "any": {
      const ids = composition.gateIds;
      const satisfied = ids.some((id) => {
        const g = byGateId.get(id);
        return g ? isSatisfiedStatus(g.status) : false;
      });
      return {
        satisfied,
        evaluatedGateIds: ids,
        summary: `ANY — ${satisfied ? "satisfied" : "not satisfied"}`,
      };
    }
    case "minimum": {
      const ids = composition.gateIds;
      const count = ids.filter((id) => {
        const g = byGateId.get(id);
        return g ? isSatisfiedStatus(g.status) : false;
      }).length;
      const satisfied = count >= composition.count;
      return {
        satisfied,
        evaluatedGateIds: ids,
        summary: `MINIMUM ${composition.count} — ${count} satisfied`,
      };
    }
    case "weighted": {
      let score = 0;
      const ids: string[] = [];
      for (const item of composition.items) {
        ids.push(item.gateId);
        const g = byGateId.get(item.gateId);
        if (g && isSatisfiedStatus(g.status)) {
          score += item.weight;
        }
      }
      const satisfied = score >= composition.threshold;
      return {
        satisfied,
        evaluatedGateIds: ids,
        summary: `WEIGHTED score ${score} / threshold ${composition.threshold}`,
      };
    }
    case "sequential": {
      const ids = composition.gateIds;
      for (const id of ids) {
        const g = byGateId.get(id);
        if (!g) {
          return {
            satisfied: false,
            evaluatedGateIds: ids,
            summary: `SEQUENTIAL stopped — missing ${id}`,
          };
        }
        if (
          isBlockingFailure(g.status) ||
          g.status === "pending" ||
          g.status === "deferred"
        ) {
          return {
            satisfied: false,
            evaluatedGateIds: ids,
            summary: `SEQUENTIAL stopped at ${id} (${g.status})`,
          };
        }
        if (!isSatisfiedStatus(g.status)) {
          return {
            satisfied: false,
            evaluatedGateIds: ids,
            summary: `SEQUENTIAL stopped at ${id} (${g.status})`,
          };
        }
      }
      return {
        satisfied: true,
        evaluatedGateIds: ids,
        summary: "SEQUENTIAL — all gates satisfied in order",
      };
    }
    case "conditional": {
      const condition = byGateId.get(composition.ifGateId);
      const branch =
        condition && isSatisfiedStatus(condition.status)
          ? composition.thenGateIds
          : composition.elseGateIds;
      const evaluated = [composition.ifGateId, ...branch];
      const satisfied = branch.every((id) => {
        const g = byGateId.get(id);
        return g ? isSatisfiedStatus(g.status) : false;
      });
      return {
        satisfied,
        evaluatedGateIds: evaluated,
        summary: `CONDITIONAL via ${composition.ifGateId} → ${branch.join(",") || "(empty)"}`,
      };
    }
    default: {
      const _exhaustive: never = composition;
      return {
        satisfied: false,
        evaluatedGateIds: [],
        summary: `Unknown composition ${JSON.stringify(_exhaustive)}`,
      };
    }
  }
}

/** Collect all gate ids referenced by a composition (for evaluation). */
export function collectCompositionGateIds(
  composition: GateComposition,
): readonly string[] {
  switch (composition.mode) {
    case "all":
    case "any":
    case "minimum":
    case "sequential":
      return composition.gateIds;
    case "weighted":
      return composition.items.map((i) => i.gateId);
    case "conditional":
      return [
        composition.ifGateId,
        ...composition.thenGateIds,
        ...composition.elseGateIds,
      ];
    default: {
      const _exhaustive: never = composition;
      void _exhaustive;
      return [];
    }
  }
}
