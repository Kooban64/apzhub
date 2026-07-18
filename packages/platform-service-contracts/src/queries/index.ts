import type { SprintStatus, TeamRole } from "../domain";
import type { ProjectModuleStatus } from "../domain/module";
import type { SupportHistoryAction } from "../domain/support";

export interface WorkspaceListFilter {
  readonly search?: string;
}

export interface ProjectListFilter {
  readonly search?: string;
  readonly status?: "active" | "archived" | "all";
  readonly workspaceId?: string;
}

export interface ProjectStateListFilter {
  readonly group?: string;
}

export interface LabelListFilter {
  readonly search?: string;
}

export interface CycleListFilter {
  readonly status?: SprintStatus | "all";
}

export interface ModuleListFilter {
  readonly status?: ProjectModuleStatus | "all";
}

export interface MemberListFilter {
  readonly role?: TeamRole;
}

export interface TaskListFilter {
  readonly search?: string;
  readonly status?: string;
  readonly statusId?: string;
  readonly assigneeId?: string;
  readonly sprintId?: string;
  readonly labelId?: string;
  readonly priority?: string;
  readonly projectModuleId?: string;
  readonly parentTaskId?: string | null;
  readonly archived?: boolean;
  /** Inclusive lower bound (ISO-8601 date or datetime). */
  readonly createdAfter?: string;
  /** Inclusive upper bound (ISO-8601 date or datetime). */
  readonly createdBefore?: string;
  /** Inclusive lower bound (ISO-8601 date or datetime). */
  readonly updatedAfter?: string;
  /** Inclusive upper bound (ISO-8601 date or datetime). */
  readonly updatedBefore?: string;
}

export interface TeamListFilter {
  readonly search?: string;
  readonly projectId?: string;
  readonly role?: TeamRole;
}

export interface UserListFilter {
  readonly search?: string;
  readonly status?: "active" | "inactive" | "invited" | "all";
}

export interface SearchFilter {
  readonly kinds?: readonly string[];
  readonly workspaceId?: string;
  readonly projectId?: string;
}

export interface ActivityListFilter {
  readonly taskId?: string;
  readonly actorId?: string;
  readonly action?: string;
  /** Inclusive lower bound (ISO-8601). */
  readonly occurredAfter?: string;
  /** Inclusive upper bound (ISO-8601). */
  readonly occurredBefore?: string;
}

export interface CommentListFilter {
  readonly authorId?: string;
  readonly search?: string;
}

export type WorkspaceSortField = "name" | "slug" | "createdAt" | "updatedAt";
export type ProjectSortField =
  "name" | "identifier" | "status" | "createdAt" | "updatedAt";
export type TaskSortField =
  "title" | "status" | "priority" | "rank" | "createdAt" | "updatedAt";
export type TeamSortField = "role" | "joinedAt";
export type UserSortField = "displayName" | "email" | "createdAt";
export type SearchSortField = "score" | "title";

/** Support Request list filters — vendor-neutral. */
export interface SupportTicketListFilter {
  readonly search?: string;
  readonly title?: string;
  readonly displayId?: string;
  readonly status?: string;
  readonly priority?: string;
  readonly groupId?: string;
  readonly assigneeId?: string | null;
  readonly requesterId?: string;
  readonly organizationId?: string;
  readonly active?: boolean;
}

export interface SupportOrganizationListFilter {
  readonly search?: string;
  readonly active?: boolean;
}

export interface SupportGroupListFilter {
  readonly search?: string;
  readonly active?: boolean;
}

export interface SupportUserListFilter {
  readonly search?: string;
  readonly email?: string;
  readonly login?: string;
  readonly active?: boolean;
  readonly role?: "agent" | "customer" | "admin" | "unknown";
}

export type SupportTicketSortField =
  "title" | "displayId" | "status" | "priority" | "createdAt" | "updatedAt";
export type SupportOrganizationSortField = "name" | "createdAt" | "updatedAt";
export type SupportGroupSortField = "name" | "createdAt" | "updatedAt";
export type SupportUserSortField =
  "displayName" | "email" | "login" | "createdAt" | "updatedAt";

export interface SupportArticleListFilter {
  readonly visibility?: "internal" | "public";
  readonly channel?: string;
  readonly authorId?: string;
  readonly senderType?: "agent" | "customer" | "system" | "unknown";
  /** Inclusive lower bound (ISO-8601). */
  readonly createdAfter?: string;
  /** Inclusive upper bound (ISO-8601). */
  readonly createdBefore?: string;
}

export type SupportArticleSortField = "createdAt" | "updatedAt";

export interface SupportSearchFilter {
  readonly kinds?: readonly (
    "support_request" | "organization" | "group" | "user" | "article"
  )[];
  readonly supportTicketId?: string;
  readonly organizationId?: string;
  readonly groupId?: string;
}

export type SupportSearchSortField = "score" | "updatedAt" | "title";

export interface SupportHistoryListFilter {
  readonly actions?: readonly SupportHistoryAction[];
  readonly actorId?: string;
  /** Inclusive lower bound (ISO-8601). */
  readonly occurredAfter?: string;
  /** Inclusive upper bound (ISO-8601). */
  readonly occurredBefore?: string;
}

export type SupportHistorySortField = "occurredAt";
