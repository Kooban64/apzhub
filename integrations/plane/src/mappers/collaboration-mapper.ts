import type {
  ActivityEntry,
  Comment,
  Watcher,
} from "@apzhub/platform-service-contracts";

import type {
  PlaneActivityRecord,
  PlaneCommentRecord,
  PlaneSubscriberRecord,
} from "../internal/plane-api-types";
import {
  toActivityId,
  toCommentId,
  toProjectId,
  toTaskId,
  toUserId,
  toWatcherId,
} from "./mapper-context";

function resolveActorId(
  actor: string | { readonly id: string } | null | undefined,
): string {
  if (!actor) {
    return toUserId("unknown");
  }
  if (typeof actor === "string") {
    return toUserId(actor);
  }
  return toUserId(actor.id);
}

function resolveCommentBody(record: PlaneCommentRecord): string {
  if (typeof record.comment_stripped === "string" && record.comment_stripped.length > 0) {
    return record.comment_stripped;
  }
  if (typeof record.comment === "string" && record.comment.length > 0) {
    return record.comment;
  }
  if (typeof record.comment_html === "string") {
    return record.comment_html.replace(/<[^>]+>/g, "").trim();
  }
  return "";
}

export function mapPlaneComment(
  record: PlaneCommentRecord,
  taskId: string,
): Comment {
  const planeTaskId =
    typeof record.issue === "string" && record.issue.length > 0
      ? record.issue
      : undefined;
  return {
    id: toCommentId(record.id),
    taskId: planeTaskId ? toTaskId(planeTaskId) : taskId,
    authorId: resolveActorId(record.actor),
    body: resolveCommentBody(record),
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  };
}

export function mapCommentToPlaneCreateBody(body: string): Record<string, unknown> {
  return {
    comment_html: `<p>${escapeHtml(body)}</p>`,
    comment_stripped: body,
  };
}

export function mapCommentToPlaneUpdateBody(body: string): Record<string, unknown> {
  return mapCommentToPlaneCreateBody(body);
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function mapPlaneActivity(
  record: PlaneActivityRecord,
  projectId: string,
  taskId?: string,
): ActivityEntry {
  const action = record.verb ?? record.field ?? "updated";
  const summaryParts = [
    action,
    record.field ? `field=${record.field}` : undefined,
    record.old_value != null ? `from=${record.old_value}` : undefined,
    record.new_value != null ? `to=${record.new_value}` : undefined,
    record.comment ? record.comment : undefined,
  ].filter((part): part is string => Boolean(part));

  const planeIssueId =
    typeof record.issue === "string" && record.issue.length > 0 ? record.issue : undefined;
  const planeProjectId =
    typeof record.project === "string" && record.project.length > 0
      ? record.project
      : undefined;

  return {
    id: toActivityId(record.id),
    projectId: planeProjectId ? toProjectId(planeProjectId) : projectId,
    taskId: planeIssueId ? toTaskId(planeIssueId) : taskId,
    actorId: resolveActorId(record.actor),
    action,
    summary: summaryParts.join(" "),
    occurredAt: record.created_at,
  };
}

function resolveSubscriberUserId(
  subscriber: string | { readonly id: string },
): string {
  return typeof subscriber === "string" ? toUserId(subscriber) : toUserId(subscriber.id);
}

export function mapPlaneSubscriber(
  record: PlaneSubscriberRecord,
  taskId: string,
): Watcher {
  const planeIssueId =
    typeof record.issue === "string" && record.issue.length > 0 ? record.issue : undefined;
  return {
    id: toWatcherId(record.id),
    taskId: planeIssueId ? toTaskId(planeIssueId) : taskId,
    userId: resolveSubscriberUserId(record.subscriber),
    createdAt: record.created_at ?? new Date(0).toISOString(),
  };
}
