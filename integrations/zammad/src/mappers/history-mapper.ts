import type {
  SupportHistoryAction,
  SupportHistoryActor,
  SupportHistoryEvent,
  SupportHistoryFieldChange,
  SupportTimeline,
} from "../models/canonical";
import type { ZammadHistoryRecord } from "../internal/zammad-api-types";
import {
  type MapperContext,
  toSupportArticleId,
  toSupportHistoryEventId,
  toSupportTicketId,
  toSupportUserId,
} from "./mapper-context";

const ACTION_BY_TYPE: Readonly<Record<string, SupportHistoryAction>> = {
  created: "created",
  create: "created",
  updated: "updated",
  update: "updated",
  "notification triggered": "updated",
};

const FIELD_ACTION: Readonly<Record<string, SupportHistoryAction>> = {
  state: "state_changed",
  state_id: "state_changed",
  owner: "owner_changed",
  owner_id: "owner_changed",
  priority: "priority_changed",
  priority_id: "priority_changed",
  customer: "customer_changed",
  customer_id: "customer_changed",
  organization: "organization_changed",
  organization_id: "organization_changed",
  group: "group_changed",
  group_id: "group_changed",
};

function normalizeType(record: ZammadHistoryRecord): string {
  return (record.history_type ?? record.type ?? "").trim().toLowerCase();
}

function normalizeObject(record: ZammadHistoryRecord): string {
  return (record.history_object ?? record.object ?? "").trim().toLowerCase();
}

function normalizeAttribute(record: ZammadHistoryRecord): string {
  return (record.attribute ?? "").trim().toLowerCase();
}

export function mapZammadHistoryAction(
  record: ZammadHistoryRecord,
): SupportHistoryAction {
  const objectName = normalizeObject(record);
  const type = normalizeType(record);
  const attribute = normalizeAttribute(record);

  if (objectName.includes("article") || type.includes("article")) {
    return "article_created";
  }
  if (
    objectName.includes("attachment") ||
    type.includes("attachment") ||
    attribute === "attachment" ||
    attribute.includes("attachment")
  ) {
    return "attachment_added";
  }
  if (attribute && FIELD_ACTION[attribute]) {
    return FIELD_ACTION[attribute]!;
  }
  if (ACTION_BY_TYPE[type]) {
    return ACTION_BY_TYPE[type]!;
  }
  if (type.includes("state")) return "state_changed";
  if (type.includes("owner")) return "owner_changed";
  if (type.includes("priority")) return "priority_changed";
  return "unknown";
}

export function mapZammadHistoryActor(
  record: ZammadHistoryRecord,
): SupportHistoryActor {
  if (record.created_by_id === undefined || record.created_by_id === null) {
    return { kind: "system", displayName: "System" };
  }
  if (record.created_by_id === 1) {
    return { kind: "system", displayName: "System", userId: toSupportUserId(1) };
  }
  return {
    kind: "agent",
    userId: toSupportUserId(record.created_by_id),
  };
}

function mapFieldChanges(
  record: ZammadHistoryRecord,
  action: SupportHistoryAction,
): readonly SupportHistoryFieldChange[] | undefined {
  const attribute = record.attribute?.trim();
  if (!attribute && record.value_from == null && record.value_to == null) {
    return undefined;
  }
  const field =
    attribute ||
    (action === "state_changed"
      ? "state"
      : action === "owner_changed"
        ? "owner"
        : action === "priority_changed"
          ? "priority"
          : action === "customer_changed"
            ? "customer"
            : action === "organization_changed"
              ? "organization"
              : action === "group_changed"
                ? "group"
                : "value");

  return [
    {
      field,
      fromValue: record.value_from ?? undefined,
      toValue: record.value_to ?? undefined,
    },
  ];
}

function buildSummary(
  action: SupportHistoryAction,
  changes: readonly SupportHistoryFieldChange[] | undefined,
): string {
  const change = changes?.[0];
  switch (action) {
    case "created":
      return "Support request created";
    case "state_changed":
      return `State changed${change ? ` from ${change.fromValue ?? "—"} to ${change.toValue ?? "—"}` : ""}`;
    case "owner_changed":
      return `Owner changed${change ? ` to ${change.toValue ?? "—"}` : ""}`;
    case "priority_changed":
      return `Priority changed${change ? ` to ${change.toValue ?? "—"}` : ""}`;
    case "customer_changed":
      return "Customer assignment changed";
    case "organization_changed":
      return "Organization changed";
    case "group_changed":
      return "Group changed";
    case "article_created":
      return "Article created";
    case "attachment_added":
      return "Attachment metadata recorded";
    case "updated":
      return change ? `Updated ${change.field}` : "Support request updated";
    default:
      return "History event";
  }
}

export function mapZammadHistoryEvent(
  record: ZammadHistoryRecord,
  ctx: MapperContext,
  supportTicketId: string,
): SupportHistoryEvent {
  if (typeof record.id !== "number" || !record.created_at) {
    throw Object.assign(new Error("Invalid Zammad history response"), {
      category: "mapping" as const,
      code: "zammad.mapping.invalid_history",
      message: "Invalid Zammad history response",
      retryable: false,
      correlationId: "zammad-mapping",
    });
  }

  const action = mapZammadHistoryAction(record);
  const fieldChanges = mapFieldChanges(record, action);
  const ticketIdFromRecord = record.ticket_id ?? record.o_id;
  const resolvedTicketId =
    ticketIdFromRecord !== undefined
      ? toSupportTicketId(ticketIdFromRecord)
      : supportTicketId;

  return {
    id: toSupportHistoryEventId(record.id),
    supportTicketId: resolvedTicketId,
    action,
    summary: buildSummary(action, fieldChanges),
    actor: mapZammadHistoryActor(record),
    fieldChanges,
    articleId:
      action === "article_created" && record.sourceable_id
        ? toSupportArticleId(record.sourceable_id)
        : undefined,
    occurredAt: record.created_at,
  };
}

export function mapZammadHistoryTimeline(
  records: readonly ZammadHistoryRecord[],
  ctx: MapperContext,
  supportTicketId: string,
): SupportTimeline {
  const events = [...records]
    .map((record) => mapZammadHistoryEvent(record, ctx, supportTicketId))
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));

  return {
    supportTicketId,
    events,
    totalCount: events.length,
  };
}
