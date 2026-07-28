import {
  computeQepTestPlanAvailableActions,
  type QepTestPlanAction,
} from "@apzhub/qep-contracts";

import type { StoredTestPlan } from "../domain/test-plan/plan-repository";

/**
 * Computes Test Plan commands a caller may perform, delegating to canonical
 * `@apzhub/qep-contracts` rules (OES-ENG-060B Part 3 §6).
 */
export function computePlanAvailableActions(
  plan: Pick<StoredTestPlan, "status">,
  permissions?: readonly string[],
): readonly QepTestPlanAction[] {
  return computeQepTestPlanAvailableActions(plan.status, permissions);
}

export { type QepTestPlanAction };
