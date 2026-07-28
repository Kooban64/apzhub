/**
 * Alert rule validation + lifecycle metadata helpers (ADR-0070 Phase A).
 */

import {
  isObserveAlertCategory,
  isObserveAlertSeverity,
  isObserveAlertSignalSource,
  OBSERVE_ALERT_LIFECYCLE_METADATA_KEY,
  OBSERVE_ALERT_RULE_METADATA_KEY,
  type ObserveAlertLifecycleMetadata,
  type ObserveAlertPredicate,
  type ObserveAlertRuleConfig,
} from "@apzhub/observe-contracts";

import { ObserveDomainError } from "../ports/repository-ports";

function requireNonEmpty(value: string | undefined, field: string): string {
  const trimmed = value?.trim() ?? "";
  if (!trimmed) {
    throw new ObserveDomainError("validation_error", `${field} is required`, { field });
  }
  return trimmed;
}

function assertPredicate(predicate: unknown): ObserveAlertPredicate {
  if (!predicate || typeof predicate !== "object") {
    throw new ObserveDomainError("validation_error", "rule.predicate is required", {
      field: "predicate",
    });
  }
  const p = predicate as Record<string, unknown>;
  const kind = p.kind;
  if (kind === "status_in" || kind === "status_not_in") {
    const field = requireNonEmpty(
      typeof p.field === "string" ? p.field : undefined,
      "predicate.field",
    );
    if (!Array.isArray(p.values) || p.values.length === 0) {
      throw new ObserveDomainError(
        "validation_error",
        "predicate.values must be a non-empty array",
        { field: "predicate.values" },
      );
    }
    const values = p.values.map((v) => {
      if (typeof v !== "string" || !v.trim()) {
        throw new ObserveDomainError(
          "validation_error",
          "predicate.values must be non-empty strings",
          { field: "predicate.values" },
        );
      }
      return v;
    });
    return { kind, field, values };
  }
  if (kind === "threshold") {
    const field = requireNonEmpty(
      typeof p.field === "string" ? p.field : undefined,
      "predicate.field",
    );
    const op = p.op;
    if (op !== "gt" && op !== "gte" && op !== "lt" && op !== "lte" && op !== "eq") {
      throw new ObserveDomainError("validation_error", "predicate.op is invalid", {
        field: "predicate.op",
      });
    }
    if (typeof p.value !== "number" || Number.isNaN(p.value)) {
      throw new ObserveDomainError(
        "validation_error",
        "predicate.value must be a number",
        {
          field: "predicate.value",
        },
      );
    }
    return { kind: "threshold", field, op, value: p.value };
  }
  throw new ObserveDomainError("validation_error", "predicate.kind is invalid", {
    field: "predicate.kind",
  });
}

/**
 * Validate and normalize a Phase A alert rule config.
 * Rejects PromQL / LogQL / credential-like payloads.
 */
export function validateAlertRuleConfig(input: unknown): ObserveAlertRuleConfig {
  if (!input || typeof input !== "object") {
    throw new ObserveDomainError("validation_error", "rule config is required", {
      field: "rule",
    });
  }
  const raw = input as Record<string, unknown>;

  if (typeof raw.enabled !== "boolean") {
    throw new ObserveDomainError("validation_error", "rule.enabled must be boolean", {
      field: "enabled",
    });
  }

  if (
    typeof raw.signalSource !== "string" ||
    !isObserveAlertSignalSource(raw.signalSource)
  ) {
    throw new ObserveDomainError("validation_error", "rule.signalSource is invalid", {
      field: "signalSource",
    });
  }

  // Phase A forbidden languages / engines
  const forbiddenKeys = ["promql", "logql", "query", "expr", "grafana", "prometheus"];
  for (const key of Object.keys(raw)) {
    if (forbiddenKeys.includes(key.toLowerCase())) {
      throw new ObserveDomainError(
        "validation_error",
        `Phase A forbids rule field: ${key}`,
        { field: key },
      );
    }
  }

  const predicate = assertPredicate(raw.predicate);

  let severityOverride: ObserveAlertRuleConfig["severityOverride"];
  if (raw.severityOverride !== undefined) {
    if (
      typeof raw.severityOverride !== "string" ||
      !isObserveAlertSeverity(raw.severityOverride)
    ) {
      throw new ObserveDomainError(
        "validation_error",
        "rule.severityOverride is invalid",
        { field: "severityOverride" },
      );
    }
    severityOverride = raw.severityOverride;
  }

  let category: ObserveAlertRuleConfig["category"];
  if (raw.category !== undefined) {
    if (typeof raw.category !== "string" || !isObserveAlertCategory(raw.category)) {
      throw new ObserveDomainError("validation_error", "rule.category is invalid", {
        field: "category",
      });
    }
    category = raw.category;
  }

  let labels: Readonly<Record<string, string>> | undefined;
  if (raw.labels !== undefined) {
    if (!raw.labels || typeof raw.labels !== "object" || Array.isArray(raw.labels)) {
      throw new ObserveDomainError(
        "validation_error",
        "rule.labels must be an object",
        {
          field: "labels",
        },
      );
    }
    const next: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw.labels as Record<string, unknown>)) {
      if (typeof v !== "string") {
        throw new ObserveDomainError(
          "validation_error",
          "rule.labels values must be strings",
          { field: `labels.${k}` },
        );
      }
      next[k] = v;
    }
    labels = next;
  }

  const optionalMs = (value: unknown, field: string): number | undefined => {
    if (value === undefined) return undefined;
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new ObserveDomainError(
        "validation_error",
        `${field} must be a non-negative number`,
        {
          field,
        },
      );
    }
    return value;
  };

  return {
    enabled: raw.enabled,
    signalSource: raw.signalSource,
    signalKey:
      typeof raw.signalKey === "string" && raw.signalKey.trim()
        ? raw.signalKey.trim()
        : undefined,
    predicate,
    forDurationMs: optionalMs(raw.forDurationMs, "forDurationMs"),
    resolveForMs: optionalMs(raw.resolveForMs, "resolveForMs"),
    labels,
    severityOverride,
    category,
    suppression:
      raw.suppression && typeof raw.suppression === "object"
        ? {
            silenced: Boolean((raw.suppression as { silenced?: unknown }).silenced),
            reason:
              typeof (raw.suppression as { reason?: unknown }).reason === "string"
                ? (raw.suppression as { reason: string }).reason
                : undefined,
          }
        : undefined,
    deduplication:
      raw.deduplication && typeof raw.deduplication === "object"
        ? {
            windowMs: optionalMs(
              (raw.deduplication as { windowMs?: unknown }).windowMs,
              "deduplication.windowMs",
            ),
          }
        : undefined,
    evaluationIntervalMs: optionalMs(raw.evaluationIntervalMs, "evaluationIntervalMs"),
    deliveryPolicyRef:
      typeof raw.deliveryPolicyRef === "string" ? raw.deliveryPolicyRef : undefined,
    owner: typeof raw.owner === "string" ? raw.owner : undefined,
  };
}

