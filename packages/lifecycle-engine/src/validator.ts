import { LifecycleTransitionError } from "./errors";
import type { LifecyclePolicy } from "./policy";
import type { LifecycleContext } from "./types";

export type TransitionValidator<S extends string> = {
  assertAllowed(
    policy: LifecyclePolicy<S>,
    from: S,
    to: S,
    action: string,
    ctx: LifecycleContext,
  ): void;
};

function guardMessage(result: boolean | string): string | undefined {
  if (result === true) return undefined;
  if (result === false) return "Transition blocked by policy guard";
  return result;
}

export function createTransitionValidator<S extends string>(): TransitionValidator<S> {
  return {
    assertAllowed(policy, from, to, action, ctx) {
      if (!policy.canTransition) return;

      const result = policy.canTransition(from, to, ctx);
      const message = guardMessage(result);
      if (message) {
        throw new LifecycleTransitionError(message, { from, to, action });
      }
    },
  };
}

export function assertTransitionAllowed<S extends string>(
  policy: LifecyclePolicy<S>,
  from: S,
  to: S,
  action: string,
  ctx: LifecycleContext,
): void {
  createTransitionValidator<S>().assertAllowed(policy, from, to, action, ctx);
}
