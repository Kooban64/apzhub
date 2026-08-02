"use client";

import type {
  DashboardDefinition,
  DashboardId,
  MetricValue,
  ReportTemplateId,
} from "@apzhub/qep-reporting";
import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import {
  createSavedReport,
  generateReportingReport,
  getReportingDashboard,
  getReportingMetrics,
  listReportingDashboards,
  listReportingTemplates,
  listSavedReports,
  runSavedReport,
} from "@/lib/qep/qep-enterprise-reporting-api";
import { qepQueryKeys } from "@/lib/qep/query-keys";
import {
  QEP_ENTERPRISE_REPORTING_ROUTES,
  isQepEnterpriseReportingMetricsRoute,
  parseQepReportingDashboardId,
  parseQepReportingReportId,
  parseQepReportingTemplateId,
} from "@/lib/qep/routes";

import {
  QepEmptyState,
  QepErrorState,
  QepLoadingState,
  QepPageShell,
  QepPanel,
  QepStatusBadge,
  QepTable,
} from "./qep-ui";

export function QepEnterpriseReportingRouterView({
  pathname,
}: {
  readonly pathname: string;
}) {
  if (isQepEnterpriseReportingMetricsRoute(pathname)) {
    return <MetricsView />;
  }
  const dashboardId = parseQepReportingDashboardId(pathname);
  if (dashboardId) {
    return <DashboardDetailView dashboardId={dashboardId} />;
  }
  if (pathname.startsWith(QEP_ENTERPRISE_REPORTING_ROUTES.dashboards)) {
    return <DashboardLibraryView />;
  }
  const templateId = parseQepReportingTemplateId(pathname);
  if (templateId) {
    return <TemplateRunView templateId={templateId as ReportTemplateId} />;
  }
  if (pathname.startsWith(QEP_ENTERPRISE_REPORTING_ROUTES.templates)) {
    return <TemplatesView />;
  }
  const reportId = parseQepReportingReportId(pathname);
  if (reportId) {
    return <SavedReportRunView reportId={reportId} />;
  }
  if (pathname.startsWith(QEP_ENTERPRISE_REPORTING_ROUTES.reports)) {
    return <SavedReportsView />;
  }
  return <ReportingHomeView />;
}

