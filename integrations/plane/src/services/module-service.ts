import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { PlaneModuleRecord, PlanePaginatedResponse } from "../internal/plane-api-types";
import { mapModuleToPlaneBody, mapPlaneModule, resolveProjectPlaneId } from "../mappers/module-mapper";
import type { ProjectModule } from "../models/canonical";
import type { CreateModuleInput, UpdateModuleInput } from "../models/inputs";
import type { ModuleListFilter, PageRequest, PageResult, SortField } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import { validatePlaneModuleResponse, validatePlanePaginatedResponse } from "../validation/response-validation";
import { applyClientFilters, applyClientSort, buildPlaneListQuery, mapPaginatedResult } from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const MODULE_SORT_FIELDS = ["name", "start_date", "target_date"] as const;

export class PlaneModuleService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    filter: ModuleListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof MODULE_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<ProjectModule>> {
    assertValid(
      mergeValidation(validatePageRequest(page), validateSortFields(sort, MODULE_SORT_FIELDS)),
      "modules.list",
    );

    return this.deps.runner.run(context, "modules.list", async () => {
      const response = (await this.deps.client.listModules(
        context,
        resolveProjectPlaneId(projectId),
        buildPlaneListQuery(page, sort),
      )) as PlanePaginatedResponse<PlaneModuleRecord>;

      assertValid(validatePlanePaginatedResponse(response), "modules.list.response");

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneModuleResponse(item), "module.entity");
          return mapPlaneModule(item, projectId);
        },
        page,
      );

      if (filter.status && filter.status !== "all") {
        result = {
          ...result,
          items: applyClientFilters(result.items, (item) => item.status === filter.status),
        };
      }

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "start_date") return item.startDate ?? "";
            if (field === "target_date") return item.targetDate ?? "";
            return item.name;
          }),
        };
      }

      return result;
    });
  }

  async get(context: IntegrationRequestContext, projectId: string, moduleId: string): Promise<ProjectModule> {
    return this.deps.runner.run(context, "modules.get", async () => {
      const record = await this.deps.client.getModule(
        context,
        resolveProjectPlaneId(projectId),
        moduleId.replace(/^module_plane_/, ""),
      );
      assertValid(validatePlaneModuleResponse(record), "module.entity");
      return mapPlaneModule(record, projectId);
    });
  }

  async create(
    context: IntegrationRequestContext,
    projectId: string,
    input: CreateModuleInput,
  ): Promise<ProjectModule> {
    assertValid(validateRequiredString(input.name, "name"), "modules.create");

    return this.deps.runner.run(context, "modules.create", async () => {
      const record = await this.deps.client.createModule(
        context,
        resolveProjectPlaneId(projectId),
        mapModuleToPlaneBody(input),
      );
      assertValid(validatePlaneModuleResponse(record), "module.entity");
      return mapPlaneModule(record, projectId);
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    moduleId: string,
    input: UpdateModuleInput,
  ): Promise<ProjectModule> {
    return this.deps.runner.run(context, "modules.update", async () => {
      const record = await this.deps.client.updateModule(
        context,
        resolveProjectPlaneId(projectId),
        moduleId.replace(/^module_plane_/, ""),
        mapModuleToPlaneBody(input),
      );
      assertValid(validatePlaneModuleResponse(record), "module.entity");
      return mapPlaneModule(record, projectId);
    });
  }

  async archive(
    context: IntegrationRequestContext,
    projectId: string,
    moduleId: string,
  ): Promise<ProjectModule> {
    return this.deps.runner.run(context, "modules.archive", async () => {
      const record = await this.deps.client.archiveModule(
        context,
        resolveProjectPlaneId(projectId),
        moduleId.replace(/^module_plane_/, ""),
      );
      assertValid(validatePlaneModuleResponse(record), "module.entity");
      return mapPlaneModule(record, projectId);
    });
  }
}
