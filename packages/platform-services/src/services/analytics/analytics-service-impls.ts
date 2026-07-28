import type {
  AnalyticsCapability,
  AnalyticsDashboard,
  AnalyticsDataset,
  AnalyticsHealth,
  AnalyticsPermissionService,
  AnalyticsPlatformGateway,
  AnalyticsReport,
  AnalyticsRequestContext,
  AnalyticsService,
  CapabilityService,
  CataloguePage,
  DashboardCatalogueQuery,
  DashboardPermission,
  DashboardService,
  DashboardSummary,
  DatasetService,
  OpenDashboardRequest,
  OpenDashboardResult,
  ReportService,
  ResolveReportLinkResult,
  SaveDashboardInput,
  SavedDashboard,
  SavedDashboardService,
  UpsertDatasetInput,
} from "@apzhub/analytics-contracts";
import {
  asDashboardPermissionId,
  hasAnalyticsNamedOperation,
} from "@apzhub/analytics-contracts";
import type {
  AnalyticsDashboardId,
  AnalyticsDatasetId,
  AnalyticsReportId,
  SavedDashboardId,
} from "@apzhub/analytics-contracts";

import {
  analyticsAuthorizationError,
  analyticsNotFoundError,
} from "./analytics-errors";
import {
  analyticsPermissions,
  assertAnalyticsContext,
} from "./assert-analytics-context";
import type {
  AnalyticsOpsProvider,
  AnalyticsRegistryProvider,
} from "./analytics-types";

function assertNamed(
  ctx: AnalyticsRequestContext,
  operation: Parameters<typeof hasAnalyticsNamedOperation>[1],
): void {
  if (!hasAnalyticsNamedOperation(analyticsPermissions(ctx), operation)) {
    throw analyticsAuthorizationError(ctx.correlationId ?? "missing", operation);
  }
}

/** Role / principal visibility filter for catalogue items. */
function isVisibleToPrincipal(
  permissions: readonly DashboardPermission[],
  ctx: AnalyticsRequestContext,
): boolean {
  if (permissions.length === 0) {
    // No explicit bindings — rely on platform permission already checked.
    return true;
  }
  const granted = analyticsPermissions(ctx);
  return permissions.some((p) => {
    const subjectMatch =
      (p.subjectKind === "user" && p.subjectId === ctx.userId) ||
      (p.subjectKind === "role" && granted.includes(p.subjectId)) ||
      (p.subjectKind === "group" && granted.includes(p.subjectId));
    if (!subjectMatch) return false;
    return (
      p.operations.includes("view") ||
      p.operations.includes("manage") ||
      p.operations.includes("admin")
    );
  });
}

export class AnalyticsServiceImpl implements AnalyticsService {
  constructor(
    private readonly ops: AnalyticsOpsProvider,
    private readonly registry: AnalyticsRegistryProvider,
    private readonly permissions: AnalyticsPermissionService,
  ) {}

  async getHealth(ctx: AnalyticsRequestContext): Promise<AnalyticsHealth> {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDashboard");
    return this.ops.getHealth(ctx);
  }

  async getReadiness(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDashboard");
    const [health, readiness] = await Promise.all([
      this.ops.getHealth(ctx),
      this.ops.getReadiness(ctx),
    ]);
    return {
      readiness: readiness.readiness,
      reasons: readiness.reasons,
      providerId: this.ops.providerId,
      healthStatus: health.status,
    };
  }

  async openDashboard(
    ctx: AnalyticsRequestContext,
    request: OpenDashboardRequest,
  ): Promise<OpenDashboardResult> {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanViewDashboard(ctx, request.dashboardId);
    if (request.issueEmbed) {
      await this.permissions.assertCanEmbedDashboard(ctx, request.dashboardId);
    }
    const dashboard = await this.registry.getDashboard(ctx, request.dashboardId);
    const binding = await this.registry.listPermissionsForDashboard(
      ctx,
      request.dashboardId,
    );
    if (!isVisibleToPrincipal(binding, ctx)) {
      throw analyticsAuthorizationError(
        ctx.correlationId ?? "missing",
        "viewDashboard",
      );
    }
    const embedding = this.registry.issueEmbed
      ? await this.registry.issueEmbed(ctx, request)
      : undefined;
    return { dashboard, embedding };
  }
}

export class DashboardServiceImpl implements DashboardService {
  constructor(
    private readonly registry: AnalyticsRegistryProvider,
    private readonly permissions: AnalyticsPermissionService,
  ) {}

  async listCategories(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDashboard");
    return this.registry.listCategories(ctx);
  }

