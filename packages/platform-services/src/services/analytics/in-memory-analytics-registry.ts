import type {
  AnalyticsDashboard,
  AnalyticsDataset,
  AnalyticsReport,
  AnalyticsRequestContext,
  CataloguePage,
  DashboardCatalogueQuery,
  DashboardCategory,
  DashboardEmbedding,
  DashboardPermission,
  DashboardSummary,
  OpenDashboardRequest,
  SavedDashboard,
} from "@apzhub/analytics-contracts";
import {
  asAnalyticsDashboardId,
  asAnalyticsDatasetId,
  asAnalyticsReportId,
  asDashboardCategoryId,
  asDashboardEmbeddingId,
  asDashboardPermissionId,
  asSavedDashboardId,
} from "@apzhub/analytics-contracts";

import { analyticsNotFoundError, analyticsValidationError } from "./analytics-errors";
import type { AnalyticsRegistryProvider } from "./analytics-types";

function nowIso(): string {
  return new Date().toISOString();
}

function audit(userId: string, revision = 1) {
  const at = nowIso();
  return {
    createdAt: at,
    updatedAt: at,
    createdBy: userId,
    updatedBy: userId,
    revision,
  };
}

function toSummary(dashboard: AnalyticsDashboard): DashboardSummary {
  return {
    id: dashboard.id,
    tenantId: dashboard.tenantId,
    title: dashboard.title,
    description: dashboard.description,
    categoryId: dashboard.categoryId,
    status: dashboard.status,
    tags: dashboard.tags,
    provider: dashboard.provider,
    updatedAt: dashboard.updatedAt,
  };
}

export type InMemoryAnalyticsRegistrySeed = {
  readonly categories?: readonly DashboardCategory[];
  readonly dashboards?: readonly AnalyticsDashboard[];
  readonly datasets?: readonly AnalyticsDataset[];
  readonly reports?: readonly AnalyticsReport[];
  readonly saved?: readonly SavedDashboard[];
  readonly permissions?: readonly DashboardPermission[];
};

/** In-memory Analytics registry for tests and foundation MVP metadata. */
export class InMemoryAnalyticsRegistryProvider implements AnalyticsRegistryProvider {
  private readonly categories = new Map<string, DashboardCategory>();
  private readonly dashboards = new Map<string, AnalyticsDashboard>();
  private readonly datasets = new Map<string, AnalyticsDataset>();
  private readonly reports = new Map<string, AnalyticsReport>();
  private readonly saved = new Map<string, SavedDashboard>();
  private readonly permissions = new Map<string, DashboardPermission>();

  constructor(seed: InMemoryAnalyticsRegistrySeed = {}) {
    for (const row of seed.categories ?? []) this.categories.set(row.id, row);
    for (const row of seed.dashboards ?? []) this.dashboards.set(row.id, row);
    for (const row of seed.datasets ?? []) this.datasets.set(row.id, row);
    for (const row of seed.reports ?? []) this.reports.set(row.id, row);
    for (const row of seed.saved ?? []) this.saved.set(row.id, row);
    for (const row of seed.permissions ?? []) this.permissions.set(row.id, row);
  }

  async listCategories(
    ctx: AnalyticsRequestContext,
  ): Promise<readonly DashboardCategory[]> {
    return [...this.categories.values()].filter((c) => c.tenantId === ctx.tenantId);
  }

  async listCatalogue(
    ctx: AnalyticsRequestContext,
    query?: DashboardCatalogueQuery,
  ): Promise<CataloguePage<DashboardSummary>> {
    let items = [...this.dashboards.values()]
      .filter((d) => d.tenantId === ctx.tenantId)
      .map(toSummary);

    if (query?.categoryId) {
      items = items.filter((d) => d.categoryId === query.categoryId);
    }
    if (query?.status) {
      items = items.filter((d) => d.status === query.status);
    }
    if (query?.tag) {
      items = items.filter((d) => d.tags?.includes(query.tag!));
    }
    if (query?.search?.trim()) {
      const needle = query.search.trim().toLowerCase();
      items = items.filter(
        (d) =>
          d.title.toLowerCase().includes(needle) ||
          (d.description?.toLowerCase().includes(needle) ?? false),
      );
    }

    const limit = query?.limit ?? 50;
    const start = query?.cursor ? Number(query.cursor) || 0 : 0;
    const page = items.slice(start, start + limit);
    const next = start + limit < items.length ? String(start + limit) : undefined;
    return { items: page, nextCursor: next, totalEstimate: items.length };
  }

