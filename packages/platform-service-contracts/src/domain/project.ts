import type { ProjectId, UserId, WorkspaceId } from "./identifiers";

export type ProjectStatus = "draft" | "active" | "on_hold" | "completed" | "archived";

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
