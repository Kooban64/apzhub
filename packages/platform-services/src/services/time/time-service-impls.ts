import type {
  CreateTimeActivityInput,
  CreateTimeCustomerInput,
  CreateTimeProjectInput,
  CreateTimeTagInput,
  CreateTimesheetInput,
  ListQuery,
  ProjectTimeService,
  ServiceRequestContext,
  TimeActivityService,
  TimeCustomerService,
  TimePlatformGateway,
  TimeReportingService,
  TimeTagService,
  TimeTrackingService,
  TimesheetService,
  UpdateTimeActivityInput,
  UpdateTimeCustomerInput,
  UpdateTimeProjectInput,
  UpdateTimeTagInput,
  UpdateTimesheetInput,
} from "@apzhub/platform-service-contracts";

import { assertTimeContext } from "./assert-time-context";
import type { TimeDomainProvider, TimeOpsProvider } from "./time-types";

export class TimeTrackingServiceImpl implements TimeTrackingService {
  constructor(private readonly ops: TimeOpsProvider) {}
  getFoundationCapabilities(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.ops.getFoundationCapabilities(ctx);
  }
  testConnection(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.ops.testConnection(ctx);
  }
  getHealth(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.ops.getHealth(ctx);
  }
  getDiagnostics(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.ops.getDiagnostics(ctx);
  }
  getCompatibility(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.ops.getCompatibility(ctx);
  }
  getReadiness(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.ops.getReadiness(ctx);
  }
}

export class TimeActivityServiceImpl implements TimeActivityService {
  constructor(private readonly domain: TimeDomainProvider) {}
  list(ctx: ServiceRequestContext, query?: ListQuery) {
    assertTimeContext(ctx);
    return this.domain.listActivities(ctx, query);
  }
  get(ctx: ServiceRequestContext, activityId: string) {
    assertTimeContext(ctx);
    return this.domain.getActivity(ctx, activityId);
  }
  create(ctx: ServiceRequestContext, input: CreateTimeActivityInput) {
    assertTimeContext(ctx);
    return this.domain.createActivity(ctx, input);
  }
  update(
    ctx: ServiceRequestContext,
    activityId: string,
    input: UpdateTimeActivityInput,
  ) {
    assertTimeContext(ctx);
    return this.domain.updateActivity(ctx, activityId, input);
  }
  archive(ctx: ServiceRequestContext, activityId: string) {
    assertTimeContext(ctx);
    return this.domain.archiveActivity(ctx, activityId);
  }
}

export class TimeCustomerServiceImpl implements TimeCustomerService {
  constructor(private readonly domain: TimeDomainProvider) {}
  list(ctx: ServiceRequestContext, query?: ListQuery) {
    assertTimeContext(ctx);
    return this.domain.listCustomers(ctx, query);
  }
  get(ctx: ServiceRequestContext, customerId: string) {
    assertTimeContext(ctx);
    return this.domain.getCustomer(ctx, customerId);
  }
  create(ctx: ServiceRequestContext, input: CreateTimeCustomerInput) {
    assertTimeContext(ctx);
    return this.domain.createCustomer(ctx, input);
  }
  update(
    ctx: ServiceRequestContext,
    customerId: string,
    input: UpdateTimeCustomerInput,
  ) {
    assertTimeContext(ctx);
    return this.domain.updateCustomer(ctx, customerId, input);
  }
  archive(ctx: ServiceRequestContext, customerId: string) {
    assertTimeContext(ctx);
    return this.domain.archiveCustomer(ctx, customerId);
  }
}

export class ProjectTimeServiceImpl implements ProjectTimeService {
  constructor(private readonly domain: TimeDomainProvider) {}
  list(ctx: ServiceRequestContext, query?: ListQuery) {
    assertTimeContext(ctx);
    return this.domain.listProjects(ctx, query);
  }
  get(ctx: ServiceRequestContext, projectId: string) {
    assertTimeContext(ctx);
    return this.domain.getProject(ctx, projectId);
  }
  create(ctx: ServiceRequestContext, input: CreateTimeProjectInput) {
    assertTimeContext(ctx);
    return this.domain.createProject(ctx, input);
  }
  update(ctx: ServiceRequestContext, projectId: string, input: UpdateTimeProjectInput) {
    assertTimeContext(ctx);
    return this.domain.updateProject(ctx, projectId, input);
  }
  archive(ctx: ServiceRequestContext, projectId: string) {
    assertTimeContext(ctx);
    return this.domain.archiveProject(ctx, projectId);
  }
}

