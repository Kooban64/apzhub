/**
 * Platform Realtime Subscription Service — transport abstraction (ADR-0072).
 * Phase A concrete transport: SSE only (Platform-1.3-ENG-003).
 *
 * Uses existing Platform Runtime / Event Bus — not a parallel realtime framework.
 * All outbound client events pass through this abstraction (never raw engine events).
 */

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  DomainEventEnvelope,
  DomainEventPublisher,
} from "../../events/domain-event-publisher";
import { createDomainEventEnvelopeId } from "../../events/domain-event-publisher";

/** Deny-by-default SSE enablement (ADR-0072 / ENG-003). */
export function isRealtimeSseEnabled(
  env: Readonly<Record<string, string | undefined>> = process.env,
): boolean {
  const value = env.APZHUB_REALTIME_SSE_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "on";
}

export const SUPPORT_REALTIME_WIRE_EVENTS = [
  "support.ticket.created",
  "support.ticket.assigned",
  "support.ticket.updated",
  "support.ticket.status_changed",
  "support.ticket.comment_added",
  "support.ticket.attachment_added",
  "support.ticket.sla_warning",
  "support.ticket.resolved",
] as const;

export type SupportRealtimeWireEvent = (typeof SUPPORT_REALTIME_WIRE_EVENTS)[number];

/** ENG-004 — in-app notification presentation over ADR-0072 SSE (no parallel transport). */
export const NOTIFICATION_REALTIME_WIRE_EVENTS = [
  "notification.created",
  "notification.updated",
  "notification.read",
  "notification.expired",
] as const;

export type NotificationRealtimeWireEvent =
  (typeof NOTIFICATION_REALTIME_WIRE_EVENTS)[number];

export type RealtimeWireMessage = {
  readonly id: string;
  readonly event: string;
  readonly data: Readonly<Record<string, unknown>>;
  readonly timestamp: string;
};

export type RealtimeSubscriptionTopic = "support" | "notifications";

export type RealtimeStructuredLogLevel = "debug" | "info" | "warn" | "error";

export type RealtimeStructuredLogger = {
  log(
    level: RealtimeStructuredLogLevel,
    message: string,
    fields?: Readonly<Record<string, unknown>>,
  ): void;
};

export type RealtimeSessionValidator = (input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly sessionId?: string;
  readonly correlationId?: string;
}) => boolean | Promise<boolean>;

export type RealtimeDiagnostics = {
  readonly enabled: boolean;
  readonly transport: "sse";
  readonly activeConnections: number;
  readonly connectionsByTenant: Readonly<Record<string, number>>;
  readonly eventsDelivered: number;
  readonly eventsDroppedBackpressure: number;
  readonly eventsCoalesced: number;
  readonly duplicatesSuppressed: number;
  readonly replayedEvents: number;
  readonly heartbeatsSent: number;
  readonly authzDenials: number;
  readonly tenantMismatches: number;
  readonly organisationMismatches: number;
  readonly idleTimeouts: number;
  readonly gracefulDisconnects: number;
  readonly lastEventAt?: string;
  readonly busAttached: boolean;
  readonly shuttingDown: boolean;
  readonly maxConnectionsGlobal: number;
  readonly maxConnectionsPerTenant: number;
  readonly maxQueuePerConnection: number;
  readonly replayBufferSize: number;
  readonly idleTimeoutMs: number;
};

export type RealtimeHealth = {
  readonly status: "healthy" | "degraded" | "unhealthy" | "disabled" | "unknown";
  readonly enabled: boolean;
  readonly transport: "sse";
  readonly busAttached: boolean;
  readonly activeConnections: number;
  readonly shuttingDown: boolean;
  readonly message?: string;
};

/** Minimal bus port — avoids coupling platform-services to ENF package types. */
export type RealtimeEventBusPort = {
  subscribe(options: {
    readonly eventPattern: string;
    readonly handler: (envelope: DomainEventEnvelope) => void;
  }): string;
  unsubscribe(subscriptionId: string): boolean;
};

