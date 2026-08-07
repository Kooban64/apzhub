import { beforeEach, describe, expect, it } from "vitest";

import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import {
  createProjectsReportingService,
  getMemoryProjectsReportingStore,
  resetProjectsReportingStoreForTests,
} from "./index";

function ctx(): ServiceRequestContext {
  return {
    tenantId: "t1",
    userId: "user_1",
    correlationId: "corr_1",
  } as ServiceRequestContext;
}

describe("Projects Reporting (PX-05 / W008)", () => {
  beforeEach(() => {
    resetProjectsReportingStoreForTests();
  });

  it("exposes the authorised v1 report catalogue only", () => {
    const svc = createProjectsReportingService(getMemoryProjectsReportingStore());
    const catalogue = svc.listReportCatalogue();
    expect(catalogue).toHaveLength(10);
    expect(catalogue.map((r) => r.key)).toContain("exceptions");
    expect(catalogue.map((r) => r.key)).toContain("accountability_gaps");
  });

  it("runs explainable reports with drill-through targets", async () => {
    const svc = createProjectsReportingService(getMemoryProjectsReportingStore());
    const report = await svc.runReport(ctx(), "exceptions", "project", "prj_1");
    expect(report.definition.question).toMatch(/exceptions/i);
    expect(report.rows[0]?.drill.href).toContain("/workspace/projects/");
    expect(report.rows[0]?.drill.objectType).toBe("exception");
  });

  it("starts a review with immutable-ready pack and executive summary", async () => {
    const svc = createProjectsReportingService(getMemoryProjectsReportingStore());
    const review = await svc.createReview(ctx(), {
      type: "project",
      scopeType: "project",
      scopeId: "prj_1",
      periodFrom: "2026-08-01T00:00:00.000Z",
      periodTo: "2026-08-07T00:00:00.000Z",
      chairPrincipalId: "user_1",
    });
    const started = await svc.startReview(ctx(), review.id);
    expect(started.review.status).toBe("in_progress");
    expect(started.snapshot.metrics.length).toBeGreaterThan(0);
    expect(started.summary.currentPosition.length).toBeGreaterThan(0);
    expect(started.summary.editable).toBe(true);
  });

  it("requires structured outcomes and follow-up to complete", async () => {
    const svc = createProjectsReportingService(getMemoryProjectsReportingStore());
    const review = await svc.createReview(ctx(), {
      type: "delivery",
      scopeType: "project",
      scopeId: "prj_1",
      periodFrom: "2026-08-01T00:00:00.000Z",
      periodTo: "2026-08-07T00:00:00.000Z",
      chairPrincipalId: "user_1",
    });
    await svc.startReview(ctx(), review.id);
    await expect(
      svc.completeReview(ctx(), review.id, {
        outcomes: {
          decisions: [],
          newCommitments: ["cmt_1"],
          risksRaised: [],
          risksClosed: [],
          exceptionsRaised: [],
          exceptionsClosed: [],
          governanceActions: [],
          followUpReviewAt: "",
          emptyCategoriesAttested: true,
        },
      }),
    ).rejects.toThrow(/follow_up_review_required/);

    const completed = await svc.completeReview(ctx(), review.id, {
      outcomes: {
        decisions: [],
        newCommitments: ["cmt_1"],
        risksRaised: [],
        risksClosed: [],
        exceptionsRaised: [],
        exceptionsClosed: [],
        governanceActions: [],
        followUpReviewAt: "2026-08-14T00:00:00.000Z",
        emptyCategoriesAttested: true,
      },
    });
    expect(completed.status).toBe("completed");
    await expect(svc.startReview(ctx(), review.id)).rejects.toThrow(/review_immutable/);
  });

  it("supports review calendar schedules", async () => {
    const svc = createProjectsReportingService(getMemoryProjectsReportingStore());
    const schedule = await svc.createSchedule(ctx(), {
      type: "portfolio",
      scopeType: "portfolio",
      scopeId: "ent_1",
      cadence: "monthly",
      nextRunAt: "2026-09-01T00:00:00.000Z",
    });
    expect(schedule.status).toBe("active");
    const listed = await svc.listSchedules(ctx(), {
      scopeType: "portfolio",
      scopeId: "ent_1",
    });
    expect(listed).toHaveLength(1);
  });
});
