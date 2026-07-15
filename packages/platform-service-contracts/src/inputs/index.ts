import type {
  ProjectStatus,
  SprintStatus,
  StatusGroup,
  SupportArticleBodyFormat,
  SupportArticleChannel,
  SupportArticleVisibility,
  SupportTicketPriority,
  SupportTicketStatus,
  TaskPriority,
  TeamRole,
  Estimate,
} from "../domain";
import type { ProjectModuleStatus } from "../domain/module";

export interface CreateProjectInput {
  readonly workspaceId: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly leadId?: string;
}

export interface UpdateProjectInput {
  readonly name?: string;
  readonly identifier?: string;
  readonly description?: string;
  readonly leadId?: string | null;
  readonly status?: ProjectStatus;
}

export interface CreateProjectStateInput {
  readonly name: string;
  readonly group: StatusGroup | string;
  readonly color?: string;
  readonly order?: number;
}

export interface UpdateProjectStateInput {
  readonly name?: string;
  readonly group?: StatusGroup | string;
  readonly color?: string;
  readonly order?: number;
}

export interface CreateLabelInput {
  readonly name: string;
  readonly color?: string;
}

export interface UpdateLabelInput {
  readonly name?: string;
  readonly color?: string;
}

export interface CreateSprintInput {
  readonly name: string;
  readonly goal?: string;
  readonly startDate?: string;
  readonly endDate?: string;
}

export interface UpdateSprintInput {
  readonly name?: string;
  readonly goal?: string;
  readonly startDate?: string;
  readonly endDate?: string;
  readonly status?: SprintStatus;
}

/** Adapter-level cycle input — alias retained for connector compatibility. */
export type CreateCycleInput = CreateSprintInput;
export type UpdateCycleInput = UpdateSprintInput;

export interface CreateModuleInput {
  readonly name: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly targetDate?: string;
}

export interface UpdateModuleInput {
  readonly name?: string;
  readonly description?: string;
  readonly startDate?: string;
  readonly targetDate?: string;
  readonly status?: ProjectModuleStatus;
}

export interface CreateMilestoneInput {
  readonly name: string;
  readonly description?: string;
  readonly targetDate?: string;
}

export interface UpdateMilestoneInput {
  readonly name?: string;
  readonly description?: string;
  readonly targetDate?: string;
  readonly status?: "open" | "completed";
}

export interface CreateTaskInput {
  readonly title: string;
  readonly description?: string;
  readonly statusId?: string;
  readonly priority?: TaskPriority;
  readonly assigneeId?: string;
  /** Multiple assignees where the engine supports it; first maps to assigneeId. */
  readonly assigneeIds?: readonly string[];
  readonly sprintId?: string;
  readonly milestoneId?: string;
  readonly projectModuleId?: string;
  readonly parentTaskId?: string;
  readonly labelIds?: readonly string[];
  readonly startDate?: string;
  readonly dueDate?: string;
  readonly estimate?: Estimate;
}

export interface UpdateTaskInput {
  readonly title?: string;
  readonly description?: string;
  readonly statusId?: string;
  readonly priority?: TaskPriority;
  readonly assigneeId?: string | null;
  readonly assigneeIds?: readonly string[] | null;
  readonly sprintId?: string | null;
  readonly milestoneId?: string | null;
  readonly projectModuleId?: string | null;
  readonly parentTaskId?: string | null;
  readonly labelIds?: readonly string[];
  readonly startDate?: string | null;
  readonly dueDate?: string | null;
  readonly estimate?: Estimate | null;
}

export interface TransitionTaskStatusInput {
  readonly statusId: string;
}

export interface AssignTaskInput {
  readonly assigneeId: string | null;
  /** Replace full assignee set when the engine supports multi-assignee. */
  readonly assigneeIds?: readonly string[];
}

export interface ReorderBacklogInput {
  readonly taskIds: readonly string[];
}

export interface AssignTasksToSprintInput {
  readonly taskIds: readonly string[];
}

export interface AddTeamMemberInput {
  readonly userId: string;
  readonly role: TeamRole;
}

/** Adapter-level alias retained for connector compatibility. */
export type AddMemberInput = AddTeamMemberInput;

