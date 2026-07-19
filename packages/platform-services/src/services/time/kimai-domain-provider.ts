import type { KimaiAdapter } from "@apzhub/integration-kimai";
import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
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

function toIntegrationContext(ctx: ServiceRequestContext): IntegrationRequestContext {
  return {
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
  };
}

function listQuery(query?: ListQuery) {
  const filter = query?.filter as { search?: string } | undefined;
  return {
    page: query?.page?.page,
    perPage: query?.page?.perPage,
    search: filter?.search,
  };
}

function mapError(error: unknown, ctx: ServiceRequestContext): never {
  if (error instanceof PlatformServiceError) {
    throw error;
  }
  const integrationError =
    typeof error === "object" &&
    error !== null &&
    "integrationError" in error &&
    typeof (error as { integrationError?: { code?: string; message?: string } })
      .integrationError === "object"
      ? (error as { integrationError: { code?: string; message?: string } })
          .integrationError
      : undefined;
  const vendorCode = integrationError?.code ?? "";
  const message =
    integrationError?.message ??
    (error instanceof Error ? error.message : "Kimai domain operation failed");
  const notFound =
    vendorCode.toLowerCase().includes("not_found") || /not found/i.test(message);
  throw new PlatformServiceError({
    category: notFound
      ? "not_found"
      : vendorCode === "INVALID_IDENTIFIER"
        ? "validation"
        : "integration",
    code: notFound
      ? "NOT_FOUND"
      : vendorCode === "INVALID_IDENTIFIER"
        ? "VALIDATION_FAILED"
        : "CONNECTOR_ERROR",
    message,
    correlationId: ctx.correlationId,
    retryable: false,
  });
}

