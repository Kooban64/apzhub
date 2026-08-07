/**
 * Operational Workspace aggregators — APZ Projects Release 3.0 Slice 1 (W002).
 * Assembles overview / queue / portfolio / changes from projects + delivery registers.
 */

import type { NextRequest } from "next/server";

import type { ProjectDeliveryDashboard } from "@apzhub/platform-service-contracts";
import {
  createProjectsDeliveryService,
  createProjectsOperationalService,
  createProjectsWorkflowBridge,
  getMemoryProjectsDeliveryStore,
  getMemoryProjectsOperationalStore,
  setProjectsDeliveryStoreForTests,
  setProjectsOperationalStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonDataResponse } from "../response";

const MAX_PROJECTS = 50;

function deliveryService() {
  try {
    return createProjectsDeliveryService();
  } catch {
    setProjectsDeliveryStoreForTests(getMemoryProjectsDeliveryStore());
    return createProjectsDeliveryService(getMemoryProjectsDeliveryStore());
  }
}

function operationalService() {
  try {
    return createProjectsOperationalService();
  } catch {
    setProjectsOperationalStoreForTests(getMemoryProjectsOperationalStore());
    return createProjectsOperationalService(getMemoryProjectsOperationalStore());
  }
}

function mapHealth(
  status: "green" | "amber" | "red" | undefined,
): "Healthy" | "Watch" | "Critical" {
  if (status === "red") return "Critical";
  if (status === "amber") return "Watch";
  return "Healthy";
}

function confidenceFromHealth(
  status: "green" | "amber" | "red" | undefined,
  dashboard?: ProjectDeliveryDashboard,
): { score: number; band: "High" | "Medium" | "Low" } {
  let score = status === "red" ? 35 : status === "amber" ? 58 : 82;
  if (dashboard) {
    score -= Math.min(20, dashboard.criticalRisks * 8);
    score -= Math.min(15, dashboard.overdueActions * 5);
    score -= Math.min(10, dashboard.blockers.length * 4);
  }
  score = Math.max(0, Math.min(100, score));
  const band = score >= 75 ? "High" : score >= 45 ? "Medium" : "Low";
  return { score, band };
}

function attentionScore(
  health: "Healthy" | "Watch" | "Critical",
  confidence: number,
  overdue: number,
  criticalRisks: number,
  blockers: number,
): number {
  let score = 0;
  if (health === "Critical") score += 100;
  else if (health === "Watch") score += 40;
  if (confidence < 45) score += 30;
  else if (confidence < 75) score += 10;
  score += overdue * 8 + criticalRisks * 12 + blockers * 10;
  return score;
}

function pulseFor(dashboard: ProjectDeliveryDashboard, projectName: string): string {
  if (dashboard.criticalRisks > 0) {
    const risk = dashboard.topRisks.find(
      (r) => r.probability === "critical" || r.impact === "critical",
    );
    return `Critical risk open${risk ? `: ${risk.title}` : ""}. Review Control.`;
  }
  if (dashboard.blockers.length > 0) {
    return `Delivery blocked: ${dashboard.blockers[0]}. Clear blockers to restore trajectory.`;
  }
  if (dashboard.overdueActions > 0) {
    return `${dashboard.overdueActions} overdue action${dashboard.overdueActions === 1 ? "" : "s"}. Next milestone remains in view.`;
  }
  const next = dashboard.upcomingMilestones[0];
  if (next) {
    return `No operational pressure on ${projectName}. Next milestone: ${next.name}${next.targetDate ? ` (${next.targetDate.slice(0, 10)})` : ""}.`;
  }
  return `No operational pressure on ${projectName}.`;
}

function daysUntil(iso?: string): number | undefined {
  if (!iso) return undefined;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return undefined;
  return Math.ceil((t - Date.now()) / (24 * 60 * 60 * 1000));
}

function isDueWithinDays(iso: string | undefined, days: number): boolean {
  const d = daysUntil(iso);
  return d !== undefined && d >= 0 && d <= days;
}

function isOverdue(iso?: string): boolean {
  const d = daysUntil(iso);
  return d !== undefined && d < 0;
}

