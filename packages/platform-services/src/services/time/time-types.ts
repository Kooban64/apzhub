import type {
  CreateTimeActivityInput,
  CreateTimeCustomerInput,
  CreateTimeProjectInput,
  CreateTimeTagInput,
  CreateTimesheetInput,
  PageResult,
  ServiceRequestContext,
  TimeActivity,
  TimeCompatibilitySnapshot,
  TimeConnectionTestResult,
  TimeCustomer,
  TimeDiagnosticsSnapshot,
  TimeFoundationCapabilities,
  TimeHealthSnapshot,
  TimeProject,
  TimeReadinessSnapshot,
  TimeReportingCapabilities,
  TimeReportingHealth,
  TimeTag,
  Timesheet,
  UpdateTimeActivityInput,
  UpdateTimeCustomerInput,
  UpdateTimeProjectInput,
  UpdateTimeTagInput,
  UpdateTimesheetInput,
  ListQuery,
} from "@apzhub/platform-service-contracts";

export interface TimeOpsProvider {
  getFoundationCapabilities(
    ctx: ServiceRequestContext,
  ): Promise<TimeFoundationCapabilities>;
  testConnection(ctx: ServiceRequestContext): Promise<TimeConnectionTestResult>;
  getHealth(ctx: ServiceRequestContext): Promise<TimeHealthSnapshot>;
  getDiagnostics(ctx: ServiceRequestContext): Promise<TimeDiagnosticsSnapshot>;
  getCompatibility(ctx: ServiceRequestContext): Promise<TimeCompatibilitySnapshot>;
  getReadiness(ctx: ServiceRequestContext): Promise<TimeReadinessSnapshot>;
}

export interface TimeDomainProvider {
  listActivities(
    ctx: ServiceRequestContext,
    query?: ListQuery,
  ): Promise<PageResult<TimeActivity>>;
  getActivity(ctx: ServiceRequestContext, id: string): Promise<TimeActivity>;
  createActivity(
    ctx: ServiceRequestContext,
    input: CreateTimeActivityInput,
  ): Promise<TimeActivity>;
  updateActivity(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateTimeActivityInput,
  ): Promise<TimeActivity>;
  archiveActivity(ctx: ServiceRequestContext, id: string): Promise<TimeActivity>;

  listCustomers(
    ctx: ServiceRequestContext,
    query?: ListQuery,
  ): Promise<PageResult<TimeCustomer>>;
  getCustomer(ctx: ServiceRequestContext, id: string): Promise<TimeCustomer>;
  createCustomer(
    ctx: ServiceRequestContext,
    input: CreateTimeCustomerInput,
  ): Promise<TimeCustomer>;
  updateCustomer(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateTimeCustomerInput,
  ): Promise<TimeCustomer>;
  archiveCustomer(ctx: ServiceRequestContext, id: string): Promise<TimeCustomer>;

  listProjects(
    ctx: ServiceRequestContext,
    query?: ListQuery,
  ): Promise<PageResult<TimeProject>>;
  getProject(ctx: ServiceRequestContext, id: string): Promise<TimeProject>;
  createProject(
    ctx: ServiceRequestContext,
    input: CreateTimeProjectInput,
  ): Promise<TimeProject>;
  updateProject(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateTimeProjectInput,
  ): Promise<TimeProject>;
  archiveProject(ctx: ServiceRequestContext, id: string): Promise<TimeProject>;

  listTimesheets(
    ctx: ServiceRequestContext,
    query?: ListQuery,
  ): Promise<PageResult<Timesheet>>;
  getTimesheet(ctx: ServiceRequestContext, id: string): Promise<Timesheet>;
  createTimesheet(
    ctx: ServiceRequestContext,
    input: CreateTimesheetInput,
  ): Promise<Timesheet>;
  updateTimesheet(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateTimesheetInput,
  ): Promise<Timesheet>;
  stopTimesheet(ctx: ServiceRequestContext, id: string): Promise<Timesheet>;
  archiveTimesheet(ctx: ServiceRequestContext, id: string): Promise<Timesheet>;

  listTags(ctx: ServiceRequestContext, query?: ListQuery): Promise<PageResult<TimeTag>>;
  getTag(ctx: ServiceRequestContext, id: string): Promise<TimeTag>;
  createTag(ctx: ServiceRequestContext, input: CreateTimeTagInput): Promise<TimeTag>;
  updateTag(
    ctx: ServiceRequestContext,
    id: string,
    input: UpdateTimeTagInput,
  ): Promise<TimeTag>;
  archiveTag(ctx: ServiceRequestContext, id: string): Promise<TimeTag>;

  getReportingCapabilities(
    ctx: ServiceRequestContext,
  ): Promise<TimeReportingCapabilities>;
  getReportingHealth(ctx: ServiceRequestContext): Promise<TimeReportingHealth>;
}
