import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type {
  PlaneCycleRecord,
  PlanePaginatedResponse,
} from "../internal/plane-api-types";
import {
  mapCycleToPlaneBody,
  mapPlaneCycle,
  resolveProjectPlaneId,
} from "../mappers/cycle-mapper";
import type { Sprint } from "../models/canonical";
import type { CreateCycleInput, UpdateCycleInput } from "../models/inputs";
import type {
  CycleListFilter,
  PageRequest,
  PageResult,
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
  validatePlaneCycleResponse,
  validatePlanePaginatedResponse,
} from "../validation/response-validation";
import {
  applyClientFilters,
  applyClientSort,
  buildPlaneListQuery,
  mapPaginatedResult,
} from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const CYCLE_SORT_FIELDS = ["name", "start_date", "end_date"] as const;

export class PlaneCycleService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    filter: CycleListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof CYCLE_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<Sprint>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, CYCLE_SORT_FIELDS),
      ),
      "cycles.list",
    );

    return this.deps.runner.run(context, "cycles.list", async () => {
      const response = (await this.deps.client.listCycles(
        context,
        resolveProjectPlaneId(projectId),
        buildPlaneListQuery(page, sort),
      )) as PlanePaginatedResponse<PlaneCycleRecord>;

      assertValid(validatePlanePaginatedResponse(response), "cycles.list.response");

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneCycleResponse(item), "cycle.entity");
          return mapPlaneCycle(item, projectId);
        },
        page,
      );

      if (filter.status && filter.status !== "all") {
        result = {
          ...result,
          items: applyClientFilters(
            result.items,
            (item) => item.status === filter.status,
          ),
        };
      }

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            if (field === "start_date") return item.startDate ?? "";
            if (field === "end_date") return item.endDate ?? "";
            return item.name;
          }),
        };
      }

      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
  ): Promise<Sprint> {
    return this.deps.runner.run(context, "cycles.get", async () => {
      const record = await this.deps.client.getCycle(
        context,
        resolveProjectPlaneId(projectId),
        cycleId.replace(/^sprint_plane_/, ""),
      );
      assertValid(validatePlaneCycleResponse(record), "cycle.entity");
      return mapPlaneCycle(record, projectId);
    });
  }

  async create(
    context: IntegrationRequestContext,
    projectId: string,
    input: CreateCycleInput,
  ): Promise<Sprint> {
    assertValid(validateRequiredString(input.name, "name"), "cycles.create");

    return this.deps.runner.run(context, "cycles.create", async () => {
      const record = await this.deps.client.createCycle(
        context,
        resolveProjectPlaneId(projectId),
        mapCycleToPlaneBody(input),
      );
      assertValid(validatePlaneCycleResponse(record), "cycle.entity");
      return mapPlaneCycle(record, projectId);
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
    input: UpdateCycleInput,
  ): Promise<Sprint> {
    return this.deps.runner.run(context, "cycles.update", async () => {
      const record = await this.deps.client.updateCycle(
        context,
        resolveProjectPlaneId(projectId),
        cycleId.replace(/^sprint_plane_/, ""),
        mapCycleToPlaneBody(input),
      );
      assertValid(validatePlaneCycleResponse(record), "cycle.entity");
      return mapPlaneCycle(record, projectId);
    });
  }

  async archive(
    context: IntegrationRequestContext,
    projectId: string,
    cycleId: string,
  ): Promise<Sprint> {
    return this.deps.runner.run(context, "cycles.archive", async () => {
      const record = await this.deps.client.archiveCycle(
        context,
        resolveProjectPlaneId(projectId),
        cycleId.replace(/^sprint_plane_/, ""),
      );
      assertValid(validatePlaneCycleResponse(record), "cycle.entity");
      return mapPlaneCycle(record, projectId);
    });
  }
}