type Loaded = {
  readonly project: {
    readonly id: string;
    readonly name: string;
    readonly identifier: string;
    readonly status: string;
    readonly updatedAt: string;
  };
  readonly dashboard: ProjectDeliveryDashboard | null;
};

async function loadActiveProjects(
  context: PlatformApiRequestContext,
): Promise<readonly Loaded[]> {
  const gateway = await getPlatformServiceGateway();
  const result = await gateway.projects.listProjects(context.serviceContext, {
    page: { page: 1, perPage: MAX_PROJECTS },
    filter: { status: "active" },
  });
  const service = deliveryService();
  const rows = await Promise.all(
    result.items.map(async (project) => {
      try {
        const dashboard = await service.getDashboard(
          context.serviceContext,
          project.id,
        );
        return { project, dashboard };
      } catch {
        return { project, dashboard: null };
      }
    }),
  );
  return rows;
}

export async function handleWorkspaceOverview(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const loaded = await loadActiveProjects(context);
  let healthy = 0;
  let watch = 0;
  let critical = 0;
  let confidenceSum = 0;
  let lowCount = 0;
  let milestonesDue7d = 0;
  let criticalRisks = 0;
  let watchRisks = 0;
  let openDecisions = 0;
  let decisionQueue = 0;
  let attentionQueue = 0;
  let waitingQueue = 0;
  let commitmentsDue7d = 0;
  const operational = operationalService();

  for (const row of loaded) {
    const status = row.dashboard?.health.status;
    const label = mapHealth(status);
    if (label === "Critical") critical += 1;
    else if (label === "Watch") watch += 1;
    else healthy += 1;

    const conf = confidenceFromHealth(status, row.dashboard ?? undefined);
    confidenceSum += conf.score;
    if (conf.band === "Low") lowCount += 1;

    if (row.dashboard) {
      criticalRisks += row.dashboard.criticalRisks;
      watchRisks += Math.max(0, row.dashboard.openRisks - row.dashboard.criticalRisks);
      openDecisions += row.dashboard.recentDecisions.length;
      for (const m of row.dashboard.upcomingMilestones) {
        if (isDueWithinDays(m.targetDate, 7)) milestonesDue7d += 1;
      }
      if (row.dashboard.criticalRisks > 0) decisionQueue += 1;
      attentionQueue +=
        row.dashboard.overdueActions +
        row.dashboard.blockers.length +
        (row.dashboard.health.status === "red" ? 1 : 0);
    }

    try {
      const [waits, decisions, commitments] = await Promise.all([
        operational.listWaiting(context.serviceContext, row.project.id),
        operational.listOpsDecisions(context.serviceContext, row.project.id),
        operational.listCommitments(context.serviceContext, row.project.id),
      ]);
      waitingQueue += waits.filter((w) => w.status === "active").length;
      decisionQueue += decisions.filter(
        (d) => d.status === "pending" || d.status === "deferred",
      ).length;
      openDecisions += decisions.filter(
        (d) => d.status === "pending" || d.status === "deferred",
      ).length;
      for (const c of commitments) {
        if (c.status === "done" || c.status === "cancelled") continue;
        if (isDueWithinDays(c.dueAt, 7)) commitmentsDue7d += 1;
        if (c.dueAt && isOverdue(c.dueAt)) attentionQueue += 1;
      }
    } catch {
      /* operational store optional during degrade */
    }
  }

  const n = loaded.length || 1;
  const mean = Math.round(confidenceSum / n);
  const pressureParts: string[] = [];
  if (critical > 0)
    pressureParts.push(`${critical} project${critical === 1 ? "" : "s"} Critical`);
  if (attentionQueue > 0)
    pressureParts.push(`${attentionQueue} items require attention`);
  if (criticalRisks > 0)
    pressureParts.push(
      `${criticalRisks} critical risk${criticalRisks === 1 ? "" : "s"} open`,
    );
  const pressureStatement =
    pressureParts.length > 0
      ? pressureParts.join(" · ")
      : loaded.length === 0
        ? "No active projects in scope."
        : "No operational pressure across the active portfolio.";

  // Trend: v1 uses current pressure as baseline deltas (prior-week store arrives with analytics).
  const trend = {
    slippedMilestonesDelta: critical > 0 ? critical : 0,
    agedWaitsDelta: waitingQueue > 0 ? Math.min(waitingQueue, 9) : 0,
    confidenceDelta: mean >= 75 ? 0 : mean >= 45 ? -1 : -2,
  };

  return jsonDataResponse(
    {
      asOf: new Date().toISOString(),
      pressureStatement,
      health: { healthy, watch, critical },
      confidence: { mean: loaded.length ? mean : 0, lowCount },
      attention: {
        decision: decisionQueue,
        attention: attentionQueue,
        waiting: waitingQueue,
      },
      delivery: {
        commitmentsDue7d: commitmentsDue7d || milestonesDue7d,
        milestonesDue7d,
      },
      control: {
        criticalRisks,
        watchRisks,
        openDecisions,
      },
      trend,
    },
    context.tracing,
  );
}

