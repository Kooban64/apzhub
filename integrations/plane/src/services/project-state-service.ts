import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { PlanePaginatedResponse, PlaneStateRecord } from "../internal/plane-api-types";
import { mapPlaneState, mapStateToPlaneBody, resolveProjectPlaneId } from "../mappers/state-mapper";
import type { ProjectStatusEntity } from "../models/canonical";
import type { CreateProjectStateInput, UpdateProjectStateInput } from "../models/inputs";
import type { PageRequest, PageResult, ProjectStateListFilter, SortField } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import { validatePlanePaginatedResponse, validatePlaneStateResponse } from "../validation/response-validation";
import { applyClientFilters, applyClientSort, buildPlaneListQuery, mapPaginatedResult } from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const STATE_SORT_FIELDS = ["name", "order", "group"] as const;

export class PlaneProjectStateService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    filter: ProjectStateListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof STATE_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<ProjectStatusEntity>> {
    assertValid(
      mergeValidation(validatePageRequest(page), validateSortFields(sort, STATE_SORT_FIELDS)),
      "project_states.list",
    );

    const planeProjectId = resolveProjectPlaneId(projectId);

    return this.deps.runner.run(context, "project_states.list", async () => {
      const response = (await this.deps.client.listStates(
        context,
        planeProjectId,
        buildPlaneListQuery(page, sort),
      )) as PlanePaginatedResponse<PlaneStateRecord>;

      assertValid(validatePlanePaginatedResponse(response), "project_states.list.response");

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneStateResponse(item), "project_state.entity");
          return mapPlaneState(item, projectId);
        },
        page,
      );

      if (filter.group) {
        result = { ...result, items: applyClientFilters(result.items, (item) => item.group === filter.group) };
      }

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "order") return item.order;
            return item[field as keyof ProjectStatusEntity] as string;
          }),
        };
      }

      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    projectId: string,
    stateId: string,
  ): Promise<ProjectStatusEntity> {
    const planeProjectId = resolveProjectPlaneId(projectId);
    const planeStateId = stateId.replace(/^status_plane_/, "");

    return this.deps.runner.run(context, "project_states.get", async () => {
      const record = await this.deps.client.getState(context, planeProjectId, planeStateId);
      assertValid(validatePlaneStateResponse(record), "project_state.entity");
      return mapPlaneState(record, projectId);
    });
  }

  async create(
    context: IntegrationRequestContext,
    projectId: string,
    input: CreateProjectStateInput,
  ): Promise<ProjectStatusEntity> {
    assertValid(validateRequiredString(input.name, "name"), "project_states.create");

    return this.deps.runner.run(context, "project_states.create", async () => {
      const record = await this.deps.client.createState(
        context,
        resolveProjectPlaneId(projectId),
        mapStateToPlaneBody(input),
      );
      assertValid(validatePlaneStateResponse(record), "project_state.entity");
      return mapPlaneState(record, projectId);
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    stateId: string,
    input: UpdateProjectStateInput,
  ): Promise<ProjectStatusEntity> {
    return this.deps.runner.run(context, "project_states.update", async () => {
      const record = await this.deps.client.updateState(
        context,
        resolveProjectPlaneId(projectId),
        stateId.replace(/^status_plane_/, ""),
        mapStateToPlaneBody(input),
      );
      assertValid(validatePlaneStateResponse(record), "project_state.entity");
      return mapPlaneState(record, projectId);
    });
  }

  async delete(
    context: IntegrationRequestContext,
    projectId: string,
    stateId: string,
  ): Promise<void> {
    await this.deps.runner.run(context, "project_states.delete", async () => {
      await this.deps.client.deleteState(
        context,
        resolveProjectPlaneId(projectId),
        stateId.replace(/^status_plane_/, ""),
      );
    });
  }
}
