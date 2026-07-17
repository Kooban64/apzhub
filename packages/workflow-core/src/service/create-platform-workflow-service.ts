/**
 * Platform Workflow domain service (APZWORKFLOW-002).
 * Metadata CRUD / validate / lifecycle only — NEVER execute / schedule / engine adapters.
 */

import type {
  CreateWorkflowCategoryInput,
  CreateWorkflowFolderInput,
  CreateWorkflowInput,
  CreateWorkflowTemplateInput,
  CreateWorkflowVersionInput,
  FindWorkflowsInput,
  PlatformWorkflowService,
  TransitionWorkflowLifecycleInput,
  UpdateWorkflowInput,
  UpdateWorkflowTemplateInput,
  ValidateWorkflowInput,
  Workflow,
  WorkflowAuditEntry,
  WorkflowCategory,
  WorkflowFolder,
  WorkflowRequestContext,
  WorkflowSummary,
  WorkflowTemplate,
  WorkflowVersion,
} from "@apzhub/workflow-contracts";
import {
  asWorkflowAuditId,
  asWorkflowCategoryId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowTemplateId,
  asWorkflowVersionId,
} from "@apzhub/workflow-contracts";

import { assertWorkflowLifecycleTransition } from "../lifecycle/transitions";
import {
  requireFound,
  WorkflowDomainError,
  type WorkflowFoundationRepos,
} from "../ports/repository-ports";
import { validateWorkflow } from "../validation/validate-workflow";

export type PlatformWorkflowEngineDeps = {
  readonly repos: WorkflowFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
};

function assertCtx(ctx: WorkflowRequestContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new WorkflowDomainError("validation_error", "tenantId is required");
  }
  if (!ctx.userId?.trim()) {
    throw new WorkflowDomainError("validation_error", "userId is required");
  }
}

async function appendAudit(
  deps: PlatformWorkflowEngineDeps,
  ctx: WorkflowRequestContext,
  workflowId: Workflow["id"],
  action: string,
  detail: Readonly<Record<string, string>> = {},
  versionId?: WorkflowVersion["id"],
): Promise<void> {
  const entry: WorkflowAuditEntry = {
    id: asWorkflowAuditId(deps.id()),
    tenantId: ctx.tenantId,
    organisationId: ctx.organisationId,
    workflowId,
    versionId,
    action,
    actorUserId: ctx.userId,
    correlationId: ctx.correlationId,
    detail,
    createdAt: deps.now(),
  };
  await deps.repos.audits.append(ctx, entry);
}

function toSummary(workflow: Workflow): WorkflowSummary {
  return {
    id: workflow.id,
    key: workflow.key,
    name: workflow.name,
    lifecycle: workflow.lifecycle,
    currentVersionId: workflow.currentVersionId,
    categoryId: workflow.categoryId,
    folderId: workflow.folderId,
    updatedAt: workflow.updatedAt,
  };
}

async function loadKnownRefs(
  deps: PlatformWorkflowEngineDeps,
  ctx: WorkflowRequestContext,
): Promise<{
  knownCategoryIds: Set<string>;
  knownFolderIds: Set<string>;
  knownTemplateIds: Set<string>;
}> {
  const [categories, folders, templates] = await Promise.all([
    deps.repos.categories.list(ctx),
    deps.repos.folders.list(ctx),
    deps.repos.templates.list(ctx),
  ]);
  return {
    knownCategoryIds: new Set(categories.map((row) => row.id)),
    knownFolderIds: new Set(folders.map((row) => row.id)),
    knownTemplateIds: new Set(templates.map((row) => row.id)),
  };
}

/**
 * Create the flat PlatformWorkflowService — business rules live here.
 * Platform-services wraps this into nested gateway facets.
 */
