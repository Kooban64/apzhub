import type {
  EventTranslationResult,
  IntegrationEventAction,
  IntegrationEventEnvelope,
  IntegrationEventResource,
  IntegrationEventType,
} from "@apzhub/platform-service-contracts";

import type { PlaneWebhookPayload } from "../internal/plane-api-types";
import {
  toCommentId,
  toModuleId,
  toProjectId,
  toSprintId,
  toTaskId,
  toUserId,
} from "../mappers/mapper-context";

const SUPPORTED_VENDOR_EVENTS = new Set([
  "project",
  "issue",
  "cycle",
  "module",
  "issue_comment",
  "label",
  "member",
  "state",
  "webhook",
]);

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  return value as Record<string, unknown>;
}

function readId(data: Record<string, unknown> | undefined): string | undefined {
  if (!data) return undefined;
  const id = data.id;
  return typeof id === "string" && id.length > 0 ? id : undefined;
}

function readString(data: Record<string, unknown> | undefined, key: string): string | undefined {
  const value = data?.[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

function mapResource(vendorEvent: string): IntegrationEventResource {
  switch (vendorEvent) {
    case "project":
      return "project";
    case "issue":
      return "task";
    case "issue_comment":
      return "comment";
    case "cycle":
      return "cycle";
    case "module":
      return "module";
    case "label":
      return "label";
    case "member":
      return "member";
    case "state":
      return "state";
    case "webhook":
      return "webhook";
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
    case "project":
      return toProjectId(vendorId);
    case "task":
      return toTaskId(vendorId);
    case "comment":
      return toCommentId(vendorId);
    case "cycle":
      return toSprintId(vendorId);
    case "module":
      return toModuleId(vendorId);
    case "member":
      return `member_plane_${vendorId}`;
    case "label":
      return `label_plane_${vendorId}`;
    case "state":
      return `status_plane_${vendorId}`;
    case "webhook":
      return `webhook_plane_${vendorId}`;
    default:
      return vendorId;
  }
}

function inferAction(
  vendorEvent: string,
  vendorAction: string,
  activityField?: string,
): { readonly action: IntegrationEventAction; readonly type: IntegrationEventType } {
  const normalized = vendorAction.toLowerCase();

  if (vendorEvent === "issue" && activityField === "state") {
    return { action: "state_changed", type: "task.state_changed" };
  }
  if (vendorEvent === "issue" && (activityField === "assignees" || activityField === "assignee")) {
    return { action: "assigned", type: "task.assigned" };
  }
  if (vendorEvent === "issue" && activityField === "labels") {
    return { action: "label_changed", type: "task.label_changed" };
  }
  if (vendorEvent === "issue" && activityField === "cycle") {
    return { action: "cycle_changed", type: "task.cycle_changed" };
  }
  if (vendorEvent === "issue" && activityField === "module") {
    return { action: "module_changed", type: "task.module_changed" };
  }

  if (normalized === "create" || normalized === "created") {
    if (vendorEvent === "issue_comment") return { action: "commented", type: "comment.created" };
    if (vendorEvent === "member") return { action: "membership_changed", type: "member.added" };
    if (vendorEvent === "project") return { action: "created", type: "project.created" };
    if (vendorEvent === "issue") return { action: "created", type: "task.created" };
    if (vendorEvent === "cycle") return { action: "created", type: "cycle.created" };
    if (vendorEvent === "module") return { action: "created", type: "module.created" };
    if (vendorEvent === "label") return { action: "created", type: "label.created" };
    if (vendorEvent === "state") return { action: "created", type: "state.created" };
    if (vendorEvent === "webhook") return { action: "created", type: "webhook.created" };
  }

  if (normalized === "update" || normalized === "updated") {
    if (vendorEvent === "issue_comment") return { action: "updated", type: "comment.updated" };
    if (vendorEvent === "member") return { action: "membership_changed", type: "member.updated" };
    if (vendorEvent === "project") return { action: "updated", type: "project.updated" };
    if (vendorEvent === "issue") return { action: "updated", type: "task.updated" };
    if (vendorEvent === "cycle") return { action: "updated", type: "cycle.updated" };
    if (vendorEvent === "module") return { action: "updated", type: "module.updated" };
    if (vendorEvent === "label") return { action: "updated", type: "label.updated" };
    if (vendorEvent === "state") return { action: "updated", type: "state.updated" };
    if (vendorEvent === "webhook") return { action: "updated", type: "webhook.updated" };
  }

  if (normalized === "delete" || normalized === "deleted") {
    if (vendorEvent === "issue_comment") return { action: "deleted", type: "comment.deleted" };
    if (vendorEvent === "member") return { action: "membership_changed", type: "member.removed" };
    if (vendorEvent === "project") return { action: "deleted", type: "project.deleted" };
    if (vendorEvent === "issue") return { action: "deleted", type: "task.deleted" };
    if (vendorEvent === "cycle") return { action: "deleted", type: "cycle.deleted" };
    if (vendorEvent === "module") return { action: "deleted", type: "module.deleted" };
    if (vendorEvent === "label") return { action: "deleted", type: "label.deleted" };
    if (vendorEvent === "state") return { action: "deleted", type: "state.deleted" };
    if (vendorEvent === "webhook") return { action: "deleted", type: "webhook.deleted" };
  }

  if (normalized === "archive" || normalized === "archived") {
    if (vendorEvent === "project") return { action: "archived", type: "project.archived" };
    if (vendorEvent === "issue") return { action: "archived", type: "task.archived" };
    if (vendorEvent === "cycle") return { action: "archived", type: "cycle.archived" };
    if (vendorEvent === "module") return { action: "archived", type: "module.archived" };
  }

  return { action: "unknown", type: "integration.unknown" };
}

function occurredAt(data: Record<string, unknown> | undefined): string {
  return (
    readString(data, "updated_at") ??
    readString(data, "created_at") ??
    new Date().toISOString()
  );
}

/**
 * Translate Plane webhook payloads into canonical APZHUB integration events.
 * Unknown events are ignored with structured diagnostics (never thrown).
 */
export function translatePlaneWebhookPayload(
  payload: unknown,
  options: { readonly deliveryId?: string; readonly correlationId?: string } = {},
): EventTranslationResult {
  const body = asRecord(payload);
  if (!body) {
    return {
      ok: false,
      ignored: true,
      reason: "payload_not_object",
    };
  }

  const vendorEvent = typeof body.event === "string" ? body.event.toLowerCase() : "";
  const vendorAction = typeof body.action === "string" ? body.action.toLowerCase() : "";

  if (!vendorEvent || !vendorAction) {
    return {
      ok: false,
      ignored: true,
      reason: "missing_event_or_action",
      vendorEvent: vendorEvent || undefined,
      vendorAction: vendorAction || undefined,
    };
  }

  if (!SUPPORTED_VENDOR_EVENTS.has(vendorEvent)) {
    return {
      ok: true,
      ignored: true,
      reason: "unsupported_vendor_event",
      vendorEvent,
      vendorAction,
    };
  }

  const data = asRecord(body.data);
  const activity = asRecord(body.activity);
  const activityField =
    typeof activity?.field === "string" ? activity.field.toLowerCase() : undefined;
  const resource = mapResource(vendorEvent);
  const mapped = inferAction(vendorEvent, vendorAction, activityField);
  const vendorId = readId(data);
  const resourceId = mapCanonicalResourceId(resource, vendorId);
  const projectVendorId = readString(data, "project") ?? readString(data, "project_id");
  const actorVendorId =
    readString(data, "updated_by") ??
    readString(data, "created_by") ??
    readString(data, "actor");

  const event: IntegrationEventEnvelope = {
    id: `event_plane_${options.deliveryId ?? body.webhook_id ?? `${vendorEvent}-${vendorAction}-${vendorId ?? "unknown"}`}`,
    type: mapped.type,
    resource,
    action: mapped.action,
    occurredAt: occurredAt(data),
    workspaceId:
      typeof body.workspace_id === "string"
        ? `ws_plane_${body.workspace_id}`
        : undefined,
    projectId: projectVendorId ? toProjectId(projectVendorId) : undefined,
    resourceId,
    actorId: actorVendorId ? toUserId(actorVendorId) : undefined,
    correlationId: options.correlationId,
    deliveryId: options.deliveryId,
    summary: `${mapped.type} (${vendorEvent}.${vendorAction})`,
  };

  if (mapped.type === "integration.unknown") {
    return {
      ok: true,
      ignored: true,
      reason: "unmapped_action",
      vendorEvent,
      vendorAction,
      event,
    };
  }

  return {
    ok: true,
    ignored: false,
    event,
    vendorEvent,
    vendorAction,
  };
}

export function isPlaneWebhookPayload(value: unknown): value is PlaneWebhookPayload {
  const body = asRecord(value);
  return Boolean(body && typeof body.event === "string" && typeof body.action === "string");
}

export const PLANE_SUPPORTED_WEBHOOK_EVENT_TYPES = [
  "project",
  "issue",
  "cycle",
  "module",
  "issue_comment",
] as const;
