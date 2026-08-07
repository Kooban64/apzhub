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
  readonly owner?: string;
  readonly ownerUserId?: string;
  readonly dependencyIds?: readonly string[];
  readonly progressPercent?: number;
  readonly status?:
    | "planned"
    | "at_risk"
    | "slipped"
    | "achieved"
    | "cancelled"
    | "open"
    | "completed"
    | "missed";
  readonly confidence?: "high" | "medium" | "low";
  readonly failureConsequence?: string;
  readonly exitCriteria?: string;
  readonly baselineDueAt?: string;
  readonly sortKey?: number;
}

export interface UpdateMilestoneInput {
  readonly name?: string;
  readonly description?: string;
  readonly targetDate?: string;
  /** Required when targetDate moves beyond governance tolerance. */
  readonly dateChangeReason?: string;
  readonly owner?: string;
  readonly ownerUserId?: string;
  readonly dependencyIds?: readonly string[];
  readonly progressPercent?: number;
  readonly status?:
    | "planned"
    | "at_risk"
    | "slipped"
    | "achieved"
    | "cancelled"
    | "open"
    | "completed"
    | "missed";
  readonly confidence?: "high" | "medium" | "low";
  readonly failureConsequence?: string;
  readonly exitCriteria?: string;
  readonly baselineDueAt?: string;
  readonly sortKey?: number;
  readonly achievementEvidence?: readonly {
    readonly type:
      | "document"
      | "approval"
      | "deliverable"
      | "external_reference"
      | "verification_note";
    readonly label: string;
    readonly uri?: string;
    readonly documentId?: string;
  }[];
  readonly evidenceOptional?: boolean;
}

export interface CreateProjectRiskInput {
  readonly title: string;
  readonly description: string;
  readonly probability: "low" | "medium" | "high" | "critical";
  readonly impact: "low" | "medium" | "high" | "critical";
  readonly mitigation: string;
  readonly owner: string;
  readonly reviewDate?: string;
  readonly status?: "open" | "mitigating" | "closed" | "accepted";
}

export interface UpdateProjectRiskInput {
  readonly title?: string;
  readonly description?: string;
  readonly probability?: "low" | "medium" | "high" | "critical";
  readonly impact?: "low" | "medium" | "high" | "critical";
  readonly mitigation?: string;
  readonly owner?: string;
  readonly reviewDate?: string;
  readonly status?: "open" | "mitigating" | "closed" | "accepted";
}

export interface CreateProjectDecisionInput {
  readonly decision: string;
  readonly rationale: string;
  readonly owner: string;
  readonly decidedAt?: string;
  readonly outcome: string;
  readonly relatedWork?: string;
}

export interface UpdateProjectDecisionInput {
  readonly decision?: string;
  readonly rationale?: string;
  readonly owner?: string;
  readonly decidedAt?: string;
  readonly outcome?: string;
  readonly relatedWork?: string;
}

export interface CreateProjectActionInput {
  readonly title: string;
  readonly owner: string;
  readonly dueDate?: string;
  readonly status?: "open" | "done" | "cancelled";
}

export interface UpdateProjectActionInput {
  readonly title?: string;
  readonly owner?: string;
  readonly dueDate?: string;
  readonly status?: "open" | "done" | "cancelled";
}

export interface BusinessJourneyStageInput {
  readonly id?: string;
  readonly name: string;
  readonly description?: string;
  readonly order: number;
  readonly responsibility?: string;
  readonly entryCondition?: string;
  readonly exitCondition?: string;
}

export interface BusinessJourneyTransitionInput {
  readonly id?: string;
  readonly fromStageId: string;
  readonly toStageId: string;
  readonly name: string;
  readonly outcome?: string;
}

export interface CreateBusinessJourneyInput {
  readonly name: string;
  readonly summary: string;
  readonly outcomes?: readonly string[];
  readonly stages?: readonly BusinessJourneyStageInput[];
  readonly transitions?: readonly BusinessJourneyTransitionInput[];
  readonly processOwner: string;
  readonly businessSteward: string;
  readonly reviewCycleDays?: number;
  readonly templateKey?: string;
  readonly publicationStatus?: "draft" | "review" | "approved" | "retired";
}

