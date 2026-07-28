/** Generic lifecycle domain types — reusable across bounded contexts. */

export type LifecycleState = string;

export type LifecycleTransition<S extends string = LifecycleState> = {
  readonly from: S;
  readonly to: S;
  readonly action: string;
};

export type LifecycleReason = {
  readonly code?: string;
  readonly message: string;
};

export type LifecycleMetadata = Readonly<Record<string, string>>;

export type LifecycleContext = {
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly reason?: string;
  readonly comments?: string;
  readonly metadata?: LifecycleMetadata;
  readonly revision?: number;
  readonly now: string;
};

export type LifecycleHistoryEntry<S extends string = LifecycleState> = {
  readonly previousState: S;
  readonly newState: S;
  readonly action: string;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly reason?: string;
  readonly comments?: string;
  readonly metadata?: LifecycleMetadata;
  readonly revision?: number;
  readonly occurredAt: string;
};

export type LifecycleTransitionResult<S extends string = LifecycleState> = {
  readonly previousState: S;
  readonly newState: S;
  readonly action: string;
  readonly historyEntry: LifecycleHistoryEntry<S>;
};

export type AvailableLifecycleTransition<S extends string = LifecycleState> = {
  readonly from: S;
  readonly to: S;
  readonly action: string;
};
