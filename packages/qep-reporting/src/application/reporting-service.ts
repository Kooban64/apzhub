/**
 * Reporting Application Service — APZQEP-140-F.
 * Read model over Cap A–E facts. Saved reports are platform metadata only.
 */

import { DASHBOARD_CATALOGUE, getDashboardDefinition } from "../domain/dashboards";
import { calculateMetrics, pickMetrics } from "../domain/metrics-engine";
import {
  getReportTemplate,
  REPORT_TEMPLATES,
  templateMetricKeys,
} from "../domain/reports";
import { buildTrends, currentAsTrend } from "../domain/trend-engine";
import type {
  DashboardId,
  DashboardView,
  GeneratedReport,
  MetricKey,
  MetricsBundle,
  ReportTemplateId,
  SavedReport,
  TrendSeries,
} from "../domain/types";
import {
  buildReportingDomainEvent,
  QEP_REPORTING_EVENTS,
  savedReportPayload,
  type ReportingDomainEvent,
} from "./events";
import type { QualityFactsPort } from "./ports";
import type { ReportingRepository } from "./repository";

export type ReportingActor = {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissions: readonly string[];
};

export type ReportingEventPublisher = {
  publish(event: ReportingDomainEvent): Promise<void>;
};

function requirePermission(actor: ReportingActor, permission: string): void {
  if (
    !actor.permissions.includes(permission) &&
    !actor.permissions.includes("qep.reporting.admin")
  ) {
    throw new Error(`reporting.permission.denied:${permission}`);
  }
}

let seq = 0;
function nextId(prefix: string): string {
  seq += 1;
  return `${prefix}-${Date.now().toString(36)}-${seq}`;
}

export type ReportingApplicationService = {
  listDashboards(actor: ReportingActor): Promise<typeof DASHBOARD_CATALOGUE>;
  getDashboard(
    actor: ReportingActor,
    dashboardId: DashboardId,
    now: string,
    projectId?: string,
  ): Promise<DashboardView>;
  metrics(
    actor: ReportingActor,
    now: string,
    options?: {
      readonly projectId?: string;
      readonly keys?: readonly MetricKey[];
    },
  ): Promise<MetricsBundle>;
  trends(
    actor: ReportingActor,
    now: string,
    keys: readonly MetricKey[],
    projectId?: string,
  ): Promise<readonly TrendSeries[]>;
  listTemplates(actor: ReportingActor): Promise<typeof REPORT_TEMPLATES>;
  generateReport(
    actor: ReportingActor,
    templateId: ReportTemplateId,
    now: string,
    options?: {
      readonly projectId?: string;
      readonly name?: string;
    },
  ): Promise<GeneratedReport>;
  createSavedReport(
    actor: ReportingActor,
    input: {
      readonly name: string;
      readonly templateId: ReportTemplateId;
      readonly projectId?: string;
      readonly filters?: SavedReport["filters"];
      readonly sharedWith?: readonly string[];
    },
    now: string,
  ): Promise<SavedReport>;
  updateSavedReport(
    actor: ReportingActor,
    reportId: string,
    patch: {
      readonly name?: string;
      readonly filters?: SavedReport["filters"];
      readonly sharedWith?: readonly string[];
    },
    now: string,
  ): Promise<SavedReport>;
  getSavedReport(actor: ReportingActor, reportId: string): Promise<SavedReport>;
  listSavedReports(
    actor: ReportingActor,
    filter?: { readonly projectId?: string; readonly query?: string },
  ): Promise<readonly SavedReport[]>;
  runSavedReport(
    actor: ReportingActor,
    reportId: string,
    now: string,
  ): Promise<GeneratedReport>;
  drainEvents(): readonly ReportingDomainEvent[];
};

