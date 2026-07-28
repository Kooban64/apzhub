import type { LifecycleContext } from "./types";

export type LifecyclePolicy<S extends string> = {
  readonly id: string;
  readonly states: readonly S[];
  readonly transitions: readonly {
    readonly from: S;
    readonly to: S;
    readonly action: string;
  }[];
  readonly canTransition?: (
    from: S,
    to: S,
    ctx: LifecycleContext,
  ) => boolean | string;
};

export function isLifecycleState<S extends string>(
  policy: LifecyclePolicy<S>,
  state: string,
): state is S {
  return (policy.states as readonly string[]).includes(state);
}

export function findTransitionsFrom<S extends string>(
  policy: LifecyclePolicy<S>,
  from: S,
): readonly { readonly from: S; readonly to: S; readonly action: string }[] {
  return policy.transitions.filter((transition) => transition.from === from);
}

export function findTransitionByAction<S extends string>(
  policy: LifecyclePolicy<S>,
  from: S,
  action: string,
): { readonly from: S; readonly to: S; readonly action: string } | undefined {
  return policy.transitions.find(
    (transition) => transition.from === from && transition.action === action,
  );
}

export function findTransitionByTarget<S extends string>(
  policy: LifecyclePolicy<S>,
  from: S,
  targetState: S,
): { readonly from: S; readonly to: S; readonly action: string } | undefined {
  return policy.transitions.find(
    (transition) => transition.from === from && transition.to === targetState,
  );
}
