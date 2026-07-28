export class LifecyclePolicyError extends Error {
  readonly code = "LIFECYCLE_POLICY_ERROR" as const;

  constructor(message: string) {
    super(message);
    this.name = "LifecyclePolicyError";
  }
}

export class LifecycleTransitionError extends Error {
  readonly code = "LIFECYCLE_TRANSITION_ERROR" as const;
  readonly from: string;
  readonly to?: string;
  readonly action?: string;

  constructor(
    message: string,
    options: { readonly from: string; readonly to?: string; readonly action?: string },
  ) {
    super(message);
    this.name = "LifecycleTransitionError";
    this.from = options.from;
    this.to = options.to;
    this.action = options.action;
  }
}
