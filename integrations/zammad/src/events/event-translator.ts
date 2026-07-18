import type {
  EventTranslationResult,
  IntegrationEventAction,
  IntegrationEventEnvelope,
  IntegrationEventResource,
  IntegrationEventType,
} from "@apzhub/platform-service-contracts";

import type { ZammadWebhookPayload } from "../internal/zammad-api-types";
import {
  toSupportArticleId,
  toSupportGroupId,
  toSupportOrganizationId,
  toSupportTicketId,
  toSupportUserId,
} from "../mappers/mapper-context";

export const ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES = [
  "ticket",
  "article",
  "organization",
  "group",
  "user",
  "assignment",
  "priority",
  "state",
  "attachment",
] as const;

export type ZammadWebhookEventType =
  (typeof ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES)[number];

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function readNumericId(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  const id = data.id;
  if (typeof id === "number") return String(id);
  if (typeof id === "string" && id.length > 0) return id;
  return undefined;
}

function readString(
  data: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const value = data?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function normalizeVendorEvent(payload: ZammadWebhookPayload): string {
  const explicit = (payload.event ?? payload.type ?? "").trim().toLowerCase();
  if (explicit) {
    if (explicit === "ticket" || explicit === "support_request") return "ticket";
    if (explicit === "ticket_article" || explicit === "ticket::article")
      return "article";
    return explicit;
  }
  if (payload.article) return "article";
  if (payload.ticket) return "ticket";
  if (payload.organization) return "organization";
  if (payload.group) return "group";
  if (payload.user) return "user";
  return "unknown";
}

function normalizeVendorAction(
  payload: ZammadWebhookPayload,
  vendorEvent: string,
): string {
  const explicit = (payload.action ?? "").trim().toLowerCase();
  if (explicit) return explicit;

  const changes = payload.changes ?? {};
  if (vendorEvent === "ticket") {
    if ("state" in changes || "state_id" in changes) {
      const stateChange = changes.state ?? changes.state_id;
      const toValue = Array.isArray(stateChange)
        ? String(stateChange[1] ?? "").toLowerCase()
        : "";
      if (toValue.includes("close")) return "close";
      if (toValue.includes("open") || toValue.includes("new")) return "reopen";
      return "state";
    }
    if ("owner" in changes || "owner_id" in changes) return "assignment";
    if ("priority" in changes || "priority_id" in changes) return "priority";
    return "update";
  }
  if (vendorEvent === "article") return "create";
  return "update";
}

function mapResource(vendorEvent: string): IntegrationEventResource {
  switch (vendorEvent) {
    case "ticket":
      return "support_request";
    case "article":
      return "article";
    case "organization":
      return "organization";
    case "group":
      return "group";
    case "user":
      return "support_user";
    case "attachment":
      return "article";
    default:
      return "unknown";
  }
}

function mapCanonicalResourceId(
  resource: IntegrationEventResource,
  vendorId: string | undefined,
): string | undefined {
  if (!vendorId) return undefined;
  switch (resource) {
    case "support_request":
      return toSupportTicketId(vendorId);
    case "article":
      return toSupportArticleId(vendorId);
    case "organization":
      return toSupportOrganizationId(vendorId);
    case "group":
      return toSupportGroupId(vendorId);
    case "support_user":
      return toSupportUserId(vendorId);
    default:
      return vendorId;
  }
}

function inferAction(
  vendorEvent: string,
  vendorAction: string,
):
  | { readonly action: IntegrationEventAction; readonly type: IntegrationEventType }
  | undefined {
  const normalized = vendorAction.toLowerCase();

  if (vendorEvent === "ticket") {
    if (normalized === "create" || normalized === "created") {
      return { action: "created", type: "support_request.created" };
    }
    if (normalized === "close" || normalized === "closed") {
      return { action: "closed", type: "support_request.closed" };
    }
    if (normalized === "reopen" || normalized === "reopened") {
      return { action: "reopened", type: "support_request.reopened" };
    }
    if (
      normalized === "assignment" ||
      normalized === "assign" ||
      normalized === "assigned"
    ) {
      return { action: "assigned", type: "support_request.assigned" };
    }
    if (normalized === "unassign" || normalized === "unassigned") {
      return { action: "unassigned", type: "support_request.unassigned" };
    }
    if (normalized === "priority" || normalized === "priority_changed") {
      return { action: "priority_changed", type: "support_request.priority_changed" };
    }
    if (normalized === "state" || normalized === "state_changed") {
      return { action: "state_changed", type: "support_request.state_changed" };
    }
    if (normalized === "update" || normalized === "updated") {
      return { action: "updated", type: "support_request.updated" };
    }
  }

  if (vendorEvent === "article") {
    if (normalized === "create" || normalized === "created") {
      return { action: "created", type: "article.created" };
    }
    if (normalized === "update" || normalized === "updated") {
      return { action: "updated", type: "article.updated" };
    }
  }

  if (vendorEvent === "attachment") {
    return { action: "attachment_added", type: "attachment.metadata_recorded" };
  }

  if (vendorEvent === "organization") {
    if (normalized === "create" || normalized === "created") {
      return { action: "created", type: "organization.created" };
    }
    if (normalized === "archive" || normalized === "archived") {
      return { action: "archived", type: "organization.archived" };
    }
    return { action: "updated", type: "organization.updated" };
  }

  if (vendorEvent === "group") {
    if (normalized === "create" || normalized === "created") {
      return { action: "created", type: "group.created" };
    }
    return { action: "updated", type: "group.updated" };
  }

  if (vendorEvent === "user") {
    if (normalized === "create" || normalized === "created") {
      return { action: "created", type: "support_user.created" };
    }
    return { action: "updated", type: "support_user.updated" };
  }

  if (vendorEvent === "assignment") {
    return { action: "assigned", type: "support_request.assigned" };
  }
  if (vendorEvent === "priority") {
    return { action: "priority_changed", type: "support_request.priority_changed" };
  }
  if (vendorEvent === "state") {
    return { action: "state_changed", type: "support_request.state_changed" };
  }

  return undefined;
}

function buildSummary(
  type: IntegrationEventType,
  resourceId: string | undefined,
): string {
  return resourceId ? `${type} (${resourceId})` : type;
}

function resolveOccurredAt(payload: ZammadWebhookPayload): string {
  return (
    payload.updated_at ??
    payload.created_at ??
    readString(asRecord(payload.ticket), "updated_at") ??
    readString(asRecord(payload.article), "created_at") ??
    new Date().toISOString()
  );
}

function resolveVendorResourceId(
  vendorEvent: string,
  payload: ZammadWebhookPayload,
): string | undefined {
  switch (vendorEvent) {
    case "ticket":
    case "assignment":
    case "priority":
    case "state":
      return readNumericId(asRecord(payload.ticket));
    case "article":
    case "attachment":
      return (
        readNumericId(asRecord(payload.article)) ??
        readNumericId(asRecord(payload.ticket))
      );
    case "organization":
      return readNumericId(asRecord(payload.organization));
    case "group":
      return readNumericId(asRecord(payload.group));
    case "user":
      return readNumericId(asRecord(payload.user));
    default:
      return undefined;
  }
}

/**
 * Translate Zammad webhook payloads into canonical Support integration events.
 * Unknown events are ignored safely — never thrown.
 */
export function translateZammadWebhookPayload(
  payload: unknown,
  options: { readonly deliveryId?: string; readonly correlationId?: string } = {},
): EventTranslationResult {
  const record = asRecord(payload);
  if (!record) {
    return {
      ok: false,
      ignored: true,
      reason: "payload_not_object",
    };
  }

  const typed = record as unknown as ZammadWebhookPayload;
  const vendorEvent = normalizeVendorEvent(typed);
  const vendorAction = normalizeVendorAction(typed, vendorEvent);

  if (vendorEvent === "unknown") {
    return {
      ok: true,
      ignored: true,
      reason: "unsupported_vendor_event",
      vendorEvent,
      vendorAction,
    };
  }

  const supported = (
    ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES as readonly string[]
  ).includes(vendorEvent);
  if (!supported) {
    return {
      ok: true,
      ignored: true,
      reason: "unsupported_vendor_event",
      vendorEvent,
      vendorAction,
    };
  }

  const mapped = inferAction(vendorEvent, vendorAction);
  if (!mapped) {
    const resource = mapResource(vendorEvent);
    const vendorId = resolveVendorResourceId(vendorEvent, typed);
    const resourceId = mapCanonicalResourceId(resource, vendorId);
    return {
      ok: true,
      ignored: true,
      reason: "unmapped_action",
      vendorEvent,
      vendorAction,
      event: {
        id: `ievt_zammad_${options.deliveryId ?? vendorId ?? "unknown"}`,
        type: "integration.unknown",
        resource,
        action: "unknown",
        occurredAt: resolveOccurredAt(typed),
        supportTicketId:
          resource === "support_request"
            ? resourceId
            : mapCanonicalResourceId(
                "support_request",
                readNumericId(asRecord(typed.ticket)),
              ),
        resourceId,
        correlationId: options.correlationId,
        deliveryId: options.deliveryId,
        summary: buildSummary("integration.unknown", resourceId),
      },
    };
  }

  const resource = mapResource(vendorEvent);
  const vendorId = resolveVendorResourceId(vendorEvent, typed);
  const resourceId = mapCanonicalResourceId(resource, vendorId);
  const supportTicketId =
    resource === "support_request"
      ? resourceId
      : mapCanonicalResourceId(
          "support_request",
          readNumericId(asRecord(typed.ticket)),
        );

  const event: IntegrationEventEnvelope = {
    id: `ievt_zammad_${options.deliveryId ?? `${vendorEvent}_${vendorId ?? "na"}`}`,
    type: mapped.type,
    resource,
    action: mapped.action,
    occurredAt: resolveOccurredAt(typed),
    supportTicketId,
    resourceId,
    correlationId: options.correlationId,
    deliveryId: options.deliveryId,
    summary: buildSummary(mapped.type, resourceId),
  };

  return {
    ok: true,
    ignored: false,
    event,
    vendorEvent,
    vendorAction,
  };
}