export function createReportingApplicationService(deps: {
  readonly repository: ReportingRepository;
  readonly facts: QualityFactsPort;
  readonly publisher?: ReportingEventPublisher;
}): ReportingApplicationService {
  const pending: ReportingDomainEvent[] = [];

  async function emit(
    eventId: ReportingDomainEvent["eventId"],
    actor: ReportingActor,
    now: string,
    payload: Readonly<Record<string, unknown>>,
    projectId?: string,
  ): Promise<void> {
    const event = buildReportingDomainEvent({
      eventId,
      tenantId: actor.tenantId,
      actorId: actor.userId,
      correlationId: `corr-reporting-${Date.now().toString(36)}`,
      timestamp: now,
      ...(projectId ? { projectId } : {}),
      payload,
    });
    pending.push(event);
    await deps.publisher?.publish(event);
  }

  async function loadFacts(actor: ReportingActor, now: string, projectId?: string) {
    return deps.facts.collect({
      tenantId: actor.tenantId,
      ...(projectId ? { projectId } : {}),
      now,
    });
  }

  return {
    drainEvents() {
      return [...pending];
    },

    async listDashboards(actor) {
      requirePermission(actor, "qep.reporting.read");
      return DASHBOARD_CATALOGUE;
    },

    async getDashboard(actor, dashboardId, now, projectId) {
      requirePermission(actor, "qep.reporting.read");
      const definition = getDashboardDefinition(dashboardId);
      if (!definition) {
        throw new Error(`reporting.dashboard.not_found:${dashboardId}`);
      }
      const facts = await loadFacts(actor, now, projectId);
      const metrics = calculateMetrics(facts);
      await deps.repository.appendTrendSample(actor.tenantId, {
        at: now,
        metrics: metrics.metrics,
      });
      const samples = await deps.repository.listTrendSamples(actor.tenantId);
      const trendKeys = definition.widgets
        .filter((w) => w.kind === "trend")
        .flatMap((w) => w.metricKeys ?? []);
      const uniqueKeys = [...new Set(trendKeys)];
      const trends =
        samples.length > 0
          ? buildTrends(samples, uniqueKeys)
          : currentAsTrend(metrics.metrics, uniqueKeys, now);

      await emit(
        QEP_REPORTING_EVENTS.dashboardViewed,
        actor,
        now,
        { dashboardId, name: definition.name },
        projectId,
      );

      return {
        definition,
        metrics,
        trends,
        generatedAt: now,
      };
    },

    async metrics(actor, now, options = {}) {
      requirePermission(actor, "qep.reporting.read");
      const facts = await loadFacts(actor, now, options.projectId);
      const bundle = calculateMetrics(facts);
      if (!options.keys?.length) return bundle;
      return {
        ...bundle,
        metrics: pickMetrics(bundle, options.keys),
      };
    },

    async trends(actor, now, keys, projectId) {
      requirePermission(actor, "qep.reporting.read");
      const facts = await loadFacts(actor, now, projectId);
      const bundle = calculateMetrics(facts);
      await deps.repository.appendTrendSample(actor.tenantId, {
        at: now,
        metrics: bundle.metrics,
      });
      const samples = await deps.repository.listTrendSamples(actor.tenantId);
      return buildTrends(samples, keys);
    },

    async listTemplates(actor) {
      requirePermission(actor, "qep.reporting.read");
      return REPORT_TEMPLATES;
    },

    async generateReport(actor, templateId, now, options = {}) {
      requirePermission(actor, "qep.reporting.read");
      const template = getReportTemplate(templateId);
      if (!template) {
        throw new Error(`reporting.template.not_found:${templateId}`);
      }
      const facts = await loadFacts(actor, now, options.projectId);
      const metrics = calculateMetrics(facts);
      const selected = pickMetrics(metrics, template.defaultMetricKeys);
      const rows = selected.map((m) => ({
        metric: m.label,
        key: m.key,
        value: m.value,
        unit: m.unit,
      }));
      const report: GeneratedReport = {
        templateId,
        name: options.name ?? template.name,
        generatedAt: now,
        tenantId: actor.tenantId,
        ...(options.projectId ? { projectId: options.projectId } : {}),
        metrics: { ...metrics, metrics: selected },
        rows,
        exportMetadata: {
          format: "json",
          rowCount: rows.length,
          derived: true,
          source: "qep-reporting",
        },
      };
      await emit(
        QEP_REPORTING_EVENTS.reportGenerated,
        actor,
        now,
        {
          templateId,
          name: report.name,
          rowCount: rows.length,
        },
        options.projectId,
      );
      return report;
    },

    async createSavedReport(actor, input, now) {
      requirePermission(actor, "qep.reporting.create");
      if (!input.name.trim()) {
        throw new Error("reporting.validation.name_required");
      }
      if (!getReportTemplate(input.templateId)) {
        throw new Error(`reporting.template.not_found:${input.templateId}`);
      }
      const report: SavedReport = {
        reportId: nextId("rpt"),
        tenantId: actor.tenantId,
        ...(input.projectId ? { projectId: input.projectId } : {}),
        ownerId: actor.userId,
        name: input.name.trim(),
        templateId: input.templateId,
        filters: input.filters ?? {},
        sharedWith: input.sharedWith ?? [],
        createdAt: now,
        createdBy: actor.userId,
        updatedAt: now,
        updatedBy: actor.userId,
        revision: 1,
      };
      await deps.repository.saveSavedReport(report);
      await emit(
        QEP_REPORTING_EVENTS.savedReportCreated,
        actor,
        now,
        savedReportPayload(report),
        report.projectId,
      );
      return report;
    },

    async updateSavedReport(actor, reportId, patch, now) {
      requirePermission(actor, "qep.reporting.update");
      const existing = await deps.repository.getSavedReport(actor.tenantId, reportId);
      if (!existing) throw new Error(`reporting.report.not_found:${reportId}`);
      if (
        existing.ownerId !== actor.userId &&
        !actor.permissions.includes("qep.reporting.admin")
      ) {
        throw new Error("reporting.permission.denied:owner");
      }
      const next: SavedReport = {
        ...existing,
        ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
        ...(patch.filters !== undefined ? { filters: patch.filters } : {}),
        ...(patch.sharedWith !== undefined ? { sharedWith: patch.sharedWith } : {}),
        updatedAt: now,
        updatedBy: actor.userId,
        revision: existing.revision + 1,
      };
      await deps.repository.saveSavedReport(next);
      await emit(
        QEP_REPORTING_EVENTS.savedReportUpdated,
        actor,
        now,
        savedReportPayload(next),
        next.projectId,
      );
      return next;
    },

    async getSavedReport(actor, reportId) {
      requirePermission(actor, "qep.reporting.read");
      const report = await deps.repository.getSavedReport(actor.tenantId, reportId);
      if (!report) throw new Error(`reporting.report.not_found:${reportId}`);
      if (
        report.ownerId !== actor.userId &&
        !report.sharedWith.includes(actor.userId) &&
        !actor.permissions.includes("qep.reporting.admin")
      ) {
        throw new Error("reporting.permission.denied:owner");
      }
      return report;
    },

    async listSavedReports(actor, filter = {}) {
      requirePermission(actor, "qep.reporting.read");
      return deps.repository.listSavedReports({
        tenantId: actor.tenantId,
        ownerId: actor.userId,
        ...(filter.projectId ? { projectId: filter.projectId } : {}),
        ...(filter.query ? { query: filter.query } : {}),
      });
    },

    async runSavedReport(actor, reportId, now) {
      const saved = await this.getSavedReport(actor, reportId);
      return this.generateReport(actor, saved.templateId, now, {
        ...(saved.projectId || saved.filters.projectId
          ? {
              projectId: saved.projectId ?? saved.filters.projectId,
            }
          : {}),
        name: saved.name,
      });
    },
  };
}

export { templateMetricKeys };