export function createPlatformWorkflowService(
  deps: PlatformWorkflowEngineDeps,
): PlatformWorkflowService {
  if (!deps?.repos) {
    throw new WorkflowDomainError(
      "missing_repos",
      "createPlatformWorkflowService requires explicit repos",
    );
  }

  async function transitionLifecycle(
    ctx: WorkflowRequestContext,
    input: TransitionWorkflowLifecycleInput,
  ): Promise<Workflow> {
    assertCtx(ctx);
    const existing = requireFound(
      await deps.repos.workflows.get(ctx, input.workflowId),
      "workflow",
      input.workflowId,
    );
    assertWorkflowLifecycleTransition(existing.lifecycle, input.to);
    const now = deps.now();
    const updated: Workflow = {
      ...existing,
      lifecycle: input.to,
      archivedAt: input.to === "archived" ? now : undefined,
      updatedAt: now,
      updatedBy: ctx.userId,
    };
    const saved = await deps.repos.workflows.update(ctx, updated);
    await appendAudit(deps, ctx, saved.id, `workflow.${input.to}`, {
      from: existing.lifecycle,
      to: input.to,
      reason: input.reason ?? "",
    });
    return saved;
  }

  return {
    async createWorkflow(ctx, input: CreateWorkflowInput) {
      assertCtx(ctx);
      const key = input.key?.trim();
      const name = input.name?.trim();
      if (!key) {
        throw new WorkflowDomainError("validation_error", "key is required");
      }
      if (!name) {
        throw new WorkflowDomainError("validation_error", "name is required");
      }
      const existing = await deps.repos.workflows.list(ctx);
      if (existing.some((row) => row.key === key)) {
        throw new WorkflowDomainError(
          "duplicate",
          `Workflow key already exists: ${key}`,
          { key },
        );
      }
      const refs = await loadKnownRefs(deps, ctx);
      if (input.categoryId && !refs.knownCategoryIds.has(input.categoryId)) {
        throw new WorkflowDomainError(
          "reference_error",
          `Unknown category: ${input.categoryId}`,
        );
      }
      if (input.folderId && !refs.knownFolderIds.has(input.folderId)) {
        throw new WorkflowDomainError(
          "reference_error",
          `Unknown folder: ${input.folderId}`,
        );
      }
      if (input.templateId && !refs.knownTemplateIds.has(input.templateId)) {
        throw new WorkflowDomainError(
          "reference_error",
          `Unknown template: ${input.templateId}`,
        );
      }

      const now = deps.now();
      const workflow: Workflow = {
        id: asWorkflowId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        key,
        name,
        description: input.description,
        lifecycle: "draft",
        categoryId: input.categoryId,
        folderId: input.folderId,
        templateId: input.templateId,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      const created = await deps.repos.workflows.create(ctx, workflow);
      await appendAudit(deps, ctx, created.id, "workflow.created", {
        key: created.key,
      });
      return created;
    },

    async getWorkflow(ctx, workflowId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.workflows.get(ctx, workflowId),
        "workflow",
        workflowId,
      );
    },

    async updateWorkflow(ctx, input: UpdateWorkflowInput) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.workflows.get(ctx, input.workflowId),
        "workflow",
        input.workflowId,
      );
      if (existing.lifecycle === "archived") {
        throw new WorkflowDomainError(
          "invalid_lifecycle_transition",
          "Cannot update an archived workflow — restore first",
        );
      }
      const refs = await loadKnownRefs(deps, ctx);
      let categoryId = existing.categoryId;
      if (input.categoryId === null) categoryId = undefined;
      else if (input.categoryId !== undefined) {
        if (!refs.knownCategoryIds.has(input.categoryId)) {
          throw new WorkflowDomainError(
            "reference_error",
            `Unknown category: ${input.categoryId}`,
          );
        }
        categoryId = input.categoryId;
      }
      let folderId = existing.folderId;
      if (input.folderId === null) folderId = undefined;
      else if (input.folderId !== undefined) {
        if (!refs.knownFolderIds.has(input.folderId)) {
          throw new WorkflowDomainError(
            "reference_error",
            `Unknown folder: ${input.folderId}`,
          );
        }
        folderId = input.folderId;
      }
      const now = deps.now();
      const updated: Workflow = {
        ...existing,
        name: input.name?.trim() || existing.name,
        description:
          input.description !== undefined
            ? input.description
            : existing.description,
        categoryId,
        folderId,
        updatedAt: now,
        updatedBy: ctx.userId,
      };
      const saved = await deps.repos.workflows.update(ctx, updated);
      await appendAudit(deps, ctx, saved.id, "workflow.updated");
      return saved;
    },

    async deleteWorkflow(ctx, workflowId) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.workflows.get(ctx, workflowId),
        "workflow",
        workflowId,
      );
      await deps.repos.workflows.delete(ctx, workflowId);
      await appendAudit(deps, ctx, existing.id, "workflow.deleted", {
        key: existing.key,
      });
    },

    async findWorkflows(ctx, input?: FindWorkflowsInput) {
      assertCtx(ctx);
      let rows = await deps.repos.workflows.list(ctx);
      if (input?.lifecycle) {
        rows = rows.filter((row) => row.lifecycle === input.lifecycle);
      }
      if (input?.categoryId) {
        rows = rows.filter((row) => row.categoryId === input.categoryId);
      }
      if (input?.folderId) {
        rows = rows.filter((row) => row.folderId === input.folderId);
      }
      if (input?.query?.trim()) {
        const q = input.query.trim().toLowerCase();
        rows = rows.filter(
          (row) =>
            row.name.toLowerCase().includes(q) ||
            row.key.toLowerCase().includes(q),
        );
      }
      const limit = input?.limit ?? 100;
      return rows.slice(0, limit).map(toSummary);
    },

    async createVersion(ctx, input: CreateWorkflowVersionInput) {
      assertCtx(ctx);
      const workflow = requireFound(
        await deps.repos.workflows.get(ctx, input.workflowId),
        "workflow",
        input.workflowId,
      );
      const prior = await deps.repos.versions.listByWorkflow(
        ctx,
        input.workflowId,
      );
      const versionNumber =
        prior.reduce((max, row) => Math.max(max, row.versionNumber), 0) + 1;
      const validation = validateWorkflow({
        graph: input.graph,
        variables: input.variables,
        parameters: input.parameters,
        versionNumber,
        existingVersionNumbers: prior.map((row) => row.versionNumber),
        lifecycle: workflow.lifecycle,
      });
      if (!validation.valid) {
        throw new WorkflowDomainError(
          "validation_error",
          "Workflow version failed structural validation",
          { issues: validation.issues },
        );
      }
      const now = deps.now();
      const version: WorkflowVersion = {
        id: asWorkflowVersionId(deps.id()),
        workflowId: input.workflowId,
        tenantId: ctx.tenantId,
        organisationId: workflow.organisationId,
        versionNumber,
        status: "draft",
        lifecycle: workflow.lifecycle,
        graph: input.graph,
        variables: input.variables ?? [],
        parameters: input.parameters ?? [],
        triggers: input.triggers ?? [],
        actions: input.actions ?? [],
        conditions: input.conditions ?? [],
        connections: input.connections ?? input.graph.connections,
        createdAt: now,
        createdBy: ctx.userId,
        changeSummary: input.changeSummary,
      };
      const created = await deps.repos.versions.create(ctx, version);
      await deps.repos.workflows.update(ctx, {
        ...workflow,
        currentVersionId: created.id,
        updatedAt: now,
        updatedBy: ctx.userId,
      });
      await appendAudit(
        deps,
        ctx,
        workflow.id,
        "workflow.version.created",
        { versionNumber: String(versionNumber) },
        created.id,
      );
      return created;
    },

    async getVersion(ctx, versionId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.versions.get(ctx, versionId),
        "workflow_version",
        versionId,
      );
    },

    async listVersions(ctx, workflowId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.workflows.get(ctx, workflowId),
        "workflow",
        workflowId,
      );
      const rows = await deps.repos.versions.listByWorkflow(ctx, workflowId);
      return [...rows].sort((a, b) => b.versionNumber - a.versionNumber);
    },

    async validateWorkflow(ctx, input: ValidateWorkflowInput) {
      assertCtx(ctx);
      let graph = input.graph;
      let variables = input.variables;
      let parameters = input.parameters;
      let versionNumber = input.versionNumber;
      let lifecycle = input.lifecycle;
      let categoryId = input.categoryId;
      let folderId = input.folderId;
      let templateId = input.templateId;

      if (input.versionId) {
        const version = requireFound(
          await deps.repos.versions.get(ctx, input.versionId),
          "workflow_version",
          input.versionId,
        );
        graph = graph ?? version.graph;
        variables = variables ?? version.variables;
        parameters = parameters ?? version.parameters;
        versionNumber = versionNumber ?? version.versionNumber;
        lifecycle = lifecycle ?? version.lifecycle;
      } else if (input.workflowId) {
        const workflow = requireFound(
          await deps.repos.workflows.get(ctx, input.workflowId),
          "workflow",
          input.workflowId,
        );
        lifecycle = lifecycle ?? workflow.lifecycle;
        categoryId = categoryId ?? workflow.categoryId;
        folderId = folderId ?? workflow.folderId;
        templateId = templateId ?? workflow.templateId;
        if (workflow.currentVersionId && !graph) {
          const version = await deps.repos.versions.get(
            ctx,
            workflow.currentVersionId,
          );
          if (version) {
            graph = version.graph;
            variables = variables ?? version.variables;
            parameters = parameters ?? version.parameters;
            versionNumber = versionNumber ?? version.versionNumber;
          }
        }
      }

      const refs = await loadKnownRefs(deps, ctx);
      return validateWorkflow({
        graph,
        variables,
        parameters,
        versionNumber,
        lifecycle,
        categoryId,
        folderId,
        templateId,
        knownCategoryIds: refs.knownCategoryIds,
        knownFolderIds: refs.knownFolderIds,
        knownTemplateIds: refs.knownTemplateIds,
      });
    },

    async publishWorkflow(ctx, workflowId) {
      return transitionLifecycle(ctx, {
        workflowId,
        to: "active",
        reason: "publish",
      });
    },

    async archiveWorkflow(ctx, workflowId) {
      return transitionLifecycle(ctx, {
        workflowId,
        to: "archived",
        reason: "archive",
      });
    },

    async restoreWorkflow(ctx, workflowId) {
      return transitionLifecycle(ctx, {
        workflowId,
        to: "restored",
        reason: "restore",
      });
    },

    transitionLifecycle,

    async createTemplate(ctx, input: CreateWorkflowTemplateInput) {
      assertCtx(ctx);
      const key = input.key?.trim();
      const name = input.name?.trim();
      if (!key) {
        throw new WorkflowDomainError("validation_error", "key is required");
      }
      if (!name) {
        throw new WorkflowDomainError("validation_error", "name is required");
      }
      const validation = validateWorkflow({ graph: input.graph });
      if (!validation.valid) {
        throw new WorkflowDomainError(
          "validation_error",
          "Template graph failed structural validation",
          { issues: validation.issues },
        );
      }
      const now = deps.now();
      const template: WorkflowTemplate = {
        id: asWorkflowTemplateId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        key,
        name,
        description: input.description,
        lifecycle: "draft",
        categoryId: input.categoryId,
        graph: input.graph,
        parameters: input.parameters ?? [],
        variables: input.variables ?? [],
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
      };
      return deps.repos.templates.create(ctx, template);
    },

    async getTemplate(ctx, templateId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.templates.get(ctx, templateId),
        "workflow_template",
        templateId,
      );
    },

    async updateTemplate(ctx, input: UpdateWorkflowTemplateInput) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.templates.get(ctx, input.templateId),
        "workflow_template",
        input.templateId,
      );
      if (input.graph) {
        const validation = validateWorkflow({ graph: input.graph });
        if (!validation.valid) {
          throw new WorkflowDomainError(
            "validation_error",
            "Template graph failed structural validation",
            { issues: validation.issues },
          );
        }
      }
      const now = deps.now();
      let categoryId = existing.categoryId;
      if (input.categoryId === null) categoryId = undefined;
      else if (input.categoryId !== undefined) categoryId = input.categoryId;
      const updated: WorkflowTemplate = {
        ...existing,
        name: input.name?.trim() || existing.name,
        description:
          input.description !== undefined
            ? input.description
            : existing.description,
        categoryId,
        graph: input.graph ?? existing.graph,
        parameters: input.parameters ?? existing.parameters,
        variables: input.variables ?? existing.variables,
        updatedAt: now,
        updatedBy: ctx.userId,
      };
      return deps.repos.templates.update(ctx, updated);
    },

    async deleteTemplate(ctx, templateId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.templates.get(ctx, templateId),
        "workflow_template",
        templateId,
      );
      await deps.repos.templates.delete(ctx, templateId);
    },

    async listTemplates(ctx) {
      assertCtx(ctx);
      return deps.repos.templates.list(ctx);
    },

    async createCategory(ctx, input: CreateWorkflowCategoryInput) {
      assertCtx(ctx);
      const name = input.name?.trim();
      if (!name) {
        throw new WorkflowDomainError("validation_error", "name is required");
      }
      const now = deps.now();
      const category: WorkflowCategory = {
        id: asWorkflowCategoryId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        name,
        description: input.description,
        parentCategoryId: input.parentCategoryId,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.categories.create(ctx, category);
    },

    async getCategory(ctx, categoryId) {
      assertCtx(ctx);
      return deps.repos.categories.get(ctx, categoryId);
    },

    async listCategories(ctx) {
      assertCtx(ctx);
      return deps.repos.categories.list(ctx);
    },

    async createFolder(ctx, input: CreateWorkflowFolderInput) {
      assertCtx(ctx);
      const name = input.name?.trim();
      const path = input.path?.trim();
      if (!name) {
        throw new WorkflowDomainError("validation_error", "name is required");
      }
      if (!path) {
        throw new WorkflowDomainError("validation_error", "path is required");
      }
      const now = deps.now();
      const folder: WorkflowFolder = {
        id: asWorkflowFolderId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        name,
        parentFolderId: input.parentFolderId,
        path,
        createdAt: now,
        updatedAt: now,
      };
      return deps.repos.folders.create(ctx, folder);
    },

    async getFolder(ctx, folderId) {
      assertCtx(ctx);
      return deps.repos.folders.get(ctx, folderId);
    },

    async listFolders(ctx) {
      assertCtx(ctx);
      return deps.repos.folders.list(ctx);
    },

    async listAudit(ctx, workflowId) {
      assertCtx(ctx);
      requireFound(
        await deps.repos.workflows.get(ctx, workflowId),
        "workflow",
        workflowId,
      );
      return deps.repos.audits.listByWorkflow(ctx, workflowId);
    },
  };
}
