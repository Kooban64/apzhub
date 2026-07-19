import type {
  TimeActivityId,
  TimeCustomerId,
  TimeProjectId,
  TimeTagId,
  TimesheetId,
  UserId,
} from "../identifiers";

export type TimesheetStatus = "running" | "stopped" | "archived";

export interface Timesheet {
  readonly id: TimesheetId;
  readonly tenantId: string;
  readonly userId: UserId;
  readonly description?: string;
  readonly status: TimesheetStatus;
  readonly durationMinutes: number;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly activityId?: TimeActivityId;
  readonly customerId?: TimeCustomerId;
  readonly projectId?: TimeProjectId;
  readonly tagIds: readonly TimeTagId[];
  readonly billable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TimesheetSummary {
  readonly id: TimesheetId;
  readonly userId: UserId;
  readonly status: TimesheetStatus;
  readonly durationMinutes: number;
  readonly startedAt: string;
  readonly projectId?: TimeProjectId;
}
