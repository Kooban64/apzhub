import { LifecyclePolicyError, LifecycleTransitionError } from "./errors";
import {
  findTransitionByAction,
  findTransitionByTarget,
  findTransitionsFrom,
  isLifecycleState,
  type LifecyclePolicy,
} from "./policy";
import type { TransitionValidator } from "./validator";
import { assertTransitionAllowed } from "./validator";
import type {
  AvailableLifecycleTransition,
  LifecycleContext,
  LifecycleHistoryEntry,
  LifecycleTransitionResult,
} from "./types";

export type LifecycleEngineOptions<S extends string> = {
  readonly validator?: TransitionValidator<S>;
};

function buildHistoryEntry<S extends string>(
  transition: { readonly from: S; readonly to: S; readonly action: string },
  ctx: LifecycleContext,
): LifecycleHistoryEntry<S> {
  return {
    previousState: transition.from,
    newState: transition.to,
    action: transition.action,
    actorUserId: ctx.actorUserId,
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    reason: ctx.reason,
    comments: ctx.comments,
    metadata: ctx.metadata,
    revision: ctx.revision,
    occurredAt: ctx.now,
  };
}

function resolveTransition<S extends string>(
  policy: LifecyclePolicy<S>,
  currentState: S,
  target: string,
): { readonly from: S; readonly to: S; readonly action: string } {
  const byAction = findTransitionByAction(policy, currentState, target);
  if (byAction) return byAction;

  if (isLifecycleState(policy, target)) {
    const byTarget = findTransitionByTarget(policy, currentState, target);
    if (byTarget) return byTarget;
  }

  throw new LifecycleTransitionError(
    `No transition from ${currentState} via action or target "${target}"`,
    { from: currentState, action: target, to: isLifecycleState(policy, target) ? target : undefined },
  );
}

export function assertTransition<S extends string>(
  policy: LifecyclePolicy<S>,
  currentState: S,
  targetStateOrAction: string,
  ctx: LifecycleContext,
  options: LifecycleEngineOptions<S> = {},
): LifecycleTransitionResult<S> {
  if (!isLifecycleState(policy, currentState)) {
    throw new LifecyclePolicyError(`Unknown lifecycle state: ${currentState}`);
  }

  const transition = resolveTransition(policy, currentState, targetStateOrAction);
  const validator = options.validator ?? createInlineValidator<S>();
  validator.assertAllowed(policy, transition.from, transition.to, transition.action, ctx);

  return {
    previousState: transition.from,
    newState: transition.to,
    action: transition.action,
    historyEntry: buildHistoryEntry(transition, ctx),
  };
}

export function transition<S extends string>(
  policy: LifecyclePolicy<S>,
  currentState: S,
  targetStateOrAction: string,
  ctx: LifecycleContext,
  options: LifecycleEngineOptions<S> = {},
): LifecycleTransitionResult<S> {
  return assertTransition(policy, currentState, targetStateOrAction, ctx, options);
}

export function availableTransitions<S extends string>(
  policy: LifecyclePolicy<S>,
  currentState: S,
  ctx: LifecycleContext,
  options: LifecycleEngineOptions<S> = {},
): readonly AvailableLifecycleTransition<S>[] {
  if (!isLifecycleState(policy, currentState)) {
    throw new LifecyclePolicyError(`Unknown lifecycle state: ${currentState}`);
  }

  const validator = options.validator ?? createInlineValidator<S>();
  const candidates = findTransitionsFrom(policy, currentState);

  return candidates.filter((candidate) => {
    if (!policy.canTransition) return true;
    try {
      validator.assertAllowed(
        policy,
        candidate.from,
        candidate.to,
        candidate.action,
        ctx,
      );
      return true;
    } catch {
      return false;
    }
  });
}

function createInlineValidator<S extends string>(): TransitionValidator<S> {
  return {
    assertAllowed(policy, from, to, action, ctx) {
      assertTransitionAllowed(policy, from, to, action, ctx);
    },
  };
}

/** Namespace-style export for consumers preferring LifecycleEngine.transition syntax. */
export const LifecycleEngine = {
  transition,
  availableTransitions,
  assertTransition,
} as const;