export type RealtimeSubscriptionService = {
  readonly isEnabled: () => boolean;
  attachEventBus(bus: RealtimeEventBusPort): void;
  /** Test / direct ingest path. */
  ingestDomainEvent(envelope: DomainEventEnvelope): void;
  openSseStream(
    ctx: ServiceRequestContext,
    options?: {
      readonly topics?: readonly RealtimeSubscriptionTopic[];
      readonly lastEventId?: string;
      readonly signal?: AbortSignal;
      readonly sessionId?: string;
    },
  ): ReadableStream<Uint8Array>;
  /** Graceful process/server shutdown — notify clients then close. */
  shutdown(reason?: string): void;
  getDiagnostics(ctx: ServiceRequestContext): RealtimeDiagnostics;
  getHealth(ctx: ServiceRequestContext): RealtimeHealth;
};

export type CreateRealtimeSubscriptionServiceInput = {
  readonly env?: Readonly<Record<string, string | undefined>>;
  readonly now?: () => string;
  readonly nowMs?: () => number;
  readonly heartbeatIntervalMs?: number;
  readonly logger?: RealtimeStructuredLogger;
  readonly auditPublisher?: DomainEventPublisher;
  readonly validateSession?: RealtimeSessionValidator;
};

type Connection = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly sessionId?: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly topics: ReadonlySet<RealtimeSubscriptionTopic>;
  readonly queue: RealtimeWireMessage[];
  readonly deliveredIds: Set<string>;
  readonly createdAt: string;
  readonly createdAtMs: number;
  /** Last successful SSE write (including heartbeats). */
  lastWriteMs: number;
  /** Last delivered business wire event (excludes heartbeat/control). */
  lastWireEventMs: number;
  dropped: number;
  controller?: ReadableStreamDefaultController<Uint8Array>;
};

const COALESCE_EVENTS = new Set<string>([
  "support.ticket.updated",
  "support.ticket.status_changed",
]);

function parsePositiveInt(
  value: string | undefined,
  fallback: number,
  max: number,
): number {
  if (!value?.trim()) return fallback;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
}

function hasNotificationRealtimePermission(permissions: readonly string[]): boolean {
  if (permissions.includes("notification.*")) return true;
  if (permissions.includes("notifications.read")) return true;
  if (permissions.includes("notification.read")) return true;
  return false;
}

function hasSupportRealtimePermission(permissions: readonly string[]): boolean {
  if (permissions.includes("support.*")) return true;
  if (permissions.includes("support.requests.list")) return true;
  if (permissions.includes("support.requests.read")) return true;
  if (permissions.includes("support.requests.get")) return true;
  return false;
}

function encodeSse(message: {
  readonly id?: string;
  readonly event?: string;
  readonly data?: string;
  readonly comment?: string;
}): string {
  if (message.comment !== undefined) {
    return `: ${message.comment}\n\n`;
  }
  const lines: string[] = [];
  if (message.id) lines.push(`id: ${message.id}`);
  if (message.event) lines.push(`event: ${message.event}`);
  if (message.data !== undefined) {
    for (const part of message.data.split("\n")) {
      lines.push(`data: ${part}`);
    }
  }
  return `${lines.join("\n")}\n\n`;
}

const textEncoder = new TextEncoder();

function defaultLogger(): RealtimeStructuredLogger {
  return {
    log(level, message, fields = {}) {
      const line = JSON.stringify({
        ts: new Date().toISOString(),
        scope: "realtime-subscription",
        level,
        message,
        ...fields,
      });
      if (level === "error") console.error(line);
      else if (level === "warn") console.warn(line);
      else console.info(line);
    },
  };
}

function coalesceKey(message: RealtimeWireMessage): string | undefined {
  if (!COALESCE_EVENTS.has(message.event)) return undefined;
  const requestId = message.data.supportRequestId;
  if (typeof requestId !== "string" || !requestId) return undefined;
  return `${message.event}:${requestId}`;
}

