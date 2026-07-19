import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";

import type { TimeDomainProvider } from "./time-types";

function unsupported(ctx: ServiceRequestContext, capability: string): Promise<never> {
  return Promise.reject(
    new PlatformServiceError({
      category: "configuration",
      code: "PROVIDER_CAPABILITY_UNSUPPORTED",
      message: `Time domain capability "${capability}" is unavailable — Kimai Integration Foundation (0.1.0) exposes ops/health only; domain CRUD requires a future Kimai domain expansion`,
      correlationId: ctx.correlationId,
      retryable: false,
      details: { capability, integration: "kimai", adapterVersion: "0.1.0" },
    }),
  );
}

/**
 * Production Kimai domain provider while adapter remains foundation-only.
 * Every domain method fails with PROVIDER_CAPABILITY_UNSUPPORTED (Plane unsupported-op pattern).
 */
export function createKimaiLimitedDomainProvider(): TimeDomainProvider {
  return {
    listActivities: (ctx) => unsupported(ctx, "activities.list"),
    getActivity: (ctx) => unsupported(ctx, "activities.get"),
    createActivity: (ctx) => unsupported(ctx, "activities.create"),
    updateActivity: (ctx) => unsupported(ctx, "activities.update"),
    archiveActivity: (ctx) => unsupported(ctx, "activities.archive"),
    listCustomers: (ctx) => unsupported(ctx, "customers.list"),
    getCustomer: (ctx) => unsupported(ctx, "customers.get"),
    createCustomer: (ctx) => unsupported(ctx, "customers.create"),
    updateCustomer: (ctx) => unsupported(ctx, "customers.update"),
    archiveCustomer: (ctx) => unsupported(ctx, "customers.archive"),
    listProjects: (ctx) => unsupported(ctx, "projects.list"),
    getProject: (ctx) => unsupported(ctx, "projects.get"),
    createProject: (ctx) => unsupported(ctx, "projects.create"),
    updateProject: (ctx) => unsupported(ctx, "projects.update"),
    archiveProject: (ctx) => unsupported(ctx, "projects.archive"),
    listTimesheets: (ctx) => unsupported(ctx, "timesheets.list"),
    getTimesheet: (ctx) => unsupported(ctx, "timesheets.get"),
    createTimesheet: (ctx) => unsupported(ctx, "timesheets.create"),
    updateTimesheet: (ctx) => unsupported(ctx, "timesheets.update"),
    stopTimesheet: (ctx) => unsupported(ctx, "timesheets.stop"),
    archiveTimesheet: (ctx) => unsupported(ctx, "timesheets.archive"),
    listTags: (ctx) => unsupported(ctx, "tags.list"),
    getTag: (ctx) => unsupported(ctx, "tags.get"),
    createTag: (ctx) => unsupported(ctx, "tags.create"),
    updateTag: (ctx) => unsupported(ctx, "tags.update"),
    archiveTag: (ctx) => unsupported(ctx, "tags.archive"),
    getReportingCapabilities: async () => ({
      foundationOnly: true,
      supported: ["capabilities", "health"],
      unsupported: ["exports", "analytics", "scheduledReports", "ui"],
    }),
    getReportingHealth: async (_ctx) => ({
      status: "degraded",
      message:
        "Reporting foundation only — domain analytics unavailable on Kimai 0.1.0",
      checkedAt: new Date().toISOString(),
    }),
  };
}