export async function handleWorkspaceQueue(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const loaded = await loadActiveProjects(context);
  const decision: Array<Record<string, unknown>> = [];
  const attention: Array<Record<string, unknown>> = [];
  const waitingOnOthers: Array<Record<string, unknown>> = [];

  const operational = operationalService();

  for (const row of loaded) {
    const d = row.dashboard;
    if (!d) continue;
    const basePath = `/workspace/projects/${row.project.id}`;

    const [waits, opsDecisions, commitments] = await Promise.all([
      operational.listWaiting(context.serviceContext, row.project.id),
      operational.listOpsDecisions(context.serviceContext, row.project.id),
      operational.listCommitments(context.serviceContext, row.project.id),
    ]);

    for (const wait of waits) {
      if (wait.status !== "active") continue;
      const ageDays = Math.floor(
        (Date.now() - Date.parse(wait.since)) / (24 * 60 * 60 * 1000),
      );
      const aged = ageDays > (wait.slaDays || 7);
      waitingOnOthers.push({
        id: `wait-${wait.id}`,
        group: "waiting",
        kind: "Waiting",
        impact: aged ? "High" : "Medium",
        statement: wait.subject,
        category: wait.category,
        partyLabel: wait.partyLabel,
        projectId: row.project.id,
        projectName: row.project.name,
        since: wait.since,
        ageDays,
        aged,
        targetPath: `${basePath}/delivery`,
      });
    }

    for (const dec of opsDecisions) {
      if (dec.status !== "pending" && dec.status !== "deferred") continue;
      decision.push({
        id: `opdec-${dec.id}`,
        group: "decision",
        kind: "Decision",
        impact: dec.dueAt && Date.parse(dec.dueAt) < Date.now() ? "High" : "Medium",
        statement: dec.title,
        projectId: row.project.id,
        projectName: row.project.name,
        dueAt: dec.dueAt,
        inlineAct: "approve_reject",
        targetPath: `${basePath}/control?surface=decisions`,
      });
    }

    for (const cmt of commitments) {
      if (cmt.status === "done" || cmt.status === "cancelled") continue;
      if (cmt.status === "waiting") {
        waitingOnOthers.push({
          id: `cmt-wait-${cmt.id}`,
          group: "waiting",
          kind: "Commitment",
          impact: "Medium",
          statement: cmt.statement,
          projectId: row.project.id,
          projectName: row.project.name,
          targetPath: `${basePath}/delivery`,
        });
      } else if (cmt.dueAt && isOverdue(cmt.dueAt)) {
        attention.push({
          id: `cmt-${cmt.id}`,
          group: "attention",
          kind: "Commitment",
          impact: cmt.blocksGoLive || cmt.priority === "high" ? "High" : "Medium",
          statement: cmt.statement,
          projectId: row.project.id,
          projectName: row.project.name,
          dueAt: cmt.dueAt,
          targetPath: `${basePath}/delivery`,
        });
      }
    }

    for (const risk of d.topRisks) {
      if (risk.status === "closed" || risk.status === "accepted") continue;
      if (risk.probability === "critical" || risk.impact === "critical") {
        decision.push({
          id: `risk-${risk.id}`,
          group: "decision",
          kind: "Risk",
          impact: "High",
          statement: risk.title,
          projectId: row.project.id,
          projectName: row.project.name,
          dueAt: risk.reviewDate,
          targetPath: `${basePath}/risks`,
        });
      } else if (risk.probability === "high" || risk.impact === "high") {
        attention.push({
          id: `risk-${risk.id}`,
          group: "attention",
          kind: "Risk",
          impact: "Medium",
          statement: risk.title,
          projectId: row.project.id,
          projectName: row.project.name,
          dueAt: risk.reviewDate,
          targetPath: `${basePath}/risks`,
        });
      }
    }

    for (const blocker of d.blockers) {
      attention.push({
        id: `block-${row.project.id}-${blocker.slice(0, 24)}`,
        group: "attention",
        kind: "Blocked",
        impact: "High",
        statement: blocker,
        projectId: row.project.id,
        projectName: row.project.name,
        targetPath: `${basePath}/delivery`,
      });
    }

    if (d.overdueActions > 0) {
      attention.push({
        id: `overdue-actions-${row.project.id}`,
        group: "attention",
        kind: "Action",
        impact: d.overdueActions > 2 ? "High" : "Medium",
        statement: `${d.overdueActions} overdue action${d.overdueActions === 1 ? "" : "s"} require completion`,
        projectId: row.project.id,
        projectName: row.project.name,
        targetPath: `${basePath}/actions`,
      });
    }

    for (const m of d.upcomingMilestones) {
      if (m.status === "missed" || isOverdue(m.targetDate)) {
        attention.push({
          id: `ms-${m.id}`,
          group: "attention",
          kind: "Milestone",
          impact: "High",
          statement: `Milestone ${m.name} requires date confirmation`,
          projectId: row.project.id,
          projectName: row.project.name,
          dueAt: m.targetDate,
          targetPath: `${basePath}/milestones`,
        });
      }
    }
  }

  const byImpact = (a: Record<string, unknown>, b: Record<string, unknown>) => {
    const order = { High: 0, Medium: 1, Low: 2 } as const;
    const ai = order[String(a.impact) as keyof typeof order] ?? 9;
    const bi = order[String(b.impact) as keyof typeof order] ?? 9;
    return ai - bi;
  };

  decision.sort(byImpact);
  attention.sort(byImpact);
  waitingOnOthers.sort(byImpact);

  const bridgeHealth = await createProjectsWorkflowBridge().health(
    context.serviceContext,
  );

  return jsonDataResponse(
    {
      decision: decision.slice(0, 50),
      attention: attention.slice(0, 50),
      waitingOnOthers: waitingOnOthers.slice(0, 50),
      approvalsUnavailable: !bridgeHealth.available,
    },
    context.tracing,
  );
}

