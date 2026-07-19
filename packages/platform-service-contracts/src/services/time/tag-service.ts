import type { ServiceRequestContext } from "../../common/context";
import type { ListQuery } from "../../common/list-query";
import type { PageResult } from "../../common/paging";
import type { TimeTag } from "../../domain/time";
import type { TimeTagId } from "../../domain/identifiers";

export interface CreateTimeTagInput {
  readonly name: string;
  readonly color?: string;
}

export interface UpdateTimeTagInput {
  readonly name?: string;
  readonly color?: string;
}

export interface TimeTagService {
  list(ctx: ServiceRequestContext, query?: ListQuery): Promise<PageResult<TimeTag>>;
  get(ctx: ServiceRequestContext, tagId: TimeTagId): Promise<TimeTag>;
  create(ctx: ServiceRequestContext, input: CreateTimeTagInput): Promise<TimeTag>;
  update(
    ctx: ServiceRequestContext,
    tagId: TimeTagId,
    input: UpdateTimeTagInput,
  ): Promise<TimeTag>;
  archive(ctx: ServiceRequestContext, tagId: TimeTagId): Promise<TimeTag>;
}
