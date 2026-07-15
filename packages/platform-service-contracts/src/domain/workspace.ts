import type { UserId, WorkspaceId } from "./identifiers";

export interface Workspace {
  readonly id: WorkspaceId;
  readonly tenantId: string;
  readonly name: string;
  readonly slug: string;
  readonly url?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkspaceSummary {
  readonly id: WorkspaceId;
  readonly name: string;
  readonly slug: string;
}

export interface WorkspaceMembership {
  readonly workspaceId: WorkspaceId;
  readonly userId: UserId;
  readonly role: WorkspaceRole;
  readonly joinedAt: string;
}

export type WorkspaceRole = "viewer" | "member" | "admin";
