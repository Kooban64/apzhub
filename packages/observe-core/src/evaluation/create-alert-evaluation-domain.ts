/**
 * Observe Alert Evaluation domain orchestration (ADR-0070 Phase A).
 * Metadata signals only — no PromQL / provider SDKs.
 */

import type {
  AlertDefinition,
  AlertState,
  AcknowledgeAlertStateInput,
  ObserveAlertEvaluationBatchResult,
  ObserveAlertEvaluationDiagnostics,
  ObserveAlertEvaluationHealth,
  ObserveAlertEvaluationResult,
  ObserveAlertLifecycleMetadata,
  ObserveAlertRuleConfig,
  ObserveAlertSignalSnapshot,
  ObserveRequestContext,
  ResolveAlertStateInput,
  SuppressAlertStateInput,
} from "@apzhub/observe-contracts";
import {
  asAlertStateId,
  OBSERVE_ALERT_LIFECYCLE_METADATA_KEY,
} from "@apzhub/observe-contracts";

import { assertObserveAlertStateTransition } from "../lifecycle/transitions";
import {
  ObserveDomainError,
  requireFound,
  type ObserveFoundationRepos,
} from "../ports/repository-ports";
import {
  parseAlertRuleFromDefinitionMetadata,
  readAlertLifecycleMetadata,
  writeAlertLifecycleMetadata,
} from "../validation/validate-alert-rule";
import { assertNoCredentialPayload } from "../validation/validate-observe";
import { evaluateAlertPredicate } from "./evaluate-predicate";
import { computeAlertFingerprint } from "./fingerprint";

export type ObserveAlertEvaluationMetrics = {
  evaluationsStarted: number;
  evaluationsCompleted: number;
  evaluationsFailed: number;
  alertsFired: number;
  alertsAcknowledged: number;
  alertsResolved: number;
  alertsSuppressed: number;
  deduplicationCount: number;
  eventPublicationFailureCount: number;
  failedEvaluationCount: number;
  lastEvaluationAt?: string;
  lastEvaluationDurationMs?: number;
  lastEvaluationResult?: "success" | "partial" | "failed" | "disabled";
  lastSuccessfulEvaluationAt?: string;
  lastFailedEvaluationAt?: string;
  lastEventBusOk?: boolean;
};

export type ObserveAlertEvaluationHooks = {
  readonly isEvaluationEnabled: () => boolean;
  readonly publishLifecycleEvent?: (input: {
    readonly eventId:
      | "observe.alert.fired"
      | "observe.alert.acknowledged"
      | "observe.alert.resolved"
      | "observe.alert.suppressed";
    readonly ctx: ObserveRequestContext;
    readonly alertState: AlertState;
    readonly definition: AlertDefinition;
  }) => { readonly ok: boolean };
  /** Delivery hook seam — no SMTP/providers (ADR-0070). */
  readonly deliveryHook?: (input: {
    readonly eventId: string;
    readonly alertState: AlertState;
    readonly definition: AlertDefinition;
  }) => void;
  readonly metrics?: ObserveAlertEvaluationMetrics;
};

export type CreateObserveAlertEvaluationDomainInput = {
  readonly repos: ObserveFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
  readonly hooks: ObserveAlertEvaluationHooks;
};

function assertCtx(ctx: ObserveRequestContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new ObserveDomainError("validation_error", "tenantId is required");
  }
  if (!ctx.userId?.trim()) {
    throw new ObserveDomainError("validation_error", "userId is required");
  }
}

