import type { ServiceRequestContext } from "../common/context";
import type { ListQuery } from "../common/list-query";
import type { PageResult } from "../common/paging";
import type { Workspace } from "../domain";
import type { WorkspaceListFilter, WorkspaceSortField } from "../queries";
import type { WorkspaceId } from "../domain/identifiers";

/** Vendor-neutral workspace operations — no backend types. */
export interface WorkspaceService {
  listWorkspaces(
    ctx: ServiceRequestContext,
    query?: ListQuery<WorkspaceListFilter, WorkspaceSortField>,
  ): Promise<PageResult<Workspace>>;

  getWorkspace(
    ctx: ServiceRequestContext,
    workspaceId: WorkspaceId,
  ): Promise<Workspace>;
}
