import type {
  ProjectActionItem,
  ProjectDeliveryHealth,
  ProjectDeliveryHealthStatus,
  ProjectMilestone,
  ProjectRisk,
} from "@apzhub/platform-service-contracts";
import { isOpenMilestoneStatus } from "@apzhub/platform-service-contracts";

function worse(
  a: ProjectDeliveryHealthStatus,
  b: ProjectDeliveryHealthStatus,
): ProjectDeliveryHealthStatus {
  const rank = { green: 0, amber: 1, red: 2 } as const;
  return rank[a] >= rank[b] ? a : b;
}

/**
 * Transparent business rules — no AI, no prediction.
 */
export function computeProjectDeliveryHealth(input: {
  readonly projectId: string;
  readonly milestones: readonly ProjectMilestone[];
  readonly risks: readonly ProjectRisk[];
  readonly actions: readonly ProjectActionItem[];
  readonly now?: Date;
}): ProjectDeliveryHealth {
  const now = input.now ?? new Date();
  const reasons: string[] = [];

  const openMilestones = input.milestones.filter((m) =>
    isOpenMilestoneStatus(m.status),
  );
  const overdueMilestones = openMilestones.filter(
    (m) =>
      m.status === "slipped" ||
      m.status === "missed" ||
      (m.targetDate && Date.parse(m.targetDate) < now.getTime()),
  );
  let milestoneScore: ProjectDeliveryHealthStatus = "green";
  if (overdueMilestones.length > 0) {
    milestoneScore = "red";
    reasons.push(`${overdueMilestones.length} overdue/slipped milestone(s)`);
  } else if (
    openMilestones.some(
      (m) =>
        m.status === "at_risk" ||
        m.confidence === "low" ||
        (m.progressPercent < 50 && m.targetDate),
    )
  ) {
    milestoneScore = "amber";
    reasons.push("Open milestones at risk or behind expected progress");
  }

  const openRisks = input.risks.filter(
    (r) => r.status === "open" || r.status === "mitigating",
  );
  const criticalRisks = openRisks.filter(
    (r) => r.impact === "critical" || r.probability === "critical",
  );
  let riskScore: ProjectDeliveryHealthStatus = "green";
  if (criticalRisks.length > 0) {
    riskScore = "red";
    reasons.push(`${criticalRisks.length} critical open risk(s)`);
  } else if (openRisks.some((r) => r.impact === "high" || r.probability === "high")) {
    riskScore = "amber";
    reasons.push("High-impact or high-probability risks remain open");
  }

  const openActions = input.actions.filter((a) => a.status === "open");
  const overdueActions = openActions.filter(
    (a) => a.dueDate && Date.parse(a.dueDate) < now.getTime(),
  );
  let actionScore: ProjectDeliveryHealthStatus = "green";
  if (overdueActions.length >= 3) {
    actionScore = "red";
    reasons.push(`${overdueActions.length} overdue actions`);
  } else if (overdueActions.length > 0) {
    actionScore = "amber";
    reasons.push(`${overdueActions.length} overdue action(s)`);
  }

  let scheduleScore: ProjectDeliveryHealthStatus = "green";
  if (overdueMilestones.length > 0 || overdueActions.length >= 3) {
    scheduleScore = "red";
  } else if (overdueActions.length > 0) {
    scheduleScore = "amber";
  }

  const status = [scheduleScore, riskScore, milestoneScore, actionScore].reduce(
    worse,
    "green" as ProjectDeliveryHealthStatus,
  );

  if (reasons.length === 0) {
    reasons.push("Delivery indicators within expected thresholds");
  }

  return Object.freeze({
    projectId: input.projectId as ProjectDeliveryHealth["projectId"],
    status,
    scheduleScore,
    riskScore,
    milestoneScore,
    actionScore,
    reasons: Object.freeze(reasons),
    computedAt: now.toISOString(),
  });
}