function ReportingHomeView() {
  return (
    <QepPageShell
      title="Reporting & Analytics"
      description="Derived dashboards and reports. Reporting is a projection — never a source of truth."
      breadcrumbs={["QEP", "Reporting"]}
      actions={
        <>
          <Link
            href={QEP_ENTERPRISE_REPORTING_ROUTES.dashboards}
            className="inline-flex h-8 items-center rounded-md bg-[var(--color-primary)] px-3 text-sm text-[var(--color-primary-foreground)]"
          >
            Dashboards
          </Link>
          <Link
            href={QEP_ENTERPRISE_REPORTING_ROUTES.templates}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Reports
          </Link>
          <Link
            href={QEP_ENTERPRISE_REPORTING_ROUTES.metrics}
            className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
          >
            Metrics
          </Link>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(
          [
            ["executive", "Executive"],
            ["qa_manager", "QA Manager"],
            ["execution", "Execution"],
            ["defect", "Defects"],
            ["coverage", "Coverage"],
            ["quality_trend", "Quality Trends"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={QEP_ENTERPRISE_REPORTING_ROUTES.dashboard(id)}
            className="rounded-md border border-[var(--color-border)] p-4 hover:bg-[var(--color-muted)]"
          >
            <h3 className="font-medium">{label}</h3>
            <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
              Derived from Caps A–E · QKI projections
            </p>
          </Link>
        ))}
      </div>
    </QepPageShell>
  );
}

function DashboardLibraryView() {
  const listQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseReporting.dashboards(),
    queryFn: ({ signal }) => listReportingDashboards({ signal }),
  });

  const items = listQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Dashboard library"
      description="All dashboards consume derived metrics only."
      breadcrumbs={["QEP", "Reporting", "Dashboards"]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REPORTING_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Home
        </Link>
      }
    >
      {listQuery.isLoading ? (
        <QepLoadingState label="Loading dashboards…" />
      ) : items.length === 0 ? (
        <QepEmptyState title="No dashboards registered." />
      ) : (
        <QepTable
          caption="Dashboards"
          columns={["Name", "Audience", "Widgets", "Open"]}
          rows={items.map((d: DashboardDefinition) => ({
            id: d.dashboardId,
            cells: [
              d.name,
              d.audience,
              String(d.widgets.length),
              <Link
                key="o"
                href={QEP_ENTERPRISE_REPORTING_ROUTES.dashboard(d.dashboardId)}
                className="text-[var(--color-primary)] underline"
              >
                Open
              </Link>,
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function MetricCards({ metrics }: { readonly metrics: readonly MetricValue[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((m) => (
        <QepPanel key={m.key} title={m.label}>
          <p className="text-2xl font-semibold">
            {m.value}
            {m.unit === "percent" ? "%" : m.unit === "days" ? "d" : ""}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{m.key}</p>
        </QepPanel>
      ))}
    </div>
  );
}

function DashboardDetailView({ dashboardId }: { readonly dashboardId: string }) {
  const detailQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseReporting.dashboard(dashboardId),
    queryFn: ({ signal }) =>
      getReportingDashboard(dashboardId as DashboardId, { signal }),
  });

  if (detailQuery.isLoading) {
    return <QepLoadingState label="Deriving dashboard…" />;
  }
  if (detailQuery.isError || !detailQuery.data) {
    return (
      <QepErrorState
        message={
          detailQuery.error instanceof Error
            ? detailQuery.error.message
            : "Dashboard failed"
        }
        onRetry={() => void detailQuery.refetch()}
      />
    );
  }

  const view = detailQuery.data;
  const widgetKeys = new Set(
    view.definition.widgets.flatMap((w) => w.metricKeys ?? []),
  );
  const shown = view.metrics.metrics.filter((m) => widgetKeys.has(m.key));

  return (
    <QepPageShell
      title={view.definition.name}
      description={view.definition.description}
      breadcrumbs={["QEP", "Reporting", "Dashboards", view.definition.name]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REPORTING_ROUTES.dashboards}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Library
        </Link>
      }
    >
      <p className="mb-4 text-xs text-[var(--color-muted-foreground)]">
        Generated {new Date(view.generatedAt).toLocaleString()} · derived only
      </p>
      <MetricCards metrics={shown.length ? shown : view.metrics.metrics.slice(0, 6)} />

      {view.trends.length > 0 ? (
        <div className="mt-4">
          <QepPanel title="Trends">
            <ul className="space-y-3 text-sm">
              {view.trends.map((series) => (
                <li key={series.key}>
                  <div className="mb-1 font-medium">{series.label}</div>
                  <div className="flex flex-wrap gap-2">
                    {series.points.map((p) => (
                      <span
                        key={`${series.key}-${p.at}`}
                        className="rounded border border-[var(--color-border)] px-2 py-1 text-xs"
                      >
                        {p.value}
                        {series.key.includes("rate") ||
                        series.key.includes("coverage") ||
                        series.key.includes("progress")
                          ? "%"
                          : ""}{" "}
                        <span className="text-[var(--color-muted-foreground)]">
                          {p.at.slice(0, 16).replace("T", " ")}
                        </span>
                      </span>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </QepPanel>
        </div>
      ) : null}
    </QepPageShell>
  );
}

function MetricsView() {
  const metricsQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseReporting.metrics(),
    queryFn: ({ signal }) => getReportingMetrics({ signal }),
  });

  return (
    <QepPageShell
      title="Metrics"
      description="Automatically calculated. Never manually edited."
      breadcrumbs={["QEP", "Reporting", "Metrics"]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REPORTING_ROUTES.home}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Home
        </Link>
      }
    >
      {metricsQuery.isLoading ? (
        <QepLoadingState label="Calculating metrics…" />
      ) : metricsQuery.data ? (
        <MetricCards metrics={metricsQuery.data.metrics} />
      ) : (
        <QepEmptyState title="No metrics available." />
      )}
    </QepPageShell>
  );
}

function TemplatesView() {
  const templatesQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseReporting.templates(),
    queryFn: ({ signal }) => listReportingTemplates({ signal }),
  });
  const items = templatesQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Report templates"
      description="Ad hoc derived reports from Caps A–E facts."
      breadcrumbs={["QEP", "Reporting", "Templates"]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REPORTING_ROUTES.reports}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Saved reports
        </Link>
      }
    >
      {templatesQuery.isLoading ? (
        <QepLoadingState label="Loading templates…" />
      ) : (
        <QepTable
          caption="Templates"
          columns={["Name", "Description", "Run"]}
          rows={items.map((t) => ({
            id: t.templateId,
            cells: [
              t.name,
              t.description,
              <Link
                key="r"
                href={QEP_ENTERPRISE_REPORTING_ROUTES.template(t.templateId)}
                className="text-[var(--color-primary)] underline"
              >
                Run
              </Link>,
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function TemplateRunView({ templateId }: { readonly templateId: ReportTemplateId }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const generateMutation = useMutation({
    mutationFn: () =>
      generateReportingReport({
        templateId,
        ...(name.trim() ? { name: name.trim() } : {}),
      }),
  });
  const saveMutation = useMutation({
    mutationFn: () =>
      createSavedReport({
        name: name.trim() || templateId,
        templateId,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: qepQueryKeys.enterpriseReporting.savedReports(),
      });
    },
  });

  const report = generateMutation.data;

  return (
    <QepPageShell
      title={`Report: ${templateId.replace(/_/g, " ")}`}
      description="Derived report output — export metadata only."
      breadcrumbs={["QEP", "Reporting", "Templates", templateId]}
      actions={
        <Link
          href={QEP_ENTERPRISE_REPORTING_ROUTES.templates}
          className="inline-flex h-8 items-center rounded-md border border-[var(--color-border)] px-3 text-sm"
        >
          Templates
        </Link>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <Input
          aria-label="Report name"
          placeholder="Optional name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button
          type="button"
          size="sm"
          disabled={generateMutation.isPending}
          onClick={() => generateMutation.mutate()}
        >
          Generate
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          Save
        </Button>
      </div>
      {report ? (
        <>
          <p className="mb-2 text-sm">
            <QepStatusBadge status="derived" /> {report.name} ·{" "}
            {report.exportMetadata.rowCount} rows
          </p>
          <QepTable
            caption="Report rows"
            columns={["Metric", "Value", "Unit"]}
            rows={report.rows.map((row, index) => ({
              id: String(index),
              cells: [
                String(row.metric ?? ""),
                String(row.value ?? ""),
                String(row.unit ?? ""),
              ],
            }))}
          />
        </>
      ) : (
        <QepEmptyState title="Generate to view derived report rows." />
      )}
    </QepPageShell>
  );
}

function SavedReportsView() {
  const listQuery = useQuery({
    queryKey: qepQueryKeys.enterpriseReporting.savedReports(),
    queryFn: ({ signal }) => listSavedReports({ signal }),
  });
  const items = listQuery.data?.items ?? [];

  return (
    <QepPageShell
      title="Saved reports"
      description="Platform metadata for report definitions — business data remains in Caps A–E."
      breadcrumbs={["QEP", "Reporting", "Saved"]}
    >
      {listQuery.isLoading ? (
        <QepLoadingState label="Loading saved reports…" />
      ) : items.length === 0 ? (
        <QepEmptyState title="No saved reports yet." />
      ) : (
        <QepTable
          caption="Saved reports"
          columns={["Name", "Template", "Owner", "Open"]}
          rows={items.map((r) => ({
            id: r.reportId,
            cells: [
              r.name,
              r.templateId,
              r.ownerId,
              <Link
                key="o"
                href={QEP_ENTERPRISE_REPORTING_ROUTES.report(r.reportId)}
                className="text-[var(--color-primary)] underline"
              >
                Run
              </Link>,
            ],
          }))}
        />
      )}
    </QepPageShell>
  );
}

function SavedReportRunView({ reportId }: { readonly reportId: string }) {
  const runMutation = useMutation({
    mutationFn: () => runSavedReport(reportId),
  });

  return (
    <QepPageShell
      title="Saved report"
      description={`Report ${reportId}`}
      breadcrumbs={["QEP", "Reporting", "Saved", reportId]}
      actions={
        <Button
          type="button"
          size="sm"
          disabled={runMutation.isPending}
          onClick={() => runMutation.mutate()}
        >
          Run now
        </Button>
      }
    >
      {runMutation.data ? (
        <QepTable
          caption="Generated rows"
          columns={["Metric", "Value", "Unit"]}
          rows={runMutation.data.rows.map((row, index) => ({
            id: String(index),
            cells: [
              String(row.metric ?? ""),
              String(row.value ?? ""),
              String(row.unit ?? ""),
            ],
          }))}
        />
      ) : (
        <QepEmptyState title="Run to generate a derived report snapshot." />
      )}
    </QepPageShell>
  );
}