export class TimesheetServiceImpl implements TimesheetService {
  constructor(private readonly domain: TimeDomainProvider) {}
  list(ctx: ServiceRequestContext, query?: ListQuery) {
    assertTimeContext(ctx);
    return this.domain.listTimesheets(ctx, query);
  }
  get(ctx: ServiceRequestContext, timesheetId: string) {
    assertTimeContext(ctx);
    return this.domain.getTimesheet(ctx, timesheetId);
  }
  create(ctx: ServiceRequestContext, input: CreateTimesheetInput) {
    assertTimeContext(ctx);
    return this.domain.createTimesheet(ctx, input);
  }
  update(ctx: ServiceRequestContext, timesheetId: string, input: UpdateTimesheetInput) {
    assertTimeContext(ctx);
    return this.domain.updateTimesheet(ctx, timesheetId, input);
  }
  stop(ctx: ServiceRequestContext, timesheetId: string) {
    assertTimeContext(ctx);
    return this.domain.stopTimesheet(ctx, timesheetId);
  }
  archive(ctx: ServiceRequestContext, timesheetId: string) {
    assertTimeContext(ctx);
    return this.domain.archiveTimesheet(ctx, timesheetId);
  }
}

export class TimeTagServiceImpl implements TimeTagService {
  constructor(private readonly domain: TimeDomainProvider) {}
  list(ctx: ServiceRequestContext, query?: ListQuery) {
    assertTimeContext(ctx);
    return this.domain.listTags(ctx, query);
  }
  get(ctx: ServiceRequestContext, tagId: string) {
    assertTimeContext(ctx);
    return this.domain.getTag(ctx, tagId);
  }
  create(ctx: ServiceRequestContext, input: CreateTimeTagInput) {
    assertTimeContext(ctx);
    return this.domain.createTag(ctx, input);
  }
  update(ctx: ServiceRequestContext, tagId: string, input: UpdateTimeTagInput) {
    assertTimeContext(ctx);
    return this.domain.updateTag(ctx, tagId, input);
  }
  archive(ctx: ServiceRequestContext, tagId: string) {
    assertTimeContext(ctx);
    return this.domain.archiveTag(ctx, tagId);
  }
}

export class TimeReportingServiceImpl implements TimeReportingService {
  constructor(private readonly domain: TimeDomainProvider) {}
  getReportingCapabilities(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.domain.getReportingCapabilities(ctx);
  }
  getReportingHealth(ctx: ServiceRequestContext) {
    assertTimeContext(ctx);
    return this.domain.getReportingHealth(ctx);
  }
}

export interface TimePlatformServiceImpls {
  readonly tracking: TimeTrackingServiceImpl;
  readonly activities: TimeActivityServiceImpl;
  readonly customers: TimeCustomerServiceImpl;
  readonly projects: ProjectTimeServiceImpl;
  readonly timesheets: TimesheetServiceImpl;
  readonly tags: TimeTagServiceImpl;
  readonly reporting: TimeReportingServiceImpl;
}

export function createTimePlatformServiceImpls(input: {
  readonly ops: TimeOpsProvider;
  readonly domain: TimeDomainProvider;
}): TimePlatformServiceImpls {
  return {
    tracking: new TimeTrackingServiceImpl(input.ops),
    activities: new TimeActivityServiceImpl(input.domain),
    customers: new TimeCustomerServiceImpl(input.domain),
    projects: new ProjectTimeServiceImpl(input.domain),
    timesheets: new TimesheetServiceImpl(input.domain),
    tags: new TimeTagServiceImpl(input.domain),
    reporting: new TimeReportingServiceImpl(input.domain),
  };
}

export function toTimePlatformGateway(
  impls: TimePlatformServiceImpls,
): TimePlatformGateway {
  return {
    tracking: impls.tracking,
    activities: impls.activities,
    customers: impls.customers,
    projects: impls.projects,
    timesheets: impls.timesheets,
    tags: impls.tags,
    reporting: impls.reporting,
  };
}
