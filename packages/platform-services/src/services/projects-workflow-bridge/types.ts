import type {
  ApplyProjectsApprovalOutcomeInput,
  ProjectsApprovalBinding,
  ProjectsApprovalKind,
  ProjectsApprovalSubjectType,
  ProjectsWorkflowBridgeHealth,
  RequestProjectsApprovalInput,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

export type WorkflowApprovalExecutorResult =
  | {
      readonly available: true;
      readonly runId: string;
      readonly taskId: string;
      readonly providerId: string;
    }
  | {
      readonly available: false;
      readonly reason: string;
    };

export type WorkflowApprovalExecutor = {
  readonly health: (
    ctx: ServiceRequestContext,
  ) => Promise<ProjectsWorkflowBridgeHealth>;
  readonly startApproval: (
    ctx: ServiceRequestContext,
    input: {
      readonly kind: ProjectsApprovalKind;
      readonly projectId: string;
      readonly subjectType: ProjectsApprovalSubjectType;
      readonly subjectId: string;
      readonly title: string;
      readonly reason?: string;
      readonly assigneePrincipalId?: string;
    },
  ) => Promise<WorkflowApprovalExecutorResult>;
  readonly readDecision: (
    ctx: ServiceRequestContext,
    taskId: string,
  ) => Promise<"pending" | "approved" | "rejected" | null>;
  readonly decide: (
    ctx: ServiceRequestContext,
    taskId: string,
    outcome: "approved" | "rejected",
    comment?: string,
  ) => Promise<"approved" | "rejected">;
};

export type ProjectsWorkflowBridgeStore = {
  readonly get: (
    tenantId: string,
    bindingId: string,
  ) => Promise<ProjectsApprovalBinding | null>;
  readonly listForProject: (
    tenantId: string,
    projectId: string,
  ) => Promise<readonly ProjectsApprovalBinding[]>;
  readonly findOpenForSubject: (
    tenantId: string,
    projectId: string,
    subjectType: ProjectsApprovalSubjectType,
    subjectId: string,
    kind: ProjectsApprovalKind,
  ) => Promise<ProjectsApprovalBinding | null>;
  readonly findLatestForSubject: (
    tenantId: string,
    projectId: string,
    subjectType: ProjectsApprovalSubjectType,
    subjectId: string,
    kind: ProjectsApprovalKind,
  ) => Promise<ProjectsApprovalBinding | null>;
  readonly upsert: (
    tenantId: string,
    binding: ProjectsApprovalBinding,
  ) => Promise<ProjectsApprovalBinding>;
};

export type ProjectsWorkflowBridge = {
  readonly health: (
    ctx: ServiceRequestContext,
  ) => Promise<ProjectsWorkflowBridgeHealth>;
  readonly requestApproval: (
    ctx: ServiceRequestContext,
    input: RequestProjectsApprovalInput,
  ) => Promise<ProjectsApprovalBinding>;
  readonly getBinding: (
    ctx: ServiceRequestContext,
    bindingId: string,
  ) => Promise<ProjectsApprovalBinding | null>;
  readonly listBindings: (
    ctx: ServiceRequestContext,
    projectId: string,
  ) => Promise<readonly ProjectsApprovalBinding[]>;
  readonly hasApproved: (
    ctx: ServiceRequestContext,
    projectId: string,
    kind: ProjectsApprovalKind,
    subjectType: ProjectsApprovalSubjectType,
    subjectId: string,
  ) => Promise<boolean>;
  readonly applyOutcome: (
    ctx: ServiceRequestContext,
    bindingId: string,
    input: ApplyProjectsApprovalOutcomeInput,
  ) => Promise<ProjectsApprovalBinding>;
  readonly syncFromWorkflow: (
    ctx: ServiceRequestContext,
    bindingId: string,
  ) => Promise<ProjectsApprovalBinding | null>;
};