function asTimesheet(
  ctx: ServiceRequestContext,
  item: {
    readonly id: string;
    readonly userId: string;
    readonly description?: string;
    readonly status: Timesheet["status"];
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
  },
): Timesheet {
  return {
    id: item.id,
    tenantId: ctx.tenantId,
    userId: item.userId === "unknown" ? ctx.userId : item.userId,
    description: item.description,
    status: item.status,
    durationMinutes: item.durationMinutes,
    startedAt: item.startedAt,
    endedAt: item.endedAt,
    activityId: item.activityId,
    customerId: item.customerId,
    projectId: item.projectId,
    tagIds: item.tagIds,
    billable: item.billable,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function asActivity(
  ctx: ServiceRequestContext,
  item: {
    readonly id: string;
    readonly name: string;
    readonly description?: string;
    readonly projectId?: string;
    readonly status: TimeActivity["status"];
    readonly createdAt: string;
    readonly updatedAt: string;
  },
): TimeActivity {
  return {
    id: item.id,
    tenantId: ctx.tenantId,
    name: item.name,
    description: item.description,
    projectId: item.projectId,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function asCustomer(
  ctx: ServiceRequestContext,
  item: {
    readonly id: string;
    readonly name: string;
    readonly number?: string;
    readonly status: TimeCustomer["status"];
    readonly createdAt: string;
    readonly updatedAt: string;
  },
): TimeCustomer {
  return {
    id: item.id,
    tenantId: ctx.tenantId,
    name: item.name,
    number: item.number,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function asProject(
  ctx: ServiceRequestContext,
  item: {
    readonly id: string;
    readonly name: string;
    readonly customerId?: string;
    readonly status: TimeProject["status"];
    readonly createdAt: string;
    readonly updatedAt: string;
  },
): TimeProject {
  return {
    id: item.id,
    tenantId: ctx.tenantId,
    name: item.name,
    customerId: item.customerId,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

function asTag(
  ctx: ServiceRequestContext,
  item: {
    readonly id: string;
    readonly name: string;
    readonly color?: string;
    readonly status: TimeTag["status"];
    readonly createdAt: string;
    readonly updatedAt: string;
  },
): TimeTag {
  return {
    id: item.id,
    tenantId: ctx.tenantId,
    name: item.name,
    color: item.color,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/**
 * Production Kimai domain provider — delegates to adapter.core (KIMAI-002).
 * No foundation-only fallback for implemented CE domains.
 */
export function createKimaiDomainProvider(adapter: KimaiAdapter): TimeDomainProvider {
  const core = adapter.core;

  return {
    async listActivities(ctx, query) {
      try {
        const result = await core.activities.list(
          toIntegrationContext(ctx),
          listQuery(query),
        );
        return {
          items: result.items.map((item) => asActivity(ctx, item)),
          totalCount: result.totalCount,
          page: result.page,
          perPage: result.perPage,
          hasNextPage: result.hasNextPage,
        } satisfies PageResult<TimeActivity>;
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async getActivity(ctx, id) {
      try {
        return asActivity(
          ctx,
          await core.activities.get(toIntegrationContext(ctx), id),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async createActivity(ctx, input: CreateTimeActivityInput) {
      try {
        return asActivity(
          ctx,
          await core.activities.create(toIntegrationContext(ctx), input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async updateActivity(ctx, id, input: UpdateTimeActivityInput) {
      try {
        return asActivity(
          ctx,
          await core.activities.update(toIntegrationContext(ctx), id, input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async archiveActivity(ctx, id) {
      try {
        return asActivity(
          ctx,
          await core.activities.archive(toIntegrationContext(ctx), id),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },

    async listCustomers(ctx, query) {
      try {
        const result = await core.customers.list(
          toIntegrationContext(ctx),
          listQuery(query),
        );
        return {
          items: result.items.map((item) => asCustomer(ctx, item)),
          totalCount: result.totalCount,
          page: result.page,
          perPage: result.perPage,
          hasNextPage: result.hasNextPage,
        };
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async getCustomer(ctx, id) {
      try {
        return asCustomer(ctx, await core.customers.get(toIntegrationContext(ctx), id));
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async createCustomer(ctx, input: CreateTimeCustomerInput) {
      try {
        return asCustomer(
          ctx,
          await core.customers.create(toIntegrationContext(ctx), input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async updateCustomer(ctx, id, input: UpdateTimeCustomerInput) {
      try {
        return asCustomer(
          ctx,
          await core.customers.update(toIntegrationContext(ctx), id, input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async archiveCustomer(ctx, id) {
      try {
        return asCustomer(
          ctx,
          await core.customers.archive(toIntegrationContext(ctx), id),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },

    async listProjects(ctx, query) {
      try {
        const result = await core.projects.list(
          toIntegrationContext(ctx),
          listQuery(query),
        );
        return {
          items: result.items.map((item) => asProject(ctx, item)),
          totalCount: result.totalCount,
          page: result.page,
          perPage: result.perPage,
          hasNextPage: result.hasNextPage,
        };
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async getProject(ctx, id) {
      try {
        return asProject(ctx, await core.projects.get(toIntegrationContext(ctx), id));
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async createProject(ctx, input: CreateTimeProjectInput) {
      try {
        return asProject(
          ctx,
          await core.projects.create(toIntegrationContext(ctx), input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async updateProject(ctx, id, input: UpdateTimeProjectInput) {
      try {
        return asProject(
          ctx,
          await core.projects.update(toIntegrationContext(ctx), id, input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async archiveProject(ctx, id) {
      try {
        return asProject(
          ctx,
          await core.projects.archive(toIntegrationContext(ctx), id),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },

    async listTimesheets(ctx, query) {
      try {
        const result = await core.timesheets.list(
          toIntegrationContext(ctx),
          listQuery(query),
        );
        return {
          items: result.items.map((item) => asTimesheet(ctx, item)),
          totalCount: result.totalCount,
          page: result.page,
          perPage: result.perPage,
          hasNextPage: result.hasNextPage,
        };
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async getTimesheet(ctx, id) {
      try {
        return asTimesheet(
          ctx,
          await core.timesheets.get(toIntegrationContext(ctx), id),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async createTimesheet(ctx, input: CreateTimesheetInput) {
      try {
        return asTimesheet(
          ctx,
          await core.timesheets.create(toIntegrationContext(ctx), input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async updateTimesheet(ctx, id, input: UpdateTimesheetInput) {
      try {
        return asTimesheet(
          ctx,
          await core.timesheets.update(toIntegrationContext(ctx), id, input),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async stopTimesheet(ctx, id) {
      try {
        return asTimesheet(
          ctx,
          await core.timesheets.stop(toIntegrationContext(ctx), id),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async archiveTimesheet(ctx, id) {
      try {
        return asTimesheet(
          ctx,
          await core.timesheets.archive(toIntegrationContext(ctx), id),
        );
      } catch (error) {
        return mapError(error, ctx);
      }
    },

    async listTags(ctx, query) {
      try {
        const result = await core.tags.list(
          toIntegrationContext(ctx),
          listQuery(query),
        );
        return {
          items: result.items.map((item) => asTag(ctx, item)),
          totalCount: result.totalCount,
          page: result.page,
          perPage: result.perPage,
          hasNextPage: result.hasNextPage,
        };
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async getTag(ctx, id) {
      try {
        return asTag(ctx, await core.tags.get(toIntegrationContext(ctx), id));
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async createTag(ctx, input: CreateTimeTagInput) {
      try {
        return asTag(ctx, await core.tags.create(toIntegrationContext(ctx), input));
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async updateTag(ctx, id, input: UpdateTimeTagInput) {
      try {
        return asTag(ctx, await core.tags.update(toIntegrationContext(ctx), id, input));
      } catch (error) {
        return mapError(error, ctx);
      }
    },
    async archiveTag(ctx, id) {
      try {
        return asTag(ctx, await core.tags.archive(toIntegrationContext(ctx), id));
      } catch (error) {
        return mapError(error, ctx);
      }
    },

    async getReportingCapabilities(_ctx): Promise<TimeReportingCapabilities> {
      return {
        foundationOnly: true,
        supported: ["capabilities", "health"],
        unsupported: ["exports", "analytics", "scheduledReports", "ui"],
      };
    },
    async getReportingHealth(_ctx): Promise<TimeReportingHealth> {
      return {
        status: "degraded",
        message:
          "Reporting remains foundation-only — domain analytics/exports out of KIMAI-002 scope",
        checkedAt: new Date().toISOString(),
      };
    },
  };
}
