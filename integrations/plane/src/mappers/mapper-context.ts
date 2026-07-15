/** Provisional canonical ID helpers — SDK IdentityMapper with plane slug. */

import { createIdentityMapper } from "@apzhub/integration-sdk/mapping";

export interface MapperContext {
  readonly tenantId: string;
  readonly workspaceId?: string;
}

const ids = createIdentityMapper("plane");

export function toWorkspaceId(planeId: string): string {
  return ids.toProvisionalId("ws", planeId);
}

export function toProjectId(planeId: string): string {
  return ids.toProvisionalId("proj", planeId);
}

export function toStatusId(planeId: string): string {
  return ids.toProvisionalId("status", planeId);
}

export function toLabelId(planeId: string): string {
  return ids.toProvisionalId("label", planeId);
}

export function toSprintId(planeId: string): string {
  return ids.toProvisionalId("sprint", planeId);
}

export function toModuleId(planeId: string): string {
  return ids.toProvisionalId("module", planeId);
}

export function toMemberId(planeId: string): string {
  return ids.toProvisionalId("member", planeId);
}

export function toTaskId(planeId: string): string {
  return ids.toProvisionalId("task", planeId);
}

export function toCommentId(planeId: string): string {
  return ids.toProvisionalId("comment", planeId);
}

export function toActivityId(planeId: string): string {
  return ids.toProvisionalId("activity", planeId);
}

export function toWatcherId(planeId: string): string {
  return ids.toProvisionalId("watcher", planeId);
}

export function toUserId(planeUserId: string): string {
  return ids.toProvisionalId("user", planeUserId);
}

export function extractPlaneId(canonicalId: string, prefix: string): string {
  return ids.extractNativeId(canonicalId, prefix);
}

export function extractProjectPlaneId(projectId: string): string {
  return extractPlaneId(projectId, "proj");
}

export function extractTaskPlaneId(taskId: string): string {
  return extractPlaneId(taskId, "task");
}

export function extractCommentPlaneId(commentId: string): string {
  return extractPlaneId(commentId, "comment");
}

export function extractWatcherPlaneId(watcherId: string): string {
  return extractPlaneId(watcherId, "watcher");
}