export interface UpdateBusinessJourneyInput {
  readonly name?: string;
  readonly summary?: string;
  readonly outcomes?: readonly string[];
  readonly stages?: readonly BusinessJourneyStageInput[];
  readonly transitions?: readonly BusinessJourneyTransitionInput[];
  readonly processOwner?: string;
  readonly businessSteward?: string;
  readonly reviewCycleDays?: number | null;
  readonly publicationStatus?: "draft" | "review" | "approved" | "retired";
}

export interface TransitionBusinessJourneyGovernanceInput {
  readonly publicationStatus: "draft" | "review" | "approved" | "retired";
  readonly notes?: string;
}

export interface CreateBusinessProcessInstanceInput {
  readonly journeyId: string;
  readonly title: string;
  readonly currentStageId?: string;
  readonly dueAt?: string;
}

export interface UpdateBusinessProcessInstanceInput {
  readonly title?: string;
  readonly currentStageId?: string;
  readonly status?: "active" | "completed" | "cancelled";
  readonly dueAt?: string | null;
}

export interface GenerateDecisionPackInput {
  readonly questionId: string;
  readonly audienceRole:
    "executive" | "manager" | "project_manager" | "support_manager" | "team_member";
}

export interface CreateDecisionKpiInput {
  readonly name: string;
  readonly description: string;
  readonly owner: string;
  readonly targetValue: number;
  readonly currentValue: number;
  readonly unit: string;
  readonly domain:
    | "project_delivery"
    | "support_performance"
    | "workflow_throughput"
    | "operational_quality";
}

export interface UpdateDecisionKpiInput {
  readonly name?: string;
  readonly description?: string;
  readonly owner?: string;
  readonly targetValue?: number;
  readonly currentValue?: number;
  readonly unit?: string;
}

export interface CreateDecisionTimelineEntryInput {
  readonly title: string;
  readonly decision: string;
  readonly rationale: string;
  readonly decidedBy: string;
  readonly decidedAt?: string;
  readonly evidenceRefs?: readonly string[];
  readonly relatedQuestionId?: string;
  readonly relatedProduct?: string;
  readonly sourceRecordRef?: string;
}

export interface CreateKnowledgeLessonInput {
  readonly title: string;
  readonly summary: string;
  readonly context: string;
  readonly situation: string;
  readonly resolution: string;
  readonly recommendation: string;
  readonly owner: string;
  readonly relatedProducts?: readonly string[];
  readonly relatedCapabilities?: readonly string[];
  readonly tags?: readonly string[];
  readonly reviewDate?: string;
  readonly expiresAt?: string;
}

export interface CreateKnowledgeLibraryItemInput {
  readonly title: string;
  readonly summary: string;
  readonly content: string;
  readonly owner: string;
  readonly libraryCategory:
    | "standards"
    | "procedures"
    | "best_practices"
    | "operational_guides"
    | "reference_material";
  readonly relatedProducts?: readonly string[];
  readonly relatedCapabilities?: readonly string[];
  readonly tags?: readonly string[];
  readonly reviewDate?: string;
  readonly expiresAt?: string;
}

export interface CreateDecisionKnowledgeInput {
  readonly title: string;
  readonly summary: string;
  readonly rationale: string;
  readonly owner: string;
  readonly decisionRef: string;
  readonly relatedQuestionId?: string;
  readonly relatedProducts?: readonly string[];
  readonly tags?: readonly string[];
  readonly reviewDate?: string;
}

export interface UpdateKnowledgeObjectInput {
  readonly title?: string;
  readonly summary?: string;
  readonly body?: Record<string, unknown>;
  readonly owner?: string;
  readonly tags?: readonly string[];
  readonly relatedProducts?: readonly string[];
  readonly relatedCapabilities?: readonly string[];
  readonly reviewDate?: string | null;
  readonly expiresAt?: string | null;
  readonly decisionRef?: string;
}

export interface TransitionKnowledgeLifecycleInput {
  readonly status: "draft" | "review" | "approved" | "archived";
  readonly note?: string;
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

/** Attachment descriptor for article create — inline base64 binary (R12-SUP-02). */
export interface SupportArticleAttachmentDescriptor {
  readonly filename: string;
  readonly contentType?: string;
  /** Required for binary upload; max ~1 MiB decoded. */
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
