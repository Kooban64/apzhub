/**
 * Provider-neutral execution contracts.
 * External APIs must never expose Playwright-specific types.
 */

export type AutomationProviderId =
  | "playwright"
  | "vitest"
  | "selenium"
  | "cypress"
  | "appium"
  | "rest"
  | "k6"
  | "visual"
  | "accessibility"
  | "security"
  | "codequality";

export type ExecutionLifecycleState =
  | "queued"
  | "preparing"
  | "running"
  | "retrying"
  | "completed"
  | "failed"
  | "cancelled"
  | "timed_out"
  | "interrupted";

export const TERMINAL_EXECUTION_STATES: readonly ExecutionLifecycleState[] = [
  "completed",
  "failed",
  "cancelled",
  "timed_out",
  "interrupted",
] as const;

export interface AutomationExecutionRequest {
  readonly executionId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly providerId: AutomationProviderId;
  readonly correlationId: string;
  readonly requestedBy: string;
  /** Provider-neutral target descriptor (suite/spec refs, URLs, scripts). */
  readonly target: AutomationExecutionTarget;
  readonly options?: AutomationExecutionOptions;
}

export interface AutomationExecutionTarget {
  readonly kind: "suite" | "spec" | "script" | "url" | "custom";
  readonly name: string;
  readonly refs?: readonly string[];
  readonly entry?: string;
  readonly baseUrl?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface AutomationExecutionOptions {
  readonly workers?: number;
  readonly retries?: number;
  readonly timeoutMs?: number;
  readonly parallel?: boolean;
  readonly collectScreenshots?: boolean;
  readonly collectVideos?: boolean;
  readonly collectTraces?: boolean;
  readonly collectNetworkLogs?: boolean;
  readonly collectConsole?: boolean;
  /** Dry-run exercises lifecycle without launching external engines. */
  readonly dryRun?: boolean;
}

export interface AutomationArtifact {
  readonly artifactId: string;
  readonly kind:
    | "log"
    | "screenshot"
    | "video"
    | "trace"
    | "console"
    | "network"
    | "timing"
    | "metadata"
    | "other";
  readonly name: string;
  readonly contentType: string;
  readonly uri?: string;
  readonly bytes?: number;
  readonly sha256?: string;
  /**
   * Optional in-process payload for evidence publication bridges.
   * Prefer durable StoragePort after publish; do not treat as long-term SoR.
   */
  readonly contentBase64?: string;
  readonly createdAt: string;
}

export interface AutomationTimingMetrics {
  readonly queuedAt?: string;
  readonly startedAt?: string;
  readonly finishedAt?: string;
  readonly durationMs?: number;
}

export interface AutomationExecutionRecord {
  readonly executionId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly providerId: AutomationProviderId;
  readonly correlationId: string;
  readonly requestedBy: string;
  readonly target: AutomationExecutionTarget;
  readonly options: AutomationExecutionOptions;
  readonly state: ExecutionLifecycleState;
  readonly attempt: number;
  readonly maxAttempts: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly errorMessage?: string;
  readonly artifacts: readonly AutomationArtifact[];
  readonly timing: AutomationTimingMetrics;
  readonly evidenceRefs: readonly string[];
  readonly resultSummary?: string;
}

export interface AutomationProviderDescriptor {
  readonly providerId: AutomationProviderId;
  readonly name: string;
  readonly version: string;
  readonly status: "active" | "placeholder" | "disabled";
  readonly capabilities: readonly string[];
}