export interface UpdateTeamMemberInput {
  readonly role: TeamRole;
}

/** Adapter-level alias retained for connector compatibility. */
export type UpdateMemberInput = UpdateTeamMemberInput;

export interface AddCommentInput {
  readonly body: string;
}

export interface UpdateCommentInput {
  readonly body: string;
}

export interface AddWatcherInput {
  readonly userId: string;
}

export interface CreateUserInput {
  readonly email: string;
  readonly displayName: string;
}

export interface UpdateUserInput {
  readonly displayName?: string;
  readonly status?: "active" | "inactive";
}

export interface SearchQueryInput {
  readonly text: string;
  readonly limit?: number;
  readonly filters?: Readonly<Record<string, unknown>>;
  readonly workspaceId?: string;
}

export interface SearchSuggestInput {
  readonly text: string;
  readonly limit?: number;
}

/** Support Request create — vendor-neutral. */
export interface CreateSupportTicketInput {
  readonly title: string;
  readonly groupId: string;
  readonly requesterId: string;
  readonly assigneeId?: string;
  readonly organizationId?: string;
  readonly status?: SupportTicketStatus;
  readonly priority?: SupportTicketPriority;
  readonly tags?: readonly string[];
}

export interface UpdateSupportTicketInput {
  readonly title?: string;
  readonly groupId?: string;
  readonly requesterId?: string;
  readonly assigneeId?: string | null;
  readonly organizationId?: string | null;
  readonly status?: SupportTicketStatus;
  readonly priority?: SupportTicketPriority;
  readonly tags?: readonly string[];
}

export interface ChangeSupportTicketStateInput {
  readonly status: SupportTicketStatus;
}

export interface ChangeSupportTicketPriorityInput {
  readonly priority: SupportTicketPriority;
}

export interface AssignSupportTicketOwnerInput {
  readonly assigneeId: string | null;
}

export interface AssignSupportTicketCustomerInput {
  readonly requesterId: string;
}

export interface CreateSupportOrganizationInput {
  readonly name: string;
  readonly note?: string;
  readonly domain?: string;
  readonly shared?: boolean;
}

export interface UpdateSupportOrganizationInput {
  readonly name?: string;
  readonly note?: string;
  readonly domain?: string;
  readonly shared?: boolean;
  readonly active?: boolean;
}

export interface CreateSupportGroupInput {
  readonly name: string;
  readonly note?: string;
  readonly active?: boolean;
}

export interface UpdateSupportGroupInput {
  readonly name?: string;
  readonly note?: string;
  readonly active?: boolean;
}

/** Attachment metadata descriptor for article create — no filesystem paths or binary. */
export interface SupportArticleAttachmentDescriptor {
  readonly filename: string;
  readonly contentType?: string;
  /** Base64 data only when the provider requires inline association; prefer omit. */
  readonly dataBase64?: string;
  readonly sizeBytes?: number;
}

export interface CreateSupportArticleInput {
  readonly supportTicketId: string;
  readonly body: string;
  readonly bodyFormat?: SupportArticleBodyFormat;
  readonly subject?: string;
  readonly channel?: SupportArticleChannel;
  readonly visibility: SupportArticleVisibility;
  readonly senderType?: "agent" | "customer" | "system";
  readonly to?: readonly string[];
  readonly cc?: readonly string[];
  readonly bcc?: readonly string[];
  readonly attachments?: readonly SupportArticleAttachmentDescriptor[];
}

export interface CreateSupportInternalNoteInput {
  readonly supportTicketId: string;
  readonly body: string;
  readonly bodyFormat?: SupportArticleBodyFormat;
  readonly subject?: string;
  readonly attachments?: readonly SupportArticleAttachmentDescriptor[];
}

export interface CreateSupportCustomerReplyInput {
  readonly supportTicketId: string;
  readonly body: string;
  readonly bodyFormat?: SupportArticleBodyFormat;
  readonly subject?: string;
  readonly channel?: Exclude<SupportArticleChannel, "note" | "unknown">;
  readonly to?: readonly string[];
  readonly cc?: readonly string[];
  readonly bcc?: readonly string[];
  readonly attachments?: readonly SupportArticleAttachmentDescriptor[];
}
