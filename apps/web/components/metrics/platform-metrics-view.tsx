"use client";

/**
 * Platform Metrics Administration Workbench (APZMETRICS-004).
 * Consumes only metrics typed-client facades — no gateway/core/persistence.
 * Metadata governance only — not analytics, reporting, or formula/KPI execution.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import * as metricsApi from "@/lib/metrics/metrics-api";
import { metricsQueryKeys } from "@/lib/metrics/query-keys";
import { MetricsClientError, toMetricsUserMessage } from "@/lib/metrics/metrics-errors";
import type { MetricsEntityViewModel } from "@/lib/metrics/metrics-types";
import type { MetricsSection } from "@/lib/metrics/routes";

const BANNERS = [
  { text: "METRIC CALCULATION NOT AVAILABLE", testId: "banner-metric-calculation" },
  { text: "FORMULA EXECUTION NOT AVAILABLE", testId: "banner-formula-execution" },
  { text: "KPI EXECUTION NOT AVAILABLE", testId: "banner-kpi-execution" },
  { text: "ANALYTICS NOT AVAILABLE", testId: "banner-analytics" },
  { text: "REPORTING NOT AVAILABLE", testId: "banner-reporting" },
  { text: "DASHBOARDS NOT AVAILABLE", testId: "banner-dashboards" },
  { text: "PROVIDER INTEGRATIONS NOT AVAILABLE", testId: "banner-providers" },
  { text: "PROMETHEUS INTEGRATION NOT AVAILABLE", testId: "banner-prometheus" },
  { text: "GRAFANA INTEGRATION NOT AVAILABLE", testId: "banner-grafana" },
  { text: "OPENTELEMETRY INTEGRATION NOT AVAILABLE", testId: "banner-otel" },
  { text: "EVENT BUS NOT AVAILABLE", testId: "banner-event-bus" },
  { text: "AI NOT AVAILABLE", testId: "banner-ai" },
] as const;

type FacetKey =
  | "metrics"
  | "definitions"
  | "versions"
  | "categories"
  | "groups"
  | "dimensions"
  | "labels"
  | "units"
  | "formulas"
  | "aggregations"
  | "thresholds"
  | "owners"
  | "consumers"
  | "retentionPolicies"
  | "classifications"
  | "dependencies"
  | "kpis"
  | "kpiGroups"
  | "kpiTargets"
  | "relationships"
  | "metadata";

type FacetConfig = {
  readonly section: MetricsSection;
  readonly facet: FacetKey;
  readonly title: string;
  readonly description: string;
  readonly columns: readonly string[];
  readonly cellKeys: readonly string[];
  readonly createDefaults: Record<string, string>;
};

const FACETS: readonly FacetConfig[] = [
  {
    section: "metrics",
    facet: "metrics",
    title: "Metrics",
    description:
      "Metric registry metadata — values are not calculated in this Workbench.",
    columns: ["ID", "Key", "Name", "Status", "Owner"],
    cellKeys: ["id", "key", "name", "status", "ownerRef"],
    createDefaults: { key: "latency", name: "Latency", status: "draft" },
  },
  {
    section: "definitions",
    facet: "definitions",
    title: "Metric Definitions",
    description: "Definition metadata only — definitions are not executed.",
    columns: ["ID", "Key", "Name", "Kind", "Status"],
    cellKeys: ["id", "key", "name", "kind", "status"],
    createDefaults: {
      metricId: "m_1",
      key: "def1",
      name: "Definition",
      kind: "gauge",
      versionNumber: "1",
      status: "draft",
    },
  },
  {
    section: "versions",
    facet: "versions",
    title: "Metric Versions",
    description: "Version metadata — migrations are not performed.",
    columns: ["ID", "Metric", "Version", "Status"],
    cellKeys: ["id", "metricId", "versionNumber", "status"],
    createDefaults: { metricId: "m_1", versionNumber: "1", status: "draft" },
  },
  {
    section: "categories",
    facet: "categories",
    title: "Metric Categories",
    description: "Category taxonomy metadata only.",
    columns: ["ID", "Key", "Name", "Status"],
    cellKeys: ["id", "key", "name", "status"],
    createDefaults: { key: "ops", name: "Operations", status: "draft" },
  },
  {
    section: "groups",
    facet: "groups",
    title: "Metric Groups",
    description: "Group hierarchy metadata only.",
    columns: ["ID", "Key", "Name", "Status"],
    cellKeys: ["id", "key", "name", "status"],
    createDefaults: { key: "g1", name: "Group", status: "draft" },
  },
  {
    section: "dimensions",
    facet: "dimensions",
    title: "Metric Dimensions",
    description: "Dimension metadata — values are not calculated.",
    columns: ["ID", "Key", "Name", "Data type", "Status"],
    cellKeys: ["id", "key", "name", "dataType", "status"],
    createDefaults: {
      key: "region",
      name: "Region",
      dataType: "string",
      status: "draft",
    },
  },
  {
    section: "labels",
    facet: "labels",
    title: "Metric Labels",
    description: "Label metadata only.",
    columns: ["ID", "Key", "Name", "Status"],
    cellKeys: ["id", "key", "name", "status"],
    createDefaults: { key: "env", name: "Environment", status: "draft" },
  },
  {
    section: "units",
    facet: "units",
    title: "Metric Units",
    description: "Unit metadata only.",
    columns: ["ID", "Key", "Name", "Status"],
    cellKeys: ["id", "key", "name", "status"],
    createDefaults: { key: "ms", name: "Milliseconds", status: "draft" },
  },
  {
    section: "formulas",
    facet: "formulas",
    title: "Metric Formulas",
    description: "Formula metadata only — expressions are never evaluated.",
    columns: ["ID", "Language", "Expression", "Status"],
    cellKeys: ["id", "language", "expression", "status"],
    createDefaults: { expression: "a + b", language: "expression", status: "draft" },
  },
  {
    section: "aggregations",
    facet: "aggregations",
    title: "Metric Aggregations",
    description: "Aggregation metadata — aggregation is not performed.",
    columns: ["ID", "Key", "Name", "Method", "Status"],
    cellKeys: ["id", "key", "name", "method", "status"],
    createDefaults: { key: "avg", name: "Average", method: "avg", status: "draft" },
  },
  {
    section: "thresholds",
    facet: "thresholds",
    title: "Metric Thresholds",
    description: "Threshold metadata — thresholds are not evaluated.",
    columns: ["ID", "Name", "Operator", "Value", "Severity"],
    cellKeys: ["id", "name", "operator", "valueLabel", "severity"],
    createDefaults: {
      metricId: "m_1",
      name: "High",
      operator: "gt",
      valueLabel: "100",
      severity: "warning",
      status: "draft",
    },
  },
  {
    section: "owners",
    facet: "owners",
    title: "Metric Owners",
    description: "Ownership metadata only.",
    columns: ["ID", "Metric", "Type", "Ref", "Status"],
    cellKeys: ["id", "metricId", "ownerType", "ownerRef", "status"],
    createDefaults: {
      metricId: "m_1",
      ownerType: "team",
      ownerRef: "platform",
      status: "draft",
    },
  },
  {
    section: "consumers",
    facet: "consumers",
    title: "Metric Consumers",
    description: "Consumer relationship metadata only.",
    columns: ["ID", "Metric", "Type", "Ref", "Status"],
    cellKeys: ["id", "metricId", "consumerType", "consumerRef", "status"],
    createDefaults: {
      metricId: "m_1",
      consumerType: "module",
      consumerRef: "reporting",
      status: "draft",
    },
  },
  {
    section: "retention-policies",
    facet: "retentionPolicies",
    title: "Retention Policies",
    description: "Retention metadata — storage systems are not managed.",
    columns: ["ID", "Key", "Name", "Days", "Status"],
    cellKeys: ["id", "key", "name", "retentionDays", "status"],
    createDefaults: {
      key: "default",
      name: "Default",
      retentionDays: "90",
      status: "draft",
    },
  },
  {
    section: "classifications",
    facet: "classifications",
    title: "Metric Classifications",
    description: "Classification metadata only.",
    columns: ["ID", "Key", "Name", "Level", "Status"],
    cellKeys: ["id", "key", "name", "level", "status"],
    createDefaults: {
      key: "ops",
      name: "Operational",
      level: "operational",
      status: "draft",
    },
  },
  {
    section: "dependencies",
    facet: "dependencies",
    title: "Metric Dependencies",
    description: "Dependency graph metadata — evaluation is not performed.",
    columns: ["ID", "Metric", "Depends on", "Kind", "Status"],
    cellKeys: ["id", "metricId", "dependsOnMetricId", "dependencyKind", "status"],
    createDefaults: {
      metricId: "m_1",
      dependsOnMetricId: "m_2",
      dependencyKind: "uses",
      status: "draft",
    },
  },
  {
    section: "kpis",
    facet: "kpis",
    title: "KPIs",
    description: "KPI definition metadata — KPI values are never calculated.",
    columns: ["ID", "Key", "Name", "Metric", "Status"],
    cellKeys: ["id", "key", "name", "metricId", "status"],
    createDefaults: { key: "kpi1", name: "KPI One", metricId: "m_1", status: "draft" },
  },
  {
    section: "kpi-groups",
    facet: "kpiGroups",
    title: "KPI Groups",
    description: "KPI group metadata only.",
    columns: ["ID", "Key", "Name", "Status"],
    cellKeys: ["id", "key", "name", "status"],
    createDefaults: { key: "kg1", name: "KPI Group", status: "draft" },
  },
  {
    section: "kpi-targets",
    facet: "kpiTargets",
    title: "KPI Targets",
    description: "KPI target metadata — targets are not evaluated.",
    columns: ["ID", "KPI", "Period", "Target", "Status"],
    cellKeys: ["id", "kpiId", "periodLabel", "targetValueLabel", "status"],
    createDefaults: {
      kpiId: "kpi_1",
      periodLabel: "2026-Q3",
      targetValueLabel: "99.9",
      status: "draft",
    },
  },
  {
    section: "relationships",
    facet: "relationships",
    title: "Relationships",
    description: "Canonical relationship metadata only.",
    columns: ["ID", "From", "To", "Kind", "Status"],
    cellKeys: ["id", "fromMetricId", "toMetricId", "relationshipKind", "status"],
    createDefaults: {
      fromMetricId: "m_1",
      toMetricId: "m_2",
      relationshipKind: "correlates_with",
      status: "draft",
    },
  },
  {
    section: "metadata",
    facet: "metadata",
    title: "Metadata",
    description: "Typed metadata records — no unrestricted JSON editor.",
    columns: ["ID", "Subject", "Key", "Status"],
    cellKeys: ["id", "subjectKind", "key", "status"],
    createDefaults: {
      subjectKind: "metric",
      subjectId: "m_1",
      key: "source",
      status: "draft",
    },
  },
];

const LIST_FNS: Record<
  FacetKey,
  (
    query?: { limit?: number },
    options?: { signal?: AbortSignal },
  ) => Promise<{
    items: readonly MetricsEntityViewModel[];
  }>
> = {
  metrics: metricsApi.listMetrics,
  definitions: metricsApi.listDefinitions,
  versions: metricsApi.listVersions,
  categories: metricsApi.listCategories,
  groups: metricsApi.listGroups,
  dimensions: metricsApi.listDimensions,
  labels: metricsApi.listLabels,
  units: metricsApi.listUnits,
  formulas: metricsApi.listFormulas,
  aggregations: metricsApi.listAggregations,
  thresholds: metricsApi.listThresholds,
  owners: metricsApi.listOwners,
  consumers: metricsApi.listConsumers,
  retentionPolicies: metricsApi.listRetentionPolicies,
  classifications: metricsApi.listClassifications,
  dependencies: metricsApi.listDependencies,
  kpis: metricsApi.listKPIs,
  kpiGroups: metricsApi.listKPIGroups,
  kpiTargets: metricsApi.listKPITargets,
  relationships: metricsApi.listRelationships,
  metadata: metricsApi.listMetadata,
};

const GET_FNS: Record<
  FacetKey,
  (id: string, options?: { signal?: AbortSignal }) => Promise<MetricsEntityViewModel>
> = {
  metrics: metricsApi.getMetric,
  definitions: metricsApi.getDefinition,
  versions: metricsApi.getVersion,
  categories: metricsApi.getCategory,
  groups: metricsApi.getGroup,
  dimensions: metricsApi.getDimension,
  labels: metricsApi.getLabel,
  units: metricsApi.getUnit,
  formulas: metricsApi.getFormula,
  aggregations: metricsApi.getAggregation,
  thresholds: metricsApi.getThreshold,
  owners: metricsApi.getOwner,
  consumers: metricsApi.getConsumer,
  retentionPolicies: metricsApi.getRetentionPolicy,
  classifications: metricsApi.getClassification,
  dependencies: metricsApi.getDependency,
  kpis: metricsApi.getKPI,
  kpiGroups: metricsApi.getKPIGroup,
  kpiTargets: metricsApi.getKPITarget,
  relationships: metricsApi.getRelationship,
  metadata: metricsApi.getMetadata,
};

const CREATE_FNS: Record<
  FacetKey,
  (input: Record<string, unknown>) => Promise<MetricsEntityViewModel>
> = {
  metrics: metricsApi.createMetric,
  definitions: metricsApi.createDefinition,
  versions: metricsApi.createVersion,
  categories: metricsApi.createCategory,
  groups: metricsApi.createGroup,
  dimensions: metricsApi.createDimension,
  labels: metricsApi.createLabel,
  units: metricsApi.createUnit,
  formulas: metricsApi.createFormula,
  aggregations: metricsApi.createAggregation,
  thresholds: metricsApi.createThreshold,
  owners: metricsApi.createOwner,
  consumers: metricsApi.createConsumer,
  retentionPolicies: metricsApi.createRetentionPolicy,
  classifications: metricsApi.createClassification,
  dependencies: metricsApi.createDependency,
  kpis: metricsApi.createKPI,
  kpiGroups: metricsApi.createKPIGroup,
  kpiTargets: metricsApi.createKPITarget,
  relationships: metricsApi.createRelationship,
  metadata: metricsApi.createMetadata,
};

const UPDATE_FNS: Record<
  FacetKey,
  (id: string, input: Record<string, unknown>) => Promise<MetricsEntityViewModel>
> = {
  metrics: metricsApi.updateMetric,
  definitions: metricsApi.updateDefinition,
  versions: metricsApi.updateVersion,
  categories: metricsApi.updateCategory,
  groups: metricsApi.updateGroup,
  dimensions: metricsApi.updateDimension,
  labels: metricsApi.updateLabel,
  units: metricsApi.updateUnit,
  formulas: metricsApi.updateFormula,
  aggregations: metricsApi.updateAggregation,
  thresholds: metricsApi.updateThreshold,
  owners: metricsApi.updateOwner,
  consumers: metricsApi.updateConsumer,
  retentionPolicies: metricsApi.updateRetentionPolicy,
  classifications: metricsApi.updateClassification,
  dependencies: metricsApi.updateDependency,
  kpis: metricsApi.updateKPI,
  kpiGroups: metricsApi.updateKPIGroup,
  kpiTargets: metricsApi.updateKPITarget,
  relationships: metricsApi.updateRelationship,
  metadata: metricsApi.updateMetadata,
};

function PageShell({
  title,
  description,
  actions,
  children,
}: {
  readonly title: string;
  readonly description?: string;
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-1" data-testid="metrics-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Platform Metrics
          </p>
          <h1 className="text-2xl font-semibold text-[var(--color-foreground)]">
            {title}
          </h1>
          {description ? (
            <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </header>
      {children}
    </div>
  );
}

function NoticeBanner({
  text,
  testId,
}: {
  readonly text: string;
  readonly testId?: string;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-destructive)]/30 bg-[var(--color-muted)]/40 px-4 py-3 text-sm font-medium"
      data-testid={testId}
      role="status"
    >
      {text}
    </div>
  );
}

function EmptyState({
  title,
  description,
}: {
  readonly title: string;
  readonly description?: string;
}) {
  return (
    <div
      className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-10 text-center"
      data-testid="metrics-empty"
    >
      <p className="font-medium text-[var(--color-foreground)]">{title}</p>
      {description ? (
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          {description}
        </p>
      ) : null}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
  forbidden,
  notFound,
  unavailable,
}: {
  readonly message: string;
  readonly onRetry?: () => void;
  readonly forbidden?: boolean;
  readonly notFound?: boolean;
  readonly unavailable?: boolean;
}) {
  return (
    <div
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/30 px-4 py-6"
      data-testid={
        unavailable
          ? "metrics-unavailable"
          : forbidden
            ? "metrics-forbidden"
            : notFound
              ? "metrics-not-found"
              : "metrics-error"
      }
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {unavailable
          ? "Metrics service unavailable"
          : forbidden
            ? "Access denied"
            : notFound
              ? "Not found"
              : "Unable to load metrics data"}
      </p>
      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{message}</p>
      {onRetry ? (
        <div className="mt-3">
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Retry
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function StatusCard({
  label,
  value,
  testId,
  emphasize,
}: {
  readonly label: string;
  readonly value: string;
  readonly testId?: string;
  readonly emphasize?: boolean;
}) {
  return (
    <div
      className={[
        "rounded-lg border border-[var(--color-border)] px-4 py-3",
        emphasize
          ? "border-[var(--color-destructive)]/40 bg-[var(--color-muted)]/40"
          : "",
      ].join(" ")}
      data-testid={testId}
    >
      <p className="text-xs uppercase tracking-wide text-[var(--color-muted-foreground)]">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function StatusBadge({ value }: { readonly value: string }) {
  const normalized = value.trim() || "unknown";
  return (
    <span
      className="inline-flex items-center gap-1 rounded border border-[var(--color-border)] px-2 py-0.5 text-xs"
      data-testid="status-badge"
      aria-label={`Status ${normalized}`}
    >
      <span aria-hidden="true">●</span>
      {normalized}
    </span>
  );
}

function MetaTable({
  columns,
  rows,
  caption,
  onRowClick,
  selectedId,
  testId = "metrics-table",
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly id: string;
    readonly cells: readonly ReactNode[];
  }[];
  readonly caption?: string;
  readonly onRowClick?: (id: string) => void;
  readonly selectedId?: string | null;
  readonly testId?: string;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg border border-[var(--color-border)]"
      data-testid={testId}
    >
      <table className="min-w-full text-left text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead className="border-b border-[var(--color-border)] bg-[var(--color-muted)]/20">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                scope="col"
                className="px-3 py-2 font-medium text-[var(--color-foreground)]"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={[
                "border-b border-[var(--color-border)]",
                onRowClick ? "cursor-pointer hover:bg-[var(--color-muted)]/30" : "",
                selectedId === row.id ? "bg-[var(--color-muted)]/40" : "",
              ].join(" ")}
              onClick={onRowClick ? () => onRowClick(row.id) : undefined}
              onKeyDown={
                onRowClick
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        onRowClick(row.id);
                      }
                    }
                  : undefined
              }
              tabIndex={onRowClick ? 0 : undefined}
              aria-selected={selectedId === row.id}
            >
              {row.cells.map((cell, index) => (
                <td
                  key={`${row.id}-${index}`}
                  className="px-3 py-2 text-[var(--color-foreground)]"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isForbidden(error: unknown): boolean {
  return (
    error instanceof MetricsClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof MetricsClientError && error.status === 404;
}

function isUnavailable(error: unknown): boolean {
  return (
    error instanceof MetricsClientError &&
    (error.status === 503 || error.code === "METRICS_SERVICE_UNAVAILABLE")
  );
}

function cellValue(item: MetricsEntityViewModel, key: string): string {
  const value = item[key];
  if (value == null || value === "") return "—";
  return String(value);
}

function FacetPanel({
  config,
  canManage,
}: {
  readonly config: FacetConfig;
  readonly canManage: boolean;
}) {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>(config.createDefaults);

  const listQuery = useQuery({
    queryKey: metricsQueryKeys[config.facet].list(),
    queryFn: ({ signal }) => LIST_FNS[config.facet]({ limit: 100 }, { signal }),
    retry: false,
  });

  const items = useMemo(() => {
    const source = listQuery.data?.items ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return [...source];
    return source.filter((item) =>
      config.cellKeys.some((key) =>
        String(item[key] ?? "")
          .toLowerCase()
          .includes(q),
      ),
    );
  }, [listQuery.data?.items, filter, config.cellKeys]);

  const activeId = selectedId ?? items[0]?.id ?? null;

  const detailQuery = useQuery({
    queryKey: metricsQueryKeys[config.facet].detail(activeId ?? ""),
    queryFn: ({ signal }) => GET_FNS[config.facet](activeId!, { signal }),
    enabled: Boolean(activeId),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = { ...draft };
      for (const key of ["versionNumber", "retentionDays"]) {
        if (key in payload && typeof payload[key] === "string") {
          payload[key] = Number(payload[key]);
        }
      }
      return CREATE_FNS[config.facet](payload);
    },
    onSuccess: async (created) => {
      setStatusMessage(`Created ${created.id}`);
      setActionError(null);
      setSelectedId(created.id);
      await queryClient.invalidateQueries({
        queryKey: metricsQueryKeys[config.facet].all,
      });
    },
    onError: (error) => {
      setActionError(toMetricsUserMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!activeId) throw new Error("No record selected");
      const name = draft.name || draft.key || undefined;
      return UPDATE_FNS[config.facet](activeId, {
        ...(name ? { name } : {}),
        ...(draft.status ? { status: draft.status } : {}),
      });
    },
    onSuccess: async () => {
      setStatusMessage("Updated metadata");
      setActionError(null);
      await queryClient.invalidateQueries({
        queryKey: metricsQueryKeys[config.facet].all,
      });
    },
    onError: (error) => {
      setActionError(toMetricsUserMessage(error));
    },
  });

  if (listQuery.isError && isUnavailable(listQuery.error)) {
    return (
      <ErrorState
        unavailable
        message={toMetricsUserMessage(listQuery.error)}
        onRetry={() => void listQuery.refetch()}
      />
    );
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        forbidden={isForbidden(listQuery.error)}
        notFound={isNotFound(listQuery.error)}
        message={toMetricsUserMessage(listQuery.error)}
        onRetry={() => void listQuery.refetch()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4" data-testid={`facet-${config.section}`}>
      <div
        className="flex flex-wrap items-center gap-2"
        role="toolbar"
        aria-label={`${config.title} commands`}
      >
        <Input
          aria-label={`Filter ${config.title}`}
          placeholder="Filter…"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="max-w-xs"
        />
        {canManage ? (
          <>
            <Button
              type="button"
              size="sm"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending}
            >
              Create
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => updateMutation.mutate()}
              disabled={!activeId || updateMutation.isPending}
            >
              Save
            </Button>
          </>
        ) : null}
      </div>

      {statusMessage ? (
        <p
          className="text-sm text-[var(--color-foreground)]"
          data-testid="metrics-status"
        >
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          role="alert"
          data-testid="metrics-action-error"
        >
          {actionError}
        </p>
      ) : null}

      {listQuery.isLoading ? (
        <p data-testid="metrics-loading">Loading…</p>
      ) : items.length === 0 ? (
        <EmptyState
          title={`No ${config.title.toLowerCase()}`}
          description="Canonical metadata records will appear here when registered."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <MetaTable
            caption={config.title}
            columns={config.columns}
            selectedId={activeId}
            onRowClick={setSelectedId}
            rows={items.map((item) => ({
              id: item.id,
              cells: config.cellKeys.map((key) =>
                key.toLowerCase().includes("status") ||
                key === "severity" ||
                key === "level" ? (
                  <StatusBadge value={cellValue(item, key)} />
                ) : (
                  cellValue(item, key)
                ),
              ),
            }))}
          />
          <div
            className="rounded-lg border border-[var(--color-border)] px-4 py-3"
            data-testid="metrics-detail"
          >
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              Detail inspector
            </h2>
            {detailQuery.isLoading ? (
              <p className="mt-2 text-sm" data-testid="metrics-loading">
                Loading detail…
              </p>
            ) : detailQuery.isError ? (
              <ErrorState
                unavailable={isUnavailable(detailQuery.error)}
                forbidden={isForbidden(detailQuery.error)}
                notFound={isNotFound(detailQuery.error)}
                message={toMetricsUserMessage(detailQuery.error)}
                onRetry={() => void detailQuery.refetch()}
              />
            ) : detailQuery.data ? (
              <dl className="mt-3 grid gap-2 text-sm">
                {Object.entries(detailQuery.data)
                  .filter(([, value]) => value != null && typeof value !== "object")
                  .slice(0, 16)
                  .map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-2">
                      <dt className="text-[var(--color-muted-foreground)]">{key}</dt>
                      <dd className="text-[var(--color-foreground)]">
                        {key.toLowerCase().includes("status") ||
                        key === "severity" ||
                        key === "level" ? (
                          <StatusBadge value={String(value)} />
                        ) : (
                          String(value)
                        )}
                      </dd>
                    </div>
                  ))}
              </dl>
            ) : (
              <EmptyState title="Select a record" />
            )}
          </div>
        </div>
      )}

      {canManage ? (
        <div className="grid gap-2 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2">
          <h2 className="md:col-span-2 text-sm font-semibold">Create metadata</h2>
          {Object.keys(config.createDefaults).map((field) => (
            <label key={field} className="flex flex-col gap-1 text-sm">
              <span className="text-[var(--color-muted-foreground)]">{field}</span>
              <Input
                value={draft[field] ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    [field]: event.target.value,
                  }))
                }
                aria-label={field}
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function PlatformMetricsView({
  section = "overview",
  canManage = true,
}: {
  readonly section?: MetricsSection;
  readonly canManage?: boolean;
}) {
  const metricsQuery = useQuery({
    queryKey: metricsQueryKeys.metrics.list(),
    queryFn: ({ signal }) => metricsApi.listMetrics({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const definitionsQuery = useQuery({
    queryKey: metricsQueryKeys.definitions.list(),
    queryFn: ({ signal }) => metricsApi.listDefinitions({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const versionsQuery = useQuery({
    queryKey: metricsQueryKeys.versions.list(),
    queryFn: ({ signal }) => metricsApi.listVersions({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const categoriesQuery = useQuery({
    queryKey: metricsQueryKeys.categories.list(),
    queryFn: ({ signal }) => metricsApi.listCategories({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const groupsQuery = useQuery({
    queryKey: metricsQueryKeys.groups.list(),
    queryFn: ({ signal }) => metricsApi.listGroups({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const ownersQuery = useQuery({
    queryKey: metricsQueryKeys.owners.list(),
    queryFn: ({ signal }) => metricsApi.listOwners({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const consumersQuery = useQuery({
    queryKey: metricsQueryKeys.consumers.list(),
    queryFn: ({ signal }) => metricsApi.listConsumers({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const kpisQuery = useQuery({
    queryKey: metricsQueryKeys.kpis.list(),
    queryFn: ({ signal }) => metricsApi.listKPIs({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const dependenciesQuery = useQuery({
    queryKey: metricsQueryKeys.dependencies.list(),
    queryFn: ({ signal }) => metricsApi.listDependencies({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const relationshipsQuery = useQuery({
    queryKey: metricsQueryKeys.relationships.list(),
    queryFn: ({ signal }) => metricsApi.listRelationships({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const capabilitiesQuery = useQuery({
    queryKey: metricsQueryKeys.capabilities(),
    queryFn: ({ signal }) => metricsApi.getMetricsCapabilities({ signal }),
    enabled: section === "overview" || section === "diagnostics",
    retry: false,
  });
  const healthQuery = useQuery({
    queryKey: metricsQueryKeys.health(),
    queryFn: ({ signal }) => metricsApi.getMetricsHealth({ signal }),
    enabled: section === "diagnostics",
    retry: false,
  });
  const readinessDiagQuery = useQuery({
    queryKey: metricsQueryKeys.readiness(),
    queryFn: ({ signal }) => metricsApi.getMetricsReadiness({ signal }),
    enabled: section === "diagnostics",
    retry: false,
  });
  const diagnosticsQuery = useQuery({
    queryKey: metricsQueryKeys.diagnostics.management(),
    queryFn: ({ signal }) => metricsApi.getMetricsDiagnostics({ signal }),
    enabled: section === "diagnostics",
    retry: false,
  });

  const overviewError = metricsQuery.error ?? capabilitiesQuery.error ?? null;

  if (
    (section === "overview" || section === "diagnostics") &&
    overviewError &&
    isUnavailable(overviewError)
  ) {
    return (
      <PageShell
        title={section === "diagnostics" ? "Diagnostics" : "Overview"}
        description="Metrics metadata management plane."
      >
        <ErrorState
          unavailable
          message={toMetricsUserMessage(overviewError)}
          onRetry={() => {
            void metricsQuery.refetch();
            void capabilitiesQuery.refetch();
          }}
        />
      </PageShell>
    );
  }

  if (section === "overview") {
    return (
      <PageShell
        title="Overview"
        description="Metrics metadata dashboard — calculation, formula/KPI execution, and providers are not available."
        actions={
          <div role="toolbar" aria-label="Metrics commands">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                void metricsQuery.refetch();
                void capabilitiesQuery.refetch();
              }}
            >
              Refresh
            </Button>
          </div>
        }
      >
        <div className="grid gap-2" data-testid="capability-banners">
          {BANNERS.map((banner) => (
            <NoticeBanner
              key={banner.testId}
              text={banner.text}
              testId={banner.testId}
            />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatusCard
            label="Registered metrics"
            value={String(metricsQuery.data?.items.length ?? "—")}
            testId="card-metrics-count"
          />
          <StatusCard
            label="KPI definitions"
            value={String(kpisQuery.data?.items.length ?? "—")}
            testId="card-kpis-count"
          />
          <StatusCard
            label="Metric categories"
            value={String(categoriesQuery.data?.items.length ?? "—")}
            testId="card-categories-count"
          />
          <StatusCard
            label="Metric groups"
            value={String(groupsQuery.data?.items.length ?? "—")}
            testId="card-groups-count"
          />
          <StatusCard
            label="Metric owners"
            value={String(ownersQuery.data?.items.length ?? "—")}
            testId="card-owners-count"
          />
          <StatusCard
            label="Metric consumers"
            value={String(consumersQuery.data?.items.length ?? "—")}
            testId="card-consumers-count"
          />
          <StatusCard
            label="Metric versions"
            value={String(versionsQuery.data?.items.length ?? "—")}
            testId="card-versions-count"
          />
          <StatusCard
            label="Definitions"
            value={String(definitionsQuery.data?.items.length ?? "—")}
            testId="card-definitions-count"
          />
          <StatusCard
            label="Dependencies"
            value={String(dependenciesQuery.data?.items.length ?? "—")}
            testId="card-dependencies-count"
          />
          <StatusCard
            label="Relationships"
            value={String(relationshipsQuery.data?.items.length ?? "—")}
            testId="card-relationships-count"
          />
          <StatusCard
            label="Metadata completeness"
            value={String(
              capabilitiesQuery.data?.metadataCompleteness ?? "platform-services",
            )}
            testId="card-metadata-completeness"
          />
          <StatusCard
            label="Persistence readiness"
            value={capabilitiesQuery.data?.persistenceReady ? "Ready" : "Unavailable"}
            testId="card-persistence-readiness"
          />
          <StatusCard
            label="Formula execution"
            value="Unavailable"
            emphasize
            testId="card-formula-execution"
          />
          <StatusCard
            label="KPI execution"
            value="Unavailable"
            emphasize
            testId="card-kpi-execution"
          />
        </div>
      </PageShell>
    );
  }

  if (section === "diagnostics") {
    const diagError =
      healthQuery.error ??
      readinessDiagQuery.error ??
      diagnosticsQuery.error ??
      capabilitiesQuery.error;
    if (diagError && isUnavailable(diagError)) {
      return (
        <PageShell title="Diagnostics" description="Safe readiness metadata only.">
          <ErrorState
            unavailable
            message={toMetricsUserMessage(diagError)}
            onRetry={() => {
              void healthQuery.refetch();
              void readinessDiagQuery.refetch();
            }}
          />
        </PageShell>
      );
    }
    return (
      <PageShell
        title="Diagnostics"
        description="Platform readiness and registration metadata — no runtime execution diagnostics."
      >
        <div className="grid gap-2" data-testid="capability-banners">
          {BANNERS.slice(0, 4).map((banner) => (
            <NoticeBanner
              key={banner.testId}
              text={banner.text}
              testId={banner.testId}
            />
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <StatusCard
            label="Metrics enabled"
            value={capabilitiesQuery.data?.metricsEnabled ? "Enabled" : "Disabled"}
            testId="diag-metrics-enabled"
          />
          <StatusCard
            label="Persistence"
            value={String(
              healthQuery.data?.persistenceMode ??
                capabilitiesQuery.data?.persistenceMode ??
                "unknown",
            )}
            testId="diag-persistence"
          />
          <StatusCard
            label="Readiness"
            value={
              readinessDiagQuery.data?.ready
                ? "Ready"
                : readinessDiagQuery.isLoading
                  ? "Loading"
                  : "Not ready"
            }
            testId="diag-readiness"
          />
          <StatusCard
            label="Metadata completeness"
            value={String(
              capabilitiesQuery.data?.metadataCompleteness ?? "platform-services",
            )}
            testId="diag-metadata-completeness"
          />
          <StatusCard
            label="Registration state"
            value={String(capabilitiesQuery.data?.registrationState ?? "unknown")}
            testId="diag-registration-state"
          />
          <StatusCard
            label="Formula execution"
            value="Unavailable"
            emphasize
            testId="diag-formula-execution"
          />
          <StatusCard
            label="KPI execution"
            value="Unavailable"
            emphasize
            testId="diag-kpi-execution"
          />
        </div>
      </PageShell>
    );
  }

  const facet = FACETS.find((entry) => entry.section === section);
  if (!facet) {
    return (
      <PageShell title="Metrics" description="Unknown section.">
        <EmptyState title="Section not found" />
      </PageShell>
    );
  }

  return (
    <PageShell title={facet.title} description={facet.description}>
      <FacetPanel config={facet} canManage={canManage} />
    </PageShell>
  );
}
