import type { CapabilityLifecycleState } from "../capability/types";

/** Optional context recorded with each lifecycle transition (audit-ready). */
export interface LifecycleTransitionContext {
  readonly reason?: string;
  readonly source?: string;
  /** Reserved for future audit integration. */
  readonly auditRef?: string;
}

export interface LifecycleTransitionRecord {
  readonly from: CapabilityLifecycleState | null;
  readonly to: CapabilityLifecycleState;
  readonly timestamp: string;
  readonly reason?: string;
  readonly source?: string;
  readonly auditRef?: string;
}

export interface LifecycleCapabilityState {
  readonly capabilityId: string;
  readonly state: CapabilityLifecycleState;
  readonly updatedAt: string;
}

export interface LifecycleTransitionSuccess {
  readonly success: true;
  readonly capabilityId: string;
  readonly from: CapabilityLifecycleState | null;
  readonly to: CapabilityLifecycleState;
  readonly record: LifecycleTransitionRecord;
}

export interface LifecycleTransitionFailure {
  readonly success: false;
  readonly capabilityId: string;
  readonly from: CapabilityLifecycleState | null;
  readonly to: CapabilityLifecycleState;
  readonly errors: readonly LifecycleError[];
}

export type LifecycleTransitionResult =
  LifecycleTransitionSuccess | LifecycleTransitionFailure;

export interface LifecycleSnapshotEntry {
  readonly capabilityId: string;
  readonly state: CapabilityLifecycleState;
  readonly transitionCount: number;
  readonly updatedAt: string;
}

export interface LifecycleSnapshot {
  readonly timestamp: string;
  readonly capabilityCount: number;
  readonly stateSummary: Readonly<Partial<Record<CapabilityLifecycleState, number>>>;
  readonly capabilities: readonly LifecycleSnapshotEntry[];
}

export interface LifecycleDiagnostics {
  readonly capabilityId: string;
  readonly currentState: CapabilityLifecycleState | undefined;
  readonly allowedTransitions: readonly CapabilityLifecycleState[];
  readonly transitionCount: number;
  readonly lastTransition: LifecycleTransitionRecord | undefined;
}

export type LifecycleErrorCode =
  "LIFECYCLE_NOT_TRACKED" | "LIFECYCLE_INVALID_TRANSITION" | "LIFECYCLE_INVALID_INPUT";

export interface LifecycleError {
  readonly code: LifecycleErrorCode;
  readonly message: string;
  readonly capabilityId?: string;
  readonly from?: CapabilityLifecycleState | null;
  readonly to?: CapabilityLifecycleState;
}
