import type { ProjectId, TeamId, TeamMemberId, UserId } from "./identifiers";

export type TeamRole = "viewer" | "member" | "admin";

export interface Team {
  readonly id: TeamId;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TeamMember {
  readonly id: TeamMemberId;
  readonly projectId: ProjectId;
  readonly userId: UserId;
  readonly role: TeamRole;
  readonly joinedAt: string;
}

export interface TeamSummary {
  readonly id: TeamId;
  readonly name: string;
}
