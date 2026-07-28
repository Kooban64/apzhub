/**
 * Hybrid Central Notification Delivery Service — Phase A (ADR-0071 Option D / ENG-004).
 * Event-driven + command intake · in-app certified path · SMTP deferred.
 */

import {
  assertNotificationDeliveryTransition,
  assertNotificationIntentTransition,
  asNotificationDeliveryId,
  asNotificationDeliveryTryId,
  asNotificationIntentId,
  hasNotificationsDeliveryPermission,
  isTransientFailureClass,
  type CreateNotificationIntentCommand,
  type NotificationDeliveryDiagnostics,
  type NotificationDeliveryHealth,
  type NotificationDeliveryMetricsSnapshot,
  type NotificationDeliveryReadiness,
  type NotificationDeliveryRecord,
  type NotificationDeliveryService,
  type NotificationDeliveryStatus,
  type NotificationDeliveryTry,
  type NotificationFailureClass,
  type NotificationInAppItem,
  type NotificationIntent,
  type NotificationIntentStatus,
  type NotificationPlatformServiceContext,
  type NotificationProviderDescriptor,
  type NotificationReceiptLevel,
  type ResolvedNotificationRecipient,
} from "@apzhub/notification-contracts";

import type {
  DomainEventEnvelope,
  DomainEventPublisher,
} from "../../../events/domain-event-publisher";
import {
  createDomainEventEnvelopeId,
  publishDomainEventFailSoft,
} from "../../../events/domain-event-publisher";
import {
  isNotificationCommandIntakeEnabled,
  isNotificationDeliveryEnabled,
  isNotificationDurableRuntimeEnabled,
  isNotificationEventIntakeEnabled,
  isNotificationInAppEnabled,
  isNotificationWorkerEnabled,
  notificationMaxAttempts,
  notificationMaxQueueDepth,
  notificationRetryBaseDelayMs,
  type NotificationDeliveryEnv,
} from "./delivery-env";

export type NotificationDeliveryEventBusPort = {
  subscribe(options: {
    readonly eventPattern: string;
    readonly handler: (envelope: DomainEventEnvelope) => void;
  }): string;
  unsubscribe(subscriptionId: string): boolean;
};

export type CreateNotificationDeliveryServiceInput = {
  readonly env?: NotificationDeliveryEnv;
  readonly now?: () => string;
  readonly nowMs?: () => number;
  readonly id?: () => string;
  readonly publisher?: DomainEventPublisher;
  /** Optional identity lookup — defaults to accepting explicit userId hints in-tenant. */
  readonly resolveUser?: (input: {
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly userId: string;
  }) =>
    | { readonly ok: true; readonly active: boolean; readonly organisationId?: string }
    | { readonly ok: false };
  readonly tickIntervalMs?: number;
  /** Test-only — force in-app adapter permanent failure. */
  readonly simulateInAppFailure?: boolean;
};

type Counters = {
  intentsCreated: number;
  intentsValidated: number;
  intentsSuppressed: number;
  deliveriesQueued: number;
  deliveriesProcessing: number;
  deliveriesDelivered: number;
  deliveriesRetrying: number;
  permanentFailures: number;
  cancelled: number;
  expired: number;
  idempotencyDeduplications: number;
  recipientResolutionFailures: number;
  preferenceSuppressions: number;
  policyFailures: number;
  templateFailures: number;
  eventIntakeFailures: number;
  commandIntakeFailures: number;
  retryCount: number;
  terminalFailureCount: number;
  deliveryAttempts: number;
  processingLatencyMsLast: number | null;
  lastSuccessfulProcessingAt?: string;
  lastFailureCategory?: string;
};

const AUTHORISED_EVENT_TYPES = new Set([
  "observe.alert.fired",
  "observe.alert.acknowledged",
  "observe.alert.resolved",
  "observe.alert.suppressed",
  "support.request.created",
  "support.request.assigned",
  "support.request.updated",
  "support.request.closed",
  "support.article.created",
  "support.request.sla_warning",
  "support.ticket.sla_warning",
]);

function deny(message: string, code = "FORBIDDEN"): never {
  throw Object.assign(new Error(message), { code, status: 403 });
}

function notFound(message: string): never {
  throw Object.assign(new Error(message), { code: "NOT_FOUND", status: 404 });
}

function badRequest(message: string, code = "VALIDATION_ERROR"): never {
  throw Object.assign(new Error(message), { code, status: 400 });
}

function requirePerm(
  ctx: NotificationPlatformServiceContext,
  op: Parameters<typeof hasNotificationsDeliveryPermission>[1],
): void {
  if (!hasNotificationsDeliveryPermission(ctx.permissions, op)) {
    deny(`Missing notifications.${op} permission`);
  }
}

function evaluatePolicy(input: {
  readonly category: string;
  readonly priority: NotificationIntent["priority"];
  readonly mandatory: boolean;
  readonly maxAttempts: number;
  readonly retryBaseDelayMs: number;
}): {
  readonly permitted: boolean;
  readonly mandatory: boolean;
  readonly permittedChannels: readonly ["in_app"];
  readonly channelOrder: readonly ["in_app"];
  readonly maxAttempts: number;
  readonly retryBaseDelayMs: number;
  readonly policyRef: string;
  readonly failClosedReason?: string;
} {
  if (!input.category.trim()) {
    return {
      permitted: false,
      mandatory: input.mandatory,
      permittedChannels: ["in_app"],
      channelOrder: ["in_app"],
      maxAttempts: input.maxAttempts,
      retryBaseDelayMs: input.retryBaseDelayMs,
      policyRef: "phase-a-default",
      failClosedReason: "missing_category",
    };
  }
  return {
    permitted: true,
    mandatory: input.mandatory,
    permittedChannels: ["in_app"],
    channelOrder: ["in_app"],
    maxAttempts: input.maxAttempts,
    retryBaseDelayMs: input.retryBaseDelayMs,
    policyRef: "phase-a-in-app-baseline",
  };
}

