import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type {
  PlanePaginatedResponse,
  PlaneProjectRecord,
} from "../internal/plane-api-types";
import { mapPlaneProject, mapProjectToPlaneBody } from "../mappers/project-mapper";
import { extractProjectPlaneId } from "../mappers/mapper-context";
import type { Project } from "../models/canonical";
import type { CreateProjectInput, UpdateProjectInput } from "../models/inputs";
import type {
  PageRequest,
  PageResult,
  ProjectListFilter,
  SortField,
} from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import {
  validatePlanePaginatedResponse,
  validatePlaneProjectResponse,
} from "../validation/response-validation";
import {
  applyClientSort,
  buildPlaneListQuery,
  mapPaginatedResult,
} from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const PROJECT_SORT_FIELDS = ["name", "identifier", "created_at", "updated_at"] as const;

export class PlaneProjectService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    filter: ProjectListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof PROJECT_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<Project>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, PROJECT_SORT_FIELDS),
      ),
      "projects.list",
    );

    return this.deps.runner.run(context, "projects.list", async () => {
      const archived =
        filter.status === "archived"
          ? true
          : filter.status === "active"
            ? false
            : undefined;

      const response = (await this.deps.client.listProjects(
        context,
        buildPlaneListQuery(page, sort, {
          ...(filter.search ? { search: filter.search } : {}),
          ...(archived !== undefined ? { archived } : {}),
        }),
      )) as PlanePaginatedResponse<PlaneProjectRecord>;

      assertValid(validatePlanePaginatedResponse(response), "projects.list.response");

      const mapperCtx = {
        tenantId: this.deps.serviceContext.tenantId,
        workspaceId: this.deps.serviceContext.workspaceId,
      };

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneProjectResponse(item), "project.entity");
          return mapPlaneProject(item, mapperCtx);
        },
        page,
      );

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "created_at") return item.createdAt;
            if (field === "updated_at") return item.updatedAt;
            return item[field as keyof Project] as string;
          }),
        };
      }

      return result;
    });
  }

  async get(context: IntegrationRequestContext, projectId: string): Promise<Project> {
    return this.deps.runner.run(context, "projects.get", async () => {
      const record = await this.deps.client.getProject(
        context,
        extractProjectPlaneId(projectId),
      );
      assertValid(validatePlaneProjectResponse(record), "project.entity");
      return mapPlaneProject(record, {
        tenantId: this.deps.serviceContext.tenantId,
        workspaceId: this.deps.serviceContext.workspaceId,
      });
    });
  }

  async create(
    context: IntegrationRequestContext,
    input: CreateProjectInput,
  ): Promise<Project> {
    assertValid(
      mergeValidation(
        validateRequiredString(input.name, "name", { maxLength: 255 }),
        validateRequiredString(input.identifier, "identifier", { maxLength: 12 }),
      ),
      "projects.create",
    );

    return this.deps.runner.run(context, "projects.create", async () => {
      const record = await this.deps.client.createProject(
        context,
        mapProjectToPlaneBody({
          name: input.name,
          identifier: input.identifier,
          description: input.description,
          leadId: input.leadId,
        }),
      );
      assertValid(validatePlaneProjectResponse(record), "project.entity");
      return mapPlaneProject(record, {
        tenantId: this.deps.serviceContext.tenantId,
        workspaceId: this.deps.serviceContext.workspaceId,
      });
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    input: UpdateProjectInput,
  ): Promise<Project> {
    return this.deps.runner.run(context, "projects.update", async () => {
      const record = await this.deps.client.updateProject(
        context,
        extractProjectPlaneId(projectId),
        mapProjectToPlaneBody({
          name: input.name,
          identifier: input.identifier,
          description: input.description,
          leadId: input.leadId,
          archived:
            input.status === "archived"
              ? true
              : input.status === "active"
                ? false
                : undefined,
        }),
      );
      assertValid(validatePlaneProjectResponse(record), "project.entity");
      return mapPlaneProject(record, {
        tenantId: this.deps.serviceContext.tenantId,
        workspaceId: this.deps.serviceContext.workspaceId,
      });
    });
  }

  async archive(
    context: IntegrationRequestContext,
    projectId: string,
  ): Promise<Project> {
    return this.deps.runner.run(context, "projects.archive", async () => {
      const record = await this.deps.client.archiveProject(
        context,
        extractProjectPlaneId(projectId),
      );
      assertValid(validatePlaneProjectResponse(record), "project.entity");
      return mapPlaneProject(record, {
        tenantId: this.deps.serviceContext.tenantId,
        workspaceId: this.deps.serviceContext.workspaceId,
      });
    });
  }
}
