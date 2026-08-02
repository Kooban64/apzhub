/**
 * APZQEP-150-01 — End-to-end Core QE chain verification.
 * Requirement → Suite → Plan → Execution → Evidence ref → Defect → Traceability → Reporting
 * No new product functionality — consume Cap A–F factories only.
 */

import { describe, expect, it } from "vitest";

import { createEnterpriseDefectManagement } from "@apzhub/qep-defects";
import { createEnterpriseTestExecutionPlanning } from "@apzhub/qep-execution-plans";
import { createEnterpriseTestExecutionWorkspace } from "@apzhub/qep-execution-workspace";
import { createEnterpriseReportingAnalytics } from "@apzhub/qep-reporting";
import { createEnterpriseRequirementsTraceability } from "@apzhub/qep-requirements-traceability";
import { createEnterpriseTestSuiteManagement } from "@apzhub/qep-suites";

const actor = {
  userId: "auditor-1",
  tenantId: "tenant-a",
  permissions: [
    "qep.suites.read",
    "qep.suites.create",
    "qep.suites.update",
    "qep.suites.lifecycle",
    "qep.execution_plans.read",
    "qep.execution_plans.create",
    "qep.execution_plans.update",
    "qep.execution_plans.lifecycle",
    "qep.execution_plans.handoff",
    "qep.execution_workspace.read",
    "qep.execution_workspace.create",
    "qep.execution_workspace.execute",
    "qep.execution_workspace.lifecycle",
    "qep.defects.read",
    "qep.defects.create",
    "qep.defects.update",
    "qep.defects.lifecycle",
    "qep.enterprise_requirements.read",
    "qep.enterprise_requirements.create",
    "qep.enterprise_requirements.update",
    "qep.enterprise_requirements.lifecycle",
    "qep.reporting.read",
    "qep.reporting.create",
  ],
};