/**
 * Map Support domain bus events → Workbench wire events (read-only).
 * Engine/raw bus payloads never reach clients unchanged.
 */
export function mapSupportDomainEventToWire(
  envelope: DomainEventEnvelope,
): RealtimeWireMessage | readonly RealtimeWireMessage[] | undefined {
  if (!envelope.eventId.startsWith("support.")) return undefined;

  const payload = envelope.payload;
  const supportRequestId =
    typeof payload.supportRequestId === "string" ? payload.supportRequestId : undefined;
  if (!supportRequestId) return undefined;

  const base = {
    id: envelope.envelopeId,
    timestamp: envelope.timestamp,
    data: {
      supportRequestId,
      tenantId: envelope.tenantId,
      organisationId: payload.organizationId ?? payload.organisationId,
      status: payload.status,
      priority: payload.priority,
      assigneeId: payload.assigneeId,
      title: payload.title,
      articleId: payload.articleId,
      articleType: payload.articleType,
      correlationId: envelope.correlationId,
      sourceEventId: envelope.eventId,
    },
  };

  switch (envelope.eventId) {
    case "support.request.created":
      return { ...base, event: "support.ticket.created" };
    case "support.request.assigned":
      return { ...base, event: "support.ticket.assigned" };
    case "support.request.closed":
      return { ...base, event: "support.ticket.resolved" };
    case "support.request.updated": {
      const messages: RealtimeWireMessage[] = [
        { ...base, event: "support.ticket.updated" },
      ];
      if (typeof payload.status === "string" && payload.status.trim()) {
        messages.push({
          ...base,
          id: `${envelope.envelopeId}:status`,
          event: "support.ticket.status_changed",
        });
      }
      return messages;
    }
    case "support.article.created": {
      const articleType =
        typeof payload.articleType === "string"
          ? payload.articleType.toLowerCase()
          : "";
      if (
        articleType.includes("attach") ||
        articleType.includes("file") ||
        articleType === "attachment"
      ) {
        return { ...base, event: "support.ticket.attachment_added" };
      }
      return { ...base, event: "support.ticket.comment_added" };
    }
    case "support.request.sla_warning":
    case "support.ticket.sla_warning":
      return { ...base, event: "support.ticket.sla_warning" };
    default:
      // Unmapped support.* (and all non-support) — never forward raw engine events
      return undefined;
  }
}

/**
 * Map Notification Delivery domain events to Workbench wire events (ENG-004).
 * Never forwards provider/engine payloads — approved presentation events only.
 */
export function mapNotificationDomainEventToWire(
  envelope: DomainEventEnvelope,
): RealtimeWireMessage | undefined {
  if (!envelope.eventId.startsWith("notification.")) return undefined;
  const payload = envelope.payload;
  const base = {
    id: envelope.envelopeId,
    timestamp: envelope.timestamp,
    data: {
      notificationId: payload.notificationId,
      deliveryId: payload.deliveryId,
      intentId: payload.intentId,
      userId: payload.userId,
      category: payload.category,
      tenantId: envelope.tenantId,
      organisationId: payload.organisationId,
      correlationId: envelope.correlationId,
      sourceEventId: envelope.eventId,
    },
  };

  switch (envelope.eventId) {
    case "notification.in_app.created":
    case "notification.delivery.delivered":
      return { ...base, event: "notification.created" };
    case "notification.in_app.read":
      return { ...base, event: "notification.read" };
    case "notification.in_app.unread":
    case "notification.delivery.retry_scheduled":
      return { ...base, event: "notification.updated" };
    case "notification.delivery.expired":
      return { ...base, event: "notification.expired" };
    default:
      return undefined;
  }
}

