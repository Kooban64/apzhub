import type { ServiceRequestContext } from "../../common/context";
import type { ListQuery } from "../../common/list-query";
import type { PageResult } from "../../common/paging";
import type { TimeProject } from "../../domain/time";
import type { TimeProjectId } from "../../domain/identifiers";

export interface CreateTimeProjectInput {
  readonly name: string;
  readonly customerId?: string;
}

export interface UpdateTimeProjectInput {
  readonly name?: string;
  readonly customerId?: string | null;
}

export interface ProjectTimeService {
  list(ctx: ServiceRequestContext, query?: ListQuery): Promise<PageResult<TimeProject>>;
  get(ctx: ServiceRequestContext, projectId: TimeProjectId): Promise<TimeProject>;
  create(
    ctx: ServiceRequestContext,
    input: CreateTimeProjectInput,
  ): Promise<TimeProject>;
  update(
    ctx: ServiceRequestContext,
    projectId: TimeProjectId,
    input: UpdateTimeProjectInput,
  ): Promise<TimeProject>;
  archive(ctx: ServiceRequestContext, projectId: TimeProjectId): Promise<TimeProject>;
}