  async listCatalogue(
    ctx: AnalyticsRequestContext,
    query?: DashboardCatalogueQuery,
  ): Promise<CataloguePage<DashboardSummary>> {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDashboard");
    const page = await this.registry.listCatalogue(ctx, query);
    const filtered: DashboardSummary[] = [];
    for (const item of page.items) {
      const binding = await this.registry.listPermissionsForDashboard(ctx, item.id);
      if (isVisibleToPrincipal(binding, ctx)) {
        filtered.push(item);
      }
    }
    return {
      items: filtered,
      nextCursor: page.nextCursor,
      totalEstimate: filtered.length,
    };
  }

  async getDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: AnalyticsDashboardId,
  ): Promise<AnalyticsDashboard> {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanViewDashboard(ctx, dashboardId);
    const dashboard = await this.registry.getDashboard(ctx, dashboardId);
    const binding = await this.registry.listPermissionsForDashboard(ctx, dashboardId);
    if (!isVisibleToPrincipal(binding, ctx)) {
      throw analyticsAuthorizationError(
        ctx.correlationId ?? "missing",
        "viewDashboard",
      );
    }
    return dashboard;
  }

  async publish(
    ctx: AnalyticsRequestContext,
    input: { dashboardId: AnalyticsDashboardId },
  ) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "administerAnalytics");
    return this.registry.publishDashboard(ctx, input.dashboardId);
  }

  async deprecate(
    ctx: AnalyticsRequestContext,
    input: { dashboardId: AnalyticsDashboardId; status: AnalyticsDashboard["status"] },
  ) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "administerAnalytics");
    return this.registry.deprecateDashboard(ctx, input.dashboardId);
  }

  async setRoleVisibility(
    ctx: AnalyticsRequestContext,
    input: {
      permission: Omit<
        DashboardPermission,
        "id" | "createdAt" | "updatedAt" | "createdBy" | "updatedBy" | "revision"
      > & { readonly id?: DashboardPermission["id"] };
    },
  ): Promise<DashboardPermission> {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanShareDashboard(ctx, input.permission.dashboardId);
    const permission: DashboardPermission = {
      id: input.permission.id ?? asDashboardPermissionId(`perm_${Date.now()}`),
      tenantId: input.permission.tenantId,
      dashboardId: input.permission.dashboardId,
      subjectKind: input.permission.subjectKind,
      subjectId: input.permission.subjectId,
      operations: input.permission.operations,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: ctx.userId,
      updatedBy: ctx.userId,
      revision: 1,
    };
    return this.registry.setRoleVisibility(ctx, permission);
  }
}

export class DatasetServiceImpl implements DatasetService {
  constructor(
    private readonly registry: AnalyticsRegistryProvider,
    private readonly permissions: AnalyticsPermissionService,
  ) {}

  async listDatasets(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDataset");
    return this.registry.listDatasets(ctx);
  }

  async getDataset(ctx: AnalyticsRequestContext, datasetId: AnalyticsDatasetId) {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanViewDataset(ctx, datasetId);
    return this.registry.getDataset(ctx, datasetId);
  }

  async upsertDataset(ctx: AnalyticsRequestContext, input: UpsertDatasetInput) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "administerAnalytics");
    return this.registry.upsertDataset(ctx, {
      ...input.dataset,
      createdAt: input.dataset.createdAt ?? new Date().toISOString(),
      updatedAt: input.dataset.updatedAt ?? new Date().toISOString(),
      createdBy: input.dataset.createdBy ?? ctx.userId,
      updatedBy: input.dataset.updatedBy ?? ctx.userId,
      revision: input.dataset.revision ?? 1,
    } as AnalyticsDataset);
  }
}

export class ReportServiceImpl implements ReportService {
  constructor(
    private readonly registry: AnalyticsRegistryProvider,
    private readonly permissions: AnalyticsPermissionService,
  ) {}

  async resolveReportLink(
    ctx: AnalyticsRequestContext,
    reportId: AnalyticsReportId,
  ): Promise<ResolveReportLinkResult> {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanRunReport(ctx);
    const report = await this.registry.getReport(ctx, reportId);
    return {
      report,
      reportingLinkRef: `reporting://link/${report.reportingSorRef}`,
    };
  }

  async listReportLinks(
    ctx: AnalyticsRequestContext,
  ): Promise<readonly AnalyticsReport[]> {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanRunReport(ctx);
    return this.registry.listReports(ctx);
  }
}

export class SavedDashboardServiceImpl implements SavedDashboardService {
  constructor(
    private readonly registry: AnalyticsRegistryProvider,
    private readonly permissions: AnalyticsPermissionService,
  ) {}

  async listSaved(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanManageSaved(ctx);
    return this.registry.listSaved(ctx);
  }

