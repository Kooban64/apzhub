import { LifecycleEngine } from "@apzhub/lifecycle-engine";

import {
  requirementLifecyclePolicy,
  type RequirementLifecycleAction,
} from "./requirement-lifecycle-policy";
import type { RequirementStatus } from "../value-objects/requirement-status";
import type { LifecycleContext } from "@apzhub/lifecycle-engine";

export const requirementLifecycleEngine = {
  transition(
    currentState: RequirementStatus,
    targetStateOrAction: RequirementLifecycleAction | RequirementStatus | string,
    ctx: LifecycleContext,
  ) {
    return LifecycleEngine.transition(
      requirementLifecyclePolicy,
      currentState,
      targetStateOrAction,
      ctx,
    );
  },
  availableTransitions(currentState: RequirementStatus, ctx: LifecycleContext) {
    return LifecycleEngine.availableTransitions(
      requirementLifecyclePolicy,
      currentState,
      ctx,
    );
  },
  assertTransition(
    currentState: RequirementStatus,
    targetStateOrAction: RequirementLifecycleAction | RequirementStatus | string,
    ctx: LifecycleContext,
  ) {
    return LifecycleEngine.assertTransition(
      requirementLifecyclePolicy,
      currentState,
      targetStateOrAction,
      ctx,
    );
  },
  policy: requirementLifecyclePolicy,
} as const;

export { requirementLifecyclePolicy } from "./requirement-lifecycle-policy";
