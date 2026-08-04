/**
 * Provider-neutral trigger model (QO-003).
 *
 * Trigger Engine consumes NormalizedTrigger only.
 * Provider adapters (GitHub, GitLab, Jenkins, …) live outside this package.
 */

import type { QualityFlowStage } from "./capability-catalogue";

/** Identifies a single incoming normalized trigger instance. */
export type TriggerId = string & { readonly __brand: "TriggerId" };

/** Identifies a Quality Flow definition or instance selection target. */
export type QualityFlowId = string & { readonly __brand: "QualityFlowId" };

export type ExecutionId = string & { readonly __brand: "ExecutionId" };

/**
 * Generic source class — never a provider product name.
 * Adapters map GitHub/GitLab/… → these classes before reaching the engine.
 */
export type TriggerSourceClass =
  | "scm"
  | "api"
  | "schedule"
  | "cli"
  | "automation"
  | "notification"
  | "command"
  | "external"
  | "manual"
  | "unknown";

export type TriggerDisposition = "routed" | "ignored" | "rejected";

export interface TriggerIdentityBundle {
  readonly triggerId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  /** Assigned when routing selects a Quality Flow — not owned/executed here. */
  readonly qualityFlowId?: string;
  /** Reserved for later execution slices — never set by Trigger Engine execution. */
  readonly executionId?: string;
}

/**
 * Normalized trigger contract — the only input the Trigger Engine accepts.
 */
export interface NormalizedTrigger {
  readonly triggerId: string;
  readonly triggerType: string;
  readonly triggerSource: TriggerSourceClass;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  /** Opaque reference to provider payload store — never raw provider payload. */
  readonly payloadRef: string;
  /** Non-provider-specific context refs (branch, sha, suite ids as opaque strings). */
  readonly context?: Readonly<Record<string, string>>;
  readonly occurredAt: string;
  readonly labels?: Readonly<Record<string, string>>;
}

export interface TriggerBinding {
  readonly bindingId: string;
  readonly triggerType: string;
  /** Optional source-class filter; omit to match any source class. */
  readonly triggerSource?: TriggerSourceClass;
  readonly qualityFlowId: string;
  /** Suggested next stage after routing — selection metadata only. */
  readonly nextStage?: QualityFlowStage;
  readonly priority: number;
  readonly enabled: boolean;
  readonly tenantId?: string;
  readonly projectId?: string;
  readonly description?: string;
}

export interface TriggerRoutingResult {
  readonly disposition: TriggerDisposition;
  readonly triggerId: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly qualityFlowId?: string;
  readonly bindingId?: string;
  readonly nextStage?: QualityFlowStage;
  readonly reason?: string;
  readonly routedAt: string;
  readonly identities: TriggerIdentityBundle;
}

export function asTriggerId(value: string): TriggerId {
  return value as TriggerId;
}

export function asQualityFlowId(value: string): QualityFlowId {
  return value as QualityFlowId;
}

export function createTriggerId(prefix = "trig"): TriggerId {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return asTriggerId(`${prefix}_${stamp}_${rand}`);
}