  async getDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: string,
  ): Promise<AnalyticsDashboard> {
    const row = this.dashboards.get(dashboardId);
    if (!row || row.tenantId !== ctx.tenantId) {
      throw analyticsNotFoundError(
        ctx.correlationId ?? "missing",
        "Dashboard",
        dashboardId,
      );
    }
    return row;
  }

  async publishDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: string,
  ): Promise<AnalyticsDashboard> {
    const current = await this.getDashboard(ctx, dashboardId);
    const updated: AnalyticsDashboard = {
      ...current,
      status: "published",
      updatedAt: nowIso(),
      updatedBy: ctx.userId,
      revision: current.revision + 1,
    };
    this.dashboards.set(updated.id, updated);
    return updated;
  }

  async deprecateDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: string,
  ): Promise<AnalyticsDashboard> {
    const current = await this.getDashboard(ctx, dashboardId);
    const updated: AnalyticsDashboard = {
      ...current,
      status: "deprecated",
      updatedAt: nowIso(),
      updatedBy: ctx.userId,
      revision: current.revision + 1,
    };
    this.dashboards.set(updated.id, updated);
    return updated;
  }

  async setRoleVisibility(
    ctx: AnalyticsRequestContext,
    permission: DashboardPermission,
  ): Promise<DashboardPermission> {
    if (permission.tenantId !== ctx.tenantId) {
      throw analyticsValidationError(
        ctx.correlationId ?? "missing",
        "Permission tenant mismatch",
      );
    }
    await this.getDashboard(ctx, permission.dashboardId);
    const id =
      permission.id || asDashboardPermissionId(`perm_${this.permissions.size + 1}`);
    const stored: DashboardPermission = {
      ...permission,
      id,
      ...audit(ctx.userId, permission.revision ?? 1),
    };
    this.permissions.set(stored.id, stored);
    return stored;
  }

  async listPermissionsForDashboard(
    ctx: AnalyticsRequestContext,
    dashboardId: string,
  ): Promise<readonly DashboardPermission[]> {
    return [...this.permissions.values()].filter(
      (p) => p.tenantId === ctx.tenantId && p.dashboardId === dashboardId,
    );
  }

  async listDatasets(
    ctx: AnalyticsRequestContext,
  ): Promise<readonly AnalyticsDataset[]> {
    return [...this.datasets.values()].filter((d) => d.tenantId === ctx.tenantId);
  }

  async getDataset(
    ctx: AnalyticsRequestContext,
    datasetId: string,
  ): Promise<AnalyticsDataset> {
    const row = this.datasets.get(datasetId);
    if (!row || row.tenantId !== ctx.tenantId) {
      throw analyticsNotFoundError(
        ctx.correlationId ?? "missing",
        "Dataset",
        datasetId,
      );
    }
    return row;
  }

  async upsertDataset(
    ctx: AnalyticsRequestContext,
    dataset: AnalyticsDataset,
  ): Promise<AnalyticsDataset> {
    if (dataset.tenantId !== ctx.tenantId) {
      throw analyticsValidationError(
        ctx.correlationId ?? "missing",
        "Dataset tenant mismatch",
      );
    }
    const existing = this.datasets.get(dataset.id);
    const stored: AnalyticsDataset = existing
      ? {
          ...dataset,
          createdAt: existing.createdAt,
          createdBy: existing.createdBy,
          updatedAt: nowIso(),
          updatedBy: ctx.userId,
          revision: existing.revision + 1,
        }
      : { ...dataset, ...audit(ctx.userId) };
    this.datasets.set(stored.id, stored);
    return stored;
  }

  async listReports(ctx: AnalyticsRequestContext): Promise<readonly AnalyticsReport[]> {
    return [...this.reports.values()].filter((r) => r.tenantId === ctx.tenantId);
  }

  async getReport(
    ctx: AnalyticsRequestContext,
    reportId: string,
  ): Promise<AnalyticsReport> {
    const row = this.reports.get(reportId);
    if (!row || row.tenantId !== ctx.tenantId) {
      throw analyticsNotFoundError(ctx.correlationId ?? "missing", "Report", reportId);
    }
    return row;
  }

  async listSaved(ctx: AnalyticsRequestContext): Promise<readonly SavedDashboard[]> {
    return [...this.saved.values()].filter(
      (s) =>
        s.tenantId === ctx.tenantId &&
        (s.ownerPrincipalId === ctx.userId || s.status === "published"),
    );
  }

  async save(
    ctx: AnalyticsRequestContext,
    saved: SavedDashboard,
  ): Promise<SavedDashboard> {
    if (saved.tenantId !== ctx.tenantId) {
      throw analyticsValidationError(
        ctx.correlationId ?? "missing",
        "Saved dashboard tenant mismatch",
      );
    }
    await this.getDashboard(ctx, saved.dashboardId);
    const existing = this.saved.get(saved.id);
    const stored: SavedDashboard = existing
      ? {
          ...saved,
          createdAt: existing.createdAt,
          createdBy: existing.createdBy,
          updatedAt: nowIso(),
          updatedBy: ctx.userId,
          revision: existing.revision + 1,
        }
      : { ...saved, ...audit(ctx.userId) };
    this.saved.set(stored.id, stored);
    return stored;
  }

  async archiveSaved(
    ctx: AnalyticsRequestContext,
    savedDashboardId: string,
  ): Promise<SavedDashboard> {
    const row = this.saved.get(savedDashboardId);
    if (!row || row.tenantId !== ctx.tenantId) {
      throw analyticsNotFoundError(
        ctx.correlationId ?? "missing",
        "SavedDashboard",
        savedDashboardId,
      );
    }
    const updated: SavedDashboard = {
      ...row,
      status: "archived",
      updatedAt: nowIso(),
      updatedBy: ctx.userId,
      revision: row.revision + 1,
    };
    this.saved.set(updated.id, updated);
    return updated;
  }

  async issueEmbed(
    ctx: AnalyticsRequestContext,
    request: OpenDashboardRequest,
  ): Promise<DashboardEmbedding | undefined> {
    if (!request.issueEmbed) return undefined;
    await this.getDashboard(ctx, request.dashboardId);
    const issuedAt = nowIso();
    return {
      id: asDashboardEmbeddingId(`embed_${Date.now()}`),
      tenantId: ctx.tenantId,
      dashboardId: request.dashboardId,
      mode: "signed",
      issuedAt,
      expiresAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      issuedToPrincipalId: ctx.userId,
      correlationId: ctx.correlationId,
      tokenRef: `token_ref_${request.dashboardId}`,
      revoked: false,
    };
  }
}

