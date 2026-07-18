import type { PlaneCoreServices } from "@apzhub/integration-plane";
import type {
  ActivityPage,
  CreateProjectInput,
  ProjectListFilter,
  ProjectSortField,
  ProjectStateListFilter,
  Roadmap,
} from "@apzhub/platform-service-contracts";
import type {
  CycleListFilter,
  LabelListFilter,
  ModuleListFilter,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import {
  throwUnsupportedProviderOperation,
  withProviderErrorMapping,
} from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { ProjectProvider } from "../capability-providers";

const PLANE_INTEGRATION_ID = "plane";
const PLANE_PROJECT_PROVIDER_ID = "plane-project";

/**
 * Encodes project + sprint native IDs for Plane sprint-by-id operations.
 * Mapping-aware services supply both IDs; the public platform API never sees this form.
 */
export function encodePlaneSprintRef(
  projectNativeId: string,
  sprintNativeId: string,
): string {
  return `${projectNativeId}::${sprintNativeId}`;
}

export function decodePlaneSprintRef(
  sprintRef: string,
): { projectNativeId: string; sprintNativeId: string } | null {
  const separator = sprintRef.indexOf("::");
  if (separator <= 0 || separator === sprintRef.length - 2) {
    return null;
  }
  return {
    projectNativeId: sprintRef.slice(0, separator),
    sprintNativeId: sprintRef.slice(separator + 2),
  };
}

const PROJECT_SORT_MAP: Partial<Record<ProjectSortField, string>> = {
  name: "name",
  identifier: "identifier",
  createdAt: "created_at",
  updatedAt: "updated_at",
};

function mapProjectSort(
  sort: readonly { field: ProjectSortField; direction: "asc" | "desc" }[],
): readonly SortField<string>[] {
  return sort.flatMap((entry) => {
    const mapped = PROJECT_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

function toAdapterCreateProjectInput(input: CreateProjectInput) {
  return {
    name: input.name,
    identifier: input.identifier,
    description: input.description,
    leadId: input.leadId,
  };
}

/** Delegates project-scoped operations to Plane adapter core services. */
export function createPlaneProjectProvider(core: PlaneCoreServices): ProjectProvider {
  return {
    listProjects(ctx, query) {
      const { page, sort, filter } = unwrapListQuery<
        ProjectListFilter,
        ProjectSortField
      >(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projects.list(
          toIntegrationContext(ctx),
          filter,
          page,
          mapProjectSort(sort) as never,
        ),
      );
    },

    getProject(ctx, projectId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projects.get(toIntegrationContext(ctx), projectId),
      );
    },

    createProject(ctx, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projects.create(
          toIntegrationContext(ctx),
          toAdapterCreateProjectInput(input),
        ),
      );
    },

    updateProject(ctx, projectId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projects.update(toIntegrationContext(ctx), projectId, input),
      );
    },

    archiveProject(ctx, projectId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projects.archive(toIntegrationContext(ctx), projectId),
      );
    },

    listStatuses(ctx, projectId, query) {
      const { page, sort, filter } = unwrapListQuery<ProjectStateListFilter>(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projectStates.list(
          toIntegrationContext(ctx),
          projectId,
          filter,
          page,
          sort as never,
        ),
      );
    },

    getStatus(ctx, projectId, statusId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projectStates.get(toIntegrationContext(ctx), projectId, statusId),
      );
    },

    createStatus(ctx, projectId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projectStates.create(toIntegrationContext(ctx), projectId, input),
      );
    },

    updateStatus(ctx, projectId, statusId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.projectStates.update(
          toIntegrationContext(ctx),
          projectId,
          statusId,
          input,
        ),
      );
    },

    deleteStatus(ctx, projectId, statusId) {
      return withProviderErrorMapping(ctx.correlationId, async () => {
        await core.projectStates.delete(toIntegrationContext(ctx), projectId, statusId);
      });
    },

    listLabels(ctx, projectId, query) {
      const { page, sort, filter } = unwrapListQuery<LabelListFilter>(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.labels.list(
          toIntegrationContext(ctx),
          projectId,
          filter,
          page,
          sort as never,
        ),
      );
    },

    createLabel(ctx, projectId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.labels.create(toIntegrationContext(ctx), projectId, input),
      );
    },

    updateLabel(ctx, projectId, labelId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.labels.update(toIntegrationContext(ctx), projectId, labelId, input),
      );
    },

    deleteLabel(ctx, projectId, labelId) {
      return withProviderErrorMapping(ctx.correlationId, async () => {
        await core.labels.delete(toIntegrationContext(ctx), projectId, labelId);
      });
    },

    listSprints(ctx, projectId, query) {
      const { page, sort, filter } = unwrapListQuery<CycleListFilter>(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.cycles.list(
          toIntegrationContext(ctx),
          projectId,
          filter,
          page,
          sort as never,
        ),
      );
    },

    async getSprint(ctx, sprintRef) {
      const decoded = decodePlaneSprintRef(sprintRef);
      if (!decoded) {
        throwUnsupportedProviderOperation(
          ctx.correlationId,
          "project.getSprint — requires project::sprint native ref from mapping layer",
        );
      }

      return withProviderErrorMapping(ctx.correlationId, () =>
        core.cycles.get(
          toIntegrationContext(ctx),
          decoded.projectNativeId,
          decoded.sprintNativeId,
        ),
      );
    },

    createSprint(ctx, projectId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.cycles.create(toIntegrationContext(ctx), projectId, input),
      );
    },

    async updateSprint(ctx, sprintRef, input) {
      const decoded = decodePlaneSprintRef(sprintRef);
      if (!decoded) {
        throwUnsupportedProviderOperation(
          ctx.correlationId,
          "project.updateSprint — requires project::sprint native ref from mapping layer",
        );
      }

      return withProviderErrorMapping(ctx.correlationId, () =>
        core.cycles.update(
          toIntegrationContext(ctx),
          decoded.projectNativeId,
          decoded.sprintNativeId,
          input,
        ),
      );
    },

    async archiveSprint(ctx, sprintRef) {
      const decoded = decodePlaneSprintRef(sprintRef);
      if (!decoded) {
        throwUnsupportedProviderOperation(
          ctx.correlationId,
          "project.archiveSprint — requires project::sprint native ref from mapping layer",
        );
      }

      return withProviderErrorMapping(ctx.correlationId, () =>
        core.cycles.archive(
          toIntegrationContext(ctx),
          decoded.projectNativeId,
          decoded.sprintNativeId,
        ),
      );
    },

    async startSprint(ctx, sprintRef) {
      const decoded = decodePlaneSprintRef(sprintRef);
      if (!decoded) {
        throwUnsupportedProviderOperation(
          ctx.correlationId,
          "project.startSprint — requires project::sprint native ref from mapping layer",
        );
      }

      return withProviderErrorMapping(ctx.correlationId, () =>
        core.cycles.update(
          toIntegrationContext(ctx),
          decoded.projectNativeId,
          decoded.sprintNativeId,
          { status: "active" },
        ),
      );
    },

    async completeSprint(ctx, sprintRef) {
      const decoded = decodePlaneSprintRef(sprintRef);
      if (!decoded) {
        throwUnsupportedProviderOperation(
          ctx.correlationId,
          "project.completeSprint — requires project::sprint native ref from mapping layer",
        );
      }

      return withProviderErrorMapping(ctx.correlationId, () =>
        core.cycles.update(
          toIntegrationContext(ctx),
          decoded.projectNativeId,
          decoded.sprintNativeId,
          { status: "completed" },
        ),
      );
    },

    listModules(ctx, projectId, query) {
      const { page, sort, filter } = unwrapListQuery<ModuleListFilter>(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.modules.list(
          toIntegrationContext(ctx),
          projectId,
          filter,
          page,
          sort as never,
        ),
      );
    },

    getModule(ctx, projectId, moduleId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.modules.get(toIntegrationContext(ctx), projectId, moduleId),
      );
    },

    createModule(ctx, projectId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.modules.create(toIntegrationContext(ctx), projectId, input),
      );
    },

    updateModule(ctx, projectId, moduleId, input) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.modules.update(toIntegrationContext(ctx), projectId, moduleId, input),
      );
    },

    archiveModule(ctx, projectId, moduleId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.modules.archive(toIntegrationContext(ctx), projectId, moduleId),
      );
    },

    async listMilestones(ctx) {
      throwUnsupportedProviderOperation(ctx.correlationId, "project.listMilestones");
    },

    async createMilestone(ctx) {
      throwUnsupportedProviderOperation(ctx.correlationId, "project.createMilestone");
    },

    async updateMilestone(ctx) {
      throwUnsupportedProviderOperation(ctx.correlationId, "project.updateMilestone");
    },

    getRoadmap(ctx, projectId): Promise<Roadmap> {
      return withProviderErrorMapping(ctx.correlationId, async () => ({
        projectId,
        items: [],
      }));
    },

    listProjectActivity(ctx, _projectId, _page?): Promise<ActivityPage> {
      return withProviderErrorMapping(ctx.correlationId, async () => ({
        items: [],
        hasNextPage: false,
      }));
    },
  };
}

export const PLANE_PROJECT_PROVIDER_REGISTRATION = {
  providerId: PLANE_PROJECT_PROVIDER_ID,
  integrationId: PLANE_INTEGRATION_ID,
  capability: "project" as const,
  priority: 100,
};