async function loadSignal(
  repos: ObserveFoundationRepos,
  ctx: ObserveRequestContext,
  rule: ObserveAlertRuleConfig,
): Promise<ObserveAlertSignalSnapshot> {
  const key = rule.signalKey?.trim();
  try {
    switch (rule.signalSource) {
      case "serviceHealth": {
        const items = await repos.serviceHealth.list(ctx);
        const hit = key ? items.find((i) => i.serviceKey === key) : items[0];
        if (!hit) return { available: false, diagnostic: "serviceHealth_missing" };
        return {
          available: true,
          status: hit.overallStatus,
          fieldValues: {
            status: hit.overallStatus,
            overallStatus: hit.overallStatus,
            readinessStatus: hit.readinessStatus,
            livenessStatus: hit.livenessStatus,
          },
          observedAt: hit.lastEvaluatedAt,
        };
      }
      case "componentStatus": {
        const items = await repos.componentStatuses.list(ctx);
        const hit = key
          ? items.find((i) => i.componentKey === key || i.serviceKey === key)
          : items[0];
        if (!hit) return { available: false, diagnostic: "componentStatus_missing" };
        return {
          available: true,
          status: hit.status,
          fieldValues: { status: hit.status },
          observedAt: hit.observedAt,
        };
      }
      case "serviceStatus": {
        const items = await repos.serviceStatuses.list(ctx);
        const hit = key ? items.find((i) => i.serviceKey === key) : items[0];
        if (!hit) return { available: false, diagnostic: "serviceStatus_missing" };
        return {
          available: true,
          status: hit.status,
          fieldValues: { status: hit.status },
          observedAt: hit.observedAt,
        };
      }
      case "healthSummary": {
        const items = await repos.healthSummaries.list(ctx);
        const hit = key
          ? items.find((i) => i.scopeKey === key || i.id === key)
          : items[0];
        if (!hit) return { available: false, diagnostic: "healthSummary_missing" };
        return {
          available: true,
          status: hit.overallStatus,
          fieldValues: {
            status: hit.overallStatus,
            overallStatus: hit.overallStatus,
          },
          observedAt: hit.evaluatedAt,
        };
      }
      case "readinessCheck": {
        const items = await repos.readinessChecks.list(ctx);
        const hit = key
          ? items.find((i) => i.serviceKey === key || i.id === key)
          : items[0];
        if (!hit) return { available: false, diagnostic: "readinessCheck_missing" };
        return {
          available: true,
          status: hit.status,
          fieldValues: { status: hit.status },
          observedAt: hit.checkedAt,
        };
      }
      case "livenessCheck": {
        const items = await repos.livenessChecks.list(ctx);
        const hit = key
          ? items.find((i) => i.serviceKey === key || i.id === key)
          : items[0];
        if (!hit) return { available: false, diagnostic: "livenessCheck_missing" };
        return {
          available: true,
          status: hit.status,
          fieldValues: { status: hit.status },
          observedAt: hit.checkedAt,
        };
      }
      default:
        return { available: false, diagnostic: "unsupported_signal_source" };
    }
  } catch (error) {
    return {
      available: false,
      diagnostic: error instanceof Error ? error.message : "signal_load_failed",
    };
  }
}

function findActiveByFingerprint(
  states: readonly AlertState[],
  fingerprint: string,
): AlertState | undefined {
  return states.find((s) => {
    if (s.state !== "firing" && s.state !== "pending" && s.state !== "silenced") {
      return false;
    }
    const life = readAlertLifecycleMetadata(s.metadata);
    return life?.fingerprint === fingerprint;
  });
}

function bumpMetrics(
  metrics: ObserveAlertEvaluationMetrics | undefined,
  key: keyof ObserveAlertEvaluationMetrics,
  by = 1,
): void {
  if (!metrics) return;
  const current = metrics[key];
  if (typeof current === "number") {
    (metrics as Record<string, unknown>)[key] = current + by;
  }
}

export type ObserveAlertEvaluationDomain = {
  evaluateBatch(ctx: ObserveRequestContext): Promise<ObserveAlertEvaluationBatchResult>;
  getDiagnostics(
    ctx: ObserveRequestContext,
  ): Promise<ObserveAlertEvaluationDiagnostics>;
  getHealth(ctx: ObserveRequestContext): Promise<ObserveAlertEvaluationHealth>;
  acknowledgeAlertState(
    ctx: ObserveRequestContext,
    input: AcknowledgeAlertStateInput,
  ): Promise<AlertState>;
  resolveAlertState(
    ctx: ObserveRequestContext,
    input: ResolveAlertStateInput,
  ): Promise<AlertState>;
  suppressAlertState(
    ctx: ObserveRequestContext,
    input: SuppressAlertStateInput,
  ): Promise<AlertState>;
};

