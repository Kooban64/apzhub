"use client";

/**
 * Platform Observability Administration Workbench (APZOBSERVE-004).
 * Consumes only observe typed-client facades — no gateway/core/persistence.
 * Metadata governance only — not a live Grafana/Prometheus/Loki surface.
 */

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState, type ReactNode } from "react";

import * as observeApi from "@/lib/observe/observe-api";
import { observeQueryKeys } from "@/lib/observe/query-keys";
import { ObserveClientError, toObserveUserMessage } from "@/lib/observe/observe-errors";
import type { ObserveEntityViewModel } from "@/lib/observe/observe-types";
import type { ObserveSection } from "@/lib/observe/routes";

const BANNERS = [
  {
    text: "LIVE METRICS COLLECTION NOT AVAILABLE",
    testId: "banner-metrics-collection",
  },
  { text: "LIVE LOG INGESTION NOT AVAILABLE", testId: "banner-log-ingestion" },
  { text: "LIVE TRACE INGESTION NOT AVAILABLE", testId: "banner-trace-ingestion" },
  { text: "GRAFANA INTEGRATION NOT AVAILABLE", testId: "banner-grafana" },
  { text: "PROMETHEUS INTEGRATION NOT AVAILABLE", testId: "banner-prometheus" },
  { text: "LOKI INTEGRATION NOT AVAILABLE", testId: "banner-loki" },
  { text: "OPENTELEMETRY INTEGRATION NOT AVAILABLE", testId: "banner-otel" },
  { text: "ALERTMANAGER INTEGRATION NOT AVAILABLE", testId: "banner-alertmanager" },
  {
    text: "ALERT NOTIFICATION DELIVERY NOT AVAILABLE",
    testId: "banner-alert-delivery",
  },
  {
    text: "INCIDENT EXECUTION WORKFLOWS NOT AVAILABLE",
    testId: "banner-incident-execution",
  },
] as const;

type FacetKey =
  | "healthChecks"
  | "readinessChecks"
  | "livenessChecks"
  | "serviceHealth"
  | "serviceStatus"
  | "componentStatus"
  | "metricDefinitions"
  | "metricSamples"
  | "alertDefinitions"
  | "alertStates"
  | "dashboardDefinitions"
  | "logSources"
  | "traceDefinitions"
  | "traceSpans"
  | "incidentReferences"
  | "maintenanceWindows"
  | "healthSummaries"
  | "metadata";

type FacetConfig = {
  readonly section: ObserveSection;
  readonly facet: FacetKey;
  readonly title: string;
  readonly description: string;
  readonly columns: readonly string[];
  readonly cellKeys: readonly string[];
  readonly createDefaults: Record<string, string>;
  readonly canManage?: boolean;
};

