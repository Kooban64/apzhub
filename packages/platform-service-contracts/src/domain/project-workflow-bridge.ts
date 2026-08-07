/**
 * APZ Projects ↔ APZ Workflow bridge contracts (Release 3.0 Gate P1).
 *
 * Projects owns operational intent.
 * Workflow owns approval execution.
 * Projects consumes outcomes — no duplicate approval engine.
 */

export const PROJECTS_APPROVAL_KINDS = [
  "hold_approval",
  "closure_approval",
  "governance_approval",
  "checkpoint_approval",
  "exception_approval",
] as const;

export type ProjectsApprovalKind = (typeof PROJECTS_APPROVAL_KINDS)[number];

export const PROJECTS_APPROVAL_BINDING_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "cancelled",
  "unavailable",
] as const;

export type ProjectsApprovalBindingStatus =
  (typeof PROJECTS_APPROVAL_BINDING_STATUSES)[number];

export type ProjectsApprovalSubjectType =
  "project" | "checkpoint" | "exception" | "baseline" | "lifecycle_transition";

export type RequestProjectsApprovalInput = {
  readonly kind: ProjectsApprovalKind;
  readonly projectId: string;
  readonly subjectType: ProjectsApprovalSubjectType;
  readonly subjectId: string;
  readonly title: string;
  readonly reason?: string;
  /** Optional principal who must decide (Workflow assignee hint). */
  readonly assigneePrincipalId?: string;
};

export type ApplyProjectsApprovalOutcomeInput = {
  readonly outcome: "approved" | "rejected" | "cancelled";
  readonly comment?: string;
  /** When outcome originates from Workflow task completion. */
  readonly workflowTaskId?: string;
};

export type ProjectsApprovalBinding = {
  readonly id: string;
  readonly kind: ProjectsApprovalKind;
  readonly projectId: string;
  readonly subjectType: ProjectsApprovalSubjectType;
  readonly subjectId: string;
  readonly title: string;
  readonly reason?: string;
  readonly status: ProjectsApprovalBindingStatus;
  readonly workflowRunId?: string;
  readonly workflowTaskId?: string;
  readonly workflowUnavailableReason?: string;
  readonly requestedBy: string;
  readonly decidedBy?: string;
  readonly decidedAt?: string;
  readonly comment?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type ProjectsWorkflowBridgeHealth = {
  readonly available: boolean;
  readonly providerId?: string;
  readonly reason?: string;
};