export async function handleWorkspacePortfolio(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const sort = request.nextUrl.searchParams.get("sort") ?? "attention";
  const loaded = await loadActiveProjects(context);

  const operational = operationalService();
  const healthFilter = request.nextUrl.searchParams.get("health");
  const confidenceFilter = request.nextUrl.searchParams.get("confidence");
  const agedWaitOnly = request.nextUrl.searchParams.get("agedWait") === "1";

  const items = (
    await Promise.all(
      loaded.map(async (row) => {
        const d = row.dashboard;
        const health = mapHealth(d?.health.status);
        const conf = confidenceFromHealth(d?.health.status, d ?? undefined);
        const completed = d?.milestoneCompleted ?? 0;
        const total = d?.milestoneTotal ?? 0;
        const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;
        const next = d?.upcomingMilestones[0];
        let waitingCount = 0;
        let waitingSummary: string | undefined;
        let hasAgedWait = false;
        try {
          const waits = await operational.listWaiting(
            context.serviceContext,
            row.project.id,
          );
          const active = waits.filter((w) => w.status === "active");
          waitingCount = active.length;
          for (const w of active) {
            const ageDays = Math.floor(
              (Date.now() - Date.parse(w.since)) / (24 * 60 * 60 * 1000),
            );
            if (ageDays > (w.slaDays || 7)) {
              hasAgedWait = true;
              waitingSummary = `${w.partyLabel || w.category} · Aged`;
              break;
            }
          }
          if (!waitingSummary && active[0]) {
            waitingSummary = `${active[0].partyLabel || active[0].category} · ${active.length}`;
          }
        } catch {
          /* degrade */
        }
        const att = attentionScore(
          health,
          conf.score,
          d?.overdueActions ?? 0,
          d?.criticalRisks ?? 0,
          d?.blockers.length ?? 0,
        );

        return {
          projectId: row.project.id,
          name: row.project.name,
          identifier: row.project.identifier,
          health,
          confidenceScore: conf.score,
          confidenceBand: conf.band,
          progressPercent,
          pulse: d ? pulseFor(d, row.project.name) : "Delivery signals unavailable.",
          nextCommitment: next
            ? { title: next.name, dueAt: next.targetDate }
            : undefined,
          pressure: {
            risks: d?.openRisks ?? 0,
            decisions: d?.recentDecisions.length ?? 0,
            waiting: waitingCount,
            blocked: d?.blockers.length ?? 0,
          },
          waitingSummary,
          hasAgedWait,
          lastChangeAt: row.project.updatedAt,
          attentionScore: att + (hasAgedWait ? 25 : 0),
        };
      }),
    )
  ).filter((strip) => {
    if (healthFilter && strip.health !== healthFilter) return false;
    if (confidenceFilter && strip.confidenceBand !== confidenceFilter) {
      return false;
    }
    if (agedWaitOnly && !strip.hasAgedWait) return false;
    return true;
  });

  items.sort((a, b) => {
    if (sort === "name") return a.name.localeCompare(b.name);
    if (sort === "health") {
      const order = { Critical: 0, Watch: 1, Healthy: 2 } as const;
      return order[a.health] - order[b.health];
    }
    if (sort === "confidence") return a.confidenceScore - b.confidenceScore;
    if (sort === "recent") {
      return (b.lastChangeAt ?? "").localeCompare(a.lastChangeAt ?? "");
    }
    return b.attentionScore - a.attentionScore;
  });

  return jsonDataResponse({ items, sort }, context.tracing);
}

