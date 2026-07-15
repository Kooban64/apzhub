import type { IntegrationRequestContext } from "@apzhub/integration-sdk";

import type { PlanePaginatedResponse, PlaneWorkspaceResponse } from "../internal/plane-api-types";
import { mapPlaneWorkspace } from "../mappers/workspace-mapper";
import type { Workspace } from "../models/canonical";
import type { PageRequest, PageResult, SortField, WorkspaceListFilter } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateSortFields,
} from "../validation/request-validation";
import { validatePlanePaginatedResponse, validatePlaneWorkspaceResponse } from "../validation/response-validation";
import { buildPlaneListQuery, mapPaginatedResult } from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const WORKSPACE_SORT_FIELDS = ["name", "slug", "created_at"] as const;

export class PlaneWorkspaceService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    filter: WorkspaceListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof WORKSPACE_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<Workspace>> {
    assertValid(
      mergeValidation(validatePageRequest(page), validateSortFields(sort, WORKSPACE_SORT_FIELDS)),
      "workspace.list",
    );

    return this.deps.runner.run(context, "workspaces.list", async () => {
      const response = (await this.deps.client.listWorkspaces(
        context,
        buildPlaneListQuery(page, sort, filter.search ? { search: filter.search } : undefined),
      )) as PlanePaginatedResponse<PlaneWorkspaceResponse>;

      assertValid(validatePlanePaginatedResponse(response), "workspace.list.response");

      const mapperCtx = {
        tenantId: this.deps.serviceContext.tenantId,
        workspaceId: this.deps.serviceContext.workspaceId,
      };

      return mapPaginatedResult(response, (item) => {
        assertValid(validatePlaneWorkspaceResponse(item), "workspace.entity");
        return mapPlaneWorkspace(item, mapperCtx);
      }, page);
    });
  }

  async get(context: IntegrationRequestContext, slug?: string): Promise<Workspace> {
    return this.deps.runner.run(context, "workspaces.get", async () => {
      const record = await this.deps.client.getWorkspace(context, slug);
      assertValid(validatePlaneWorkspaceResponse(record), "workspace.entity");
      return mapPlaneWorkspace(record, {
        tenantId: this.deps.serviceContext.tenantId,
        workspaceId: record.id,
      });
    });
  }
}
