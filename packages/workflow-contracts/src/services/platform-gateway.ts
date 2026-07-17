/**
 * Nested Workflow Platform gateway facets (APZWORKFLOW-002).
 * Context is structurally compatible with ServiceRequestContext (no package cycle).
 */

import type {
  Workflow,
  WorkflowAuditEntry,
  WorkflowCategory,
  WorkflowFolder,
  WorkflowSummary,
  WorkflowTemplate,
  WorkflowValidationResult,
  WorkflowVersion,
} from "../domain/workflow";
import type {
  WorkflowCategoryId,
  WorkflowFolderId,
  WorkflowId,
  WorkflowTemplateId,
  WorkflowVersionId,
} from "../identifiers";
import type {
  CreateWorkflowCategoryInput,
  CreateWorkflowFolderInput,
  CreateWorkflowInput,
  CreateWorkflowTemplateInput,
  CreateWorkflowVersionInput,
  FindWorkflowsInput,
  TransitionWorkflowLifecycleInput,
  UpdateWorkflowInput,
  UpdateWorkflowTemplateInput,
  ValidateWorkflowInput,
} from "./workflow-service";
import type { WorkflowEngineGateway } from "./engine-gateway";

/**
 * Gateway request context for workflow platform services.
 * Structurally compatible with ServiceRequestContext — mapped in platform-services.
 */
export type WorkflowPlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type WorkflowService = {
  create(
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowInput,
  ): Promise<Workflow>;
  get(
    ctx: WorkflowPlatformServiceContext,
    workflowId: WorkflowId,
  ): Promise<Workflow>;
  update(
    ctx: WorkflowPlatformServiceContext,
    input: UpdateWorkflowInput,
  ): Promise<Workflow>;
  delete(
    ctx: WorkflowPlatformServiceContext,
    workflowId: WorkflowId,
  ): Promise<void>;
  find(
    ctx: WorkflowPlatformServiceContext,
    input?: FindWorkflowsInput,
  ): Promise<readonly WorkflowSummary[]>;
  publish(
    ctx: WorkflowPlatformServiceContext,
    workflowId: WorkflowId,
  ): Promise<Workflow>;
  archive(
    ctx: WorkflowPlatformServiceContext,
    workflowId: WorkflowId,
  ): Promise<Workflow>;
  restore(
    ctx: WorkflowPlatformServiceContext,
    workflowId: WorkflowId,
  ): Promise<Workflow>;
  transition(
    ctx: WorkflowPlatformServiceContext,
    input: TransitionWorkflowLifecycleInput,
  ): Promise<Workflow>;
};

export type WorkflowVersionService = {
  create(
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowVersionInput,
  ): Promise<WorkflowVersion>;
  get(
    ctx: WorkflowPlatformServiceContext,
    versionId: WorkflowVersionId,
  ): Promise<WorkflowVersion>;
  list(
    ctx: WorkflowPlatformServiceContext,
    workflowId: WorkflowId,
  ): Promise<readonly WorkflowVersion[]>;
};

export type WorkflowTemplateService = {
  create(
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowTemplateInput,
  ): Promise<WorkflowTemplate>;
  get(
    ctx: WorkflowPlatformServiceContext,
    templateId: WorkflowTemplateId,
  ): Promise<WorkflowTemplate>;
  update(
    ctx: WorkflowPlatformServiceContext,
    input: UpdateWorkflowTemplateInput,
  ): Promise<WorkflowTemplate>;
  delete(
    ctx: WorkflowPlatformServiceContext,
    templateId: WorkflowTemplateId,
  ): Promise<void>;
  list(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowTemplate[]>;
};

export type WorkflowCategoryService = {
  create(
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowCategoryInput,
  ): Promise<WorkflowCategory>;
  get(
    ctx: WorkflowPlatformServiceContext,
    categoryId: WorkflowCategoryId,
  ): Promise<WorkflowCategory | null>;
  list(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowCategory[]>;
};

export type WorkflowFolderService = {
  create(
    ctx: WorkflowPlatformServiceContext,
    input: CreateWorkflowFolderInput,
  ): Promise<WorkflowFolder>;
  get(
    ctx: WorkflowPlatformServiceContext,
    folderId: WorkflowFolderId,
  ): Promise<WorkflowFolder | null>;
  list(ctx: WorkflowPlatformServiceContext): Promise<readonly WorkflowFolder[]>;
};

export type WorkflowValidationService = {
  validate(
    ctx: WorkflowPlatformServiceContext,
    input: ValidateWorkflowInput,
  ): Promise<WorkflowValidationResult>;
};

export type WorkflowAuditService = {
  list(
    ctx: WorkflowPlatformServiceContext,
    workflowId: WorkflowId,
  ): Promise<readonly WorkflowAuditEntry[]>;
};

/**
 * Nested workflow gateway surface (APZWORKFLOW-002 / APZWORKFLOW-007).
 * Products consume via PlatformServiceGateway.workflow — never persistence repos.
 * `engine` is the read-only Workflow Engine adapter surface (n8n via Platform Services).
 */
export type WorkflowPlatformGateway = {
  readonly workflows: WorkflowService;
  readonly versions: WorkflowVersionService;
  readonly templates: WorkflowTemplateService;
  readonly categories: WorkflowCategoryService;
  readonly folders: WorkflowFolderService;
  readonly validation: WorkflowValidationService;
  readonly audit: WorkflowAuditService;
  readonly engine: WorkflowEngineGateway;
};
