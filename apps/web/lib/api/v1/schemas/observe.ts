/**
 * Zod schemas for Platform Observability HTTP API (APZOBSERVE-003).
 * Metadata only — no provider execution, scrape, ingest, or credentials.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

const idParam = (label: string) =>
  z.string().min(1).max(128).regex(idPattern, `Invalid ${label} identifier format`);

export const healthCheckIdParamSchema = idParam("healthCheck");
export const readinessCheckIdParamSchema = idParam("readinessCheck");
export const livenessCheckIdParamSchema = idParam("livenessCheck");
export const serviceHealthIdParamSchema = idParam("serviceHealth");
export const serviceStatusIdParamSchema = idParam("serviceStatus");
export const componentStatusIdParamSchema = idParam("componentStatus");
export const metricDefinitionIdParamSchema = idParam("metricDefinition");
export const metricSampleIdParamSchema = idParam("metricSample");
export const alertDefinitionIdParamSchema = idParam("alertDefinition");
export const alertStateIdParamSchema = idParam("alertState");
export const dashboardDefinitionIdParamSchema = idParam("dashboardDefinition");
export const logSourceIdParamSchema = idParam("logSource");
export const traceDefinitionIdParamSchema = idParam("traceDefinition");
export const traceSpanIdParamSchema = idParam("traceSpan");
export const incidentReferenceIdParamSchema = idParam("incidentReference");
export const maintenanceWindowIdParamSchema = idParam("maintenanceWindow");
export const healthSummaryIdParamSchema = idParam("healthSummary");
export const metadataIdParamSchema = idParam("metadata");
export const diagnosticIdParamSchema = idParam("diagnostic");

export const observeHealthStatusSchema = z.enum([
  "unknown", "healthy", "degraded", "unhealthy", "maintenance",
]);
export const observeReadinessStatusSchema = z.enum(["unknown", "ready", "not_ready"]);
export const observeLivenessStatusSchema = z.enum(["unknown", "alive", "not_alive"]);
export const observeAlertSeveritySchema = z.enum(["info", "warning", "critical"]);
export const observeAlertStateSchema = z.enum([
  "inactive", "pending", "firing", "resolved", "silenced",
]);
export const observeMetricKindSchema = z.enum([
  "counter", "gauge", "histogram", "summary", "unknown",
]);
export const observeLogSourceKindSchema = z.enum([
  "application", "platform", "infrastructure", "audit", "other",
]);
export const observeProviderKindSchema = z.enum([
  "prometheus", "loki", "grafana", "opentelemetry", "alertmanager", "internal", "unknown",
]);
export const observeMetadataStatusSchema = z.enum([
  "draft", "active", "inactive", "archived",
]);

export const observeListQuerySchema = paginationQuerySchema.strict();

export const createHealthChecksBodySchema = z.object({
  serviceKey: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  status: observeHealthStatusSchema,
  providerKind: observeProviderKindSchema,
  organisationId: z.string().min(1).max(256).optional(),
  description: z.string().min(1).max(256).optional(),
  checkedAt: z.string().datetime().optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateHealthChecksBodySchema = z.object({
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  name: z.string().min(1).max(256).optional(),
  status: observeHealthStatusSchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  description: z.string().min(1).max(256).nullable().optional(),
  checkedAt: z.string().datetime().nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createReadinessChecksBodySchema = z.object({
  serviceKey: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  status: observeReadinessStatusSchema,
  providerKind: observeProviderKindSchema,
  organisationId: z.string().min(1).max(256).optional(),
  checkedAt: z.string().datetime().optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateReadinessChecksBodySchema = z.object({
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  name: z.string().min(1).max(256).optional(),
  status: observeReadinessStatusSchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  checkedAt: z.string().datetime().nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createLivenessChecksBodySchema = z.object({
  serviceKey: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  status: observeLivenessStatusSchema,
  providerKind: observeProviderKindSchema,
  organisationId: z.string().min(1).max(256).optional(),
  checkedAt: z.string().datetime().optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateLivenessChecksBodySchema = z.object({
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  name: z.string().min(1).max(256).optional(),
  status: observeLivenessStatusSchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  checkedAt: z.string().datetime().nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createServiceHealthBodySchema = z.object({
  serviceKey: z.string().min(1).max(256),
  displayName: z.string().min(1).max(256),
  overallStatus: observeHealthStatusSchema,
  readinessStatus: observeReadinessStatusSchema,
  livenessStatus: observeLivenessStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  lastEvaluatedAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateServiceHealthBodySchema = z.object({
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  displayName: z.string().min(1).max(256).optional(),
  overallStatus: observeHealthStatusSchema.optional(),
  readinessStatus: observeReadinessStatusSchema.optional(),
  livenessStatus: observeLivenessStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  lastEvaluatedAt: z.string().datetime().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createServiceStatusBodySchema = z.object({
  serviceKey: z.string().min(1).max(256),
  status: observeHealthStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  message: z.string().min(1).max(256).optional(),
  observedAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateServiceStatusBodySchema = z.object({
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  status: observeHealthStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  message: z.string().min(1).max(256).nullable().optional(),
  observedAt: z.string().datetime().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createComponentStatusBodySchema = z.object({
  serviceKey: z.string().min(1).max(256),
  componentKey: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  status: observeHealthStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  message: z.string().min(1).max(256).optional(),
  observedAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateComponentStatusBodySchema = z.object({
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  componentKey: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  status: observeHealthStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  message: z.string().min(1).max(256).nullable().optional(),
  observedAt: z.string().datetime().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createMetricDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  kind: observeMetricKindSchema,
  providerKind: observeProviderKindSchema,
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  description: z.string().min(1).max(256).optional(),
  unit: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  labels: z.record(z.string(), z.string()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateMetricDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  kind: observeMetricKindSchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  description: z.string().min(1).max(256).nullable().optional(),
  unit: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  labels: z.record(z.string(), z.string()).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createMetricSamplesBodySchema = z.object({
  metricDefinitionId: z.string().min(1).max(128).regex(idPattern),
  sampledAt: z.string().datetime(),
  providerKind: observeProviderKindSchema,
  organisationId: z.string().min(1).max(256).optional(),
  valueLabel: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateMetricSamplesBodySchema = z.object({
  metricDefinitionId: z.string().min(1).max(128).regex(idPattern).optional(),
  sampledAt: z.string().datetime().nullable().optional(),
  providerKind: observeProviderKindSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  valueLabel: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createAlertDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  severity: observeAlertSeveritySchema,
  providerKind: observeProviderKindSchema,
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  description: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateAlertDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  severity: observeAlertSeveritySchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  description: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createAlertStatesBodySchema = z.object({
  alertDefinitionId: z.string().min(1).max(128).regex(idPattern),
  state: observeAlertStateSchema,
  providerKind: observeProviderKindSchema,
  organisationId: z.string().min(1).max(256).optional(),
  firedAt: z.string().datetime().optional(),
  resolvedAt: z.string().datetime().optional(),
  message: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateAlertStatesBodySchema = z.object({
  alertDefinitionId: z.string().min(1).max(128).regex(idPattern).nullable().optional(),
  state: observeAlertStateSchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  firedAt: z.string().datetime().nullable().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
  message: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createDashboardDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  providerKind: observeProviderKindSchema,
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  description: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateDashboardDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  providerKind: observeProviderKindSchema.optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  description: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createLogSourcesBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  kind: observeLogSourceKindSchema,
  providerKind: observeProviderKindSchema,
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateLogSourcesBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  kind: observeLogSourceKindSchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createTraceDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  providerKind: observeProviderKindSchema,
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  description: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateTraceDefinitionsBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  providerKind: observeProviderKindSchema.optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  description: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createTraceSpansBodySchema = z.object({
  traceDefinitionId: z.string().min(1).max(128).regex(idPattern),
  spanName: z.string().min(1).max(256),
  providerKind: observeProviderKindSchema,
  organisationId: z.string().min(1).max(256).optional(),
  serviceKey: z.string().min(1).max(256).optional(),
  startedAt: z.string().datetime().optional(),
  endedAt: z.string().datetime().optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateTraceSpansBodySchema = z.object({
  traceDefinitionId: z.string().min(1).max(128).regex(idPattern).optional(),
  spanName: z.string().min(1).max(256).optional(),
  providerKind: observeProviderKindSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  startedAt: z.string().datetime().nullable().optional(),
  endedAt: z.string().datetime().nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createIncidentReferencesBodySchema = z.object({
  key: z.string().min(1).max(256),
  title: z.string().min(1).max(256),
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  serviceKey: z.string().min(1).max(256).optional(),
  alertDefinitionId: z.string().min(1).max(128).regex(idPattern).optional(),
  externalRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateIncidentReferencesBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  title: z.string().min(1).max(256).optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  alertDefinitionId: z.string().min(1).max(128).regex(idPattern).nullable().optional(),
  externalRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createMaintenanceWindowsBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  serviceKey: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateMaintenanceWindowsBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createHealthSummariesBodySchema = z.object({
  scopeKey: z.string().min(1).max(256),
  overallStatus: observeHealthStatusSchema,
  healthyCount: z.number().int().min(0),
  degradedCount: z.number().int().min(0),
  unhealthyCount: z.number().int().min(0),
  evaluatedAt: z.string().datetime(),
  organisationId: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateHealthSummariesBodySchema = z.object({
  scopeKey: z.string().min(1).max(256).optional(),
  overallStatus: observeHealthStatusSchema.optional(),
  healthyCount: z.number().int().min(0).optional(),
  degradedCount: z.number().int().min(0).optional(),
  unhealthyCount: z.number().int().min(0).optional(),
  evaluatedAt: z.string().datetime().nullable().optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createMetadataBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  category: z.string().min(1).max(256),
  status: observeMetadataStatusSchema,
  organisationId: z.string().min(1).max(256).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updateMetadataBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  category: z.string().min(1).max(256).optional(),
  status: observeMetadataStatusSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  payload: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();

export const createPlatformDiagnosticBodySchema = z.object({
  key: z.string().min(1).max(256),
  name: z.string().min(1).max(256),
  status: observeHealthStatusSchema,
  providerKind: observeProviderKindSchema,
  organisationId: z.string().min(1).max(256).optional(),
  serviceKey: z.string().min(1).max(256).optional(),
  detail: z.string().min(1).max(256).optional(),
  providerRef: z.string().min(1).max(256).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
}).strict();

export const updatePlatformDiagnosticBodySchema = z.object({
  key: z.string().min(1).max(256).optional(),
  name: z.string().min(1).max(256).optional(),
  status: observeHealthStatusSchema.optional(),
  providerKind: observeProviderKindSchema.optional(),
  organisationId: z.string().min(1).max(256).nullable().optional(),
  serviceKey: z.string().min(1).max(256).nullable().optional(),
  detail: z.string().min(1).max(256).nullable().optional(),
  providerRef: z.string().min(1).max(256).nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
}).strict();