export function createRealtimeSubscriptionService(
  input: CreateRealtimeSubscriptionServiceInput = {},
): RealtimeSubscriptionService {
  const env = input.env ?? process.env;
  const now = input.now ?? (() => new Date().toISOString());
  const nowMs = input.nowMs ?? (() => Date.now());
  const logger = input.logger ?? defaultLogger();
  const heartbeatIntervalMs = input.heartbeatIntervalMs ?? 15_000;
  const maxConnectionsGlobal = parsePositiveInt(
    env.APZHUB_REALTIME_MAX_CONNECTIONS_GLOBAL,
    200,
    10_000,
  );
  const maxConnectionsPerTenant = parsePositiveInt(
    env.APZHUB_REALTIME_MAX_CONNECTIONS_PER_TENANT,
    50,
    2_000,
  );
  const maxQueuePerConnection = parsePositiveInt(
    env.APZHUB_REALTIME_MAX_QUEUE_PER_CONNECTION,
    64,
    1_000,
  );
  const replayBufferSize = parsePositiveInt(
    env.APZHUB_REALTIME_REPLAY_BUFFER_SIZE,
    100,
    2_000,
  );
  const idleTimeoutMs = parsePositiveInt(
    env.APZHUB_REALTIME_IDLE_TIMEOUT_MS,
    120_000,
    3_600_000,
  );
  const maxConnectionLifetimeMs = parsePositiveInt(
    env.APZHUB_REALTIME_MAX_CONNECTION_MS,
    1_800_000,
    86_400_000,
  );
  const duplicateWindowSize = parsePositiveInt(
    env.APZHUB_REALTIME_DUPLICATE_WINDOW,
    2_000,
    20_000,
  );

  const connections = new Map<string, Connection>();
  const replayByTenant = new Map<string, RealtimeWireMessage[]>();
  const recentIngestIds: string[] = [];
  const recentIngestIdSet = new Set<string>();

  let busAttached = false;
  let busSubscriptionId: string | undefined;
  let shuttingDown = false;
  let eventsDelivered = 0;
  let eventsDroppedBackpressure = 0;
  let eventsCoalesced = 0;
  let duplicatesSuppressed = 0;
  let replayedEvents = 0;
  let heartbeatsSent = 0;
  let authzDenials = 0;
  let tenantMismatches = 0;
  let organisationMismatches = 0;
  let idleTimeouts = 0;
  let gracefulDisconnects = 0;
  let lastEventAt: string | undefined;
  let connectionSeq = 0;

  function rememberIngestId(id: string): boolean {
    if (recentIngestIdSet.has(id)) {
      duplicatesSuppressed += 1;
      return false;
    }
    recentIngestIdSet.add(id);
    recentIngestIds.push(id);
    while (recentIngestIds.length > duplicateWindowSize) {
      const old = recentIngestIds.shift();
      if (old) recentIngestIdSet.delete(old);
    }
    return true;
  }

  function pushReplay(tenantId: string, message: RealtimeWireMessage): void {
    const buf = replayByTenant.get(tenantId) ?? [];
    buf.push(message);
    while (buf.length > replayBufferSize) buf.shift();
    replayByTenant.set(tenantId, buf);
  }

  function messagesAfter(tenantId: string, lastEventId: string): RealtimeWireMessage[] {
    const buf = replayByTenant.get(tenantId) ?? [];
    const idx = buf.findIndex((m) => m.id === lastEventId);
    if (idx < 0) return [];
    return buf.slice(idx + 1);
  }

  function countTenant(tenantId: string): number {
    let n = 0;
    for (const c of connections.values()) {
      if (c.tenantId === tenantId) n += 1;
    }
    return n;
  }

  function publishAudit(
    eventId: string,
    ctx: {
      readonly tenantId?: string;
      readonly userId?: string;
      readonly correlationId?: string;
      readonly payload?: Readonly<Record<string, unknown>>;
    },
  ): void {
    if (!input.auditPublisher) return;
    try {
      input.auditPublisher.publish({
        envelopeId: createDomainEventEnvelopeId(),
        eventId,
        eventVersion: "1.0.0",
        category: "security",
        correlationId: ctx.correlationId ?? `rt_audit_${nowMs()}`,
        timestamp: now(),
        publisher: "realtime-subscription-service",
        actorId: ctx.userId,
        sourceService: "realtime",
        tenantId: ctx.tenantId,
        payload: {
          transport: "sse",
          ...ctx.payload,
        },
      });
    } catch {
      /* fail-soft */
    }
  }

  function writeSse(
    conn: Connection,
    message: {
      readonly id?: string;
      readonly event?: string;
      readonly data?: string;
      readonly comment?: string;
    },
  ): boolean {
    if (!conn.controller) return false;
    try {
      conn.controller.enqueue(textEncoder.encode(encodeSse(message)));
      conn.lastWriteMs = nowMs();
      return true;
    } catch {
      return false;
    }
  }

  function closeConnection(
    conn: Connection,
    reason: string,
    options?: { readonly idle?: boolean; readonly shutdown?: boolean },
  ): void {
    if (!connections.has(conn.id)) return;
    writeSse(conn, {
      event: options?.shutdown
        ? "realtime.shutdown"
        : options?.idle
          ? "realtime.idle_timeout"
          : "realtime.disconnect",
      data: JSON.stringify({
        connectionId: conn.id,
        reason,
        at: now(),
      }),
      id: `${conn.id}:close`,
    });
    try {
      conn.controller?.close();
    } catch {
      /* already closed */
    }
    connections.delete(conn.id);
    gracefulDisconnects += 1;
    if (options?.idle) idleTimeouts += 1;
    logger.log("info", "realtime.connection.closed", {
      connectionId: conn.id,
      tenantId: conn.tenantId,
      userId: conn.userId,
      reason,
    });
    publishAudit("realtime.connection.closed", {
      tenantId: conn.tenantId,
      userId: conn.userId,
      correlationId: conn.correlationId,
      payload: { connectionId: conn.id, reason },
    });
  }

  function flushConnection(conn: Connection): void {
    if (!conn.controller) return;
    while (conn.queue.length > 0) {
      const message = conn.queue.shift()!;
      if (conn.deliveredIds.has(message.id)) {
        duplicatesSuppressed += 1;
        continue;
      }
      const ok = writeSse(conn, {
        id: message.id,
        event: message.event,
        data: JSON.stringify(message),
      });
      if (!ok) {
        closeConnection(conn, "write_failed");
        return;
      }
      conn.deliveredIds.add(message.id);
      if (conn.deliveredIds.size > duplicateWindowSize) {
        const first = conn.deliveredIds.values().next().value;
        if (first) conn.deliveredIds.delete(first);
      }
      conn.lastWireEventMs = nowMs();
      eventsDelivered += 1;
      lastEventAt = message.timestamp;
    }
  }

  function pushToConnection(conn: Connection, message: RealtimeWireMessage): void {
    if (!conn.controller) return;
    if (conn.deliveredIds.has(message.id)) {
      duplicatesSuppressed += 1;
      return;
    }

    const key = coalesceKey(message);
    if (key) {
      const existingIdx = conn.queue.findIndex((m) => coalesceKey(m) === key);
      if (existingIdx >= 0) {
        conn.queue[existingIdx] = message;
        eventsCoalesced += 1;
        flushConnection(conn);
        return;
      }
    }

    if (conn.queue.length >= maxQueuePerConnection) {
      conn.queue.shift();
      conn.dropped += 1;
      eventsDroppedBackpressure += 1;
    }
    conn.queue.push(message);
    flushConnection(conn);
  }

  function connectionMayReceive(
    conn: Connection,
    message: RealtimeWireMessage,
  ): boolean {
    const isNotification = message.event.startsWith("notification.");
    const topic: RealtimeSubscriptionTopic = isNotification
      ? "notifications"
      : "support";
    if (!conn.topics.has(topic)) return false;
    const tenantId =
      typeof message.data.tenantId === "string" ? message.data.tenantId : undefined;
    if (tenantId && conn.tenantId !== tenantId) {
      tenantMismatches += 1;
      return false;
    }
    const eventOrg =
      typeof message.data.organisationId === "string"
        ? message.data.organisationId
        : undefined;
    if (conn.organisationId && eventOrg && conn.organisationId !== eventOrg) {
      organisationMismatches += 1;
      return false;
    }
    if (isNotification) {
      if (!hasNotificationRealtimePermission(conn.permissions)) {
        authzDenials += 1;
        return false;
      }
      const recipientId =
        typeof message.data.userId === "string" ? message.data.userId : undefined;
      if (recipientId && recipientId !== conn.userId) {
        return false;
      }
      return true;
    }
    if (!hasSupportRealtimePermission(conn.permissions)) {
      authzDenials += 1;
      return false;
    }
    return true;
  }

  function broadcast(message: RealtimeWireMessage): void {
    const tenantId =
      typeof message.data.tenantId === "string" ? message.data.tenantId : undefined;
    if (tenantId) pushReplay(tenantId, message);
    for (const conn of connections.values()) {
      if (!connectionMayReceive(conn, message)) continue;
      pushToConnection(conn, message);
    }
  }

  function ingestDomainEvent(envelope: DomainEventEnvelope): void {
    if (shuttingDown) return;
    if (!rememberIngestId(envelope.envelopeId)) return;
    const mapped =
      mapSupportDomainEventToWire(envelope) ??
      mapNotificationDomainEventToWire(envelope);
    if (!mapped) return;
    const list = Array.isArray(mapped) ? mapped : [mapped];
    for (const message of list) {
      // Derived wire ids (e.g. `:status`) need their own duplicate window entry.
      if (message.id !== envelope.envelopeId && !rememberIngestId(message.id)) {
        continue;
      }
      broadcast(message);
    }
  }

  async function revalidateSession(conn: Connection): Promise<boolean> {
    if (!input.validateSession) return true;
    try {
      return await input.validateSession({
        tenantId: conn.tenantId,
        userId: conn.userId,
        sessionId: conn.sessionId,
        correlationId: conn.correlationId,
      });
    } catch {
      return false;
    }
  }

  return {
    isEnabled: () => isRealtimeSseEnabled(env),

    attachEventBus(bus) {
      if (busSubscriptionId) {
        bus.unsubscribe(busSubscriptionId);
      }
      // Primary subscription id retained for teardown; notification pattern attached additively.
      busSubscriptionId = bus.subscribe({
        eventPattern: "support.*",
        handler: (envelope) => {
          ingestDomainEvent(envelope);
        },
      });
      bus.subscribe({
        eventPattern: "notification.*",
        handler: (envelope) => {
          ingestDomainEvent(envelope);
        },
      });
      busAttached = true;
      logger.log("info", "realtime.bus.attached", {
        pattern: "support.*|notification.*",
      });
    },

    ingestDomainEvent,

    openSseStream(ctx, options = {}) {
      if (shuttingDown) {
        throw Object.assign(new Error("Realtime service is shutting down"), {
          code: "REALTIME_SHUTTING_DOWN" as const,
        });
      }
      if (!isRealtimeSseEnabled(env)) {
        throw Object.assign(
          new Error("Realtime SSE is not enabled (APZHUB_REALTIME_SSE_ENABLED)."),
          { code: "REALTIME_DISABLED" as const },
        );
      }
      if (!ctx.tenantId?.trim() || !ctx.userId?.trim()) {
        authzDenials += 1;
        publishAudit("realtime.connection.denied", {
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          correlationId: ctx.correlationId,
          payload: { reason: "unauthenticated" },
        });
        throw Object.assign(new Error("Authenticated tenant and user required"), {
          code: "REALTIME_UNAUTHORIZED" as const,
        });
      }
      const permissions = ctx.permissions ?? [];
      const topics = new Set<RealtimeSubscriptionTopic>(
        options.topics?.length ? options.topics : ["support"],
      );
      const wantsSupport = topics.has("support");
      const wantsNotifications = topics.has("notifications");
      const allowedSupport = wantsSupport && hasSupportRealtimePermission(permissions);
      const allowedNotifications =
        wantsNotifications && hasNotificationRealtimePermission(permissions);
      if (!allowedSupport && !allowedNotifications) {
        authzDenials += 1;
        publishAudit("realtime.connection.denied", {
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          correlationId: ctx.correlationId,
          payload: { reason: "permission_denied" },
        });
        throw Object.assign(
          new Error("Forbidden — missing realtime topic permission"),
          { code: "REALTIME_FORBIDDEN" as const },
        );
      }
      if (wantsSupport && !allowedSupport) topics.delete("support");
      if (wantsNotifications && !allowedNotifications) {
        topics.delete("notifications");
      }
      if (connections.size >= maxConnectionsGlobal) {
        throw Object.assign(new Error("Global realtime connection limit reached"), {
          code: "REALTIME_CAPACITY" as const,
        });
      }
      if (countTenant(ctx.tenantId) >= maxConnectionsPerTenant) {
        throw Object.assign(new Error("Tenant realtime connection limit reached"), {
          code: "REALTIME_CAPACITY" as const,
        });
      }
      connectionSeq += 1;
      const connectionId = `rt_${Date.now().toString(36)}_${connectionSeq}`;
      const createdAtMs = nowMs();
      const conn: Connection = {
        id: connectionId,
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        userId: ctx.userId,
        sessionId: options.sessionId ?? ctx.execution?.extras?.sessionId,
        correlationId: ctx.correlationId,
        permissions,
        topics,
        queue: [],
        deliveredIds: new Set(),
        createdAt: now(),
        createdAtMs,
        lastWriteMs: createdAtMs,
        lastWireEventMs: createdAtMs,
        dropped: 0,
      };

      let heartbeatTimer: ReturnType<typeof setInterval> | undefined;

      const stream = new ReadableStream<Uint8Array>({
        start(controller) {
          conn.controller = controller;
          connections.set(connectionId, conn);

          writeSse(conn, {
            event: "realtime.ready",
            data: JSON.stringify({
              connectionId,
              transport: "sse",
              topics: [...topics],
              resumedFrom: options.lastEventId ?? null,
              organisationScoped: Boolean(conn.organisationId),
              at: now(),
            }),
            id: connectionId,
          });

          if (options.lastEventId) {
            const replay = messagesAfter(ctx.tenantId, options.lastEventId);
            for (const message of replay) {
              if (!connectionMayReceive(conn, message)) continue;
              pushToConnection(conn, message);
              replayedEvents += 1;
            }
            logger.log("info", "realtime.last_event_id.resume", {
              connectionId,
              lastEventId: options.lastEventId,
              replayed: replay.length,
            });
          }

          logger.log("info", "realtime.connection.opened", {
            connectionId,
            tenantId: conn.tenantId,
            organisationId: conn.organisationId,
            userId: conn.userId,
          });
          publishAudit("realtime.connection.opened", {
            tenantId: conn.tenantId,
            userId: conn.userId,
            correlationId: conn.correlationId,
            payload: {
              connectionId,
              organisationId: conn.organisationId,
              topics: [...topics],
            },
          });

          heartbeatTimer = setInterval(() => {
            void (async () => {
              const current = connections.get(connectionId);
              if (!current) {
                if (heartbeatTimer) clearInterval(heartbeatTimer);
                return;
              }
              const age = nowMs() - current.createdAtMs;
              if (age >= maxConnectionLifetimeMs) {
                if (heartbeatTimer) clearInterval(heartbeatTimer);
                closeConnection(current, "max_connection_lifetime");
                return;
              }
              // Idle = no business wire events for idleTimeoutMs (heartbeats excluded).
              const idleFor = nowMs() - current.lastWireEventMs;
              if (idleFor >= idleTimeoutMs) {
                if (heartbeatTimer) clearInterval(heartbeatTimer);
                closeConnection(current, "idle_timeout", { idle: true });
                return;
              }
              const sessionOk = await revalidateSession(current);
              if (!sessionOk) {
                if (heartbeatTimer) clearInterval(heartbeatTimer);
                closeConnection(current, "session_revoked");
                return;
              }
              const ok = writeSse(current, {
                event: "realtime.heartbeat",
                data: JSON.stringify({
                  connectionId: current.id,
                  at: now(),
                }),
                id: `${current.id}:hb:${nowMs()}`,
              });
              if (!ok) {
                if (heartbeatTimer) clearInterval(heartbeatTimer);
                closeConnection(current, "heartbeat_write_failed");
                return;
              }
              heartbeatsSent += 1;
            })();
          }, heartbeatIntervalMs);

          options.signal?.addEventListener("abort", () => {
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            const current = connections.get(connectionId);
            if (current) {
              closeConnection(current, "client_abort");
            }
          });
        },
        cancel() {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          const current = connections.get(connectionId);
          if (current) {
            connections.delete(connectionId);
            gracefulDisconnects += 1;
            logger.log("info", "realtime.connection.cancelled", {
              connectionId,
              tenantId: current.tenantId,
            });
            publishAudit("realtime.connection.closed", {
              tenantId: current.tenantId,
              userId: current.userId,
              correlationId: current.correlationId,
              payload: { connectionId, reason: "stream_cancel" },
            });
          }
        },
      });

      return stream;
    },

    shutdown(reason = "server_shutdown") {
      shuttingDown = true;
      logger.log("warn", "realtime.shutdown", {
        reason,
        activeConnections: connections.size,
      });
      publishAudit("realtime.shutdown", {
        payload: { reason, activeConnections: connections.size },
      });
      for (const conn of [...connections.values()]) {
        closeConnection(conn, reason, { shutdown: true });
      }
    },

    getDiagnostics(_ctx) {
      const connectionsByTenant: Record<string, number> = {};
      for (const c of connections.values()) {
        connectionsByTenant[c.tenantId] = (connectionsByTenant[c.tenantId] ?? 0) + 1;
      }
      return {
        enabled: isRealtimeSseEnabled(env),
        transport: "sse",
        activeConnections: connections.size,
        connectionsByTenant,
        eventsDelivered,
        eventsDroppedBackpressure,
        eventsCoalesced,
        duplicatesSuppressed,
        replayedEvents,
        heartbeatsSent,
        authzDenials,
        tenantMismatches,
        organisationMismatches,
        idleTimeouts,
        gracefulDisconnects,
        lastEventAt,
        busAttached,
        shuttingDown,
        maxConnectionsGlobal,
        maxConnectionsPerTenant,
        maxQueuePerConnection,
        replayBufferSize,
        idleTimeoutMs,
      };
    },

    getHealth(_ctx) {
      const enabled = isRealtimeSseEnabled(env);
      if (!enabled) {
        return {
          status: "disabled",
          enabled: false,
          transport: "sse",
          busAttached,
          activeConnections: connections.size,
          shuttingDown,
          message: "APZHUB_REALTIME_SSE_ENABLED is not enabled",
        };
      }
      if (shuttingDown) {
        return {
          status: "unhealthy",
          enabled: true,
          transport: "sse",
          busAttached,
          activeConnections: connections.size,
          shuttingDown: true,
          message: "Realtime service shutting down",
        };
      }
      if (!busAttached) {
        return {
          status: "degraded",
          enabled: true,
          transport: "sse",
          busAttached: false,
          activeConnections: connections.size,
          shuttingDown: false,
          message: "Event Bus not attached",
        };
      }
      return {
        status: "healthy",
        enabled: true,
        transport: "sse",
        busAttached: true,
        activeConnections: connections.size,
        shuttingDown: false,
      };
    },
  };
}
