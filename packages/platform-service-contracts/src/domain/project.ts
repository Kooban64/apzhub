import type { ProjectId, UserId, WorkspaceId } from "./identifiers";

/** Canonical lifecycle stages (W003). Legacy `completed` maps to `closed`. */
export type ProjectStatus =
  | "draft"
  | "initiating"
  | "active"
  | "on_hold"
  | "closing"
  | "closed"
  | "archived"
  | "completed";

export interface Project {
  readonly id: ProjectId;
  readonly tenantId: string;
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly status: ProjectStatus;
  readonly leadId?: UserId;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectSummary {
  readonly id: ProjectId;
  readonly workspaceId: WorkspaceId;
  readonly name: string;
  readonly identifier: string;
  readonly status: ProjectStatus;
}
