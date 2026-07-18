import type { PlaneCoreServices } from "@apzhub/integration-plane";
import type {
  ListQuery,
  PageResult,
  ServiceRequestContext,
  Workspace,
  WorkspaceId,
  WorkspaceListFilter,
  WorkspaceSortField,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { WorkspaceProvider } from "../capability-providers";

const PLANE_INTEGRATION_ID = "plane";
const PLANE_WORKSPACE_PROVIDER_ID = "plane-workspace";

const WORKSPACE_SORT_MAP: Partial<Record<WorkspaceSortField, string>> = {
  name: "name",
  slug: "slug",
  createdAt: "created_at",
  updatedAt: "created_at",
};

function mapWorkspaceSort(
  sort: readonly { field: WorkspaceSortField; direction: "asc" | "desc" }[],
): readonly SortField<string>[] {
  return sort.flatMap((entry) => {
    const mapped = WORKSPACE_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

function extractPlaneWorkspaceKey(workspaceId: WorkspaceId): string {
  return workspaceId.startsWith("ws_plane_")
    ? workspaceId.slice("ws_plane_".length)
    : workspaceId;
}

/** Delegates workspace operations to Plane adapter core services. */
export function createPlaneWorkspaceProvider(
  core: PlaneCoreServices,
): WorkspaceProvider {
  return {
    async listWorkspaces(
      ctx: ServiceRequestContext,
      query?: ListQuery<WorkspaceListFilter, WorkspaceSortField>,
    ): Promise<PageResult<Workspace>> {
      const { page, sort, filter } = unwrapListQuery(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.workspaces.list(
          toIntegrationContext(ctx),
          filter,
          page,
          mapWorkspaceSort(sort) as never,
        ),
      );
    },

    async getWorkspace(
      ctx: ServiceRequestContext,
      workspaceId: WorkspaceId,
    ): Promise<Workspace> {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.workspaces.get(
          toIntegrationContext(ctx),
          extractPlaneWorkspaceKey(workspaceId),
        ),
      );
    },
  };
}

export const PLANE_WORKSPACE_PROVIDER_REGISTRATION = {
  providerId: PLANE_WORKSPACE_PROVIDER_ID,
  integrationId: PLANE_INTEGRATION_ID,
  capability: "workspace" as const,
  priority: 100,
};