export function parseAlertRuleFromDefinitionMetadata(
  metadata: Readonly<Record<string, unknown>> | undefined,
): ObserveAlertRuleConfig | undefined {
  if (!metadata) return undefined;
  const rule = metadata[OBSERVE_ALERT_RULE_METADATA_KEY];
  if (rule === undefined) return undefined;
  return validateAlertRuleConfig(rule);
}

export function readAlertLifecycleMetadata(
  metadata: Readonly<Record<string, unknown>> | undefined,
): ObserveAlertLifecycleMetadata | undefined {
  if (!metadata) return undefined;
  const raw = metadata[OBSERVE_ALERT_LIFECYCLE_METADATA_KEY];
  if (!raw || typeof raw !== "object") return undefined;
  const life = raw as Record<string, unknown>;
  if (typeof life.fingerprint !== "string" || !life.fingerprint.trim()) {
    return undefined;
  }
  return {
    fingerprint: life.fingerprint,
    occurrenceCount:
      typeof life.occurrenceCount === "number" && life.occurrenceCount >= 1
        ? life.occurrenceCount
        : 1,
    firstFiredAt: typeof life.firstFiredAt === "string" ? life.firstFiredAt : undefined,
    lastFiredAt: typeof life.lastFiredAt === "string" ? life.lastFiredAt : undefined,
    evaluatedAt: typeof life.evaluatedAt === "string" ? life.evaluatedAt : undefined,
    acknowledgedAt:
      typeof life.acknowledgedAt === "string" ? life.acknowledgedAt : undefined,
    acknowledgedBy:
      typeof life.acknowledgedBy === "string" ? life.acknowledgedBy : undefined,
    suppressedAt: typeof life.suppressedAt === "string" ? life.suppressedAt : undefined,
    suppressedBy: typeof life.suppressedBy === "string" ? life.suppressedBy : undefined,
    suppressedReason:
      typeof life.suppressedReason === "string" ? life.suppressedReason : undefined,
    category:
      typeof life.category === "string" && isObserveAlertCategory(life.category)
        ? life.category
        : undefined,
    correlationId:
      typeof life.correlationId === "string" ? life.correlationId : undefined,
    lastOutcome:
      life.lastOutcome === "match" ||
      life.lastOutcome === "clear" ||
      life.lastOutcome === "unknown" ||
      life.lastOutcome === "error"
        ? life.lastOutcome
        : undefined,
    pendingSince: typeof life.pendingSince === "string" ? life.pendingSince : undefined,
    clearSince: typeof life.clearSince === "string" ? life.clearSince : undefined,
  };
}

export function writeAlertLifecycleMetadata(
  metadata: Readonly<Record<string, unknown>> | undefined,
  lifecycle: ObserveAlertLifecycleMetadata,
): Record<string, unknown> {
  return {
    ...(metadata ?? {}),
    [OBSERVE_ALERT_LIFECYCLE_METADATA_KEY]: { ...lifecycle },
  };
}