function evaluatePreference(input: {
  readonly mandatory: boolean;
  readonly userDisabledInApp?: boolean;
}): {
  readonly enabled: boolean;
  readonly mandatoryOverride: boolean;
  readonly source: "platform_default" | "user_preference" | "mandatory_override";
} {
  if (input.mandatory) {
    return {
      enabled: true,
      mandatoryOverride: true,
      source: "mandatory_override",
    };
  }
  if (input.userDisabledInApp) {
    return {
      enabled: false,
      mandatoryOverride: false,
      source: "user_preference",
    };
  }
  return {
    enabled: true,
    mandatoryOverride: false,
    source: "platform_default",
  };
}

function renderTemplate(input: {
  readonly subject: string;
  readonly summary?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}): { readonly title: string; readonly summary?: string; readonly body?: string } {
  const escape = (value: string) =>
    value
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  const title = escape(input.subject);
  const summary = input.summary ? escape(input.summary) : undefined;
  const safeVars = Object.entries(input.payload)
    .filter(
      ([, v]) =>
        typeof v === "string" || typeof v === "number" || typeof v === "boolean",
    )
    .slice(0, 12)
    .map(([k, v]) => `${escape(k)}=${escape(String(v))}`)
    .join("; ");
  return {
    title,
    summary,
    body: safeVars ? escape(safeVars) : summary,
  };
}

function backoffMs(base: number, attempt: number, jitterRatio = 0.2): number {
  const exp = Math.min(base * 2 ** Math.max(0, attempt - 1), 60_000);
  const jitter = exp * jitterRatio * Math.random();
  return Math.floor(exp + jitter);
}