export function createObserveAlertEvaluationDomain(
  input: CreateObserveAlertEvaluationDomainInput,
): ObserveAlertEvaluationDomain {
  const { repos, now, id, hooks } = input;
  const metrics: ObserveAlertEvaluationMetrics =
    hooks.metrics ??
    ({
      evaluationsStarted: 0,
      evaluationsCompleted: 0,
      evaluationsFailed: 0,
      alertsFired: 0,
      alertsAcknowledged: 0,
      alertsResolved: 0,
      alertsSuppressed: 0,
      deduplicationCount: 0,
      eventPublicationFailureCount: 0,
      failedEvaluationCount: 0,
    } satisfies ObserveAlertEvaluationMetrics);

  async function emit(
    eventId:
      | "observe.alert.fired"
      | "observe.alert.acknowledged"
      | "observe.alert.resolved"
      | "observe.alert.suppressed",
    ctx: ObserveRequestContext,
    alertState: AlertState,
    definition: AlertDefinition,
  ): Promise<boolean> {
    let ok = true;
    if (hooks.publishLifecycleEvent) {
      const result = hooks.publishLifecycleEvent({
        eventId,
        ctx,
        alertState,
        definition,
      });
      ok = result.ok;
      metrics.lastEventBusOk = result.ok;
      if (!result.ok) {
        bumpMetrics(metrics, "eventPublicationFailureCount");
      }
    }
    // Delivery hook is a seam only — never throws into state mutation.
    try {
      hooks.deliveryHook?.({ eventId, alertState, definition });
    } catch {
      bumpMetrics(metrics, "eventPublicationFailureCount");
      ok = false;
    }
    return ok;
  }

  async function applyMatch(params: {
    readonly ctx: ObserveRequestContext;
    readonly definition: AlertDefinition;
    readonly rule: ObserveAlertRuleConfig;
    readonly fingerprint: string;
    readonly existing: AlertState | undefined;
    readonly message?: string;
  }): Promise<ObserveAlertEvaluationResult> {
    const { ctx, definition, rule, fingerprint, existing } = params;
    const ts = now();
    const severity = rule.severityOverride ?? definition.severity;
    const category = rule.category;
    const forceSilence = rule.suppression?.silenced === true;

    if (existing) {
      bumpMetrics(metrics, "deduplicationCount");
      const life = readAlertLifecycleMetadata(existing.metadata) ?? {
        fingerprint,
        occurrenceCount: 1,
      };
      let nextLife: ObserveAlertLifecycleMetadata = {
        ...life,
        fingerprint,
        occurrenceCount: life.occurrenceCount + 1,
        lastFiredAt: ts,
        firstFiredAt: life.firstFiredAt ?? existing.firedAt ?? ts,
        evaluatedAt: ts,
        lastOutcome: "match",
        category: category ?? life.category,
        correlationId: ctx.correlationId ?? life.correlationId,
        // Preserve acknowledgement
        acknowledgedAt: life.acknowledgedAt,
        acknowledgedBy: life.acknowledgedBy,
      };

      let nextState = existing.state;
      if (forceSilence && existing.state !== "silenced") {
        assertObserveAlertStateTransition(existing.state, "silenced");
        nextState = "silenced";
        nextLife = {
          ...nextLife,
          suppressedAt: ts,
          suppressedBy: "evaluation",
          suppressedReason: rule.suppression?.reason ?? "rule_suppression",
        };
      } else if (existing.state === "pending") {
        const forMs = rule.forDurationMs ?? 0;
        const pendingSince = life.pendingSince ?? existing.createdAt;
        const elapsed = Date.parse(ts) - Date.parse(pendingSince);
        if (forMs <= 0 || (!Number.isNaN(elapsed) && elapsed >= forMs)) {
          assertObserveAlertStateTransition("pending", "firing");
          nextState = "firing";
        }
      }

      const updated: AlertState = {
        ...existing,
        state: nextState,
        message: params.message ?? existing.message,
        metadata: writeAlertLifecycleMetadata(existing.metadata, nextLife),
        updatedAt: ts,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      const saved = await repos.alertStates.update(ctx, updated);
      let eventPublished = false;
      if (nextState === "firing" && existing.state !== "firing") {
        bumpMetrics(metrics, "alertsFired");
        eventPublished = await emit("observe.alert.fired", ctx, saved, definition);
      } else if (nextState === "silenced" && existing.state !== "silenced") {
        bumpMetrics(metrics, "alertsSuppressed");
        eventPublished = await emit("observe.alert.suppressed", ctx, saved, definition);
      }
      return {
        definitionId: definition.id,
        fingerprint,
        outcome: "match",
        severity,
        category,
        message: saved.message,
        alertStateId: saved.id,
        state: saved.state,
        duplicated: true,
        suppressed: saved.state === "silenced",
        eventPublished,
      };
    }

    // New alert
    const forMs = rule.forDurationMs ?? 0;
    const initialState = forceSilence ? "silenced" : forMs > 0 ? "pending" : "firing";
    const life: ObserveAlertLifecycleMetadata = {
      fingerprint,
      occurrenceCount: 1,
      firstFiredAt: ts,
      lastFiredAt: ts,
      evaluatedAt: ts,
      lastOutcome: "match",
      category,
      correlationId: ctx.correlationId,
      pendingSince: initialState === "pending" ? ts : undefined,
      suppressedAt: forceSilence ? ts : undefined,
      suppressedBy: forceSilence ? "evaluation" : undefined,
      suppressedReason: forceSilence
        ? (rule.suppression?.reason ?? "rule_suppression")
        : undefined,
    };
    const created: AlertState = {
      id: asAlertStateId(id()),
      tenantId: ctx.tenantId,
      organisationId: definition.organisationId ?? ctx.organisationId,
      alertDefinitionId: definition.id,
      state: initialState,
      firedAt: ts,
      message: params.message ?? definition.name,
      providerKind: definition.providerKind,
      providerRef: definition.providerRef,
      metadata: writeAlertLifecycleMetadata({ severity, category }, life),
      createdAt: ts,
      updatedAt: ts,
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      revision: 1,
    };
    const saved = await repos.alertStates.create(ctx, created);
    let eventPublished = false;
    if (saved.state === "firing") {
      bumpMetrics(metrics, "alertsFired");
      eventPublished = await emit("observe.alert.fired", ctx, saved, definition);
    } else if (saved.state === "silenced") {
      bumpMetrics(metrics, "alertsSuppressed");
      eventPublished = await emit("observe.alert.suppressed", ctx, saved, definition);
    }
    return {
      definitionId: definition.id,
      fingerprint,
      outcome: "match",
      severity,
      category,
      message: saved.message,
      alertStateId: saved.id,
      state: saved.state,
      duplicated: false,
      suppressed: saved.state === "silenced",
      eventPublished,
    };
  }

  async function applyClear(params: {
    readonly ctx: ObserveRequestContext;
    readonly definition: AlertDefinition;
    readonly rule: ObserveAlertRuleConfig;
    readonly fingerprint: string;
    readonly existing: AlertState | undefined;
  }): Promise<ObserveAlertEvaluationResult> {
    const { ctx, definition, rule, fingerprint, existing } = params;
    const severity = rule.severityOverride ?? definition.severity;
    if (!existing || existing.state === "resolved" || existing.state === "inactive") {
      return {
        definitionId: definition.id,
        fingerprint,
        outcome: "clear",
        severity,
        category: rule.category,
        duplicated: false,
      };
    }
    // Silenced alerts are not healthy — do not auto-resolve as healthy representation
    if (existing.state === "silenced") {
      const life = readAlertLifecycleMetadata(existing.metadata);
      const ts = now();
      const nextLife: ObserveAlertLifecycleMetadata = {
        fingerprint,
        occurrenceCount: life?.occurrenceCount ?? 1,
        ...life,
        evaluatedAt: ts,
        lastOutcome: "clear",
        clearSince: life?.clearSince ?? ts,
      };
      const updated: AlertState = {
        ...existing,
        metadata: writeAlertLifecycleMetadata(existing.metadata, nextLife),
        updatedAt: ts,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      await repos.alertStates.update(ctx, updated);
      return {
        definitionId: definition.id,
        fingerprint,
        outcome: "clear",
        severity,
        category: rule.category,
        alertStateId: existing.id,
        state: "silenced",
        suppressed: true,
        duplicated: true,
      };
    }

    const ts = now();
    const life = readAlertLifecycleMetadata(existing.metadata) ?? {
      fingerprint,
      occurrenceCount: 1,
    };
    const resolveFor = rule.resolveForMs ?? 0;
    const clearSince = life.clearSince ?? ts;
    const elapsed = Date.parse(ts) - Date.parse(clearSince);
    if (resolveFor > 0 && (Number.isNaN(elapsed) || elapsed < resolveFor)) {
      const nextLife: ObserveAlertLifecycleMetadata = {
        ...life,
        clearSince: life.clearSince ?? ts,
        evaluatedAt: ts,
        lastOutcome: "clear",
      };
      const updated: AlertState = {
        ...existing,
        metadata: writeAlertLifecycleMetadata(existing.metadata, nextLife),
        updatedAt: ts,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      await repos.alertStates.update(ctx, updated);
      return {
        definitionId: definition.id,
        fingerprint,
        outcome: "clear",
        severity,
        category: rule.category,
        alertStateId: existing.id,
        state: existing.state,
        duplicated: true,
      };
    }

    assertObserveAlertStateTransition(existing.state, "resolved");
    const nextLife: ObserveAlertLifecycleMetadata = {
      ...life,
      evaluatedAt: ts,
      lastOutcome: "clear",
      clearSince: undefined,
    };
    const updated: AlertState = {
      ...existing,
      state: "resolved",
      resolvedAt: ts,
      metadata: writeAlertLifecycleMetadata(existing.metadata, nextLife),
      updatedAt: ts,
      updatedBy: ctx.userId,
      revision: existing.revision + 1,
    };
    const saved = await repos.alertStates.update(ctx, updated);
    bumpMetrics(metrics, "alertsResolved");
    const eventPublished = await emit("observe.alert.resolved", ctx, saved, definition);
    return {
      definitionId: definition.id,
      fingerprint,
      outcome: "clear",
      severity,
      category: rule.category,
      alertStateId: saved.id,
      state: saved.state,
      duplicated: true,
      eventPublished,
    };
  }

  return {
    async evaluateBatch(ctx) {
      assertCtx(ctx);
      const startedAt = now();
      const evaluationEnabled = hooks.isEvaluationEnabled();
      bumpMetrics(metrics, "evaluationsStarted");
      metrics.lastEvaluationAt = startedAt;

      if (!evaluationEnabled) {
        const completedAt = now();
        const durationMs = Math.max(
          0,
          Date.parse(completedAt) - Date.parse(startedAt) || 0,
        );
        metrics.lastEvaluationDurationMs = durationMs;
        metrics.lastEvaluationResult = "disabled";
        bumpMetrics(metrics, "evaluationsCompleted");
        return {
          evaluationEnabled: false,
          startedAt,
          completedAt,
          durationMs,
          rulesEvaluated: 0,
          results: [],
          failed: 0,
          skipped: 0,
        };
      }

      const definitions = await repos.alertDefinitions.list(ctx);
      const states = await repos.alertStates.list(ctx);
      const results: ObserveAlertEvaluationResult[] = [];
      let failed = 0;
      let skipped = 0;

      for (const definition of definitions) {
        if (definition.status !== "active") {
          skipped += 1;
          continue;
        }
        let rule: ObserveAlertRuleConfig;
        try {
          const parsed = parseAlertRuleFromDefinitionMetadata(definition.metadata);
          if (!parsed) {
            skipped += 1;
            continue;
          }
          rule = parsed;
        } catch {
          failed += 1;
          bumpMetrics(metrics, "failedEvaluationCount");
          results.push({
            definitionId: definition.id,
            fingerprint: computeAlertFingerprint({
              tenantId: ctx.tenantId,
              definitionId: definition.id,
            }),
            outcome: "error",
            severity: definition.severity,
            message: "invalid_rule",
          });
          continue;
        }

        if (!rule.enabled) {
          skipped += 1;
          continue;
        }

        const fingerprint = computeAlertFingerprint({
          tenantId: ctx.tenantId,
          definitionId: definition.id,
          labels: rule.labels,
        });
        const existing = findActiveByFingerprint(states, fingerprint);

        try {
          const signal = await loadSignal(repos, ctx, rule);
          const outcome = evaluateAlertPredicate(rule.predicate, signal);

          if (outcome === "unknown" || outcome === "error") {
            // Preserve prior valid alert state — never auto-resolve
            if (existing) {
              const ts = now();
              const life = readAlertLifecycleMetadata(existing.metadata) ?? {
                fingerprint,
                occurrenceCount: 1,
              };
              const updated: AlertState = {
                ...existing,
                metadata: writeAlertLifecycleMetadata(existing.metadata, {
                  ...life,
                  evaluatedAt: ts,
                  lastOutcome: outcome,
                }),
                updatedAt: ts,
                updatedBy: ctx.userId,
                revision: existing.revision + 1,
              };
              await repos.alertStates.update(ctx, updated);
            }
            results.push({
              definitionId: definition.id,
              fingerprint,
              outcome,
              severity: rule.severityOverride ?? definition.severity,
              category: rule.category,
              alertStateId: existing?.id,
              state: existing?.state,
              message: signal.diagnostic ?? "unknown_signal",
              duplicated: Boolean(existing),
            });
            continue;
          }

          if (outcome === "match") {
            const result = await applyMatch({
              ctx,
              definition,
              rule,
              fingerprint,
              existing,
              message: `${definition.name}: condition matched`,
            });
            results.push(result);
            continue;
          }

          const result = await applyClear({
            ctx,
            definition,
            rule,
            fingerprint,
            existing,
          });
          results.push(result);
        } catch (error) {
          failed += 1;
          bumpMetrics(metrics, "failedEvaluationCount");
          results.push({
            definitionId: definition.id,
            fingerprint,
            outcome: "error",
            severity: definition.severity,
            message: error instanceof Error ? error.message : "evaluation_failed",
            alertStateId: existing?.id,
            state: existing?.state,
          });
        }
      }

      const completedAt = now();
      const durationMs = Math.max(
        0,
        Date.parse(completedAt) - Date.parse(startedAt) || 0,
      );
      metrics.lastEvaluationDurationMs = durationMs;
      if (failed > 0 && results.length === failed) {
        metrics.lastEvaluationResult = "failed";
        metrics.lastFailedEvaluationAt = completedAt;
        bumpMetrics(metrics, "evaluationsFailed");
      } else if (failed > 0) {
        metrics.lastEvaluationResult = "partial";
        metrics.lastSuccessfulEvaluationAt = completedAt;
        bumpMetrics(metrics, "evaluationsCompleted");
      } else {
        metrics.lastEvaluationResult = "success";
        metrics.lastSuccessfulEvaluationAt = completedAt;
        bumpMetrics(metrics, "evaluationsCompleted");
      }

      return {
        evaluationEnabled: true,
        startedAt,
        completedAt,
        durationMs,
        rulesEvaluated: results.length,
        results,
        failed,
        skipped,
      };
    },

    async getDiagnostics(ctx) {
      assertCtx(ctx);
      let ruleStoreAvailable = true;
      let alertStoreAvailable = true;
      let inputProviderAvailable = true;
      let definitions: AlertDefinition[] = [];
      let states: AlertState[] = [];
      try {
        definitions = [...(await repos.alertDefinitions.list(ctx))];
      } catch {
        ruleStoreAvailable = false;
      }
      try {
        states = [...(await repos.alertStates.list(ctx))];
      } catch {
        alertStoreAvailable = false;
      }
      try {
        await repos.serviceHealth.list(ctx);
      } catch {
        inputProviderAvailable = false;
      }

      let enabledRuleCount = 0;
      for (const d of definitions) {
        try {
          const rule = parseAlertRuleFromDefinitionMetadata(d.metadata);
          if (rule?.enabled && d.status === "active") enabledRuleCount += 1;
        } catch {
          /* invalid rule counted in inventory only */
        }
      }

      const active = states.filter(
        (s) => s.state === "firing" || s.state === "pending" || s.state === "silenced",
      );
      const alertCountsBySeverity: Record<string, number> = {};
      let suppressedCount = 0;
      let acknowledgedCount = 0;
      for (const s of active) {
        if (s.state === "silenced") suppressedCount += 1;
        const life = readAlertLifecycleMetadata(s.metadata);
        if (life?.acknowledgedAt) acknowledgedCount += 1;
        const def = definitions.find((d) => d.id === s.alertDefinitionId);
        const sev = def?.severity ?? "unknown";
        alertCountsBySeverity[sev] = (alertCountsBySeverity[sev] ?? 0) + 1;
      }

      const evaluationEnabled = hooks.isEvaluationEnabled();
      const eventBusAvailable =
        metrics.lastEventBusOk === undefined ? true : metrics.lastEventBusOk;

      let healthClass: ObserveAlertEvaluationDiagnostics["healthClass"] = "unknown";
      if (!ruleStoreAvailable || !alertStoreAvailable) healthClass = "unhealthy";
      else if (!evaluationEnabled) healthClass = "healthy";
      else if (!inputProviderAvailable || metrics.lastEvaluationResult === "failed") {
        healthClass = "degraded";
      } else if (metrics.lastEvaluationResult === "partial") healthClass = "degraded";
      else healthClass = "healthy";

      return {
        evaluationEnabled,
        configurationValid: true,
        ruleStoreAvailable,
        alertStoreAvailable,
        inputProviderAvailable,
        eventBusAvailable,
        ruleCount: definitions.length,
        enabledRuleCount,
        activeAlertCount: active.length,
        alertCountsBySeverity,
        suppressedCount,
        acknowledgedCount,
        lastEvaluationAt: metrics.lastEvaluationAt,
        lastEvaluationDurationMs: metrics.lastEvaluationDurationMs,
        lastEvaluationResult: metrics.lastEvaluationResult,
        failedEvaluationCount: metrics.failedEvaluationCount,
        deduplicationCount: metrics.deduplicationCount,
        eventPublicationFailureCount: metrics.eventPublicationFailureCount,
        evaluationsStarted: metrics.evaluationsStarted,
        evaluationsCompleted: metrics.evaluationsCompleted,
        evaluationsFailed: metrics.evaluationsFailed,
        alertsFired: metrics.alertsFired,
        alertsAcknowledged: metrics.alertsAcknowledged,
        alertsResolved: metrics.alertsResolved,
        alertsSuppressed: metrics.alertsSuppressed,
        workerState: evaluationEnabled
          ? healthClass === "unhealthy"
            ? "degraded"
            : "idle"
          : "disabled",
        healthClass,
      };
    },

    async getHealth(ctx) {
      const d = await this.getDiagnostics(ctx);
      let status: ObserveAlertEvaluationHealth["status"] = "unknown";
      if (!d.evaluationEnabled) status = "disabled";
      else if (d.healthClass === "healthy") status = "healthy";
      else if (d.healthClass === "degraded") status = "degraded";
      else if (d.healthClass === "unhealthy") status = "unhealthy";
      else status = "unknown";

      return {
        status,
        evaluationEnabled: d.evaluationEnabled,
        configurationState: d.configurationValid ? "valid" : "invalid",
        ruleStore: d.ruleStoreAvailable ? "available" : "unavailable",
        alertStore: d.alertStoreAvailable ? "available" : "unavailable",
        inputProvider: d.inputProviderAvailable ? "available" : "unavailable",
        eventBus: d.eventBusAvailable ? "available" : "unavailable",
        lastSuccessfulEvaluationAt: metrics.lastSuccessfulEvaluationAt,
        lastFailedEvaluationAt: metrics.lastFailedEvaluationAt,
        workerState: d.workerState,
        message:
          status === "disabled"
            ? "APZHUB_OBSERVE_ALERT_EVALUATION_ENABLED is not enabled"
            : undefined,
      };
    },

    async acknowledgeAlertState(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await repos.alertStates.get(ctx, input.id),
        "AlertState",
        input.id,
      );
      if (existing.state !== "firing" && existing.state !== "pending") {
        throw new ObserveDomainError(
          "invalid_lifecycle_transition",
          `Cannot acknowledge alert in state: ${existing.state}`,
          { from: existing.state, to: "acknowledged" },
        );
      }
      const ts = now();
      const life = readAlertLifecycleMetadata(existing.metadata) ?? {
        fingerprint: computeAlertFingerprint({
          tenantId: ctx.tenantId,
          definitionId: existing.alertDefinitionId,
        }),
        occurrenceCount: 1,
      };
      const nextLife: ObserveAlertLifecycleMetadata = {
        ...life,
        acknowledgedAt: ts,
        acknowledgedBy: ctx.userId,
      };
      assertNoCredentialPayload(existing.metadata);
      const updated: AlertState = {
        ...existing,
        message: input.note ?? existing.message,
        metadata: writeAlertLifecycleMetadata(existing.metadata, nextLife),
        updatedAt: ts,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      const saved = await repos.alertStates.update(ctx, updated);
      bumpMetrics(metrics, "alertsAcknowledged");
      const definition = requireFound(
        await repos.alertDefinitions.get(ctx, existing.alertDefinitionId),
        "AlertDefinition",
        existing.alertDefinitionId,
      );
      await emit("observe.alert.acknowledged", ctx, saved, definition);
      return saved;
    },

    async resolveAlertState(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await repos.alertStates.get(ctx, input.id),
        "AlertState",
        input.id,
      );
      assertObserveAlertStateTransition(existing.state, "resolved");
      const ts = now();
      const life = readAlertLifecycleMetadata(existing.metadata) ?? {
        fingerprint: computeAlertFingerprint({
          tenantId: ctx.tenantId,
          definitionId: existing.alertDefinitionId,
        }),
        occurrenceCount: 1,
      };
      const nextLife: ObserveAlertLifecycleMetadata = {
        ...life,
        lastOutcome: "clear",
        evaluatedAt: ts,
      };
      const updated: AlertState = {
        ...existing,
        state: "resolved",
        resolvedAt: ts,
        message: input.note ?? existing.message,
        metadata: writeAlertLifecycleMetadata(
          {
            ...(existing.metadata ?? {}),
            resolvedBy: input.automatic ? "evaluation" : ctx.userId,
            resolutionKind: input.automatic ? "automatic" : "manual",
          },
          nextLife,
        ),
        updatedAt: ts,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      const saved = await repos.alertStates.update(ctx, updated);
      bumpMetrics(metrics, "alertsResolved");
      const definition = requireFound(
        await repos.alertDefinitions.get(ctx, existing.alertDefinitionId),
        "AlertDefinition",
        existing.alertDefinitionId,
      );
      await emit("observe.alert.resolved", ctx, saved, definition);
      return saved;
    },

    async suppressAlertState(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await repos.alertStates.get(ctx, input.id),
        "AlertState",
        input.id,
      );
      assertObserveAlertStateTransition(existing.state, "silenced");
      const ts = now();
      const life = readAlertLifecycleMetadata(existing.metadata) ?? {
        fingerprint: computeAlertFingerprint({
          tenantId: ctx.tenantId,
          definitionId: existing.alertDefinitionId,
        }),
        occurrenceCount: 1,
      };
      const nextLife: ObserveAlertLifecycleMetadata = {
        ...life,
        suppressedAt: ts,
        suppressedBy: ctx.userId,
        suppressedReason: input.reason,
      };
      const updated: AlertState = {
        ...existing,
        state: "silenced",
        metadata: writeAlertLifecycleMetadata(existing.metadata, nextLife),
        updatedAt: ts,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      const saved = await repos.alertStates.update(ctx, updated);
      bumpMetrics(metrics, "alertsSuppressed");
      const definition = requireFound(
        await repos.alertDefinitions.get(ctx, existing.alertDefinitionId),
        "AlertDefinition",
        existing.alertDefinitionId,
      );
      await emit("observe.alert.suppressed", ctx, saved, definition);
      return saved;
    },
  };
}

/** Exported for tests — lifecycle metadata key stability. */
export const ALERT_LIFECYCLE_KEY = OBSERVE_ALERT_LIFECYCLE_METADATA_KEY;