const FACETS: readonly FacetConfig[] = [
  {
    section: "health-checks",
    facet: "healthChecks",
    title: "Health Checks",
    description:
      "Health check metadata only — probes are not executed from this Workbench.",
    columns: ["ID", "Service", "Name", "Status", "Provider"],
    cellKeys: ["id", "serviceKey", "name", "status", "providerKind"],
    createDefaults: {
      serviceKey: "platform-api",
      name: "New health check",
      status: "unknown",
      providerKind: "internal",
    },
  },
  {
    section: "readiness-checks",
    facet: "readinessChecks",
    title: "Readiness Checks",
    description:
      "Readiness metadata — distinct from liveness; external probes are not executed.",
    columns: ["ID", "Service", "Name", "Status", "Provider"],
    cellKeys: ["id", "serviceKey", "name", "status", "providerKind"],
    createDefaults: {
      serviceKey: "platform-api",
      name: "New readiness check",
      status: "unknown",
      providerKind: "internal",
    },
  },
  {
    section: "liveness-checks",
    facet: "livenessChecks",
    title: "Liveness Checks",
    description:
      "Liveness metadata — processes/containers are not probed from this Workbench.",
    columns: ["ID", "Service", "Name", "Status", "Provider"],
    cellKeys: ["id", "serviceKey", "name", "status", "providerKind"],
    createDefaults: {
      serviceKey: "platform-api",
      name: "New liveness check",
      status: "unknown",
      providerKind: "internal",
    },
  },
  {
    section: "service-health",
    facet: "serviceHealth",
    title: "Service Health",
    description:
      "Recorded service-health metadata — not a live probe result unless the record says so.",
    columns: ["ID", "Service", "Display name", "Overall", "Readiness"],
    cellKeys: ["id", "serviceKey", "displayName", "overallStatus", "readinessStatus"],
    createDefaults: {
      serviceKey: "platform-api",
      displayName: "Platform API",
      overallStatus: "unknown",
      readinessStatus: "unknown",
      livenessStatus: "unknown",
    },
  },
  {
    section: "service-status",
    facet: "serviceStatus",
    title: "Service Status",
    description: "Canonical service status metadata using domain status values.",
    columns: ["ID", "Service", "Status", "Message", "Observed"],
    cellKeys: ["id", "serviceKey", "status", "message", "observedAt"],
    createDefaults: {
      serviceKey: "platform-api",
      status: "unknown",
    },
  },
  {
    section: "component-status",
    facet: "componentStatus",
    title: "Component Status",
    description: "Component status metadata — infrastructure is not probed.",
    columns: ["ID", "Service", "Component", "Name", "Status"],
    cellKeys: ["id", "serviceKey", "componentKey", "name", "status"],
    createDefaults: {
      serviceKey: "platform-api",
      componentKey: "db",
      name: "Database",
      status: "unknown",
    },
  },
  {
    section: "metric-definitions",
    facet: "metricDefinitions",
    title: "Metric Definitions",
    description: "Metric definition metadata — no PromQL and no live querying.",
    columns: ["ID", "Key", "Name", "Kind", "Status"],
    cellKeys: ["id", "key", "name", "kind", "status"],
    createDefaults: {
      key: "requests_total",
      name: "Requests",
      kind: "counter",
      providerKind: "prometheus",
      status: "draft",
    },
  },
  {
    section: "metric-samples",
    facet: "metricSamples",
    title: "Metric Samples",
    description:
      "Stored sample metadata only — not a time-series store or charting engine.",
    columns: ["ID", "Metric", "Sampled at", "Value label", "Provider"],
    cellKeys: ["id", "metricDefinitionId", "sampledAt", "valueLabel", "providerKind"],
    createDefaults: {
      metricDefinitionId: "md_1",
      sampledAt: new Date().toISOString(),
      providerKind: "prometheus",
      valueLabel: "0",
    },
  },
  {
    section: "alert-definitions",
    facet: "alertDefinitions",
    title: "Alert Definitions",
    description: "Alert definition metadata — thresholds are not evaluated here.",
    columns: ["ID", "Key", "Name", "Severity", "Status"],
    cellKeys: ["id", "key", "name", "severity", "status"],
    createDefaults: {
      key: "high_error_rate",
      name: "High error rate",
      severity: "warning",
      providerKind: "alertmanager",
      status: "draft",
    },
  },
  {
    section: "alert-states",
    facet: "alertStates",
    title: "Alert States",
    description: "Recorded alert state metadata — notifications are not delivered.",
    columns: ["ID", "Definition", "State", "Severity msg", "Provider"],
    cellKeys: ["id", "alertDefinitionId", "state", "message", "providerKind"],
    createDefaults: {
      alertDefinitionId: "ad_1",
      state: "inactive",
      providerKind: "alertmanager",
    },
  },
  {
    section: "dashboard-definitions",
    facet: "dashboardDefinitions",
    title: "Dashboard Definitions",
    description: "Dashboard metadata only — Grafana is not embedded or connected.",
    columns: ["ID", "Key", "Name", "Provider", "Status"],
    cellKeys: ["id", "key", "name", "providerKind", "status"],
    createDefaults: {
      key: "ops",
      name: "Operations",
      providerKind: "grafana",
      status: "draft",
    },
  },
  {
    section: "log-sources",
    facet: "logSources",
    title: "Log Sources",
    description: "Log source metadata — raw logs are not ingested or displayed.",
    columns: ["ID", "Key", "Name", "Kind", "Status"],
    cellKeys: ["id", "key", "name", "kind", "status"],
    createDefaults: {
      key: "app",
      name: "Application",
      kind: "application",
      providerKind: "loki",
      status: "draft",
    },
  },
  {
    section: "trace-definitions",
    facet: "traceDefinitions",
    title: "Trace Definitions",
    description: "Trace definition metadata — exporters are not configured here.",
    columns: ["ID", "Key", "Name", "Provider", "Status"],
    cellKeys: ["id", "key", "name", "providerKind", "status"],
    createDefaults: {
      key: "http",
      name: "HTTP traces",
      providerKind: "opentelemetry",
      status: "draft",
    },
  },
  {
    section: "trace-spans",
    facet: "traceSpans",
    title: "Trace Spans",
    description: "Stored span metadata only — not a distributed-trace visualiser.",
    columns: ["ID", "Definition", "Span", "Service", "Provider"],
    cellKeys: ["id", "traceDefinitionId", "spanName", "serviceKey", "providerKind"],
    createDefaults: {
      traceDefinitionId: "td_1",
      spanName: "handler",
      providerKind: "opentelemetry",
    },
  },
  {
    section: "incident-references",
    facet: "incidentReferences",
    title: "Incident References",
    description:
      "References to externally owned incidents — Observability is not the incident SoR.",
    columns: ["ID", "Key", "Title", "Status", "Service"],
    cellKeys: ["id", "key", "title", "status", "serviceKey"],
    createDefaults: {
      key: "inc-1",
      title: "Incident reference",
      status: "draft",
    },
  },
  {
    section: "maintenance-windows",
    facet: "maintenanceWindows",
    title: "Maintenance Windows",
    description:
      "Maintenance window metadata — alerts are not automatically suppressed.",
    columns: ["ID", "Key", "Name", "Starts", "Ends"],
    cellKeys: ["id", "key", "name", "startsAt", "endsAt"],
    createDefaults: {
      key: "mw-1",
      name: "Maintenance",
      startsAt: new Date().toISOString(),
      endsAt: new Date(Date.now() + 3600000).toISOString(),
      status: "draft",
    },
  },
  {
    section: "health-summaries",
    facet: "healthSummaries",
    title: "Health Summaries",
    description:
      "Canonical stored summaries only — no cross-provider aggregation in the UI.",
    columns: ["ID", "Scope", "Overall", "Healthy", "Unhealthy"],
    cellKeys: ["id", "scopeKey", "overallStatus", "healthyCount", "unhealthyCount"],
    createDefaults: {
      scopeKey: "platform",
      overallStatus: "unknown",
      healthyCount: "0",
      degradedCount: "0",
      unhealthyCount: "0",
      evaluatedAt: new Date().toISOString(),
    },
  },
  {
    section: "metadata",
    facet: "metadata",
    title: "Metadata",
    description: "General observability registration and classification metadata.",
    columns: ["ID", "Key", "Name", "Category", "Status"],
    cellKeys: ["id", "key", "name", "category", "status"],
    createDefaults: {
      key: "meta-1",
      name: "Metadata entry",
      category: "general",
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
    items: readonly ObserveEntityViewModel[];
  }>
> = {
  healthChecks: observeApi.listHealthChecks,
  readinessChecks: observeApi.listReadinessChecks,
  livenessChecks: observeApi.listLivenessChecks,
  serviceHealth: observeApi.listServiceHealth,
  serviceStatus: observeApi.listServiceStatus,
  componentStatus: observeApi.listComponentStatus,
  metricDefinitions: observeApi.listMetricDefinitions,
  metricSamples: observeApi.listMetricSamples,
  alertDefinitions: observeApi.listAlertDefinitions,
  alertStates: observeApi.listAlertStates,
  dashboardDefinitions: observeApi.listDashboardDefinitions,
  logSources: observeApi.listLogSources,
  traceDefinitions: observeApi.listTraceDefinitions,
  traceSpans: observeApi.listTraceSpans,
  incidentReferences: observeApi.listIncidentReferences,
  maintenanceWindows: observeApi.listMaintenanceWindows,
  healthSummaries: observeApi.listHealthSummaries,
  metadata: observeApi.listObservabilityMetadata,
};

const GET_FNS: Record<
  FacetKey,
  (id: string, options?: { signal?: AbortSignal }) => Promise<ObserveEntityViewModel>
> = {
  healthChecks: observeApi.getHealthCheck,
  readinessChecks: observeApi.getReadinessCheck,
  livenessChecks: observeApi.getLivenessCheck,
  serviceHealth: observeApi.getServiceHealth,
  serviceStatus: observeApi.getServiceStatus,
  componentStatus: observeApi.getComponentStatus,
  metricDefinitions: observeApi.getMetricDefinition,
  metricSamples: observeApi.getMetricSample,
  alertDefinitions: observeApi.getAlertDefinition,
  alertStates: observeApi.getAlertState,
  dashboardDefinitions: observeApi.getDashboardDefinition,
  logSources: observeApi.getLogSource,
  traceDefinitions: observeApi.getTraceDefinition,
  traceSpans: observeApi.getTraceSpan,
  incidentReferences: observeApi.getIncidentReference,
  maintenanceWindows: observeApi.getMaintenanceWindow,
  healthSummaries: observeApi.getHealthSummary,
  metadata: observeApi.getObservabilityMetadata,
};

const CREATE_FNS: Record<
  FacetKey,
  (input: Record<string, unknown>) => Promise<ObserveEntityViewModel>
> = {
  healthChecks: observeApi.createHealthCheck,
  readinessChecks: observeApi.createReadinessCheck,
  livenessChecks: observeApi.createLivenessCheck,
  serviceHealth: observeApi.createServiceHealth,
  serviceStatus: observeApi.createServiceStatus,
  componentStatus: observeApi.createComponentStatus,
  metricDefinitions: observeApi.createMetricDefinition,
  metricSamples: observeApi.createMetricSample,
  alertDefinitions: observeApi.createAlertDefinition,
  alertStates: observeApi.createAlertState,
  dashboardDefinitions: observeApi.createDashboardDefinition,
  logSources: observeApi.createLogSource,
  traceDefinitions: observeApi.createTraceDefinition,
  traceSpans: observeApi.createTraceSpan,
  incidentReferences: observeApi.createIncidentReference,
  maintenanceWindows: observeApi.createMaintenanceWindow,
  healthSummaries: observeApi.createHealthSummary,
  metadata: observeApi.createObservabilityMetadata,
};

const UPDATE_FNS: Record<
  FacetKey,
  (id: string, input: Record<string, unknown>) => Promise<ObserveEntityViewModel>
> = {
  healthChecks: observeApi.updateHealthCheck,
  readinessChecks: observeApi.updateReadinessCheck,
  livenessChecks: observeApi.updateLivenessCheck,
  serviceHealth: observeApi.updateServiceHealth,
  serviceStatus: observeApi.updateServiceStatus,
  componentStatus: observeApi.updateComponentStatus,
  metricDefinitions: observeApi.updateMetricDefinition,
  metricSamples: observeApi.updateMetricSample,
  alertDefinitions: observeApi.updateAlertDefinition,
  alertStates: observeApi.updateAlertState,
  dashboardDefinitions: observeApi.updateDashboardDefinition,
  logSources: observeApi.updateLogSource,
  traceDefinitions: observeApi.updateTraceDefinition,
  traceSpans: observeApi.updateTraceSpan,
  incidentReferences: observeApi.updateIncidentReference,
  maintenanceWindows: observeApi.updateMaintenanceWindow,
  healthSummaries: observeApi.updateHealthSummary,
  metadata: observeApi.updateObservabilityMetadata,
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
    <div className="flex flex-col gap-6 p-1" data-testid="observability-page">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-muted-foreground)]">
            Platform Observability
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
      data-testid="observability-empty"
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
          ? "observability-unavailable"
          : forbidden
            ? "observability-forbidden"
            : notFound
              ? "observability-not-found"
              : "observability-error"
      }
      role="alert"
    >
      <p className="font-medium text-[var(--color-foreground)]">
        {unavailable
          ? "Observability service unavailable"
          : forbidden
            ? "Access denied"
            : notFound
              ? "Not found"
              : "Unable to load observability data"}
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
  testId = "observability-table",
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
    error instanceof ObserveClientError &&
    (error.status === 403 || error.code === "FORBIDDEN")
  );
}

