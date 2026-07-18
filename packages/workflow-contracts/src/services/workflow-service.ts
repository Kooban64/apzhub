/**
 * Platform Workflow service contracts (APZWORKFLOW-001).
 * Metadata CRUD / validate / lifecycle ports only — NO execute.
 */

import type { WorkflowRequestContext } from "../common/context";
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
import type { WorkflowLifecycleState } from "../enums/catalogue";
import type {
  WorkflowAction,
  WorkflowCondition,
  WorkflowConnection,
  WorkflowGraphSnapshot,
  WorkflowParameter,
  WorkflowTrigger,
  WorkflowVariable,
} from "../domain/workflow";

export type CreateWorkflowInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
  readonly categoryId?: WorkflowCategoryId;
  readonly folderId?: WorkflowFolderId;
  readonly templateId?: WorkflowTemplateId;
};

export type UpdateWorkflowInput = {
  readonly workflowId: WorkflowId;
  readonly name?: string;
  readonly description?: string;
  readonly categoryId?: WorkflowCategoryId | null;
  readonly folderId?: WorkflowFolderId | null;
};

export type CreateWorkflowVersionInput = {
  readonly workflowId: WorkflowId;
  readonly graph: WorkflowGraphSnapshot;
  readonly variables?: readonly WorkflowVariable[];
  readonly parameters?: readonly WorkflowParameter[];
  readonly triggers?: readonly WorkflowTrigger[];
  readonly actions?: readonly WorkflowAction[];
  readonly conditions?: readonly WorkflowCondition[];
  readonly connections?: readonly WorkflowConnection[];
  readonly changeSummary?: string;
};

export type TransitionWorkflowLifecycleInput = {
  readonly workflowId: WorkflowId;
  readonly to: WorkflowLifecycleState;
  readonly reason?: string;
};

export type FindWorkflowsInput = {
  readonly query?: string;
  readonly lifecycle?: WorkflowLifecycleState;
  readonly categoryId?: WorkflowCategoryId;
  readonly folderId?: WorkflowFolderId;
  readonly limit?: number;
};

export type CreateWorkflowTemplateInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
  readonly categoryId?: WorkflowCategoryId;
  readonly graph: WorkflowGraphSnapshot;
  readonly parameters?: readonly WorkflowParameter[];
  readonly variables?: readonly WorkflowVariable[];
};

export type UpdateWorkflowTemplateInput = {
  readonly templateId: WorkflowTemplateId;
  readonly name?: string;
  readonly description?: string;
  readonly categoryId?: WorkflowCategoryId | null;
  readonly graph?: WorkflowGraphSnapshot;
  readonly parameters?: readonly WorkflowParameter[];
  readonly variables?: readonly WorkflowVariable[];
};

export type CreateWorkflowCategoryInput = {
  readonly name: string;
  readonly description?: string;
  readonly organisationId?: string;
  readonly parentCategoryId?: WorkflowCategoryId;
};

export type CreateWorkflowFolderInput = {
  readonly name: string;
  readonly organisationId?: string;
  readonly parentFolderId?: WorkflowFolderId;
  readonly path: string;
};

export type ValidateWorkflowInput = {
  readonly workflowId?: WorkflowId;
  readonly versionId?: WorkflowVersionId;
  readonly lifecycle?: WorkflowLifecycleState;
  readonly graph?: WorkflowGraphSnapshot;
  readonly variables?: readonly WorkflowVariable[];
  readonly parameters?: readonly WorkflowParameter[];
  readonly triggers?: readonly WorkflowTrigger[];
  readonly actions?: readonly WorkflowAction[];
  readonly conditions?: readonly WorkflowCondition[];
  readonly connections?: readonly WorkflowConnection[];
  readonly versionNumber?: number;
  readonly categoryId?: WorkflowCategoryId;
  readonly folderId?: WorkflowFolderId;
  readonly templateId?: WorkflowTemplateId;
};

/**
 * Flat Platform Workflow Service interface ports (APZWORKFLOW-001).
 * Intentionally excludes any execute / run / schedule method.
 *
 * @deprecated Prefer nested {@link WorkflowPlatformGateway} facets (APZWORKFLOW-002).
 * Kept as a composition façade for domain-core implementation wiring.
 */
export interface PlatformWorkflowService {
  createWorkflow(
    ctx: WorkflowRequestContext,
    input: CreateWorkflowInput,
  ): Promise<Workflow>;
  getWorkflow(ctx: WorkflowRequestContext, workflowId: WorkflowId): Promise<Workflow>;
  updateWorkflow(
    ctx: WorkflowRequestContext,
    input: UpdateWorkflowInput,
  ): Promise<Workflow>;
  deleteWorkflow(ctx: WorkflowRequestContext, workflowId: WorkflowId): Promise<void>;
  findWorkflows(
    ctx: WorkflowRequestContext,
    input?: FindWorkflowsInput,
  ): Promise<readonly WorkflowSummary[]>;

  createVersion(
    ctx: WorkflowRequestContext,
    input: CreateWorkflowVersionInput,
  ): Promise<WorkflowVersion>;
  getVersion(
    ctx: WorkflowRequestContext,
    versionId: WorkflowVersionId,
  ): Promise<WorkflowVersion>;
  listVersions(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<readonly WorkflowVersion[]>;

  validateWorkflow(
    ctx: WorkflowRequestContext,
    input: ValidateWorkflowInput,
  ): Promise<WorkflowValidationResult>;

  publishWorkflow(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<Workflow>;
  archiveWorkflow(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<Workflow>;
  restoreWorkflow(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<Workflow>;
  transitionLifecycle(
    ctx: WorkflowRequestContext,
    input: TransitionWorkflowLifecycleInput,
  ): Promise<Workflow>;

  createTemplate(
    ctx: WorkflowRequestContext,
    input: CreateWorkflowTemplateInput,
  ): Promise<WorkflowTemplate>;
  getTemplate(
    ctx: WorkflowRequestContext,
    templateId: WorkflowTemplateId,
  ): Promise<WorkflowTemplate>;
  updateTemplate(
    ctx: WorkflowRequestContext,
    input: UpdateWorkflowTemplateInput,
  ): Promise<WorkflowTemplate>;
  deleteTemplate(
    ctx: WorkflowRequestContext,
    templateId: WorkflowTemplateId,
  ): Promise<void>;
  listTemplates(ctx: WorkflowRequestContext): Promise<readonly WorkflowTemplate[]>;

  createCategory(
    ctx: WorkflowRequestContext,
    input: CreateWorkflowCategoryInput,
  ): Promise<WorkflowCategory>;
  getCategory(
    ctx: WorkflowRequestContext,
    categoryId: WorkflowCategoryId,
  ): Promise<WorkflowCategory | null>;
  listCategories(ctx: WorkflowRequestContext): Promise<readonly WorkflowCategory[]>;

  createFolder(
    ctx: WorkflowRequestContext,
    input: CreateWorkflowFolderInput,
  ): Promise<WorkflowFolder>;
  getFolder(
    ctx: WorkflowRequestContext,
    folderId: WorkflowFolderId,
  ): Promise<WorkflowFolder | null>;
  listFolders(ctx: WorkflowRequestContext): Promise<readonly WorkflowFolder[]>;

  listAudit(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<readonly WorkflowAuditEntry[]>;
}
