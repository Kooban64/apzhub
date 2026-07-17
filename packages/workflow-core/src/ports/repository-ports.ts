/**
 * Workflow repository ports (APZWORKFLOW-001).
 * Interfaces only — no Drizzle / HTTP / memory defaults.
 */

import type {
  Workflow,
  WorkflowAuditEntry,
  WorkflowCategory,
  WorkflowFolder,
  WorkflowId,
  WorkflowRequestContext,
  WorkflowTemplate,
  WorkflowTemplateId,
  WorkflowCategoryId,
  WorkflowFolderId,
  WorkflowVersion,
  WorkflowVersionId,
} from "@apzhub/workflow-contracts";

export class WorkflowDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "WorkflowDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new WorkflowDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

export interface WorkflowRepositoryPort {
  create(ctx: WorkflowRequestContext, workflow: Workflow): Promise<Workflow>;
  get(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<Workflow | null>;
  update(ctx: WorkflowRequestContext, workflow: Workflow): Promise<Workflow>;
  delete(ctx: WorkflowRequestContext, workflowId: WorkflowId): Promise<void>;
  list(ctx: WorkflowRequestContext): Promise<readonly Workflow[]>;
}

export interface WorkflowVersionRepositoryPort {
  create(
    ctx: WorkflowRequestContext,
    version: WorkflowVersion,
  ): Promise<WorkflowVersion>;
  get(
    ctx: WorkflowRequestContext,
    versionId: WorkflowVersionId,
  ): Promise<WorkflowVersion | null>;
  listByWorkflow(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<readonly WorkflowVersion[]>;
}

export interface WorkflowTemplateRepositoryPort {
  create(
    ctx: WorkflowRequestContext,
    template: WorkflowTemplate,
  ): Promise<WorkflowTemplate>;
  get(
    ctx: WorkflowRequestContext,
    templateId: WorkflowTemplateId,
  ): Promise<WorkflowTemplate | null>;
  update(
    ctx: WorkflowRequestContext,
    template: WorkflowTemplate,
  ): Promise<WorkflowTemplate>;
  delete(
    ctx: WorkflowRequestContext,
    templateId: WorkflowTemplateId,
  ): Promise<void>;
  list(ctx: WorkflowRequestContext): Promise<readonly WorkflowTemplate[]>;
}

export interface WorkflowCategoryRepositoryPort {
  create(
    ctx: WorkflowRequestContext,
    category: WorkflowCategory,
  ): Promise<WorkflowCategory>;
  get(
    ctx: WorkflowRequestContext,
    categoryId: WorkflowCategoryId,
  ): Promise<WorkflowCategory | null>;
  list(ctx: WorkflowRequestContext): Promise<readonly WorkflowCategory[]>;
}

export interface WorkflowFolderRepositoryPort {
  create(
    ctx: WorkflowRequestContext,
    folder: WorkflowFolder,
  ): Promise<WorkflowFolder>;
  get(
    ctx: WorkflowRequestContext,
    folderId: WorkflowFolderId,
  ): Promise<WorkflowFolder | null>;
  list(ctx: WorkflowRequestContext): Promise<readonly WorkflowFolder[]>;
}

export interface WorkflowAuditRepositoryPort {
  append(
    ctx: WorkflowRequestContext,
    audit: WorkflowAuditEntry,
  ): Promise<WorkflowAuditEntry>;
  listByWorkflow(
    ctx: WorkflowRequestContext,
    workflowId: WorkflowId,
  ): Promise<readonly WorkflowAuditEntry[]>;
}

export type WorkflowFoundationRepos = {
  readonly workflows: WorkflowRepositoryPort;
  readonly versions: WorkflowVersionRepositoryPort;
  readonly templates: WorkflowTemplateRepositoryPort;
  readonly categories: WorkflowCategoryRepositoryPort;
  readonly folders: WorkflowFolderRepositoryPort;
  readonly audits: WorkflowAuditRepositoryPort;
};