export async function handleWorkspaceChanges(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const loaded = await loadActiveProjects(context);
  const items: Array<Record<string, unknown>> = [];

  for (const row of loaded) {
    const d = row.dashboard;
    if (!d) continue;
    const basePath = `/workspace/projects/${row.project.id}`;

    for (const risk of d.topRisks.slice(0, 2)) {
      if (risk.probability === "critical" || risk.impact === "critical") {
        items.push({
          id: `chg-risk-${risk.id}`,
          headline: `Risk elevated — ${risk.title}`,
          whyCare: "Exposure may affect delivery confidence and go-live readiness.",
          projectId: row.project.id,
          projectName: row.project.name,
          at: risk.updatedAt,
          targetPath: `${basePath}/risks`,
        });
      }
    }

    for (const m of d.upcomingMilestones.slice(0, 2)) {
      if (m.status === "missed") {
        items.push({
          id: `chg-ms-${m.id}`,
          headline: `Milestone slipped — ${m.name}`,
          whyCare: "Trajectory changed; baseline variance and forecast may move.",
          projectId: row.project.id,
          projectName: row.project.name,
          at: m.updatedAt,
          targetPath: `${basePath}/milestones`,
        });
      } else if (m.status === "completed") {
        items.push({
          id: `chg-ms-done-${m.id}`,
          headline: `Milestone completed — ${m.name}`,
          whyCare: "Delivery progress advanced; dependent work may unblock.",
          projectId: row.project.id,
          projectName: row.project.name,
          at: m.updatedAt,
          targetPath: `${basePath}/milestones`,
        });
      }
    }

    if (d.health.status === "red") {
      items.push({
        id: `chg-health-${row.project.id}`,
        headline: `Delivery health Critical — ${row.project.name}`,
        whyCare: "Immediate operational intervention may be required.",
        projectId: row.project.id,
        projectName: row.project.name,
        at: d.health.computedAt,
        targetPath: `${basePath}/delivery`,
      });
    }
  }

  items.sort((a, b) => String(b.at).localeCompare(String(a.at)));

  return jsonDataResponse({ items: items.slice(0, 40) }, context.tracing);
}
