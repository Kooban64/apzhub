/**
 * Deterministic readiness evaluation — no AI / QI.
 */

import type {
  ExecutionPlanNode,
  ReadinessFinding,
  ReadinessSnapshot,
  ReadinessState,
} from "./types";

export type SuiteReadinessContext = {
  readonly exists: boolean;
  readonly accessible: boolean;
  readonly status?: string;
  readonly version?: number;
};

export function evaluateExecutionPlanReadiness(
  plan: ExecutionPlanNode,
  suiteCtx: SuiteReadinessContext,
  now: string,
): ReadinessSnapshot {
  const findings: ReadinessFinding[] = [];

  if (!plan.suiteRef.suiteId) {
    findings.push({
      code: "suite.missing",
      severity: "blocking",
      message: "Suite reference is required.",
    });
  } else if (!suiteCtx.exists) {
    findings.push({
      code: "suite.not_found",
      severity: "blocking",
      message: "Referenced suite does not exist.",
    });
  } else if (!suiteCtx.accessible) {
    findings.push({
      code: "suite.inaccessible",
      severity: "blocking",
      message: "Referenced suite is not accessible in this tenant/project.",
    });
  } else if (
    suiteCtx.status === "archived" ||
    suiteCtx.status === "retired" ||
    suiteCtx.status === "deleted"
  ) {
    findings.push({
      code: "suite.not_plannable",
      severity: "blocking",
      message: `Suite status '${suiteCtx.status}' cannot be planned.`,
    });
  } else if (suiteCtx.status !== "published" && suiteCtx.status !== "approved") {
    findings.push({
      code: "suite.not_approved",
      severity: "warning",
      message: `Suite is '${suiteCtx.status ?? "unknown"}'; prefer approved/published.`,
    });
  }

  if (suiteCtx.version != null && suiteCtx.version !== plan.suiteRef.suiteVersion) {
    findings.push({
      code: "suite.version_drift",
      severity: "warning",
      message: `Bound suite version v${plan.suiteRef.suiteVersion}; live suite is v${suiteCtx.version}.`,
    });
  }

  if (!plan.assignments.testerIds.length && !plan.assignments.testLeadId) {
    findings.push({
      code: "assignment.missing",
      severity: "blocking",
      message: "At least one tester or test lead is required.",
    });
  }

  if (!plan.environmentReferences.length) {
    findings.push({
      code: "environment.missing",
      severity: "warning",
      message: "No environment references configured.",
    });
  }

  const start = plan.schedule.plannedStartAt;
  const end = plan.schedule.plannedEndAt;
  if (start && end && start > end) {
    findings.push({
      code: "schedule.invalid_window",
      severity: "blocking",
      message: "Planned start must be before planned end.",
    });
  }

  for (const prereq of plan.prerequisites) {
    if (prereq.required && !prereq.satisfied) {
      findings.push({
        code: `prerequisite.unsatisfied:${prereq.prerequisiteId}`,
        severity: "blocking",
        message: prereq.description,
      });
    }
  }

  if (plan.status === "in_review" || plan.status === "draft") {
    findings.push({
      code: "lifecycle.not_approved",
      severity: "blocking",
      message: "Plan must be approved before READY.",
    });
  }

  const blockingFindings = findings.filter((f) => f.severity === "blocking");
  const warnings = findings.filter((f) => f.severity === "warning");

  let readinessState: ReadinessState;
  if (blockingFindings.length > 0) readinessState = "not_ready";
  else if (warnings.length > 0) readinessState = "ready_with_warnings";
  else readinessState = "ready";

  return {
    readinessState,
    findings,
    blockingFindings,
    warnings,
    evaluatedAt: now,
  };
}