export function createNotificationDeliveryService(
  input: CreateNotificationDeliveryServiceInput = {},
): NotificationDeliveryService & {
  attachEventBus(bus: NotificationDeliveryEventBusPort): void;
  ingestDomainEvent(envelope: DomainEventEnvelope): void;
  setUserPreferenceDisabled(userId: string, category: string, disabled: boolean): void;
} {
  const env = input.env ?? process.env;
  const now = input.now ?? (() => new Date().toISOString());
  const nowMs = input.nowMs ?? (() => Date.now());
  let seq = 0;
  const id =
    input.id ?? (() => `nd_${Date.now().toString(36)}_${(++seq).toString(36)}`);

  const intents = new Map<string, NotificationIntent>();
  const deliveries = new Map<string, NotificationDeliveryRecord>();
  const tries = new Map<string, NotificationDeliveryTry[]>();
  const inApp = new Map<string, NotificationInAppItem>();
  const intentByIdem = new Map<string, string>();
  const deliveryByIdem = new Map<string, string>();
  const userPrefDisabled = new Map<string, boolean>();
  const counters: Counters = {
    intentsCreated: 0,
    intentsValidated: 0,
    intentsSuppressed: 0,
    deliveriesQueued: 0,
    deliveriesProcessing: 0,
    deliveriesDelivered: 0,
    deliveriesRetrying: 0,
    permanentFailures: 0,
    cancelled: 0,
    expired: 0,
    idempotencyDeduplications: 0,
    recipientResolutionFailures: 0,
    preferenceSuppressions: 0,
    policyFailures: 0,
    templateFailures: 0,
    eventIntakeFailures: 0,
    commandIntakeFailures: 0,
    retryCount: 0,
    terminalFailureCount: 0,
    deliveryAttempts: 0,
    processingLatencyMsLast: null,
  };

  let workerTimer: ReturnType<typeof setInterval> | undefined;
  let workerRunning = false;
  let busAttached = false;
  const subscriptions: string[] = [];

  const resolveUser =
    input.resolveUser ??
    ((hint) => ({
      ok: true as const,
      active: true,
      organisationId: hint.organisationId,
    }));

  function publish(
    eventId: string,
    payload: Record<string, unknown>,
    ctx?: {
      readonly tenantId?: string;
      readonly correlationId?: string;
      readonly actorId?: string;
    },
  ): void {
    publishDomainEventFailSoft(input.publisher, {
      envelopeId: createDomainEventEnvelopeId(),
      eventId,
      eventVersion: "1.0.0",
      category: "notification",
      correlationId: ctx?.correlationId ?? `corr_${id()}`,
      timestamp: now(),
      publisher: "notification-delivery-service",
      sourceService: "notification-delivery",
      actorId: ctx?.actorId,
      tenantId: ctx?.tenantId,
      payload,
    });
  }

  function transitionIntent(
    intent: NotificationIntent,
    to: NotificationIntentStatus,
    patch: Partial<NotificationIntent> = {},
  ): NotificationIntent {
    assertNotificationIntentTransition(intent.status, to);
    const next: NotificationIntent = {
      ...intent,
      ...patch,
      status: to,
      updatedAt: now(),
    };
    intents.set(intent.id, next);
    return next;
  }

  function transitionDelivery(
    delivery: NotificationDeliveryRecord,
    to: NotificationDeliveryStatus,
    patch: Partial<NotificationDeliveryRecord> = {},
  ): NotificationDeliveryRecord {
    assertNotificationDeliveryTransition(delivery.status, to);
    const next: NotificationDeliveryRecord = {
      ...delivery,
      ...patch,
      status: to,
      updatedAt: now(),
    };
    deliveries.set(delivery.id, next);
    return next;
  }

  function resolveRecipients(
    cmd: CreateNotificationIntentCommand,
  ): ResolvedNotificationRecipient[] {
    const resolved: ResolvedNotificationRecipient[] = [];
    const seen = new Set<string>();
    for (const hint of cmd.recipientHints) {
      if (!hint.userId) {
        counters.recipientResolutionFailures += 1;
        continue;
      }
      if (seen.has(hint.userId)) continue;
      const lookup = resolveUser({
        tenantId: cmd.tenantId,
        organisationId: cmd.organisationId ?? hint.organisationId,
        userId: hint.userId,
      });
      if (!lookup.ok || !lookup.active) {
        counters.recipientResolutionFailures += 1;
        continue;
      }
      seen.add(hint.userId);
      resolved.push({
        userId: hint.userId,
        tenantId: cmd.tenantId,
        organisationId: lookup.organisationId ?? cmd.organisationId,
        recipientType: "user",
        resolutionSource: "hint_user",
        snapshotAt: now(),
        channelEndpoints: { in_app: hint.userId },
      });
    }
    return resolved;
  }

  function createDeliveriesForIntent(
    intent: NotificationIntent,
    recipients: readonly ResolvedNotificationRecipient[],
    maxAttempts: number,
  ): void {
    for (const recipient of recipients) {
      const deliveryIdem = `${intent.idempotencyKey}:in_app:${recipient.userId}`;
      const existingId = deliveryByIdem.get(`${intent.tenantId}:${deliveryIdem}`);
      if (existingId) {
        counters.idempotencyDeduplications += 1;
        continue;
      }
      const deliveryId = asNotificationDeliveryId(id());
      const record: NotificationDeliveryRecord = {
        id: deliveryId,
        intentId: intent.id,
        tenantId: intent.tenantId,
        organisationId: recipient.organisationId ?? intent.organisationId,
        userId: recipient.userId,
        channel: "in_app",
        providerId: "in_app",
        status: "queued",
        receiptLevel: "requested",
        idempotencyKey: deliveryIdem,
        correlationId: intent.correlationId,
        attemptCount: 0,
        maxAttempts,
        nextAttemptAt: now(),
        deadLetter: false,
        createdAt: now(),
        updatedAt: now(),
      };
      deliveries.set(deliveryId, record);
      deliveryByIdem.set(`${intent.tenantId}:${deliveryIdem}`, deliveryId);
      tries.set(deliveryId, []);
      counters.deliveriesQueued += 1;
      publish(
        "notification.delivery.queued",
        {
          deliveryId,
          intentId: intent.id,
          channel: "in_app",
          providerId: "in_app",
        },
        {
          tenantId: intent.tenantId,
          correlationId: intent.correlationId,
        },
      );
    }
  }

  function routeAndPersist(cmd: CreateNotificationIntentCommand): NotificationIntent {
    if (!isNotificationDeliveryEnabled(env)) {
      badRequest("Notification delivery is disabled", "DELIVERY_DISABLED");
    }
    if (!cmd.idempotencyKey.trim()) {
      badRequest("idempotencyKey is required");
    }
    if (!cmd.correlationId.trim()) {
      badRequest("correlationId is required");
    }
    if (!cmd.subject.trim()) {
      badRequest("subject is required");
    }
    if (cmd.tenantId.trim() === "") {
      badRequest("tenantId is required");
    }

    const idemKey = `${cmd.tenantId}:${cmd.idempotencyKey}`;
    const existingIntentId = intentByIdem.get(idemKey);
    if (existingIntentId) {
      counters.idempotencyDeduplications += 1;
      const existing = intents.get(existingIntentId);
      if (!existing) notFound("Idempotent intent missing");
      return existing;
    }

    const queuedDepth = [...deliveries.values()].filter(
      (d) => d.status === "queued" || d.status === "retry_scheduled",
    ).length;
    if (queuedDepth >= notificationMaxQueueDepth(env)) {
      badRequest("Notification queue depth exceeded", "QUEUE_CAPACITY");
    }

    let intent: NotificationIntent = {
      id: asNotificationIntentId(id()),
      tenantId: cmd.tenantId,
      organisationId: cmd.organisationId,
      sourceProduct: cmd.sourceProduct,
      sourceEvent: cmd.sourceEvent,
      category: cmd.category,
      priority: cmd.priority ?? "normal",
      subject: cmd.subject,
      summary: cmd.summary,
      payload: cmd.payload ?? {},
      recipientHints: cmd.recipientHints,
      mandatory: cmd.mandatory ?? false,
      correlationId: cmd.correlationId,
      idempotencyKey: cmd.idempotencyKey,
      createdAt: now(),
      requestedBy: cmd.requestedBy,
      expiresAt: cmd.expiresAt,
      templateId: cmd.templateId,
      templateVersion: cmd.templateVersion,
      metadata: cmd.metadata,
      status: "requested",
      updatedAt: now(),
    };
    intents.set(intent.id, intent);
    intentByIdem.set(idemKey, intent.id);
    counters.intentsCreated += 1;
    publish(
      "notification.intent.created",
      {
        intentId: intent.id,
        category: intent.category,
        sourceProduct: intent.sourceProduct,
        mandatory: intent.mandatory,
      },
      {
        tenantId: intent.tenantId,
        correlationId: intent.correlationId,
        actorId: intent.requestedBy,
      },
    );

    const policy = evaluatePolicy({
      category: intent.category,
      priority: intent.priority,
      mandatory: intent.mandatory,
      maxAttempts: notificationMaxAttempts(env),
      retryBaseDelayMs: notificationRetryBaseDelayMs(env),
    });
    if (!policy.permitted) {
      counters.policyFailures += 1;
      intent = transitionIntent(intent, "suppressed", {
        suppressionReason: policy.failClosedReason ?? "policy_denied",
        policyRef: policy.policyRef,
      });
      counters.intentsSuppressed += 1;
      publish(
        "notification.intent.suppressed",
        { intentId: intent.id, reason: intent.suppressionReason },
        { tenantId: intent.tenantId, correlationId: intent.correlationId },
      );
      return intent;
    }

    intent = transitionIntent(intent, "validated", { policyRef: policy.policyRef });
    counters.intentsValidated += 1;
    publish(
      "notification.intent.validated",
      { intentId: intent.id, policyRef: policy.policyRef },
      { tenantId: intent.tenantId, correlationId: intent.correlationId },
    );

    if (!isNotificationInAppEnabled(env)) {
      intent = transitionIntent(intent, "suppressed", {
        suppressionReason: "in_app_disabled",
      });
      counters.intentsSuppressed += 1;
      return intent;
    }

    const recipients = resolveRecipients(cmd);
    if (recipients.length === 0) {
      intent = transitionIntent(intent, "permanent_failure", {
        suppressionReason: "no_resolvable_recipients",
      });
      counters.permanentFailures += 1;
      counters.terminalFailureCount += 1;
      return intent;
    }

    const eligible: ResolvedNotificationRecipient[] = [];
    for (const recipient of recipients) {
      const pref = evaluatePreference({
        mandatory: intent.mandatory || policy.mandatory,
        userDisabledInApp: userPrefDisabled.get(
          `${recipient.userId}:${intent.category}`,
        ),
      });
      if (!pref.enabled) {
        counters.preferenceSuppressions += 1;
        continue;
      }
      eligible.push(recipient);
    }

    if (eligible.length === 0) {
      intent = transitionIntent(intent, "suppressed", {
        suppressionReason: "preference_suppressed",
      });
      counters.intentsSuppressed += 1;
      publish(
        "notification.intent.suppressed",
        { intentId: intent.id, reason: "preference_suppressed" },
        { tenantId: intent.tenantId, correlationId: intent.correlationId },
      );
      return intent;
    }

    intent = transitionIntent(intent, "queued");
    createDeliveriesForIntent(intent, eligible, policy.maxAttempts);
    return intent;
  }

  function dispatchInApp(
    delivery: NotificationDeliveryRecord,
    intent: NotificationIntent,
  ): {
    readonly ok: boolean;
    readonly receiptLevel: NotificationReceiptLevel;
    readonly failureClass?: NotificationFailureClass;
    readonly failureCode?: string;
    readonly inAppId?: string;
  } {
    if (!isNotificationInAppEnabled(env)) {
      return {
        ok: false,
        receiptLevel: "failed",
        failureClass: "configuration",
        failureCode: "IN_APP_DISABLED",
      };
    }
    if (input.simulateInAppFailure) {
      return {
        ok: false,
        receiptLevel: "failed",
        failureClass: "permanent_provider",
        failureCode: "SIMULATED_FAILURE",
      };
    }
    try {
      const rendered = renderTemplate({
        subject: intent.subject,
        summary: intent.summary,
        payload: intent.payload,
      });
      const inAppId = id();
      const item: NotificationInAppItem = {
        id: inAppId,
        deliveryId: delivery.id,
        intentId: intent.id,
        tenantId: delivery.tenantId,
        organisationId: delivery.organisationId,
        userId: delivery.userId,
        category: intent.category,
        priority: intent.priority,
        title: rendered.title,
        summary: rendered.summary,
        body: rendered.body,
        sourceProduct: intent.sourceProduct,
        sourceObjectRef:
          typeof intent.payload.sourceObjectRef === "string"
            ? intent.payload.sourceObjectRef
            : undefined,
        createdAt: now(),
        expiresAt: intent.expiresAt,
      };
      inApp.set(inAppId, item);
      publish(
        "notification.in_app.created",
        {
          notificationId: inAppId,
          deliveryId: delivery.id,
          userId: delivery.userId,
          category: intent.category,
        },
        {
          tenantId: delivery.tenantId,
          correlationId: delivery.correlationId,
        },
      );
      return {
        ok: true,
        receiptLevel: "delivered",
        inAppId,
      };
    } catch {
      counters.templateFailures += 1;
      return {
        ok: false,
        receiptLevel: "failed",
        failureClass: "template_failure",
        failureCode: "RENDER_FAILED",
      };
    }
  }

  function processOne(deliveryId: string): void {
    const delivery = deliveries.get(deliveryId);
    if (!delivery) return;
    if (
      delivery.status !== "queued" &&
      delivery.status !== "retry_scheduled" &&
      delivery.status !== "processing"
    ) {
      return;
    }
    const intent = intents.get(delivery.intentId);
    if (!intent) {
      transitionDelivery(delivery, "permanent_failure", {
        lastFailureClass: "internal_processing",
        lastFailureCode: "INTENT_MISSING",
        deadLetter: true,
        terminalAt: now(),
        receiptLevel: "failed",
      });
      counters.permanentFailures += 1;
      counters.terminalFailureCount += 1;
      return;
    }

    if (intent.expiresAt && Date.parse(intent.expiresAt) <= nowMs()) {
      transitionDelivery(delivery, "expired", {
        receiptLevel: "expired",
        terminalAt: now(),
      });
      counters.expired += 1;
      transitionIntent(intent, "expired");
      return;
    }

    const started = nowMs();
    let current = transitionDelivery(delivery, "processing", {
      receiptLevel: "accepted_by_adapter",
    });
    counters.deliveriesProcessing += 1;
    publish(
      "notification.delivery.started",
      { deliveryId: current.id, attempt: current.attemptCount + 1 },
      { tenantId: current.tenantId, correlationId: current.correlationId },
    );

    const attemptNumber = current.attemptCount + 1;
    const tryId = asNotificationDeliveryTryId(id());
    const tryStart = now();
    const result = dispatchInApp(current, intent);
    counters.deliveryAttempts += 1;

    const tryRecord: NotificationDeliveryTry = {
      id: tryId,
      deliveryId: current.id,
      attemptNumber,
      providerId: "in_app",
      startedAt: tryStart,
      finishedAt: now(),
      receiptLevel: result.receiptLevel,
      failureClass: result.failureClass,
      failureCode: result.failureCode,
    };
    const list = tries.get(current.id) ?? [];
    tries.set(current.id, [...list, tryRecord]);

    counters.processingLatencyMsLast = nowMs() - started;

    if (result.ok) {
      current = transitionDelivery(current, "delivered", {
        attemptCount: attemptNumber,
        receiptLevel: result.receiptLevel,
        inAppNotificationId: result.inAppId,
        nextAttemptAt: undefined,
        lastFailureClass: undefined,
        lastFailureCode: undefined,
      });
      counters.deliveriesDelivered += 1;
      counters.lastSuccessfulProcessingAt = now();
      publish(
        "notification.delivery.delivered",
        {
          deliveryId: current.id,
          receiptLevel: current.receiptLevel,
          inAppNotificationId: current.inAppNotificationId,
        },
        { tenantId: current.tenantId, correlationId: current.correlationId },
      );

      const latestIntent = intents.get(intent.id) ?? intent;
      const siblings = [...deliveries.values()].filter((d) => d.intentId === intent.id);
      const allDelivered = siblings.every((d) => d.status === "delivered");
      const anyDelivered = siblings.some((d) => d.status === "delivered");
      try {
        let aggregate = latestIntent;
        if (aggregate.status === "queued") {
          aggregate = transitionIntent(aggregate, "processing");
        }
        if (allDelivered) {
          if (
            aggregate.status === "processing" ||
            aggregate.status === "partially_delivered"
          ) {
            transitionIntent(aggregate, "delivered");
          }
        } else if (anyDelivered && aggregate.status === "processing") {
          transitionIntent(aggregate, "partially_delivered");
        }
      } catch {
        /* aggregate best-effort */
      }
      return;
    }

    const failureClass: NotificationFailureClass = result.failureClass ?? "unknown";
    counters.lastFailureCategory = failureClass;
    current = {
      ...current,
      attemptCount: attemptNumber,
      lastFailureClass: failureClass,
      lastFailureCode: result.failureCode,
      receiptLevel: result.receiptLevel,
      updatedAt: now(),
    };
    deliveries.set(current.id, current);

    const canRetry =
      isTransientFailureClass(failureClass) && attemptNumber < current.maxAttempts;
    if (canRetry) {
      const delay = backoffMs(notificationRetryBaseDelayMs(env), attemptNumber);
      const nextAt = new Date(nowMs() + delay).toISOString();
      transitionDelivery(current, "retry_scheduled", {
        nextAttemptAt: nextAt,
      });
      counters.deliveriesRetrying += 1;
      counters.retryCount += 1;
      publish(
        "notification.delivery.retry_scheduled",
        {
          deliveryId: current.id,
          nextAttemptAt: nextAt,
          attempt: attemptNumber,
          failureClass,
        },
        { tenantId: current.tenantId, correlationId: current.correlationId },
      );
      return;
    }

    transitionDelivery(current, "permanent_failure", {
      deadLetter: true,
      terminalAt: now(),
      receiptLevel: result.receiptLevel === "unknown" ? "failed" : result.receiptLevel,
    });
    counters.permanentFailures += 1;
    counters.terminalFailureCount += 1;
    publish(
      "notification.delivery.failed",
      {
        deliveryId: current.id,
        failureClass,
        permanent: true,
      },
      { tenantId: current.tenantId, correlationId: current.correlationId },
    );
  }

  function processQueue(limit = 25): { readonly processed: number } {
    // Manual / ops ticks may run when the interval worker is disabled.
    if (!isNotificationDeliveryEnabled(env)) {
      return { processed: 0 };
    }
    // Narrow compatibility: when durable runtime is selected, process-local
    // queue processing yields so only one runtime handles deliveries.
    if (isNotificationDurableRuntimeEnabled(env)) {
      return { processed: 0 };
    }
    const due = [...deliveries.values()]
      .filter(
        (d) =>
          (d.status === "queued" || d.status === "retry_scheduled") &&
          (!d.nextAttemptAt || Date.parse(d.nextAttemptAt) <= nowMs()),
      )
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, limit);
    for (const d of due) processOne(d.id);
    return { processed: due.length };
  }

  function startWorker(): void {
    if (!isNotificationWorkerEnabled(env)) return;
    if (isNotificationDurableRuntimeEnabled(env)) return;
    if (workerTimer) return;
    workerRunning = true;
    workerTimer = setInterval(() => {
      processQueue(25);
    }, input.tickIntervalMs ?? 250);
  }

  function stopWorker(): void {
    workerRunning = false;
    if (workerTimer) {
      clearInterval(workerTimer);
      workerTimer = undefined;
    }
  }

  function mapEventToCommand(
    envelope: DomainEventEnvelope,
  ): CreateNotificationIntentCommand | undefined {
    if (!AUTHORISED_EVENT_TYPES.has(envelope.eventId)) return undefined;
    const tenantId = envelope.tenantId;
    if (!tenantId) return undefined;
    const payload = envelope.payload;
    const organisationId =
      typeof payload.organisationId === "string"
        ? payload.organisationId
        : typeof payload.organizationId === "string"
          ? payload.organizationId
          : undefined;
    const userHints: Array<{
      userId?: string;
      roleId?: string;
      teamId?: string;
      organisationId?: string;
      operationalGroupId?: string;
    }> = [];
    for (const key of ["assigneeId", "userId", "ownerId", "createdBy"] as const) {
      const v = payload[key];
      if (typeof v === "string" && v.trim()) {
        userHints.push({ userId: v, organisationId });
      }
    }
    if (userHints.length === 0) {
      // Observe alerts may only have definition/state refs — require explicit user later
      return undefined;
    }
    const sourceProduct = envelope.eventId.startsWith("observe.")
      ? "observe"
      : envelope.eventId.startsWith("support.")
        ? "support"
        : "platform";
    const mandatory = envelope.eventId === "observe.alert.fired";
    return {
      tenantId,
      organisationId,
      sourceProduct,
      sourceEvent: envelope.eventId,
      category: sourceProduct === "observe" ? "observe.alert" : "support.ticket",
      priority: mandatory ? "high" : "normal",
      subject:
        typeof payload.title === "string"
          ? payload.title
          : typeof payload.subject === "string"
            ? payload.subject
            : `${envelope.eventId}`,
      summary: typeof payload.summary === "string" ? payload.summary : undefined,
      payload: {
        sourceObjectRef:
          typeof payload.supportRequestId === "string"
            ? payload.supportRequestId
            : typeof payload.alertStateId === "string"
              ? payload.alertStateId
              : undefined,
        eventId: envelope.eventId,
      },
      recipientHints: userHints,
      mandatory,
      correlationId: envelope.correlationId,
      idempotencyKey: `evt:${envelope.eventId}:${envelope.envelopeId}`,
      requestedBy: envelope.actorId ?? "event-bus",
    };
  }

  function ingestDomainEvent(envelope: DomainEventEnvelope): void {
    if (!isNotificationEventIntakeEnabled(env)) return;
    if (!AUTHORISED_EVENT_TYPES.has(envelope.eventId)) {
      counters.eventIntakeFailures += 1;
      return;
    }
    if (!envelope.tenantId) {
      counters.eventIntakeFailures += 1;
      return;
    }
    const cmd = mapEventToCommand(envelope);
    if (!cmd) {
      counters.eventIntakeFailures += 1;
      return;
    }
    try {
      const intent = routeAndPersist(cmd);
      if (intent.status === "queued" && isNotificationWorkerEnabled(env)) {
        processQueue(10);
      }
    } catch {
      counters.eventIntakeFailures += 1;
    }
  }

  function attachEventBus(bus: NotificationDeliveryEventBusPort): void {
    if (busAttached) return;
    busAttached = true;
    for (const pattern of ["observe.alert.*", "support.*"] as const) {
      subscriptions.push(
        bus.subscribe({
          eventPattern: pattern,
          handler: (envelope) => ingestDomainEvent(envelope),
        }),
      );
    }
  }

  function assertTenant(
    ctx: NotificationPlatformServiceContext,
    tenantId: string,
    organisationId?: string,
  ): void {
    if (ctx.tenantId !== tenantId)
      deny("Cross-tenant access denied", "TENANT_ISOLATION");
    if (ctx.organisationId && organisationId && ctx.organisationId !== organisationId) {
      deny("Cross-organisation access denied", "ORG_ISOLATION");
    }
  }

  const service: NotificationDeliveryService & {
    attachEventBus(bus: NotificationDeliveryEventBusPort): void;
    ingestDomainEvent(envelope: DomainEventEnvelope): void;
    setUserPreferenceDisabled(
      userId: string,
      category: string,
      disabled: boolean,
    ): void;
  } = {
    attachEventBus,
    ingestDomainEvent,
    setUserPreferenceDisabled(userId, category, disabled) {
      userPrefDisabled.set(`${userId}:${category}`, disabled);
    },
    async createIntent(ctx, cmd) {
      requirePerm(ctx, "send");
      if (!isNotificationCommandIntakeEnabled(env)) {
        counters.commandIntakeFailures += 1;
        badRequest("Command intake disabled", "COMMAND_INTAKE_DISABLED");
      }
      if (ctx.tenantId !== cmd.tenantId) {
        deny("Tenant mismatch", "TENANT_ISOLATION");
      }
      const intent = routeAndPersist({
        ...cmd,
        requestedBy: cmd.requestedBy || ctx.userId,
        correlationId: cmd.correlationId || ctx.correlationId,
      });
      processQueue(10);
      return intent;
    },
    async getIntent(ctx, intentId) {
      requirePerm(ctx, "read");
      const intent = intents.get(intentId);
      if (!intent) notFound("Intent not found");
      assertTenant(ctx, intent.tenantId, intent.organisationId);
      return intent;
    },
    async listIntents(ctx) {
      requirePerm(ctx, "read");
      return [...intents.values()].filter((i) => {
        if (i.tenantId !== ctx.tenantId) return false;
        if (
          ctx.organisationId &&
          i.organisationId &&
          i.organisationId !== ctx.organisationId
        )
          return false;
        return true;
      });
    },
    async cancelIntent(ctx, intentId) {
      requirePerm(ctx, "manage");
      const intent = intents.get(intentId);
      if (!intent) notFound("Intent not found");
      assertTenant(ctx, intent.tenantId, intent.organisationId);
      const next = transitionIntent(intent, "cancelled");
      counters.cancelled += 1;
      for (const d of deliveries.values()) {
        if (d.intentId !== intent.id) continue;
        if (
          d.status === "queued" ||
          d.status === "retry_scheduled" ||
          d.status === "requested" ||
          d.status === "processing"
        ) {
          try {
            transitionDelivery(d, "cancelled", { terminalAt: now() });
          } catch {
            /* ignore illegal */
          }
        }
      }
      publish(
        "notification.delivery.cancelled",
        { intentId: intent.id },
        {
          tenantId: intent.tenantId,
          correlationId: intent.correlationId,
          actorId: ctx.userId,
        },
      );
      return next;
    },
    async listDeliveries(ctx) {
      requirePerm(ctx, "read");
      return [...deliveries.values()].filter((d) => {
        if (d.tenantId !== ctx.tenantId) return false;
        if (
          ctx.organisationId &&
          d.organisationId &&
          d.organisationId !== ctx.organisationId
        )
          return false;
        return true;
      });
    },
    async getDelivery(ctx, deliveryId) {
      requirePerm(ctx, "read");
      const delivery = deliveries.get(deliveryId);
      if (!delivery) notFound("Delivery not found");
      assertTenant(ctx, delivery.tenantId, delivery.organisationId);
      return delivery;
    },
    async listDeliveryAttempts(ctx, deliveryId) {
      requirePerm(ctx, "diagnostics");
      const delivery = deliveries.get(deliveryId);
      if (!delivery) notFound("Delivery not found");
      assertTenant(ctx, delivery.tenantId, delivery.organisationId);
      return tries.get(deliveryId) ?? [];
    },
    async retryDelivery(ctx, deliveryId) {
      requirePerm(ctx, "retry");
      const delivery = deliveries.get(deliveryId);
      if (!delivery) notFound("Delivery not found");
      assertTenant(ctx, delivery.tenantId, delivery.organisationId);
      if (
        delivery.status !== "permanent_failure" &&
        delivery.status !== "retry_scheduled" &&
        delivery.status !== "queued"
      ) {
        badRequest("Delivery is not retryable");
      }
      // Operator retry may re-queue terminal failures (audited privileged path).
      const reset: NotificationDeliveryRecord = {
        ...delivery,
        status: "queued",
        deadLetter: false,
        terminalAt: undefined,
        nextAttemptAt: now(),
        updatedAt: now(),
        receiptLevel: "requested",
      };
      deliveries.set(reset.id, reset);
      publish(
        "notification.delivery.retry_scheduled",
        { deliveryId: reset.id, operatorRetry: true },
        {
          tenantId: reset.tenantId,
          correlationId: reset.correlationId,
          actorId: ctx.userId,
        },
      );
      if (isNotificationWorkerEnabled(env)) processQueue(5);
      return reset;
    },
    async replayTerminalFailure(ctx, deliveryId) {
      requirePerm(ctx, "retry");
      const delivery = deliveries.get(deliveryId);
      if (!delivery) notFound("Delivery not found");
      assertTenant(ctx, delivery.tenantId, delivery.organisationId);
      if (!delivery.deadLetter && delivery.status !== "permanent_failure") {
        badRequest("Delivery is not in terminal failure");
      }
      const reset: NotificationDeliveryRecord = {
        ...delivery,
        status: "queued",
        deadLetter: false,
        terminalAt: undefined,
        nextAttemptAt: now(),
        attemptCount: 0,
        receiptLevel: "requested",
        lastFailureClass: undefined,
        lastFailureCode: undefined,
        updatedAt: now(),
      };
      deliveries.set(reset.id, reset);
      publish(
        "notification.dead_letter.replayed",
        { deliveryId: reset.id },
        {
          tenantId: reset.tenantId,
          correlationId: reset.correlationId,
          actorId: ctx.userId,
        },
      );
      if (isNotificationWorkerEnabled(env)) processQueue(5);
      return reset;
    },
    async getInAppNotifications(ctx, options) {
      requirePerm(ctx, "read");
      return [...inApp.values()]
        .filter((item) => {
          if (item.tenantId !== ctx.tenantId) return false;
          if (item.userId !== ctx.userId) return false;
          if (
            ctx.organisationId &&
            item.organisationId &&
            item.organisationId !== ctx.organisationId
          ) {
            return false;
          }
          if (options?.unreadOnly && item.readAt) return false;
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },
    async markInAppRead(ctx, notificationId) {
      requirePerm(ctx, "read");
      const item = inApp.get(notificationId);
      if (!item) notFound("In-app notification not found");
      if (item.tenantId !== ctx.tenantId || item.userId !== ctx.userId) {
        deny("Recipient ownership required");
      }
      const next = { ...item, readAt: now() };
      inApp.set(notificationId, next);
      // Read state must not alter provider delivery outcome
      publish(
        "notification.in_app.read",
        { notificationId, deliveryId: item.deliveryId },
        {
          tenantId: item.tenantId,
          correlationId: ctx.correlationId,
          actorId: ctx.userId,
        },
      );
      return next;
    },
    async markInAppUnread(ctx, notificationId) {
      requirePerm(ctx, "read");
      const item = inApp.get(notificationId);
      if (!item) notFound("In-app notification not found");
      if (item.tenantId !== ctx.tenantId || item.userId !== ctx.userId) {
        deny("Recipient ownership required");
      }
      const next = { ...item, readAt: undefined };
      inApp.set(notificationId, next);
      publish(
        "notification.in_app.unread",
        { notificationId, deliveryId: item.deliveryId },
        {
          tenantId: item.tenantId,
          correlationId: ctx.correlationId,
          actorId: ctx.userId,
        },
      );
      return next;
    },
    async markAllInAppRead(ctx) {
      requirePerm(ctx, "read");
      let updated = 0;
      for (const [key, item] of inApp) {
        if (item.tenantId !== ctx.tenantId || item.userId !== ctx.userId) continue;
        if (item.readAt) continue;
        inApp.set(key, { ...item, readAt: now() });
        updated += 1;
      }
      return { updated };
    },
    async getProviders(_ctx) {
      requirePerm(_ctx, "providers");
      const enabled = isNotificationInAppEnabled(env);
      const descriptor: NotificationProviderDescriptor = {
        providerId: "in_app",
        channel: "in_app",
        displayName: "In-application notifications",
        enabled,
        health: enabled ? "healthy" : "disabled",
        capabilities: [
          "persistent_history",
          "read_state",
          "user_scoped",
          "tenant_isolated",
        ],
      };
      return [descriptor];
    },
    async getHealth(_ctx): Promise<NotificationDeliveryHealth> {
      requirePerm(_ctx, "health");
      const enabled = isNotificationDeliveryEnabled(env);
      if (!enabled) {
        return {
          status: "disabled",
          enabled: false,
          inAppEnabled: false,
          eventIntakeEnabled: false,
          commandIntakeEnabled: false,
          workerEnabled: false,
          workerRunning: false,
          smtpDeferred: true,
          message: "disabled_by_configuration",
          checkedAt: now(),
        };
      }
      const inAppEnabled = isNotificationInAppEnabled(env);
      const status = inAppEnabled ? "healthy" : "degraded";
      return {
        status,
        enabled: true,
        inAppEnabled,
        eventIntakeEnabled: isNotificationEventIntakeEnabled(env),
        commandIntakeEnabled: isNotificationCommandIntakeEnabled(env),
        workerEnabled: isNotificationWorkerEnabled(env),
        workerRunning,
        smtpDeferred: true,
        checkedAt: now(),
      };
    },
    async getReadiness(_ctx): Promise<NotificationDeliveryReadiness> {
      requirePerm(_ctx, "health");
      const enabled = isNotificationDeliveryEnabled(env);
      const inAppEnabled = isNotificationInAppEnabled(env);
      const checks = {
        deliveryEnabled: enabled,
        inAppEnabled,
        policyAvailable: true,
        templateAvailable: true,
        recipientResolution: true,
        workerConfigured: isNotificationWorkerEnabled(env),
        smtp: "deferred",
      };
      if (!enabled) {
        return {
          ready: false,
          enabled: false,
          reason: "disabled_by_configuration",
          checks,
        };
      }
      return {
        ready: inAppEnabled,
        enabled: true,
        reason: inAppEnabled ? undefined : "in_app_disabled",
        checks,
      };
    },
    async getDiagnostics(_ctx): Promise<NotificationDeliveryDiagnostics> {
      requirePerm(_ctx, "diagnostics");
      const queued = [...deliveries.values()].filter(
        (d) => d.status === "queued" || d.status === "retry_scheduled",
      );
      const oldest = queued
        .map((d) => nowMs() - Date.parse(d.createdAt))
        .sort((a, b) => b - a)[0];
      const unread = [...inApp.values()].filter((i) => !i.readAt).length;
      return {
        intentsCreated: counters.intentsCreated,
        intentsValidated: counters.intentsValidated,
        intentsSuppressed: counters.intentsSuppressed,
        deliveriesQueued: counters.deliveriesQueued,
        deliveriesProcessing: counters.deliveriesProcessing,
        deliveriesDelivered: counters.deliveriesDelivered,
        deliveriesRetrying: counters.deliveriesRetrying,
        permanentFailures: counters.permanentFailures,
        cancelled: counters.cancelled,
        expired: counters.expired,
        inAppUnreadAggregate: unread,
        idempotencyDeduplications: counters.idempotencyDeduplications,
        recipientResolutionFailures: counters.recipientResolutionFailures,
        preferenceSuppressions: counters.preferenceSuppressions,
        policyFailures: counters.policyFailures,
        templateFailures: counters.templateFailures,
        eventIntakeFailures: counters.eventIntakeFailures,
        commandIntakeFailures: counters.commandIntakeFailures,
        retryCount: counters.retryCount,
        terminalFailureCount: counters.terminalFailureCount,
        oldestQueuedAgeMs: oldest ?? null,
        workerState: !isNotificationWorkerEnabled(env)
          ? "disabled"
          : workerRunning
            ? "running"
            : "stopped",
        adapterState: isNotificationInAppEnabled(env) ? "healthy" : "disabled",
        configurationState: isNotificationDeliveryEnabled(env) ? "valid" : "disabled",
        lastSuccessfulProcessingAt: counters.lastSuccessfulProcessingAt,
        lastFailureCategory: counters.lastFailureCategory,
        smtpDeliveryStatus: "deferred",
      };
    },
    async getMetricsSnapshot(_ctx): Promise<NotificationDeliveryMetricsSnapshot> {
      requirePerm(_ctx, "diagnostics");
      const queueDepth = [...deliveries.values()].filter(
        (d) => d.status === "queued" || d.status === "retry_scheduled",
      ).length;
      const oldest = [...deliveries.values()]
        .filter((d) => d.status === "queued" || d.status === "retry_scheduled")
        .map((d) => nowMs() - Date.parse(d.createdAt))
        .sort((a, b) => b - a)[0];
      return {
        intents_total: counters.intentsCreated,
        intents_suppressed_total: counters.intentsSuppressed,
        deliveries_queued_total: counters.deliveriesQueued,
        delivery_attempts_total: counters.deliveryAttempts,
        deliveries_delivered_total: counters.deliveriesDelivered,
        deliveries_failed_total: counters.permanentFailures,
        retries_scheduled_total: counters.retryCount,
        permanent_failures_total: counters.permanentFailures,
        idempotency_deduplications_total: counters.idempotencyDeduplications,
        recipient_resolution_failures_total: counters.recipientResolutionFailures,
        policy_failures_total: counters.policyFailures,
        preference_suppressions_total: counters.preferenceSuppressions,
        event_intake_failures_total: counters.eventIntakeFailures,
        processing_latency_ms_last: counters.processingLatencyMsLast,
        queue_depth: queueDepth,
        oldest_queue_age_ms: oldest ?? null,
        worker_health: workerRunning || !isNotificationWorkerEnabled(env) ? 1 : 0,
      };
    },
    processQueue: async (limit?: number) => processQueue(limit),
    startWorker,
    stopWorker,
  };

  return service;
}

/** Bind Observe alert delivery hook to Notification Delivery command intake. */
export function createObserveNotificationDeliveryHook(service: {
  createIntent: NotificationDeliveryService["createIntent"];
}): (input: {
  readonly eventId: string;
  readonly alertState: {
    readonly id: string;
    readonly tenantId: string;
    readonly organisationId?: string;
    readonly state: string;
  };
  readonly definition: {
    readonly id: string;
    readonly name?: string;
    readonly severity?: string;
  };
}) => void {
  return (input) => {
    const ctx: NotificationPlatformServiceContext = {
      tenantId: input.alertState.tenantId,
      organisationId: input.alertState.organisationId,
      userId: "observe-delivery-hook",
      correlationId: `observe:${input.eventId}:${input.alertState.id}`,
      permissions: ["notifications.send", "notification.delivery"],
    };
    const assigneeHint = input.alertState as unknown as {
      assigneeId?: string;
    };
    const assignee =
      typeof assigneeHint.assigneeId === "string" ? assigneeHint.assigneeId : undefined;
    if (!assignee) return;
    void service.createIntent(ctx, {
      tenantId: input.alertState.tenantId,
      organisationId: input.alertState.organisationId,
      sourceProduct: "observe",
      sourceEvent: input.eventId,
      category: "observe.alert",
      priority: "high",
      subject: input.definition.name ?? `Alert ${input.alertState.state}`,
      payload: {
        alertStateId: input.alertState.id,
        definitionId: input.definition.id,
        sourceObjectRef: input.alertState.id,
      },
      recipientHints: [{ userId: assignee }],
      mandatory: input.eventId.includes("fired"),
      correlationId: ctx.correlationId,
      idempotencyKey: `observe:${input.eventId}:${input.alertState.id}`,
      requestedBy: "observe-delivery-hook",
    });
  };
}