export function createInMemoryAnalyticsRegistry(
  seed?: InMemoryAnalyticsRegistrySeed,
): AnalyticsRegistryProvider {
  return new InMemoryAnalyticsRegistryProvider(seed);
}

/** Default seed for tests / Workbench MVP — provider-agnostic refs only. */
export function createDefaultAnalyticsRegistrySeed(
  tenantId = "tenant_analytics_test",
): InMemoryAnalyticsRegistrySeed {
  const fields = audit("user_analytics_test");
  const suites = [
    {
      categoryId: asDashboardCategoryId("cat_executive"),
      key: "executive",
      name: "Executive",
      sortOrder: 1,
      dashboardId: asAnalyticsDashboardId("dash_exec_overview"),
      title: "Executive Overview",
      description: "Cross-product executive scorecards",
      tag: "executive",
      providerRef: "collection:1",
    },
    {
      categoryId: asDashboardCategoryId("cat_operational"),
      key: "operational",
      name: "Operational",
      sortOrder: 2,
      dashboardId: asAnalyticsDashboardId("dash_ops_daily"),
      title: "Operational Daily",
      description: "Day-to-day operations scorecards",
      tag: "operational",
      providerRef: "collection:2",
    },
    {
      categoryId: asDashboardCategoryId("cat_projects"),
      key: "projects",
      name: "Projects",
      sortOrder: 3,
      dashboardId: asAnalyticsDashboardId("dash_projects_delivery"),
      title: "Projects Delivery",
      description: "Delivery and workload analytics",
      tag: "projects",
      providerRef: "collection:3",
    },
    {
      categoryId: asDashboardCategoryId("cat_time"),
      key: "time",
      name: "Time",
      sortOrder: 4,
      dashboardId: asAnalyticsDashboardId("dash_time_utilisation"),
      title: "Time Utilisation",
      description: "Utilisation and entry aggregates",
      tag: "time",
      providerRef: "collection:4",
    },
    {
      categoryId: asDashboardCategoryId("cat_support"),
      key: "support",
      name: "Support",
      sortOrder: 5,
      dashboardId: asAnalyticsDashboardId("dash_support_sla"),
      title: "Support SLA",
      description: "Ticket and SLA style views",
      tag: "support",
      providerRef: "collection:5",
    },
    {
      categoryId: asDashboardCategoryId("cat_platform_health"),
      key: "platform-health",
      name: "Platform Health",
      sortOrder: 6,
      dashboardId: asAnalyticsDashboardId("dash_platform_health"),
      title: "Platform Health",
      description: "Hierarchical platform health summary",
      tag: "platform-health",
      providerRef: "collection:6",
    },
    {
      categoryId: asDashboardCategoryId("cat_repository_metrics"),
      key: "repository-metrics",
      name: "Repository Metrics",
      sortOrder: 7,
      dashboardId: asAnalyticsDashboardId("dash_repo_metrics"),
      title: "Repository Metrics",
      description: "Selected engineering and quality indicators",
      tag: "repository-metrics",
      providerRef: "collection:7",
    },
  ] as const;

  const exec = suites[0]!;
  const datasetId = asAnalyticsDatasetId("ds_projects_throughput");
  const reportId = asAnalyticsReportId("rep_weekly_ops");
  const savedId = asSavedDashboardId("saved_exec_mine");

  return {
    categories: suites.map((suite) => ({
      id: suite.categoryId,
      tenantId,
      key: suite.key,
      name: suite.name,
      status: "published" as const,
      sortOrder: suite.sortOrder,
      ...fields,
    })),
    dashboards: suites.map((suite) => ({
      id: suite.dashboardId,
      tenantId,
      title: suite.title,
      description: suite.description,
      categoryId: suite.categoryId,
      status: "published" as const,
      tags: [suite.tag],
      provider: {
        providerId: "metabase",
        providerRef: suite.providerRef,
      },
      ...fields,
    })),
    datasets: [
      {
        id: datasetId,
        tenantId,
        key: "projects.throughput",
        name: "Projects Throughput",
        status: "published",
        provider: { providerId: "metabase", providerRef: "dataset:1" },
        dimensions: ["project", "week"],
        measures: ["completed_issues"],
        ...fields,
      },
      {
        id: asAnalyticsDatasetId("ds_time_utilisation"),
        tenantId,
        key: "time.utilisation",
        name: "Time Utilisation",
        status: "published",
        provider: { providerId: "metabase", providerRef: "dataset:2" },
        dimensions: ["user", "week"],
        measures: ["billable_hours"],
        ...fields,
      },
    ],
    reports: [
      {
        id: reportId,
        tenantId,
        reportingSorRef: "reporting:weekly_ops",
        key: "weekly.ops",
        title: "Weekly Ops Report",
      },
      {
        id: asAnalyticsReportId("rep_monthly_exec"),
        tenantId,
        reportingSorRef: "reporting:monthly_exec",
        key: "monthly.exec",
        title: "Monthly Executive Report",
      },
    ],
    saved: [
      {
        id: savedId,
        tenantId,
        ownerPrincipalId: "user_analytics_test",
        dashboardId: exec.dashboardId,
        name: "My Executive",
        filterSnapshot: { period: "2026-Q3" },
        status: "published",
        ...fields,
      },
    ],
  };
}
