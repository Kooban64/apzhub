import type { ServiceRequestContext } from "../../common/context";
import type { ListQuery } from "../../common/list-query";
import type { PageResult } from "../../common/paging";
import type { Timesheet } from "../../domain/time";
import type { TimesheetId } from "../../domain/identifiers";

export interface CreateTimesheetInput {
  readonly description?: string;
  readonly startedAt?: string;
  readonly activityId?: string;
  readonly customerId?: string;
  readonly projectId?: string;
  readonly tagIds?: readonly string[];
  readonly billable?: boolean;
}

export interface UpdateTimesheetInput {
  readonly description?: string;
  readonly activityId?: string | null;
  readonly customerId?: string | null;
  readonly projectId?: string | null;
  readonly tagIds?: readonly string[];
  readonly billable?: boolean;
  readonly endedAt?: string;
}

export interface TimesheetService {
  list(ctx: ServiceRequestContext, query?: ListQuery): Promise<PageResult<Timesheet>>;
  get(ctx: ServiceRequestContext, timesheetId: TimesheetId): Promise<Timesheet>;
  create(ctx: ServiceRequestContext, input: CreateTimesheetInput): Promise<Timesheet>;
  update(
    ctx: ServiceRequestContext,
    timesheetId: TimesheetId,
    input: UpdateTimesheetInput,
  ): Promise<Timesheet>;
  stop(ctx: ServiceRequestContext, timesheetId: TimesheetId): Promise<Timesheet>;
  archive(ctx: ServiceRequestContext, timesheetId: TimesheetId): Promise<Timesheet>;
}
