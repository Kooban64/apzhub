import {
  PlatformServiceError,
  type CreateTimeActivityInput,
  type CreateTimeCustomerInput,
  type CreateTimeProjectInput,
  type CreateTimeTagInput,
  type CreateTimesheetInput,
  type ListQuery,
  type PageResult,
  type ServiceRequestContext,
  type TimeActivity,
  type TimeCustomer,
  type TimeProject,
  type TimeReportingCapabilities,
  type TimeReportingHealth,
  type TimeTag,
  type Timesheet,
  type UpdateTimeActivityInput,
  type UpdateTimeCustomerInput,
  type UpdateTimeProjectInput,
  type UpdateTimeTagInput,
  type UpdateTimesheetInput,
} from "@apzhub/platform-service-contracts";

import type { TimeDomainProvider } from "./time-types";

function now(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function page<T>(items: readonly T[], query?: ListQuery): PageResult<T> {
  const pageNumber = query?.page?.page ?? 1;
  const perPage = query?.page?.perPage ?? 50;
  const offset = Math.max(0, (pageNumber - 1) * perPage);
  const slice = items.slice(offset, offset + perPage);
  return {
    items: slice,
    totalCount: items.length,
    page: pageNumber,
    perPage,
    hasNextPage: offset + perPage < items.length,
  };
}

/**
 * Full in-memory Time domain provider for tests and local verification.
 * Not a production SoR — production domain requires a future Kimai domain expansion.
 */
export class InMemoryTimeDomainProvider implements TimeDomainProvider {
  private readonly activities = new Map<string, TimeActivity>();
  private readonly customers = new Map<string, TimeCustomer>();
  private readonly projects = new Map<string, TimeProject>();
  private readonly timesheets = new Map<string, Timesheet>();
  private readonly tags = new Map<string, TimeTag>();

  async listActivities(ctx: ServiceRequestContext, query?: ListQuery) {
    return page(
      [...this.activities.values()].filter((a) => a.tenantId === ctx.tenantId),
      query,
    );
  }
  async getActivity(ctx: ServiceRequestContext, activityId: string) {
    return this.require(this.activities, ctx, activityId, "Activity");
  }
  async createActivity(ctx: ServiceRequestContext, input: CreateTimeActivityInput) {
    const entity: TimeActivity = {
      id: id("tact"),
      tenantId: ctx.tenantId,
      name: input.name,
      description: input.description,
      projectId: input.projectId,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
    };
    this.activities.set(entity.id, entity);
    return entity;
  }
  async updateActivity(
    ctx: ServiceRequestContext,
    activityId: string,
    input: UpdateTimeActivityInput,
  ) {
    const current = await this.getActivity(ctx, activityId);
    const next: TimeActivity = {
      ...current,
      name: input.name ?? current.name,
      description:
        input.description === undefined ? current.description : input.description,
      projectId:
        input.projectId === undefined
          ? current.projectId
          : (input.projectId ?? undefined),
      updatedAt: now(),
    };
    this.activities.set(activityId, next);
    return next;
  }
  async archiveActivity(ctx: ServiceRequestContext, activityId: string) {
    const current = await this.getActivity(ctx, activityId);
    const next = { ...current, status: "archived" as const, updatedAt: now() };
    this.activities.set(activityId, next);
    return next;
  }

  async listCustomers(ctx: ServiceRequestContext, query?: ListQuery) {
    return page(
      [...this.customers.values()].filter((c) => c.tenantId === ctx.tenantId),
      query,
    );
  }
  async getCustomer(ctx: ServiceRequestContext, customerId: string) {
    return this.require(this.customers, ctx, customerId, "Customer");
  }
  async createCustomer(ctx: ServiceRequestContext, input: CreateTimeCustomerInput) {
    const entity: TimeCustomer = {
      id: id("tcust"),
      tenantId: ctx.tenantId,
      name: input.name,
      number: input.number,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
    };
    this.customers.set(entity.id, entity);
    return entity;
  }
  async updateCustomer(
    ctx: ServiceRequestContext,
    customerId: string,
    input: UpdateTimeCustomerInput,
  ) {
    const current = await this.getCustomer(ctx, customerId);
    const next = {
      ...current,
      name: input.name ?? current.name,
      number: input.number ?? current.number,
      updatedAt: now(),
    };
    this.customers.set(customerId, next);
    return next;
  }
  async archiveCustomer(ctx: ServiceRequestContext, customerId: string) {
    const current = await this.getCustomer(ctx, customerId);
    const next = { ...current, status: "archived" as const, updatedAt: now() };
    this.customers.set(customerId, next);
    return next;
  }

  async listProjects(ctx: ServiceRequestContext, query?: ListQuery) {
    return page(
      [...this.projects.values()].filter((p) => p.tenantId === ctx.tenantId),
      query,
    );
  }
  async getProject(ctx: ServiceRequestContext, projectId: string) {
    return this.require(this.projects, ctx, projectId, "Time project");
  }
  async createProject(ctx: ServiceRequestContext, input: CreateTimeProjectInput) {
    const entity: TimeProject = {
      id: id("tproj"),
      tenantId: ctx.tenantId,
      name: input.name,
      customerId: input.customerId,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
    };
    this.projects.set(entity.id, entity);
    return entity;
  }
  async updateProject(
    ctx: ServiceRequestContext,
    projectId: string,
    input: UpdateTimeProjectInput,
  ) {
    const current = await this.getProject(ctx, projectId);
    const next = {
      ...current,
      name: input.name ?? current.name,
      customerId:
        input.customerId === undefined
          ? current.customerId
          : (input.customerId ?? undefined),
      updatedAt: now(),
    };
    this.projects.set(projectId, next);
    return next;
  }
  async archiveProject(ctx: ServiceRequestContext, projectId: string) {
    const current = await this.getProject(ctx, projectId);
    const next = { ...current, status: "archived" as const, updatedAt: now() };
    this.projects.set(projectId, next);
    return next;
  }

  async listTimesheets(ctx: ServiceRequestContext, query?: ListQuery) {
    return page(
      [...this.timesheets.values()].filter((t) => t.tenantId === ctx.tenantId),
      query,
    );
  }
  async getTimesheet(ctx: ServiceRequestContext, timesheetId: string) {
    return this.require(this.timesheets, ctx, timesheetId, "Timesheet");
  }
  async createTimesheet(ctx: ServiceRequestContext, input: CreateTimesheetInput) {
    const startedAt = input.startedAt ?? now();
    const entity: Timesheet = {
      id: id("tts"),
      tenantId: ctx.tenantId,
      userId: ctx.userId,
      description: input.description,
      status: "running",
      durationMinutes: 0,
      startedAt,
      activityId: input.activityId,
      customerId: input.customerId,
      projectId: input.projectId,
      tagIds: input.tagIds ?? [],
      billable: input.billable ?? true,
      createdAt: now(),
      updatedAt: now(),
    };
    this.timesheets.set(entity.id, entity);
    return entity;
  }
  async updateTimesheet(
    ctx: ServiceRequestContext,
    timesheetId: string,
    input: UpdateTimesheetInput,
  ) {
    const current = await this.getTimesheet(ctx, timesheetId);
    const endedAt = input.endedAt ?? current.endedAt;
    const durationMinutes = endedAt
      ? Math.max(
          0,
          Math.round((Date.parse(endedAt) - Date.parse(current.startedAt)) / 60000),
        )
      : current.durationMinutes;
    const next: Timesheet = {
      ...current,
      description: input.description ?? current.description,
      activityId:
        input.activityId === undefined
          ? current.activityId
          : (input.activityId ?? undefined),
      customerId:
        input.customerId === undefined
          ? current.customerId
          : (input.customerId ?? undefined),
      projectId:
        input.projectId === undefined
          ? current.projectId
          : (input.projectId ?? undefined),
      tagIds: input.tagIds ?? current.tagIds,
      billable: input.billable ?? current.billable,
      endedAt,
      durationMinutes,
      status: endedAt ? "stopped" : current.status,
      updatedAt: now(),
    };
    this.timesheets.set(timesheetId, next);
    return next;
  }
  async stopTimesheet(ctx: ServiceRequestContext, timesheetId: string) {
    return this.updateTimesheet(ctx, timesheetId, { endedAt: now() });
  }
  async archiveTimesheet(ctx: ServiceRequestContext, timesheetId: string) {
    const current = await this.getTimesheet(ctx, timesheetId);
    const next = { ...current, status: "archived" as const, updatedAt: now() };
    this.timesheets.set(timesheetId, next);
    return next;
  }

  async listTags(ctx: ServiceRequestContext, query?: ListQuery) {
    return page(
      [...this.tags.values()].filter((t) => t.tenantId === ctx.tenantId),
      query,
    );
  }
  async getTag(ctx: ServiceRequestContext, tagId: string) {
    return this.require(this.tags, ctx, tagId, "Tag");
  }
  async createTag(ctx: ServiceRequestContext, input: CreateTimeTagInput) {
    const entity: TimeTag = {
      id: id("ttag"),
      tenantId: ctx.tenantId,
      name: input.name,
      color: input.color,
      status: "active",
      createdAt: now(),
      updatedAt: now(),
    };
    this.tags.set(entity.id, entity);
    return entity;
  }
  async updateTag(
    ctx: ServiceRequestContext,
    tagId: string,
    input: UpdateTimeTagInput,
  ) {
    const current = await this.getTag(ctx, tagId);
    const next = {
      ...current,
      name: input.name ?? current.name,
      color: input.color ?? current.color,
      updatedAt: now(),
    };
    this.tags.set(tagId, next);
    return next;
  }
  async archiveTag(ctx: ServiceRequestContext, tagId: string) {
    const current = await this.getTag(ctx, tagId);
    const next = { ...current, status: "archived" as const, updatedAt: now() };
    this.tags.set(tagId, next);
    return next;
  }

  async getReportingCapabilities(
    _ctx: ServiceRequestContext,
  ): Promise<TimeReportingCapabilities> {
    return {
      foundationOnly: true,
      supported: ["capabilities", "health"],
      unsupported: ["exports", "analytics", "scheduledReports", "ui"],
    };
  }

  async getReportingHealth(_ctx: ServiceRequestContext): Promise<TimeReportingHealth> {
    return {
      status: "healthy",
      message: "Time reporting foundation available (no export engines)",
      checkedAt: now(),
    };
  }

  private require<T extends { tenantId: string }>(
    store: Map<string, T>,
    ctx: ServiceRequestContext,
    entityId: string,
    label: string,
  ): T {
    const entity = store.get(entityId);
    if (!entity || entity.tenantId !== ctx.tenantId) {
      throw new PlatformServiceError({
        category: "not_found",
        code: "NOT_FOUND",
        message: `${label} not found`,
        correlationId: ctx.correlationId,
        retryable: false,
      });
    }
    return entity;
  }
}

export function createInMemoryTimeDomainProvider(): TimeDomainProvider {
  return new InMemoryTimeDomainProvider();
}
