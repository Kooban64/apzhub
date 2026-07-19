/** Time Workbench view models — Platform API shapes only (string IDs). */

export type TimesheetStatus = "running" | "stopped" | "archived";

export type TimeActivityStatus = "active" | "archived";

export type TimeCustomerStatus = "active" | "archived";

export type TimeTagStatus = "active" | "archived";

export type TimeProjectStatus = "active" | "archived";

export interface Timesheet {
  readonly id: string;
  readonly tenantId: string;
  readonly userId: string;
  readonly description?: string;
  readonly status: TimesheetStatus;
  readonly durationMinutes: number;
  readonly startedAt: string;
  readonly endedAt?: string;
  readonly activityId?: string;
  readonly customerId?: string;
  readonly projectId?: string;
  readonly tagIds: readonly string[];
  readonly billable: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TimeActivity {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly description?: string;
  readonly projectId?: string;
  readonly status: TimeActivityStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TimeCustomer {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly number?: string;
  readonly status: TimeCustomerStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TimeTag {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly color?: string;
  readonly status: TimeTagStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TimeProject {
  readonly id: string;
  readonly tenantId: string;
  readonly name: string;
  readonly customerId?: string;
  readonly status: TimeProjectStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TimePaginationParams {
  readonly page?: number;
  readonly perPage?: number;
  readonly limit?: number;
  readonly cursor?: string;
  readonly sort?: string;
  readonly order?: "asc" | "desc";
  readonly search?: string;
}

export type TimesheetListParams = TimePaginationParams;

export type TimeActivityListParams = TimePaginationParams;

export type TimeCustomerListParams = TimePaginationParams;

export type TimeTagListParams = TimePaginationParams;

export type TimeProjectListParams = TimePaginationParams;

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

export interface CreateTimeCustomerInput {
  readonly name: string;
  readonly number?: string;
}

export interface UpdateTimeCustomerInput {
  readonly name?: string;
  readonly number?: string;
}

export interface CreateTimeTagInput {
  readonly name: string;
  readonly color?: string;
}

export interface UpdateTimeTagInput {
  readonly name?: string;
  readonly color?: string;
}

export interface TimeCollectionResult<T> {
  readonly items: readonly T[];
  readonly page?: {
    readonly page?: number;
    readonly perPage?: number;
    readonly limit?: number;
    readonly hasMore?: boolean;
    readonly cursor?: string | null;
    readonly nextCursor?: string | null;
  };
}

export interface TimeSearchHit {
  readonly type: "activity" | "customer" | "project" | "tag" | "timesheet";
  readonly id: string;
  readonly label: string;
}

export interface TimeHealthSnapshot {
  readonly status: string;
  readonly version?: string;
  readonly checks?:
    | readonly { readonly name: string; readonly status: string }[]
    | Record<string, string>;
  readonly details?: Record<string, string>;
  readonly observedAt?: string;
}

export interface TimeDiagnosticsSnapshot {
  readonly healthStatus?: string;
  readonly warnings?: readonly string[];
  readonly recommendations?: readonly string[];
  readonly foundationOnly?: boolean;
  readonly details?: Record<string, unknown>;
}

export interface TimeCapabilitiesSnapshot {
  readonly timeEnabled?: boolean;
  readonly domainMode?: string;
  readonly opsMode?: string;
  readonly httpApiVersion?: string;
  readonly workbenchReady?: boolean;
  readonly productReady?: boolean;
  readonly operations?: readonly string[];
  readonly [key: string]: unknown;
}

export interface TimeReadinessSnapshot {
  readonly ready?: boolean;
  readonly classification?: string;
  readonly blockingFailures?: readonly string[];
  readonly warnings?: readonly string[];
  readonly [key: string]: unknown;
}

export interface TimeCompatibilitySnapshot {
  readonly compatibilityStatus?: string;
  readonly edition?: string;
  readonly [key: string]: unknown;
}

export interface TimeConnectionTestResult {
  readonly ok: boolean;
  readonly message?: string;
}

export interface TimeApiRequestOptions {
  readonly signal?: AbortSignal;
  readonly correlationId?: string;
}