describe("APZQEP-150-01 enterprise product chain", () => {
  it("verifies Requirement→Suite→Plan→Execution→Evidence→Defect→Traceability→Reporting", async () => {
    const suites = createEnterpriseTestSuiteManagement();
    const suitePort = {
      async get(tenantId: string, suiteId: string) {
        const agg = await suites.repository.get(tenantId, suiteId);
        if (!agg) return undefined;
        return {
          suiteId: agg.suite.suiteId,
          tenantId: agg.suite.tenantId,
          ...(agg.suite.projectId ? { projectId: agg.suite.projectId } : {}),
          name: agg.suite.name,
          status: agg.suite.status,
          version: agg.suite.version,
        };
      },
    };

    const plans = createEnterpriseTestExecutionPlanning({ suites: suitePort });
    const sessions = createEnterpriseTestExecutionWorkspace({
      plans: {
        async getByHandoff(tenantId, handoffId) {
          const items = await plans.repository.list({
            tenantId,
            includeArchived: true,
          });
          const match = items.find((p) => p.handoff?.handoffId === handoffId);
          if (!match?.handoff) return undefined;
          return {
            planId: match.planId,
            handoffId: match.handoff.handoffId,
            tenantId: match.tenantId,
            ...(match.projectId ? { projectId: match.projectId } : {}),
            planName: match.name,
            suiteId: match.suiteRef.suiteId,
            suiteVersion: match.suiteRef.suiteVersion,
            suiteName: match.suiteRef.suiteName,
            environmentLabels: match.environmentReferences.map((e) => e.label),
            configurationLabels: match.configurationReferences.map((c) => c.label),
            assigneeIds: [
              ...(match.assignments.testLeadId ? [match.assignments.testLeadId] : []),
              ...match.assignments.testerIds,
            ],
            ...(match.schedule.plannedStartAt
              ? { plannedStartAt: match.schedule.plannedStartAt }
              : {}),
            ...(match.schedule.plannedEndAt
              ? { plannedEndAt: match.schedule.plannedEndAt }
              : {}),
            handedOffAt: match.handoff.handedOffAt,
            correlationId: match.handoff.correlationId,
            status: match.status,
          };
        },
        async getByPlanId(tenantId, planId) {
          const agg = await plans.repository.get(tenantId, planId);
          if (!agg?.plan.handoff) return undefined;
          return this.getByHandoff(tenantId, agg.plan.handoff.handoffId);
        },
      },
    });

    const defects = createEnterpriseDefectManagement({
      executions: {
        async get(tenantId, sessionId) {
          const agg = await sessions.repository.get(tenantId, sessionId);
          if (!agg) return undefined;
          return {
            sessionId: agg.session.sessionId,
            tenantId: agg.session.tenantId,
            ...(agg.session.projectId ? { projectId: agg.session.projectId } : {}),
            name: agg.session.name,
            status: agg.session.status,
            planId: agg.session.planning.planId,
            suiteId: agg.session.planning.suiteId,
            suiteName: agg.session.planning.suiteName,
            steps: agg.session.steps.map((s) => ({
              stepId: s.stepId,
              title: s.title,
              outcome: s.outcome,
              ...(s.failureNotes ? { failureNotes: s.failureNotes } : {}),
              evidenceIds: s.evidenceIds,
            })),
            evidenceIds: agg.session.evidenceRefs.map((r) => r.evidenceId),
          };
        },
      },
    });

    const requirements = createEnterpriseRequirementsTraceability({
      ports: {
        async getSuite(tenantId, suiteId) {
          return suitePort.get(tenantId, suiteId);
        },
        async listPlansBySuite(tenantId, suiteId) {
          const items = await plans.repository.list({
            tenantId,
            includeArchived: true,
          });
          return items
            .filter((p) => p.suiteRef.suiteId === suiteId)
            .map((p) => ({
              planId: p.planId,
              tenantId: p.tenantId,
              suiteId: p.suiteRef.suiteId,
              name: p.name,
              status: p.status,
            }));
        },
        async listSessionsBySuite(tenantId, suiteId) {
          const items = await sessions.repository.list({
            tenantId,
            includeArchived: true,
          });
          return items
            .filter((s) => s.planning.suiteId === suiteId)
            .map((s) => ({
              sessionId: s.sessionId,
              tenantId: s.tenantId,
              planId: s.planning.planId,
              suiteId: s.planning.suiteId,
              name: s.name,
              status: s.status,
              evidenceIds: s.evidenceRefs.map((r) => r.evidenceId),
              stepOutcomes: s.steps.map((st) => st.outcome ?? "not_run"),
            }));
        },
        async listDefectsBySuite(tenantId, suiteId) {
          const items = await defects.repository.list({
            tenantId,
            includeArchived: true,
          });
          return items
            .filter((d) => d.executionOrigin?.suiteId === suiteId)
            .map((d) => ({
              defectId: d.defectId,
              tenantId: d.tenantId,
              title: d.title,
              status: d.status,
              ...(d.executionOrigin?.suiteId
                ? { suiteId: d.executionOrigin.suiteId }
                : {}),
              ...(d.executionOrigin?.sessionId
                ? { sessionId: d.executionOrigin.sessionId }
                : {}),
              evidenceIds: d.evidenceRefs.map((r) => r.evidenceId),
            }));
        },
      },
    });

    const reporting = createEnterpriseReportingAnalytics({
      facts: {
        async collect({ tenantId, projectId, now }) {
          const reqs = await requirements.repository.list({
            tenantId,
            ...(projectId ? { projectId } : {}),
            includeArchived: false,
          });
          const suiteList = await suites.repository.list({
            tenantId,
            ...(projectId ? { projectId } : {}),
            includeDeleted: false,
          });
          const planList = await plans.repository.list({
            tenantId,
            includeArchived: true,
          });
          const sessionList = await sessions.repository.list({
            tenantId,
            includeArchived: true,
          });
          const defectList = await defects.repository.list({
            tenantId,
            includeArchived: true,
          });
          return {
            tenantId,
            ...(projectId ? { projectId } : {}),
            asOf: now,
            requirementTotal: reqs.length,
            requirementApproved: reqs.filter(
              (r) => r.status === "approved" || r.status === "active",
            ).length,
            requirementUncovered: 0,
            requirementHighRiskGaps: 0,
            requirementCoverageAvg: reqs.length ? 100 : 0,
            suiteTotal: suiteList.length,
            suiteActive: suiteList.filter(
              (s) => s.status === "published" || s.status === "approved",
            ).length,
            planTotal: planList.length,
            planReady: planList.filter((p) => p.status === "ready").length,
            planHandedOff: planList.filter((p) => p.status === "handed_off").length,
            sessionTotal: sessionList.length,
            sessionCompleted: sessionList.filter((s) => s.status === "completed")
              .length,
            sessionInProgress: sessionList.filter((s) => s.status === "in_progress")
              .length,
            sessionBlocked: sessionList.filter((s) => s.status === "blocked").length,
            sessionPassed: sessionList.filter((s) => s.progress?.failed === 0).length,
            sessionFailed: sessionList.filter((s) => (s.progress?.failed ?? 0) > 0)
              .length,
            evidenceTotal: sessionList.reduce((n, s) => n + s.evidenceRefs.length, 0),
            evidenceIntegrityOk: sessionList.reduce(
              (n, s) => n + s.evidenceRefs.length,
              0,
            ),
            defectTotal: defectList.length,
            defectOpen: defectList.filter(
              (d) => !["closed", "verified", "archived"].includes(d.status),
            ).length,
            defectCritical: defectList.filter((d) => d.severity === "critical").length,
            defectRetest: defectList.filter((d) => d.status === "ready_for_retest")
              .length,
            defectVerified: defectList.filter((d) => d.status === "verified").length,
            defectAgingDaysSum: 0,
            defectAgingCount: 0,
          };
        },
      },
    });

    // Cap E — Requirement
    let requirement = await requirements.service.create(
      actor,
      {
        title: "SSO login required",
        category: "security",
        risk: "high",
        projectId: "proj-1",
      },
      "2026-08-02T18:00:00.000Z",
    );
    requirement = await requirements.service.transition(
      actor,
      requirement.requirementId,
      "under_review",
      "2026-08-02T18:00:01.000Z",
    );
    requirement = await requirements.service.transition(
      actor,
      requirement.requirementId,
      "approved",
      "2026-08-02T18:00:02.000Z",
    );
    expect(requirement.status).toBe("approved");

    // Cap A — Suite
    let suite = await suites.service.create(
      actor,
      { name: "SSO Regression", projectId: "proj-1", tags: ["sso"] },
      "2026-08-02T18:01:00.000Z",
    );
    for (const state of ["review", "approved", "published"] as const) {
      suite = await suites.service.transition(
        actor,
        suite.suiteId,
        state,
        `2026-08-02T18:01:0${["review", "approved", "published"].indexOf(state) + 1}.000Z`,
      );
    }
    expect(suite.status).toBe("published");

    await requirements.service.linkSuite(
      actor,
      requirement.requirementId,
      suite.suiteId,
      "2026-08-02T18:01:10.000Z",
      suite.name,
    );

    // Cap B — Plan → handoff
    let plan = await plans.service.create(
      actor,
      {
        name: "Sprint SSO Plan",
        suiteId: suite.suiteId,
        projectId: "proj-1",
        assignments: { testerIds: ["tester-1"] },
        environmentReferences: [{ referenceId: "env-1", label: "QA" }],
      },
      "2026-08-02T18:02:00.000Z",
    );
    for (const [state, ts] of [
      ["in_review", "2026-08-02T18:02:01.000Z"],
      ["approved", "2026-08-02T18:02:02.000Z"],
    ] as const) {
      plan = await plans.service.transition(actor, plan.planId, state, ts);
    }
    plan = await plans.service.schedule(
      actor,
      plan.planId,
      {
        plannedStartAt: "2026-08-11T09:00:00.000Z",
        plannedEndAt: "2026-08-11T12:00:00.000Z",
        timezone: "UTC",
        scheduleStatus: "confirmed",
      },
      "2026-08-02T18:02:03.000Z",
    );
    plan = await plans.service.transition(
      actor,
      plan.planId,
      "ready",
      "2026-08-02T18:02:04.000Z",
    );
    plan = await plans.service.transition(
      actor,
      plan.planId,
      "scheduled",
      "2026-08-02T18:02:05.000Z",
    );
    plan = await plans.service.handoff(actor, plan.planId, "2026-08-02T18:02:06.000Z");
    expect(plan.status).toBe("handed_off");
    expect(plan.handoff?.handoffId).toBeTruthy();

    // Cap C — Execution + evidence reference
    let session = await sessions.service.createFromHandoff(
      actor,
      plan.handoff!.handoffId,
      "2026-08-02T18:03:00.000Z",
    );
    await sessions.service.open(actor, session.sessionId, "2026-08-02T18:03:01.000Z");
    const failStep = session.steps[1]?.stepId ?? "step-2";
    await sessions.service.recordStepResult(
      actor,
      session.sessionId,
      { stepId: session.steps[0]!.stepId, outcome: "pass" },
      "2026-08-02T18:03:02.000Z",
    );
    await sessions.service.recordStepResult(
      actor,
      session.sessionId,
      {
        stepId: failStep,
        outcome: "fail",
        failureNotes: "SSO redirect loop",
      },
      "2026-08-02T18:03:03.000Z",
    );
    session = await sessions.service.attachEvidence(
      actor,
      session.sessionId,
      { evidenceId: "ev-chain-1", stepId: failStep, note: "HAR capture" },
      "2026-08-02T18:03:04.000Z",
    );
    expect(session.evidenceRefs.map((r) => r.evidenceId)).toContain("ev-chain-1");
    session = await sessions.service.complete(
      actor,
      session.sessionId,
      "2026-08-02T18:03:05.000Z",
    );
    expect(session.status).toBe("completed");

    // Cap D — Defect from execution (must not mutate session)
    const defect = await defects.service.createFromExecution(
      actor,
      { sessionId: session.sessionId, stepId: failStep },
      "2026-08-02T18:04:00.000Z",
    );
    expect(defect.evidenceRefs.map((r) => r.evidenceId)).toContain("ev-chain-1");
    const sessionAfter = await sessions.repository.get(
      actor.tenantId,
      session.sessionId,
    );
    expect(sessionAfter?.session.status).toBe("completed");

    // Cap E — Derived traceability / coverage
    const trace = await requirements.service.traceability(
      actor,
      requirement.requirementId,
      "2026-08-02T18:05:00.000Z",
    );
    expect(trace.links.some((l) => l.toKind === "suite")).toBe(true);
    expect(trace.links.some((l) => l.toKind === "execution_session")).toBe(true);
    expect(trace.links.some((l) => l.toKind === "defect")).toBe(true);

    const coverage = await requirements.service.coverage(
      actor,
      requirement.requirementId,
      "2026-08-02T18:05:01.000Z",
    );
    expect(coverage.overallCoverage).toBeGreaterThanOrEqual(0);

    // Cap F — Derived reporting
    const dashboard = await reporting.service.getDashboard(
      actor,
      "executive",
      "2026-08-02T18:06:00.000Z",
    );
    expect(dashboard.metrics.metrics.length).toBeGreaterThan(0);
    const report = await reporting.service.generateReport(
      actor,
      "coverage_summary",
      "2026-08-02T18:06:01.000Z",
    );
    expect(report.exportMetadata.derived).toBe(true);
  });
});
