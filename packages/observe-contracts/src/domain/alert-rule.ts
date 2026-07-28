/**
 * Observe Live Alerts Phase A — rule + lifecycle metadata contracts (ADR-0070).
 * Rules attach to AlertDefinition.metadata.rule; lifecycle fields live on AlertState.metadata.
 */

import type {
  ObserveAlertCategory,
  ObserveAlertEvaluationOutcome,
  ObserveAlertSeverity,
  ObserveAlertSignalSource,
  ObserveAlertStateKind,
} from "../enums/catalogue";
import type { AlertDefinitionId, AlertStateId } from "../identifiers";

export const OBSERVE_ALERT_RULE_METADATA_KEY = "rule" as const;
export const OBSERVE_ALERT_LIFECYCLE_METADATA_KEY = "lifecycle" as const;

export type ObserveAlertPredicate =
  | {
      readonly kind: "status_in";
      readonly field: string;
      readonly values: readonly string[];
    }
  | {
      readonly kind: "status_not_in";
      readonly field: string;
      readonly values: readonly string[];
    }
  | {
      readonly kind: "threshold";
      readonly field: string;
      readonly op: "gt" | "gte" | "lt" | "lte" | "eq";
      readonly value: number;
    };

export type ObserveAlertRuleConfig = {
  readonly enabled: boolean;
  readonly signalSource: ObserveAlertSignalSource;
  /** serviceKey / componentKey / summary key — required for scoped signals */
  readonly signalKey?: string;
  readonly predicate: ObserveAlertPredicate;
  /** Pending → firing confirmation window (ms). Default 0 = fire immediately. */
  readonly forDurationMs?: number;
  /** Clear must sustain this long before auto-resolve (ms). Default 0. */
  readonly resolveForMs?: number;
  readonly labels?: Readonly<Record<string, string>>;
  readonly severityOverride?: ObserveAlertSeverity;
  readonly category?: ObserveAlertCategory;
  readonly suppression?: {
    readonly silenced?: boolean;
    readonly reason?: string;
  };
  readonly deduplication?: {
    readonly windowMs?: number;
  };
  readonly evaluationIntervalMs?: number;
  /** Reference only — Notification delivery is ADR-0071 / ENG-004. */
  readonly deliveryPolicyRef?: string;
  readonly owner?: string;
};

export type ObserveAlertLifecycleMetadata = {
  readonly fingerprint: string;
  readonly occurrenceCount: number;
  readonly firstFiredAt?: string;
  readonly lastFiredAt?: string;
  readonly evaluatedAt?: string;
  readonly acknowledgedAt?: string;
  readonly acknowledgedBy?: string;
  readonly suppressedAt?: string;
  readonly suppressedBy?: string;
  readonly suppressedReason?: string;
  readonly category?: ObserveAlertCategory;
  readonly correlationId?: string;
  readonly lastOutcome?: ObserveAlertEvaluationOutcome;
  readonly pendingSince?: string;
  readonly clearSince?: string;
};

export type ObserveAlertSignalSnapshot = {
  /** False when the signal could not be loaded — must not imply healthy. */
  readonly available: boolean;
  readonly status?: string;
  readonly numericValue?: number;
  readonly fieldValues?: Readonly<Record<string, string | number | undefined>>;
  readonly observedAt?: string;
  readonly diagnostic?: string;
};

export type ObserveAlertEvaluationResult = {
  readonly definitionId: AlertDefinitionId;
  readonly fingerprint: string;
  readonly outcome: ObserveAlertEvaluationOutcome;
  readonly severity: ObserveAlertSeverity;
  readonly category?: ObserveAlertCategory;
  readonly message?: string;
  readonly alertStateId?: AlertStateId;
  readonly state?: ObserveAlertStateKind;
  readonly duplicated?: boolean;
  readonly suppressed?: boolean;
  readonly eventPublished?: boolean;
};

export type ObserveAlertEvaluationBatchResult = {
  readonly evaluationEnabled: boolean;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly rulesEvaluated: number;
  readonly results: readonly ObserveAlertEvaluationResult[];
  readonly failed: number;
  readonly skipped: number;
};

export type ObserveAlertEvaluationDiagnostics = {
  readonly evaluationEnabled: boolean;
  readonly configurationValid: boolean;
  readonly ruleStoreAvailable: boolean;
  readonly alertStoreAvailable: boolean;
  readonly inputProviderAvailable: boolean;
  readonly eventBusAvailable: boolean;
  readonly ruleCount: number;
  readonly enabledRuleCount: number;
  readonly activeAlertCount: number;
  readonly alertCountsBySeverity: Readonly<Record<string, number>>;
  readonly suppressedCount: number;
  readonly acknowledgedCount: number;
  readonly lastEvaluationAt?: string;
  readonly lastEvaluationDurationMs?: number;
  readonly lastEvaluationResult?: "success" | "partial" | "failed" | "disabled";
  readonly failedEvaluationCount: number;
  readonly deduplicationCount: number;
  readonly eventPublicationFailureCount: number;
  readonly evaluationsStarted: number;
  readonly evaluationsCompleted: number;
  readonly evaluationsFailed: number;
  readonly alertsFired: number;
  readonly alertsAcknowledged: number;
  readonly alertsResolved: number;
  readonly alertsSuppressed: number;
  readonly workerState: "idle" | "running" | "disabled" | "degraded" | "unknown";
  readonly healthClass: "healthy" | "degraded" | "unhealthy" | "unknown";
};

export type ObserveAlertEvaluationHealth = {
  readonly status: "healthy" | "degraded" | "unhealthy" | "unknown" | "disabled";
  readonly evaluationEnabled: boolean;
  readonly configurationState: "valid" | "invalid" | "unknown";
  readonly ruleStore: "available" | "unavailable" | "unknown";
  readonly alertStore: "available" | "unavailable" | "unknown";
  readonly inputProvider: "available" | "unavailable" | "unknown";
  readonly eventBus: "available" | "unavailable" | "unknown";
  readonly lastSuccessfulEvaluationAt?: string;
  readonly lastFailedEvaluationAt?: string;
  readonly workerState: ObserveAlertEvaluationDiagnostics["workerState"];
  readonly message?: string;
};

export type AcknowledgeAlertStateInput = {
  readonly id: AlertStateId;
  readonly note?: string;
};

export type ResolveAlertStateInput = {
  readonly id: AlertStateId;
  readonly note?: string;
  /** When true, resolution was produced by evaluation clear — not operator. */
  readonly automatic?: boolean;
};

export type SuppressAlertStateInput = {
  readonly id: AlertStateId;
  readonly reason?: string;
};
