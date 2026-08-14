import type { ScmProviderId } from "./repository";

/** Durable engineering change signal (Flagship F1 — GitHub Heartbeat). */
export type ScmChangeKind = "commit" | "pull_request" | "push" | "ci_run" | "other";

export type ScmChangeSource = "webhook" | "sync" | "poll";

export interface ScmChangeEvent {
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly repositoryId?: string;
  readonly providerId: ScmProviderId;
  readonly kind: ScmChangeKind;
  /** Provider-stable key (commit SHA, `pr:42`, push delivery id, …). */
  readonly externalKey: string;
  readonly sha?: string;
  readonly branch?: string;
  readonly prNumber?: number;
  readonly title?: string;
  readonly authorLogin?: string;
  readonly authorName?: string;
  readonly filesChanged?: readonly string[];
  readonly htmlUrl?: string;
  readonly occurredAt: string;
  readonly correlationId: string;
  readonly source: ScmChangeSource;
  readonly summary: string;
}