function isNotFound(error: unknown): boolean {
  return error instanceof ObserveClientError && error.status === 404;
}

function isUnavailable(error: unknown): boolean {
  return (
    error instanceof ObserveClientError &&
    (error.status === 503 || error.code === "OBSERVE_SERVICE_UNAVAILABLE")
  );
}

function cellValue(item: ObserveEntityViewModel, key: string): string {
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
    queryKey: observeQueryKeys[config.facet].list(),
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
    queryKey: observeQueryKeys[config.facet].detail(activeId ?? ""),
    queryFn: ({ signal }) => GET_FNS[config.facet](activeId!, { signal }),
    enabled: Boolean(activeId),
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = { ...draft };
      for (const key of ["healthyCount", "degradedCount", "unhealthyCount"]) {
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
        queryKey: observeQueryKeys[config.facet].all,
      });
    },
    onError: (error) => {
      setActionError(toObserveUserMessage(error));
    },
  });

  const updateMutation = useMutation({
    mutationFn: () => {
      if (!activeId) throw new Error("No record selected");
      const name =
        draft.name || draft.displayName || draft.title || draft.spanName || undefined;
      return UPDATE_FNS[config.facet](activeId, {
        ...(name ? { name, displayName: name, title: name, spanName: name } : {}),
      });
    },
    onSuccess: async () => {
      setStatusMessage("Updated metadata");
      setActionError(null);
      await queryClient.invalidateQueries({
        queryKey: observeQueryKeys[config.facet].all,
      });
    },
    onError: (error) => {
      setActionError(toObserveUserMessage(error));
    },
  });

  if (listQuery.isError && isUnavailable(listQuery.error)) {
    return (
      <ErrorState
        unavailable
        message={toObserveUserMessage(listQuery.error)}
        onRetry={() => void listQuery.refetch()}
      />
    );
  }

  if (listQuery.isError) {
    return (
      <ErrorState
        forbidden={isForbidden(listQuery.error)}
        notFound={isNotFound(listQuery.error)}
        message={toObserveUserMessage(listQuery.error)}
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
              Save name
            </Button>
          </>
        ) : null}
      </div>

      {statusMessage ? (
        <p
          className="text-sm text-[var(--color-foreground)]"
          data-testid="observability-status"
        >
          {statusMessage}
        </p>
      ) : null}
      {actionError ? (
        <p
          className="text-sm text-[var(--color-destructive)]"
          role="alert"
          data-testid="observability-action-error"
        >
          {actionError}
        </p>
      ) : null}

      {listQuery.isLoading ? (
        <p data-testid="observability-loading">Loading…</p>
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
                key === "state" ||
                key === "overallStatus" ? (
                  <StatusBadge value={cellValue(item, key)} />
                ) : (
                  cellValue(item, key)
                ),
              ),
            }))}
          />
          <div
            className="rounded-lg border border-[var(--color-border)] px-4 py-3"
            data-testid="observability-detail"
          >
            <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
              Detail inspector
            </h2>
            {detailQuery.isLoading ? (
              <p className="mt-2 text-sm" data-testid="observability-loading">
                Loading detail…
              </p>
            ) : detailQuery.isError ? (
              <ErrorState
                unavailable={isUnavailable(detailQuery.error)}
                forbidden={isForbidden(detailQuery.error)}
                notFound={isNotFound(detailQuery.error)}
                message={toObserveUserMessage(detailQuery.error)}
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
                        key === "state" ? (
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

export function PlatformObservabilityView({
  section = "overview",
  canManage = true,
}: {
  readonly section?: ObserveSection;
  readonly canManage?: boolean;
}) {
  const healthChecksQuery = useQuery({
    queryKey: observeQueryKeys.healthChecks.list(),
    queryFn: ({ signal }) => observeApi.listHealthChecks({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const readinessQuery = useQuery({
    queryKey: observeQueryKeys.readinessChecks.list(),
    queryFn: ({ signal }) => observeApi.listReadinessChecks({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const livenessQuery = useQuery({
    queryKey: observeQueryKeys.livenessChecks.list(),
    queryFn: ({ signal }) => observeApi.listLivenessChecks({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const serviceHealthQuery = useQuery({
    queryKey: observeQueryKeys.serviceHealth.list(),
    queryFn: ({ signal }) => observeApi.listServiceHealth({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const metricDefsQuery = useQuery({
    queryKey: observeQueryKeys.metricDefinitions.list(),
    queryFn: ({ signal }) =>
      observeApi.listMetricDefinitions({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const alertDefsQuery = useQuery({
    queryKey: observeQueryKeys.alertDefinitions.list(),
    queryFn: ({ signal }) =>
      observeApi.listAlertDefinitions({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const dashboardsQuery = useQuery({
    queryKey: observeQueryKeys.dashboardDefinitions.list(),
    queryFn: ({ signal }) =>
      observeApi.listDashboardDefinitions({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const logSourcesQuery = useQuery({
    queryKey: observeQueryKeys.logSources.list(),
    queryFn: ({ signal }) => observeApi.listLogSources({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const tracesQuery = useQuery({
    queryKey: observeQueryKeys.traceDefinitions.list(),
    queryFn: ({ signal }) =>
      observeApi.listTraceDefinitions({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const maintenanceQuery = useQuery({
    queryKey: observeQueryKeys.maintenanceWindows.list(),
    queryFn: ({ signal }) =>
      observeApi.listMaintenanceWindows({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const incidentsQuery = useQuery({
    queryKey: observeQueryKeys.incidentReferences.list(),
    queryFn: ({ signal }) =>
      observeApi.listIncidentReferences({ limit: 100 }, { signal }),
    enabled: section === "overview",
    retry: false,
  });
  const capabilitiesQuery = useQuery({
    queryKey: observeQueryKeys.capabilities(),
    queryFn: ({ signal }) => observeApi.getObserveCapabilities({ signal }),
    enabled: section === "overview" || section === "diagnostics",
    retry: false,
  });
  const healthQuery = useQuery({
    queryKey: observeQueryKeys.health(),
    queryFn: ({ signal }) => observeApi.getObserveHealth({ signal }),
    enabled: section === "diagnostics",
    retry: false,
  });
  const readinessDiagQuery = useQuery({
    queryKey: observeQueryKeys.readiness(),
    queryFn: ({ signal }) => observeApi.getObserveReadiness({ signal }),
    enabled: section === "diagnostics",
    retry: false,
  });
  const diagnosticsQuery = useQuery({
    queryKey: observeQueryKeys.diagnostics.management(),
    queryFn: ({ signal }) => observeApi.getObserveDiagnostics({ signal }),
    enabled: section === "diagnostics",
    retry: false,
  });
  const platformDiagListQuery = useQuery({
    queryKey: observeQueryKeys.diagnostics.list(),
    queryFn: ({ signal }) =>
      observeApi.listPlatformDiagnostics({ limit: 50 }, { signal }),
    enabled: section === "diagnostics",
    retry: false,
  });

  const overviewError = healthChecksQuery.error ?? capabilitiesQuery.error ?? null;

  if (
    (section === "overview" || section === "diagnostics") &&
    overviewError &&
    isUnavailable(overviewError)
  ) {
    return (
      <PageShell
        title={section === "diagnostics" ? "Diagnostics" : "Overview"}
        description="Observability metadata management plane."
      >
        <ErrorState
          unavailable
          message={toObserveUserMessage(overviewError)}
          onRetry={() => {
            void healthChecksQuery.refetch();
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
        description="Observability metadata dashboard — live telemetry providers are not available."
        actions={
          <div role="toolbar" aria-label="Observability commands">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                void healthChecksQuery.refetch();
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
            label="Health checks"
            value={String(healthChecksQuery.data?.items.length ?? "—")}
            testId="card-health-checks-count"
          />
          <StatusCard
            label="Readiness checks"
            value={String(readinessQuery.data?.items.length ?? "—")}
            testId="card-readiness-checks-count"
          />
          <StatusCard
            label="Liveness checks"
            value={String(livenessQuery.data?.items.length ?? "—")}
            testId="card-liveness-checks-count"
          />
          <StatusCard
            label="Services"
            value={String(serviceHealthQuery.data?.items.length ?? "—")}
            testId="card-services-count"
          />
          <StatusCard
            label="Metric definitions"
            value={String(metricDefsQuery.data?.items.length ?? "—")}
            testId="card-metric-definitions-count"
          />
          <StatusCard
            label="Alert definitions"
            value={String(alertDefsQuery.data?.items.length ?? "—")}
            testId="card-alert-definitions-count"
          />
          <StatusCard
            label="Dashboards"
            value={String(dashboardsQuery.data?.items.length ?? "—")}
            testId="card-dashboards-count"
          />
          <StatusCard
            label="Log sources"
            value={String(logSourcesQuery.data?.items.length ?? "—")}
            testId="card-log-sources-count"
          />
          <StatusCard
            label="Trace definitions"
            value={String(tracesQuery.data?.items.length ?? "—")}
            testId="card-trace-definitions-count"
          />
          <StatusCard
            label="Maintenance windows"
            value={String(maintenanceQuery.data?.items.length ?? "—")}
            testId="card-maintenance-windows-count"
          />
          <StatusCard
            label="Incident references"
            value={String(incidentsQuery.data?.items.length ?? "—")}
            testId="card-incident-references-count"
          />
          <StatusCard
            label="Service availability"
            value={
              capabilitiesQuery.data?.observeEnabled
                ? "Management plane ready"
                : "Unavailable"
            }
            testId="card-service-availability"
          />
          <StatusCard
            label="Persistence readiness"
            value={capabilitiesQuery.data?.persistenceReady ? "Ready" : "Unavailable"}
            testId="card-persistence-readiness"
          />
          <StatusCard
            label="Provider execution"
            value="Unavailable"
            emphasize
            testId="card-provider-execution"
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
            message={toObserveUserMessage(diagError)}
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
        description="Platform readiness and registration metadata — providers are not probed."
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
            label="Observe enabled"
            value={capabilitiesQuery.data?.observeEnabled ? "Enabled" : "Disabled"}
            testId="diag-observe-enabled"
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
            value={String(capabilitiesQuery.data?.metadataCompleteness ?? "foundation")}
            testId="diag-metadata-completeness"
          />
          <StatusCard
            label="Registration state"
            value={String(capabilitiesQuery.data?.registrationState ?? "unknown")}
            testId="diag-registration-state"
          />
          <StatusCard
            label="Provider execution"
            value="Unavailable"
            emphasize
            testId="diag-provider-execution"
          />
        </div>
        {platformDiagListQuery.data?.items.length ? (
          <MetaTable
            caption="Platform diagnostics"
            columns={["ID", "Key", "Name", "Status", "Provider"]}
            rows={platformDiagListQuery.data.items.map((item) => ({
              id: item.id,
              cells: [
                item.id,
                cellValue(item, "key"),
                cellValue(item, "name"),
                <StatusBadge value={cellValue(item, "status")} />,
                cellValue(item, "providerKind"),
              ],
            }))}
          />
        ) : null}
      </PageShell>
    );
  }

  const facet = FACETS.find((entry) => entry.section === section);
  if (!facet) {
    return (
      <PageShell title="Observability" description="Unknown section.">
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
