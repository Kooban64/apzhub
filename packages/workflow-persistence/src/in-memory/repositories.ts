/**
 * In-memory Workflow Platform repositories (APZWORKFLOW-001).
 * Metadata only — never stores execution / queue / runtime state.
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
import type {
  WorkflowAuditRepositoryPort,
  WorkflowCategoryRepositoryPort,
  WorkflowFolderRepositoryPort,
  WorkflowFoundationRepos,
  WorkflowRepositoryPort,
  WorkflowTemplateRepositoryPort,
  WorkflowVersionRepositoryPort,
} from "@apzhub/workflow-core";

export type WorkflowInMemoryStores = {
  readonly workflows: Map<string, Workflow>;
  readonly versions: Map<string, WorkflowVersion>;
  readonly templates: Map<string, WorkflowTemplate>;
  readonly categories: Map<string, WorkflowCategory>;
  readonly folders: Map<string, WorkflowFolder>;
  readonly audits: Map<string, WorkflowAuditEntry>;
};

export function createEmptyWorkflowInMemoryStores(): WorkflowInMemoryStores {
  return {
    workflows: new Map(),
    versions: new Map(),
    templates: new Map(),
    categories: new Map(),
    folders: new Map(),
    audits: new Map(),
  };
}

function assertTenant(ctx: WorkflowRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

export type InMemoryWorkflowRepositories = WorkflowFoundationRepos;

export function createInMemoryWorkflowRepositories(
  stores: WorkflowInMemoryStores,
): InMemoryWorkflowRepositories {
  const workflows: WorkflowRepositoryPort = {
    async create(ctx, workflow) {
      assertTenant(ctx, workflow.tenantId);
      stores.workflows.set(workflow.id, workflow);
      return workflow;
    },
    async get(ctx, workflowId) {
      const row = stores.workflows.get(workflowId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, workflow) {
      assertTenant(ctx, workflow.tenantId);
      stores.workflows.set(workflow.id, workflow);
      return workflow;
    },
    async delete(ctx, workflowId: WorkflowId) {
      const row = stores.workflows.get(workflowId);
      if (!row || row.tenantId !== ctx.tenantId) return;
      stores.workflows.delete(workflowId);
    },
    async list(ctx) {
      return [...stores.workflows.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const versions: WorkflowVersionRepositoryPort = {
    async create(ctx, version) {
      assertTenant(ctx, version.tenantId);
      stores.versions.set(version.id, version);
      return version;
    },
    async get(ctx, versionId: WorkflowVersionId) {
      const row = stores.versions.get(versionId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async listByWorkflow(ctx, workflowId) {
      return [...stores.versions.values()].filter(
        (row) =>
          row.tenantId === ctx.tenantId && row.workflowId === workflowId,
      );
    },
  };

  const templates: WorkflowTemplateRepositoryPort = {
    async create(ctx, template) {
      assertTenant(ctx, template.tenantId);
      stores.templates.set(template.id, template);
      return template;
    },
    async get(ctx, templateId: WorkflowTemplateId) {
      const row = stores.templates.get(templateId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, template) {
      assertTenant(ctx, template.tenantId);
      stores.templates.set(template.id, template);
      return template;
    },
    async delete(ctx, templateId) {
      const row = stores.templates.get(templateId);
      if (!row || row.tenantId !== ctx.tenantId) return;
      stores.templates.delete(templateId);
    },
    async list(ctx) {
      return [...stores.templates.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const categories: WorkflowCategoryRepositoryPort = {
    async create(ctx, category) {
      assertTenant(ctx, category.tenantId);
      stores.categories.set(category.id, category);
      return category;
    },
    async get(ctx, categoryId: WorkflowCategoryId) {
      const row = stores.categories.get(categoryId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.categories.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const folders: WorkflowFolderRepositoryPort = {
    async create(ctx, folder) {
      assertTenant(ctx, folder.tenantId);
      stores.folders.set(folder.id, folder);
      return folder;
    },
    async get(ctx, folderId: WorkflowFolderId) {
      const row = stores.folders.get(folderId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.folders.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const audits: WorkflowAuditRepositoryPort = {
    async append(ctx, audit) {
      assertTenant(ctx, audit.tenantId);
      stores.audits.set(audit.id, audit);
      return audit;
    },
    async listByWorkflow(ctx, workflowId) {
      return [...stores.audits.values()]
        .filter(
          (row) =>
            row.tenantId === ctx.tenantId && row.workflowId === workflowId,
        )
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };

  return {
    workflows,
    versions,
    templates,
    categories,
    folders,
    audits,
  };
}
