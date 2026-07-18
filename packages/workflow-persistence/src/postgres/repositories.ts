/**
 * PostgreSQL workflow repositories (APZWORKFLOW-001).
 * Uses Drizzle against platform_workflow* tables — metadata only.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformWorkflow,
  platformWorkflowAudit,
  platformWorkflowCategory,
  platformWorkflowFolder,
  platformWorkflowTemplate,
  platformWorkflowVersion,
} from "@apzhub/config";
import type {
  Workflow,
  WorkflowAction,
  WorkflowAuditEntry,
  WorkflowCategory,
  WorkflowCondition,
  WorkflowConnection,
  WorkflowFolder,
  WorkflowGraphSnapshot,
  WorkflowId,
  WorkflowParameter,
  WorkflowTemplate,
  WorkflowTrigger,
  WorkflowVariable,
  WorkflowVersion,
  WorkflowVersionId,
} from "@apzhub/workflow-contracts";
import {
  asWorkflowAuditId,
  asWorkflowCategoryId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowTemplateId,
  asWorkflowVersionId,
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
import { and, asc, eq } from "drizzle-orm";

function mapWorkflow(row: typeof platformWorkflow.$inferSelect): Workflow {
  return {
    id: asWorkflowId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    lifecycle: row.lifecycle as Workflow["lifecycle"],
    currentVersionId: row.currentVersionId
      ? asWorkflowVersionId(row.currentVersionId)
      : undefined,
    categoryId: row.categoryId ? asWorkflowCategoryId(row.categoryId) : undefined,
    folderId: row.folderId ? asWorkflowFolderId(row.folderId) : undefined,
    templateId: row.templateId ? asWorkflowTemplateId(row.templateId) : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    archivedAt: row.archivedAt?.toISOString(),
  };
}

function mapVersion(row: typeof platformWorkflowVersion.$inferSelect): WorkflowVersion {
  return {
    id: asWorkflowVersionId(row.id),
    workflowId: asWorkflowId(row.workflowId),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    versionNumber: row.versionNumber,
    status: row.status as WorkflowVersion["status"],
    lifecycle: row.lifecycle as WorkflowVersion["lifecycle"],
    graph: row.graphJson as unknown as WorkflowGraphSnapshot,
    variables: (row.variablesJson ?? []) as WorkflowVariable[],
    parameters: (row.parametersJson ?? []) as WorkflowParameter[],
    triggers: (row.triggersJson ?? []) as WorkflowTrigger[],
    actions: (row.actionsJson ?? []) as WorkflowAction[],
    conditions: (row.conditionsJson ?? []) as WorkflowCondition[],
    connections: (row.connectionsJson ?? []) as WorkflowConnection[],
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    changeSummary: row.changeSummary ?? undefined,
  };
}

function mapTemplate(
  row: typeof platformWorkflowTemplate.$inferSelect,
): WorkflowTemplate {
  return {
    id: asWorkflowTemplateId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    lifecycle: row.lifecycle as WorkflowTemplate["lifecycle"],
    categoryId: row.categoryId ? asWorkflowCategoryId(row.categoryId) : undefined,
    graph: row.graphJson as unknown as WorkflowGraphSnapshot,
    parameters: (row.parametersJson ?? []) as WorkflowParameter[],
    variables: (row.variablesJson ?? []) as WorkflowVariable[],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

function mapCategory(
  row: typeof platformWorkflowCategory.$inferSelect,
): WorkflowCategory {
  return {
    id: asWorkflowCategoryId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    name: row.name,
    description: row.description ?? undefined,
    parentCategoryId: row.parentCategoryId
      ? asWorkflowCategoryId(row.parentCategoryId)
      : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapFolder(row: typeof platformWorkflowFolder.$inferSelect): WorkflowFolder {
  return {
    id: asWorkflowFolderId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    name: row.name,
    parentFolderId: row.parentFolderId
      ? asWorkflowFolderId(row.parentFolderId)
      : undefined,
    path: row.path,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapAudit(row: typeof platformWorkflowAudit.$inferSelect): WorkflowAuditEntry {
  return {
    id: asWorkflowAuditId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    workflowId: asWorkflowId(row.workflowId),
    versionId: row.versionId ? asWorkflowVersionId(row.versionId) : undefined,
    action: row.action,
    actorUserId: row.actorUserId,
    correlationId: row.correlationId ?? undefined,
    detail: row.detailJson ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function createPostgresWorkflowRepositories(
  db: DatabaseExecutor,
): WorkflowFoundationRepos {
  const workflows: WorkflowRepositoryPort = {
    async create(ctx, workflow) {
      if (workflow.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db.insert(platformWorkflow).values({
        id: workflow.id,
        tenantId: workflow.tenantId,
        organisationId: workflow.organisationId,
        key: workflow.key,
        name: workflow.name,
        description: workflow.description,
        lifecycle: workflow.lifecycle,
        currentVersionId: workflow.currentVersionId,
        categoryId: workflow.categoryId,
        folderId: workflow.folderId,
        templateId: workflow.templateId,
        createdAt: new Date(workflow.createdAt),
        updatedAt: new Date(workflow.updatedAt),
        createdBy: workflow.createdBy,
        updatedBy: workflow.updatedBy,
        archivedAt: workflow.archivedAt ? new Date(workflow.archivedAt) : undefined,
      });
      return workflow;
    },
    async get(ctx, workflowId) {
      const rows = await db
        .select()
        .from(platformWorkflow)
        .where(
          and(
            eq(platformWorkflow.id, workflowId),
            eq(platformWorkflow.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapWorkflow(rows[0]) : null;
    },
    async update(ctx, workflow) {
      if (workflow.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db
        .update(platformWorkflow)
        .set({
          name: workflow.name,
          description: workflow.description,
          lifecycle: workflow.lifecycle,
          currentVersionId: workflow.currentVersionId,
          categoryId: workflow.categoryId,
          folderId: workflow.folderId,
          templateId: workflow.templateId,
          updatedAt: new Date(workflow.updatedAt),
          updatedBy: workflow.updatedBy,
          archivedAt: workflow.archivedAt ? new Date(workflow.archivedAt) : null,
        })
        .where(
          and(
            eq(platformWorkflow.id, workflow.id),
            eq(platformWorkflow.tenantId, ctx.tenantId),
          ),
        );
      return workflow;
    },
    async delete(ctx, workflowId: WorkflowId) {
      await db
        .delete(platformWorkflow)
        .where(
          and(
            eq(platformWorkflow.id, workflowId),
            eq(platformWorkflow.tenantId, ctx.tenantId),
          ),
        );
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformWorkflow)
        .where(eq(platformWorkflow.tenantId, ctx.tenantId));
      return rows.map(mapWorkflow);
    },
  };

  const versions: WorkflowVersionRepositoryPort = {
    async create(ctx, version) {
      if (version.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db.insert(platformWorkflowVersion).values({
        id: version.id,
        tenantId: version.tenantId,
        organisationId: version.organisationId,
        workflowId: version.workflowId,
        versionNumber: version.versionNumber,
        status: version.status,
        lifecycle: version.lifecycle,
        graphJson: version.graph as unknown as Record<string, unknown>,
        variablesJson: version.variables as unknown as unknown[],
        parametersJson: version.parameters as unknown as unknown[],
        triggersJson: version.triggers as unknown as unknown[],
        actionsJson: version.actions as unknown as unknown[],
        conditionsJson: version.conditions as unknown as unknown[],
        connectionsJson: version.connections as unknown as unknown[],
        changeSummary: version.changeSummary,
        createdAt: new Date(version.createdAt),
        createdBy: version.createdBy,
      });
      return version;
    },
    async get(ctx, versionId: WorkflowVersionId) {
      const rows = await db
        .select()
        .from(platformWorkflowVersion)
        .where(
          and(
            eq(platformWorkflowVersion.id, versionId),
            eq(platformWorkflowVersion.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapVersion(rows[0]) : null;
    },
    async listByWorkflow(ctx, workflowId) {
      const rows = await db
        .select()
        .from(platformWorkflowVersion)
        .where(
          and(
            eq(platformWorkflowVersion.tenantId, ctx.tenantId),
            eq(platformWorkflowVersion.workflowId, workflowId),
          ),
        )
        .orderBy(asc(platformWorkflowVersion.versionNumber));
      return rows.map(mapVersion);
    },
  };

  const templates: WorkflowTemplateRepositoryPort = {
    async create(ctx, template) {
      if (template.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db.insert(platformWorkflowTemplate).values({
        id: template.id,
        tenantId: template.tenantId,
        organisationId: template.organisationId,
        key: template.key,
        name: template.name,
        description: template.description,
        lifecycle: template.lifecycle,
        categoryId: template.categoryId,
        graphJson: template.graph as unknown as Record<string, unknown>,
        parametersJson: template.parameters as unknown as unknown[],
        variablesJson: template.variables as unknown as unknown[],
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
        createdBy: template.createdBy,
        updatedBy: template.updatedBy,
      });
      return template;
    },
    async get(ctx, templateId) {
      const rows = await db
        .select()
        .from(platformWorkflowTemplate)
        .where(
          and(
            eq(platformWorkflowTemplate.id, templateId),
            eq(platformWorkflowTemplate.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapTemplate(rows[0]) : null;
    },
    async update(ctx, template) {
      if (template.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db
        .update(platformWorkflowTemplate)
        .set({
          name: template.name,
          description: template.description,
          lifecycle: template.lifecycle,
          categoryId: template.categoryId,
          graphJson: template.graph as unknown as Record<string, unknown>,
          parametersJson: template.parameters as unknown as unknown[],
          variablesJson: template.variables as unknown as unknown[],
          updatedAt: new Date(template.updatedAt),
          updatedBy: template.updatedBy,
        })
        .where(
          and(
            eq(platformWorkflowTemplate.id, template.id),
            eq(platformWorkflowTemplate.tenantId, ctx.tenantId),
          ),
        );
      return template;
    },
    async delete(ctx, templateId) {
      await db
        .delete(platformWorkflowTemplate)
        .where(
          and(
            eq(platformWorkflowTemplate.id, templateId),
            eq(platformWorkflowTemplate.tenantId, ctx.tenantId),
          ),
        );
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformWorkflowTemplate)
        .where(eq(platformWorkflowTemplate.tenantId, ctx.tenantId));
      return rows.map(mapTemplate);
    },
  };

  const categories: WorkflowCategoryRepositoryPort = {
    async create(ctx, category) {
      if (category.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db.insert(platformWorkflowCategory).values({
        id: category.id,
        tenantId: category.tenantId,
        organisationId: category.organisationId,
        name: category.name,
        description: category.description,
        parentCategoryId: category.parentCategoryId,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      });
      return category;
    },
    async get(ctx, categoryId) {
      const rows = await db
        .select()
        .from(platformWorkflowCategory)
        .where(
          and(
            eq(platformWorkflowCategory.id, categoryId),
            eq(platformWorkflowCategory.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapCategory(rows[0]) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformWorkflowCategory)
        .where(eq(platformWorkflowCategory.tenantId, ctx.tenantId));
      return rows.map(mapCategory);
    },
  };

  const folders: WorkflowFolderRepositoryPort = {
    async create(ctx, folder) {
      if (folder.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db.insert(platformWorkflowFolder).values({
        id: folder.id,
        tenantId: folder.tenantId,
        organisationId: folder.organisationId,
        name: folder.name,
        parentFolderId: folder.parentFolderId,
        path: folder.path,
        createdAt: new Date(folder.createdAt),
        updatedAt: new Date(folder.updatedAt),
      });
      return folder;
    },
    async get(ctx, folderId) {
      const rows = await db
        .select()
        .from(platformWorkflowFolder)
        .where(
          and(
            eq(platformWorkflowFolder.id, folderId),
            eq(platformWorkflowFolder.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapFolder(rows[0]) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformWorkflowFolder)
        .where(eq(platformWorkflowFolder.tenantId, ctx.tenantId));
      return rows.map(mapFolder);
    },
  };

  const audits: WorkflowAuditRepositoryPort = {
    async append(ctx, audit) {
      if (audit.tenantId !== ctx.tenantId) {
        throw new Error("tenant_mismatch");
      }
      await db.insert(platformWorkflowAudit).values({
        id: audit.id,
        tenantId: audit.tenantId,
        organisationId: audit.organisationId,
        workflowId: audit.workflowId,
        versionId: audit.versionId,
        action: audit.action,
        actorUserId: audit.actorUserId,
        correlationId: audit.correlationId,
        detailJson: audit.detail ?? {},
        createdAt: new Date(audit.createdAt),
      });
      return audit;
    },
    async listByWorkflow(ctx, workflowId) {
      const rows = await db
        .select()
        .from(platformWorkflowAudit)
        .where(
          and(
            eq(platformWorkflowAudit.tenantId, ctx.tenantId),
            eq(platformWorkflowAudit.workflowId, workflowId),
          ),
        )
        .orderBy(asc(platformWorkflowAudit.createdAt));
      return rows.map(mapAudit);
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
