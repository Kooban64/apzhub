import type { ServiceRequestContext } from "../../common/context";
import type { ListQuery } from "../../common/list-query";
import type { PageResult } from "../../common/paging";
import type { TimeActivity } from "../../domain/time";
import type { TimeActivityId } from "../../domain/identifiers";

export interface CreateTimeActivityInput {
  readonly name: string;
  readonly description?: string;
  readonly projectId?: string;
}

export interface UpdateTimeActivityInput {
  readonly name?: string;
  readonly description?: string;
  readonly projectId?: string | null;
}

export interface TimeActivityService {
  list(
    ctx: ServiceRequestContext,
    query?: ListQuery,
  ): Promise<PageResult<TimeActivity>>;
  get(ctx: ServiceRequestContext, activityId: TimeActivityId): Promise<TimeActivity>;
  create(
    ctx: ServiceRequestContext,
    input: CreateTimeActivityInput,
  ): Promise<TimeActivity>;
  update(
    ctx: ServiceRequestContext,
    activityId: TimeActivityId,
    input: UpdateTimeActivityInput,
  ): Promise<TimeActivity>;
  archive(
    ctx: ServiceRequestContext,
    activityId: TimeActivityId,
  ): Promise<TimeActivity>;
}