  async save(ctx: AnalyticsRequestContext, input: SaveDashboardInput) {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanManageSaved(ctx);
    return this.registry.save(ctx, {
      ...input.saved,
      createdAt: input.saved.createdAt ?? new Date().toISOString(),
      updatedAt: input.saved.updatedAt ?? new Date().toISOString(),
      createdBy: input.saved.createdBy ?? ctx.userId,
      updatedBy: input.saved.updatedBy ?? ctx.userId,
      revision: input.saved.revision ?? 1,
    } as SavedDashboard);
  }

  async archive(ctx: AnalyticsRequestContext, savedDashboardId: SavedDashboardId) {
    assertAnalyticsContext(ctx);
    await this.permissions.assertCanManageSaved(ctx);
    return this.registry.archiveSaved(ctx, savedDashboardId);
  }
}

export class CapabilityServiceImpl implements CapabilityService {
  constructor(private readonly ops: AnalyticsOpsProvider) {}

  async listCapabilities(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDashboard");
    return this.ops.listProviderCapabilities(ctx);
  }

  async getCapability(ctx: AnalyticsRequestContext, capabilityId: string) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDashboard");
    const all = await this.ops.listProviderCapabilities(ctx);
    const found = all.find((c) => c.id === capabilityId);
    if (!found) {
      throw analyticsNotFoundError(
        ctx.correlationId ?? "missing",
        "Capability",
        capabilityId,
      );
    }
    return found;
  }
}

export class PermissionServiceImpl implements AnalyticsPermissionService {
  async assertCanViewDashboard(
    ctx: AnalyticsRequestContext,
    _dashboardId: AnalyticsDashboardId,
  ) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDashboard");
  }

  async assertCanViewDataset(
    ctx: AnalyticsRequestContext,
    _datasetId: AnalyticsDatasetId,
  ) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewDataset");
  }

  async assertCanViewKpi(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "viewKpi");
  }

  async assertCanRunReport(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "runReport");
  }

  async assertCanManageSaved(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "manageSavedDashboards");
  }

  async assertCanShareDashboard(
    ctx: AnalyticsRequestContext,
    _dashboardId: AnalyticsDashboardId,
  ) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "shareDashboard");
  }

  async assertCanEmbedDashboard(
    ctx: AnalyticsRequestContext,
    _dashboardId: AnalyticsDashboardId,
  ) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "embedDashboard");
  }

  async assertCanAdminister(ctx: AnalyticsRequestContext) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, "administerAnalytics");
  }

  async assertOperation(
    ctx: AnalyticsRequestContext,
    operation: Parameters<typeof hasAnalyticsNamedOperation>[1],
  ) {
    assertAnalyticsContext(ctx);
    assertNamed(ctx, operation);
  }
}

export type AnalyticsPlatformServiceImpls = {
  readonly analytics: AnalyticsServiceImpl;
  readonly dashboards: DashboardServiceImpl;
  readonly datasets: DatasetServiceImpl;
  readonly reports: ReportServiceImpl;
  readonly savedDashboards: SavedDashboardServiceImpl;
  readonly permissions: PermissionServiceImpl;
  readonly capabilities: CapabilityServiceImpl;
};

export function createAnalyticsPlatformServiceImpls(input: {
  readonly ops: AnalyticsOpsProvider;
  readonly registry: AnalyticsRegistryProvider;
}): AnalyticsPlatformServiceImpls {
  const permissions = new PermissionServiceImpl();
  return {
    analytics: new AnalyticsServiceImpl(input.ops, input.registry, permissions),
    dashboards: new DashboardServiceImpl(input.registry, permissions),
    datasets: new DatasetServiceImpl(input.registry, permissions),
    reports: new ReportServiceImpl(input.registry, permissions),
    savedDashboards: new SavedDashboardServiceImpl(input.registry, permissions),
    permissions,
    capabilities: new CapabilityServiceImpl(input.ops),
  };
}

export function toAnalyticsPlatformGateway(
  impls: AnalyticsPlatformServiceImpls,
): AnalyticsPlatformGateway {
  return {
    analytics: impls.analytics,
    dashboards: impls.dashboards,
    datasets: impls.datasets,
    reports: impls.reports,
    savedDashboards: impls.savedDashboards,
    permissions: impls.permissions,
    capabilities: impls.capabilities,
  };
}

/** Readiness aggregation helper for diagnostics surfaces. */
export async function aggregateAnalyticsReadiness(
  ops: AnalyticsOpsProvider,
  ctx: AnalyticsRequestContext,
): Promise<{
  readonly health: AnalyticsHealth;
  readonly readiness: "ready" | "ready_with_limitations" | "not_ready";
  readonly capabilities: readonly AnalyticsCapability[];
  readonly providerId: string;
}> {
  const [health, readiness, capabilities] = await Promise.all([
    ops.getHealth(ctx),
    ops.getReadiness(ctx),
    ops.listProviderCapabilities(ctx),
  ]);
  return {
    health,
    readiness: readiness.readiness,
    capabilities,
    providerId: ops.providerId,
  };
}
