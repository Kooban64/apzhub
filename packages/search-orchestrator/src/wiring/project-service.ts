/**
 * Composition wrapper — wires Projects service lifecycle to orchestration
 * without modifying frozen platform product services (APZSEARCH-016).
 */

import type { PublicationDispatcher } from "../dispatcher";
import { enqueueProductPublicationSafely } from "./safe-hooks";

export type ProjectLike = {
  readonly id: string;
  readonly name?: string;
  readonly description?: string;
  readonly status?: string;
  readonly workspaceId?: string;
  readonly updatedAt?: string;
  readonly createdAt?: string;
};

export type ProjectServiceLike = {
  createProject(ctx: unknown, input: unknown): Promise<ProjectLike>;
  updateProject(ctx: unknown, projectId: string, input: unknown): Promise<ProjectLike>;
  archiveProject(ctx: unknown, projectId: string): Promise<ProjectLike>;
  restoreProject?(ctx: unknown, projectId: string): Promise<ProjectLike>;
  deleteProject?(ctx: unknown, projectId: string): Promise<void | ProjectLike>;
};

export type ServiceContextLike = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly correlationId: string;
  readonly userId?: string;
};

function toHookContext(ctx: unknown): {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly correlationId: string;
  readonly actorUserId?: string;
} {
  const c = ctx as ServiceContextLike;
  return {
    tenantId: c.tenantId,
    organisationId: c.organisationId,
    correlationId: c.correlationId ?? "corr_missing",
    actorUserId: c.userId,
  };
}

/** Build a SearchEntityDraft-compatible payload (search-integration mapper). */
export function projectToSearchDraft(project: ProjectLike) {
  return {
    entityId: project.id,
    entityType: "project",
    title: project.name ?? project.id,
    summary: project.description,
    metadata: {
      ...(project.status ? { status: project.status } : {}),
      ...(project.workspaceId ? { workspaceId: project.workspaceId } : {}),
    },
    navigationTarget: `/workspace/projects/${project.id}`,
    sourceId: project.id,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

/**
 * Returns a shallow-wrapped project service that enqueues publications after success.
 */
export function withProjectSearchPublicationOrchestration<T extends ProjectServiceLike>(
  service: T,
  dispatcher: PublicationDispatcher,
): T {
  const createProject = service.createProject.bind(service);
  const updateProject = service.updateProject.bind(service);
  const archiveProject = service.archiveProject.bind(service);
  const restoreProject = service.restoreProject?.bind(service);
  const deleteProject = service.deleteProject?.bind(service);

  const wrapped: ProjectServiceLike = {
    async createProject(ctx, input) {
      const project = await createProject(ctx, input);
      void enqueueProductPublicationSafely(dispatcher, toHookContext(ctx), {
        entityId: project.id,
        entityType: "project",
        productId: "projects",
        operation: "publish",
        payload: projectToSearchDraft(project),
      });
      return project;
    },
    async updateProject(ctx, projectId, input) {
      const project = await updateProject(ctx, projectId, input);
      void enqueueProductPublicationSafely(dispatcher, toHookContext(ctx), {
        entityId: project.id,
        entityType: "project",
        productId: "projects",
        operation: "update",
        payload: projectToSearchDraft(project),
      });
      return project;
    },
    async archiveProject(ctx, projectId) {
      const project = await archiveProject(ctx, projectId);
      void enqueueProductPublicationSafely(dispatcher, toHookContext(ctx), {
        entityId: project.id,
        entityType: "project",
        productId: "projects",
        operation: "lifecycle",
        payload: {
          entityId: project.id,
          state: "archived",
          reason: "archiveProject",
        },
      });
      return project;
    },
  };

  if (restoreProject) {
    wrapped.restoreProject = async (ctx, projectId) => {
      const project = await restoreProject(ctx, projectId);
      void enqueueProductPublicationSafely(dispatcher, toHookContext(ctx), {
        entityId: project.id,
        entityType: "project",
        productId: "projects",
        operation: "lifecycle",
        payload: {
          entityId: project.id,
          state: "published",
          reason: "restoreProject",
        },
      });
      return project;
    };
  }

  if (deleteProject) {
    wrapped.deleteProject = async (ctx, projectId) => {
      const result = await deleteProject(ctx, projectId);
      void enqueueProductPublicationSafely(dispatcher, toHookContext(ctx), {
        entityId: projectId,
        entityType: "project",
        productId: "projects",
        operation: "remove",
        payload: { entityId: projectId },
      });
      return result;
    };
  }

  return { ...service, ...wrapped } as T;
}
