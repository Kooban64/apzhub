/** Projects Workbench view models — Platform API shapes only. */

export type ProjectStatus =
  | "draft"
  | "initiating"
  | "active"
  | "on_hold"
  | "closing"
  | "closed"
  | "archived"
  | "completed";

export type TaskStatus = "open" | "in_progress" | "blocked" | "done" | "cancelled";

export type TaskPriority = "none" | "low" | "medium" | "high" | "urgent";

export interface Project {
  readonly id: string;
  readonly tenantId: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly status: ProjectStatus;
  readonly leadId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface Task {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description?: string;
  readonly status: TaskStatus;
  readonly statusId: string;
  readonly priority: TaskPriority;
  readonly assigneeId?: string;
  readonly assigneeIds?: readonly string[];
  readonly sprintId?: string;
  readonly labelIds: readonly string[];
  readonly startDate?: string;
  readonly dueDate?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface WorkspaceSummary {
  readonly id: string;
  readonly name: string;
}

export interface ProjectsPaginationParams {
  readonly page?: number;
  readonly perPage?: number;
  readonly limit?: number;
  readonly cursor?: string;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
}

export interface ProjectListParams extends ProjectsPaginationParams {
  readonly status?: "active" | "archived" | "all";
  readonly workspaceId?: string;
}

export interface TaskListParams extends ProjectsPaginationParams {
  readonly projectId: string;
  readonly workspaceId?: string;
  readonly assigneeId?: string;
  readonly sprintId?: string;
  readonly priority?: TaskPriority;
  readonly search?: string;
}

export interface CreateProjectInput {
  readonly workspaceId: string;
  readonly name: string;
  readonly identifier: string;
  readonly description?: string;
  readonly leadId?: string;
}

export interface CreateTaskInput {
  readonly projectId: string;
  readonly title: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly assigneeId?: string;
}

export interface UpdateTaskInput {
  readonly title?: string;
  readonly description?: string;
  readonly priority?: TaskPriority;
  readonly statusId?: string;
  readonly assigneeId?: string | null;
  readonly sprintId?: string | null;
  readonly startDate?: string | null;
  readonly dueDate?: string | null;
}

export interface TransitionTaskInput {
  readonly statusId: string;
}

export interface AssignTaskInput {
  readonly assigneeId: string;
  readonly assigneeIds?: readonly string[];
}

export interface UpdateProjectInput {
  readonly name?: string;
  readonly identifier?: string;
  readonly description?: string;
  readonly leadId?: string;
}

export interface ProjectsCollectionResult<T> {
  readonly items: readonly T[];
  readonly page?: {
    readonly page?: number;
    readonly perPage?: number;
    readonly limit?: number;
    readonly hasMore?: boolean;
    readonly cursor?: string | null;
    readonly nextCursor?: string | null;
  };
}

export interface ProjectsHealthSnapshot {
  readonly status: string;
  readonly version?: string;
  readonly checks?: Record<string, string>;
  readonly details?: Record<string, string>;
}

export interface ProjectsApiRequestOptions {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
}

/** APZ-PROJECTS-CAPABILITY-001 — delivery registers (Projects SoR metadata). */

export type ProjectMilestoneStatus = "open" | "completed" | "missed";
export type ProjectRiskLevel = "low" | "medium" | "high" | "critical";
export type ProjectRiskStatus = "open" | "mitigating" | "closed" | "accepted";
export type ProjectActionStatus = "open" | "done" | "cancelled";
export type ProjectDeliveryHealthStatus = "green" | "amber" | "red";

export interface ProjectMilestone {
  readonly id: string;
  readonly projectId: string;
  readonly name: string;
  readonly description?: string;
  readonly targetDate?: string;
  readonly owner?: string;
  readonly status: ProjectMilestoneStatus;
  readonly dependencyIds: readonly string[];
  readonly progressPercent: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectRisk {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly description: string;
  readonly probability: ProjectRiskLevel;
  readonly impact: ProjectRiskLevel;
  readonly mitigation: string;
  readonly owner: string;
  readonly reviewDate?: string;
  readonly status: ProjectRiskStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectDecision {
  readonly id: string;
  readonly projectId: string;
  readonly decision: string;
  readonly rationale: string;
  readonly owner: string;
  readonly decidedAt: string;
  readonly outcome: string;
  readonly relatedWork?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectActionItem {
  readonly id: string;
  readonly projectId: string;
  readonly title: string;
  readonly owner: string;
  readonly dueDate?: string;
  readonly status: ProjectActionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProjectDeliveryHealth {
  readonly projectId: string;
  readonly status: ProjectDeliveryHealthStatus;
  readonly scheduleScore: ProjectDeliveryHealthStatus;
  readonly riskScore: ProjectDeliveryHealthStatus;
  readonly milestoneScore: ProjectDeliveryHealthStatus;
  readonly actionScore: ProjectDeliveryHealthStatus;
  readonly reasons: readonly string[];
  readonly computedAt: string;
}

export interface ProjectDeliveryDashboard {
  readonly projectId: string;
  readonly health: ProjectDeliveryHealth;
  readonly milestoneTotal: number;
  readonly milestoneCompleted: number;
  readonly openRisks: number;
  readonly criticalRisks: number;
  readonly openActions: number;
  readonly overdueActions: number;
  readonly upcomingMilestones: readonly ProjectMilestone[];
  readonly topRisks: readonly ProjectRisk[];
  readonly recentDecisions: readonly ProjectDecision[];
  readonly blockers: readonly string[];
}

export interface CreateProjectMilestoneInput {
  readonly name: string;
  readonly description?: string;
  readonly targetDate?: string;
  readonly owner?: string;
  readonly dependencyIds?: readonly string[];
  readonly progressPercent?: number;
  readonly status?: ProjectMilestoneStatus;
}

export interface UpdateProjectMilestoneInput {
  readonly name?: string;
  readonly description?: string;
  readonly targetDate?: string;
  readonly owner?: string;
  readonly dependencyIds?: readonly string[];
  readonly progressPercent?: number;
  readonly status?: ProjectMilestoneStatus;
}

export interface CreateProjectRiskInput {
  readonly title: string;
  readonly description: string;
  readonly probability: ProjectRiskLevel;
  readonly impact: ProjectRiskLevel;
  readonly mitigation: string;
  readonly owner: string;
  readonly reviewDate?: string;
  readonly status?: ProjectRiskStatus;
}

export interface UpdateProjectRiskInput {
  readonly title?: string;
  readonly description?: string;
  readonly probability?: ProjectRiskLevel;
  readonly impact?: ProjectRiskLevel;
  readonly mitigation?: string;
  readonly owner?: string;
  readonly reviewDate?: string;
  readonly status?: ProjectRiskStatus;
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
  readonly status?: ProjectActionStatus;
}

export interface UpdateProjectActionInput {
  readonly title?: string;
  readonly owner?: string;
  readonly dueDate?: string;
  readonly status?: ProjectActionStatus;
}
