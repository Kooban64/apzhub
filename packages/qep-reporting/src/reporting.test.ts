import { describe, expect, it } from "vitest";

import { createQualityKnowledgeIndex } from "@apzhub/qep-knowledge-index";
import { createNotificationSubscriptionPlatform } from "@apzhub/qep-notification";
import { createEnterpriseCommandPlatform } from "@apzhub/qep-command";

import {
  QEP_REPORTING_VERSION,
  QEP_REPORTING_EVENTS,
  createEnterpriseReportingAnalytics,
  calculateMetrics,
  DASHBOARD_CATALOGUE,
  REPORTING_COMMAND_DEFINITIONS,
  createReportingCommandHandlers,
  REPORTING_NOTIFICATION_TEMPLATES,
  createReportingNotificationProcessors,
  type QualityFacts,
  type QualityFactsPort,
} from "./index";

const actor = {
  userId: "user-1",
  tenantId: "tenant-a",
  permissions: ["qep.reporting.read", "qep.reporting.create", "qep.reporting.update"],
};

const sampleFacts: QualityFacts = {
  tenantId: "tenant-a",
  asOf: "2026-08-02T22:00:00.000Z",
  requirementTotal: 10,
  requirementApproved: 8,
  requirementUncovered: 2,
  requirementHighRiskGaps: 1,
  requirementCoverageAvg: 72,
  suiteTotal: 5,
  suiteActive: 4,
  planTotal: 3,
  planReady: 1,
  planHandedOff: 1,
  sessionTotal: 4,
  sessionCompleted: 2,
  sessionInProgress: 1,
  sessionBlocked: 1,
  sessionPassed: 1,
  sessionFailed: 1,
  evidenceTotal: 6,
  evidenceIntegrityOk: 5,
  defectTotal: 3,
  defectOpen: 2,
  defectCritical: 1,
  defectRetest: 1,
  defectVerified: 1,
  defectAgingDaysSum: 10,
  defectAgingCount: 2,
};

const facts: QualityFactsPort = {
  async collect({ tenantId, projectId, now }) {
    return {
      ...sampleFacts,
      tenantId,
      ...(projectId ? { projectId } : {}),
      asOf: now,
    };
  },
};

describe("APZQEP-140-F Enterprise Reporting & Analytics", () => {
  it("exports version 0.1.0 and catalogues 10 dashboards", () => {
    expect(QEP_REPORTING_VERSION).toBe("0.1.0");
    expect(DASHBOARD_CATALOGUE).toHaveLength(10);
  });

  it("calculates metrics purely from facts", () => {
    const bundle = calculateMetrics(sampleFacts);
    const byKey = Object.fromEntries(bundle.metrics.map((m) => [m.key, m.value]));
    expect(byKey.requirement_coverage).toBe(72);
    expect(byKey.open_defects).toBe(2);
    expect(byKey.critical_defects).toBe(1);
    expect(byKey.execution_progress).toBe(50);
    expect(byKey.uncovered_requirements).toBe(2);
  });

  it("serves dashboards and generates derived reports", async () => {
    const { service } = createEnterpriseReportingAnalytics({ facts });
    const view = await service.getDashboard(
      actor,
      "executive",
      "2026-08-02T22:01:00.000Z",
    );
    expect(view.definition.dashboardId).toBe("executive");
    expect(view.metrics.metrics.length).toBeGreaterThan(0);
    expect(view.trends.length).toBeGreaterThan(0);

    const report = await service.generateReport(
      actor,
      "coverage_summary",
      "2026-08-02T22:01:01.000Z",
    );
    expect(report.exportMetadata.derived).toBe(true);
    expect(report.rows.length).toBeGreaterThan(0);

    const events = service.drainEvents().map((e) => e.eventId);
    expect(events).toContain(QEP_REPORTING_EVENTS.dashboardViewed);
    expect(events).toContain(QEP_REPORTING_EVENTS.reportGenerated);
  });

  it("manages saved report metadata without owning business data", async () => {
    const { service } = createEnterpriseReportingAnalytics({ facts });
    const saved = await service.createSavedReport(
      actor,
      {
        name: "Weekly Coverage",
        templateId: "coverage_summary",
        filters: { projectId: "proj-1" },
      },
      "2026-08-02T22:02:00.000Z",
    );
    expect(saved.ownerId).toBe("user-1");
    const run = await service.runSavedReport(
      actor,
      saved.reportId,
      "2026-08-02T22:02:01.000Z",
    );
    expect(run.templateId).toBe("coverage_summary");
    expect(run.name).toBe("Weekly Coverage");
  });

  it("rejects cross-tenant style permission denials", async () => {
    const { service } = createEnterpriseReportingAnalytics({ facts });
    await expect(
      service.getDashboard(
        { ...actor, permissions: [] },
        "executive",
        "2026-08-02T22:03:00.000Z",
      ),
    ).rejects.toThrow(/permission/);
  });

  it("projects saved reports into QKI as documents", async () => {
    const { service } = createEnterpriseReportingAnalytics({ facts });
    const qki = createQualityKnowledgeIndex();
    const saved = await service.createSavedReport(
      actor,
      { name: "Searchable Report", templateId: "defect_summary" },
      "2026-08-02T22:04:00.000Z",
    );
    const event = service
      .drainEvents()
      .find((e) => e.eventId === QEP_REPORTING_EVENTS.savedReportCreated)!;
    const applied = await qki.engine.applyEvent({
      eventType: event.eventId,
      tenantId: event.tenantId,
      payload: event.payload,
      correlationId: event.correlationId,
      now: event.timestamp,
    });
    expect(applied.ok).toBe(true);
    const hit = await qki.search.search({
      tenantId: "tenant-a",
      query: "Searchable",
      entityKinds: ["document"],
    });
    expect(hit.total).toBe(1);
    expect(hit.hits[0]?.document.entityId).toBe(saved.reportId);
  });

  it("registers commands and notification templates", () => {
    const platform = createEnterpriseCommandPlatform({ registerBuiltins: false });
    platform.commands.registerBatch([...REPORTING_COMMAND_DEFINITIONS]);
    platform.handlers.registerBatch([...createReportingCommandHandlers({})]);
    expect(platform.commands.get("qep.command.reporting.executive")).toBeDefined();

    const notify = createNotificationSubscriptionPlatform();
    for (const t of REPORTING_NOTIFICATION_TEMPLATES) {
      notify.templates.register(t);
    }
    expect(
      notify.templates.get("qep.notification.template.reporting.report_ready"),
    ).toBeDefined();
    expect(createReportingNotificationProcessors(notify.engine).length).toBe(1);
  });
});
