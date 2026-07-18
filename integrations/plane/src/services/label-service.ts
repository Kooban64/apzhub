import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type {
  PlaneLabelRecord,
  PlanePaginatedResponse,
} from "../internal/plane-api-types";
import {
  mapLabelToPlaneBody,
  mapPlaneLabel,
  resolveProjectPlaneId,
} from "../mappers/label-mapper";
import type { Label } from "../models/canonical";
import type { CreateLabelInput, UpdateLabelInput } from "../models/inputs";
import type {
  LabelListFilter,
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
  validatePlaneLabelResponse,
  validatePlanePaginatedResponse,
} from "../validation/response-validation";
import {
  applyClientSort,
  buildPlaneListQuery,
  mapPaginatedResult,
} from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const LABEL_SORT_FIELDS = ["name"] as const;

export class PlaneLabelService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    filter: LabelListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof LABEL_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<Label>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, LABEL_SORT_FIELDS),
      ),
      "labels.list",
    );

    return this.deps.runner.run(context, "labels.list", async () => {
      const response = (await this.deps.client.listLabels(
        context,
        resolveProjectPlaneId(projectId),
        buildPlaneListQuery(
          page,
          sort,
          filter.search ? { search: filter.search } : undefined,
        ),
      )) as PlanePaginatedResponse<PlaneLabelRecord>;

      assertValid(validatePlanePaginatedResponse(response), "labels.list.response");

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneLabelResponse(item), "label.entity");
          return mapPlaneLabel(item, projectId);
        },
        page,
      );

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(
            result.items,
            sort,
            (item, field) => item[field as keyof Label] as string,
          ),
        };
      }

      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    projectId: string,
    labelId: string,
  ): Promise<Label> {
    return this.deps.runner.run(context, "labels.get", async () => {
      const record = await this.deps.client.getLabel(
        context,
        resolveProjectPlaneId(projectId),
        labelId.replace(/^label_plane_/, ""),
      );
      assertValid(validatePlaneLabelResponse(record), "label.entity");
      return mapPlaneLabel(record, projectId);
    });
  }

  async create(
    context: IntegrationRequestContext,
    projectId: string,
    input: CreateLabelInput,
  ): Promise<Label> {
    assertValid(validateRequiredString(input.name, "name"), "labels.create");

    return this.deps.runner.run(context, "labels.create", async () => {
      const record = await this.deps.client.createLabel(
        context,
        resolveProjectPlaneId(projectId),
        mapLabelToPlaneBody(input),
      );
      assertValid(validatePlaneLabelResponse(record), "label.entity");
      return mapPlaneLabel(record, projectId);
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    labelId: string,
    input: UpdateLabelInput,
  ): Promise<Label> {
    return this.deps.runner.run(context, "labels.update", async () => {
      const record = await this.deps.client.updateLabel(
        context,
        resolveProjectPlaneId(projectId),
        labelId.replace(/^label_plane_/, ""),
        mapLabelToPlaneBody(input),
      );
      assertValid(validatePlaneLabelResponse(record), "label.entity");
      return mapPlaneLabel(record, projectId);
    });
  }

  async delete(
    context: IntegrationRequestContext,
    projectId: string,
    labelId: string,
  ): Promise<void> {
    await this.deps.runner.run(context, "labels.delete", async () => {
      await this.deps.client.deleteLabel(
        context,
        resolveProjectPlaneId(projectId),
        labelId.replace(/^label_plane_/, ""),
      );
    });
  }
}
