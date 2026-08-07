/**
 * Portfolio Projection — W005 operational roll-up (PX-02).
 * Hierarchy: Project → Programme → Initiative → Enterprise Portfolio.
 * Confidence: PF-D9 weighted (not mean).
 */

import type { NextRequest } from "next/server";

import type { StrategicImportance } from "@apzhub/platform-service-contracts";
import {
  computePortfolioWeightedConfidence,
  createProjectsDeliveryService,
  createProjectsLifecycleService,
  createProjectsOperationalService,
  createProjectsPortfolioService,
  getMemoryProjectsDeliveryStore,
  getMemoryProjectsLifecycleStore,
  getMemoryProjectsOperationalStore,
  setProjectsDeliveryStoreForTests,
  setProjectsLifecycleStoreForTests,
  setProjectsOperationalStoreForTests,
  type PortfolioConfidenceMember,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonDataResponse } from "../response";
import { loadPortfolioObjectiveEvidence } from "./projects-portfolio-evidence";

const MAX = 80;

function delivery() {
  try {
    return createProjectsDeliveryService();
  } catch {
    setProjectsDeliveryStoreForTests(getMemoryProjectsDeliveryStore());
    return createProjectsDeliveryService(getMemoryProjectsDeliveryStore());
  }
}

function ops() {
  try {
    return createProjectsOperationalService();
  } catch {
    setProjectsOperationalStoreForTests(getMemoryProjectsOperationalStore());
    return createProjectsOperationalService(getMemoryProjectsOperationalStore());
  }
}

function lifecycle() {
  try {
    return createProjectsLifecycleService();
  } catch {
    setProjectsLifecycleStoreForTests(getMemoryProjectsLifecycleStore());
    return createProjectsLifecycleService(getMemoryProjectsLifecycleStore());
  }
}

function portfolioSvc() {
  return createProjectsPortfolioService(undefined, {
    loadEvidence: loadPortfolioObjectiveEvidence,
  });
}

function registers() {
  const d = delivery();
  return {
    listRisks: d.listRisks.bind(d),
    listMilestones: d.listMilestones.bind(d),
  };
}

type NodeLevel = "project" | "programme" | "initiative" | "enterprise";

function classificationImportance(
  classification: string | undefined,
): StrategicImportance {
  const c = (classification ?? "").toLowerCase();
  if (c.includes("regulatory") || c.includes("critical")) return "critical";
  if (c.includes("strategic") || c.includes("high")) return "high";
  if (c.includes("operational") || c.includes("low")) return "low";
  return "normal";
}

export async function handlePortfolioProjection(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const level = (request.nextUrl.searchParams.get("level") ??
    "enterprise") as NodeLevel;
  const gateway = await getPlatformServiceGateway();
  const listed = await gateway.projects.listProjects(context.serviceContext, {
    page: { page: 1, perPage: MAX },
    filter: { status: "active" },
  });

  const o = ops();
  const life = lifecycle();
  const reg = registers();
  const pf = portfolioSvc();

  const [programmes, initiatives, objectives] = await Promise.all([
    pf.listProgrammes(context.serviceContext),
    pf.listInitiatives(context.serviceContext),
    pf.listObjectives(context.serviceContext),
  ]);

  const projectNodes = await Promise.all(
    listed.items.map(async (project) => {
      const [health, confidence, forecast, waiting, deps, exceptions, lc, milestones] =
        await Promise.all([
          o.getHealth(context.serviceContext, project.id, reg),
          o.getConfidence(context.serviceContext, project.id, reg),
          o.getForecast(context.serviceContext, project.id, 14, reg),
          o.listWaiting(context.serviceContext, project.id),
          o.listDependencies(context.serviceContext, project.id),
          o.listExceptions(context.serviceContext, project.id),
          life.getLifecycle(context.serviceContext, project.id),
          delivery().listMilestones(context.serviceContext, project.id),
        ]);
      const activeWaits = waiting.filter((w) => w.status === "active");
      const brokenDeps = deps.filter((d) => d.status === "broken");
      const openEx = exceptions.filter((e) => e.status !== "concluded");
      const membership = programmes.find((p) =>
        p.memberProjectIds.includes(project.id),
      );
      const programmeId = membership?.id ?? lc?.programmeId ?? undefined;
      const majorMilestones = milestones
        .filter(
          (m) =>
            m.status !== "achieved" &&
            m.status !== "cancelled" &&
            m.status !== "completed",
        )
        .slice(0, 6)
        .map((m) => ({
          id: m.id,
          name: m.name,
          targetDate: m.targetDate,
          status: m.status,
        }));
      return {
        level: "project" as const,
        id: project.id,
        name: project.name,
        identifier: project.identifier,
        programmeId,
        health: health.status,
        confidenceScore: confidence.score,
        confidenceBand: confidence.band,
        importance:
          membership?.strategicImportance ??
          classificationImportance(
            typeof lc?.classification === "string" ? lc.classification : undefined,
          ),
        exceptionsOpen: openEx.length,
        exceptionsCritical: openEx.filter((e) => e.severity === "critical").length,
        exceptionsMajor: openEx.filter((e) => e.severity === "major").length,
        waitingActive: activeWaits.length,
        waitingAged: activeWaits.filter((w) => {
          const age = Math.floor((Date.now() - Date.parse(w.since)) / 86400000);
          return age > (w.slaDays || 7);
        }).length,
        dependenciesBroken: brokenDeps.length,
        dependenciesActive: deps.filter((d) => d.status === "active").length,
        dependencyEdges: deps
          .filter((d) => d.status === "active" || d.status === "broken")
          .map((d) => ({
            id: d.id,
            status: d.status,
            kind: d.kind,
            fromRef: d.fromRef,
            toRef: d.toRef,
            critical: d.status === "broken",
          })),
        forecastOutcome: forecast.predictedOutcome,
        projectedConfidenceDelta: forecast.projectedConfidenceDelta,
        forecastFactors: (forecast.contributingFactors ?? []).slice(0, 3),
        majorMilestones,
      };
    }),
  );

  function weightedFor(nodes: typeof projectNodes) {
    const members: PortfolioConfidenceMember[] = nodes.map((n) => ({
      id: n.id,
      name: n.name,
      confidenceScore: n.confidenceScore,
      importance: n.importance,
      dependenciesBroken: n.dependenciesBroken,
      exceptionsCritical: n.exceptionsCritical,
      exceptionsMajor: n.exceptionsMajor,
      programmeCritical: n.importance === "critical",
    }));
    return computePortfolioWeightedConfidence(members);
  }

  function rollup(
    nodes: typeof projectNodes,
    nodeLevel: NodeLevel,
    id: string,
    name: string,
  ) {
    const n = nodes.length || 1;
    const critical = nodes.filter((x) => x.health === "Critical").length;
    const watch = nodes.filter((x) => x.health === "Watch").length;
    const healthy = nodes.filter((x) => x.health === "Healthy").length;
    const criticalPct = Math.round((critical / n) * 100);
    const watchPct = Math.round((watch / n) * 100);
    const healthyPct = Math.round((healthy / n) * 100);
    const weighted = weightedFor(nodes);
    const healthBand =
      criticalPct >= 20 || critical >= 2
        ? "Critical"
        : watchPct + criticalPct >= 35
          ? "Watch"
          : ("Healthy" as const);
    const trend = critical > 0 ? "down" : watch > healthy ? "flat" : ("up" as const);
    return {
      level: nodeLevel,
      id,
      name,
      health: healthBand,
      healthDistribution: { healthy, watch, critical },
      healthPercents: {
        healthy: healthyPct,
        attention: watchPct,
        critical: criticalPct,
      },
      healthTrend: trend,
      confidenceScore: weighted.score,
      confidenceBand: weighted.band,
      confidenceContributors: weighted.contributors,
      exceptionsOpen: nodes.reduce((s, x) => s + x.exceptionsOpen, 0),
      exceptionsCritical: nodes.reduce((s, x) => s + x.exceptionsCritical, 0),
      waitingActive: nodes.reduce((s, x) => s + x.waitingActive, 0),
      waitingAged: nodes.reduce((s, x) => s + x.waitingAged, 0),
      dependenciesBroken: nodes.reduce((s, x) => s + x.dependenciesBroken, 0),
      dependenciesActive: nodes.reduce((s, x) => s + x.dependenciesActive, 0),
      forecastOffTrack: nodes.filter((x) => x.forecastOutcome === "off_track").length,
      forecastAtRisk: nodes.filter((x) => x.forecastOutcome === "at_risk").length,
      projectedConfidenceDelta: nodes.reduce(
        (s, x) => s + x.projectedConfidenceDelta,
        0,
      ),
      childCount: nodes.length,
      children: nodes,
      criticalPathProjectIds: nodes
        .filter(
          (x) =>
            x.health === "Critical" ||
            x.dependenciesBroken > 0 ||
            x.forecastOutcome === "off_track",
        )
        .map((x) => x.id),
    };
  }

  const byProgramme = new Map<string, typeof projectNodes>();
  for (const p of projectNodes) {
    const key = p.programmeId?.trim() || "unassigned";
    const list = byProgramme.get(key) ?? [];
    list.push(p);
    byProgramme.set(key, list);
  }

  const programmeNodes = [...byProgramme.entries()].map(([pid, nodes]) => {
    const meta = programmes.find((p) => p.id === pid);
    const rolled = rollup(
      nodes,
      "programme",
      pid,
      meta?.name ?? (pid === "unassigned" ? "Unassigned" : pid),
    );
    return {
      ...rolled,
      strategicInitiativeId: meta?.strategicInitiativeId,
      strategicImportance: meta?.strategicImportance,
      status: meta?.status,
    };
  });

  const byInitiative = new Map<string, typeof programmeNodes>();
  for (const prog of programmeNodes) {
    const key =
      prog.strategicInitiativeId ||
      (prog.id === "unassigned" ? "enterprise-default" : "unassigned-initiative");
    const list = byInitiative.get(key) ?? [];
    list.push(prog);
    byInitiative.set(key, list);
  }

  const initiativeNodes = [...byInitiative.entries()].map(([iid, progs]) => {
    const meta = initiatives.find((i) => i.id === iid);
    const flat = progs.flatMap((p) => p.children);
    return {
      ...rollup(flat, "initiative", iid, meta?.name ?? iid),
      programmes: progs,
      status: meta?.status,
      sponsorUserId: meta?.sponsorUserId,
    };
  });

  const activeObjectives = objectives.filter((o) => !o.archivedAt);
  const objectiveSummary = {
    total: activeObjectives.length,
    onTrack: activeObjectives.filter((o) => o.status === "on_track").length,
    atRisk: activeObjectives.filter((o) => o.status === "at_risk").length,
    offTrack: activeObjectives.filter((o) => o.status === "off_track").length,
    achieved: activeObjectives.filter((o) => o.status === "achieved").length,
    items: activeObjectives.slice(0, 12).map((o) => ({
      id: o.id,
      name: o.name,
      status: o.status,
      progress: o.progress,
      contributingProjectIds: o.contributingProjectIds,
    })),
  };

  const enterpriseRollup = rollup(
    projectNodes,
    "enterprise",
    "enterprise",
    "Enterprise Portfolio",
  );

  const deliveryTrend = {
    slippedMilestonesDelta: enterpriseRollup.healthDistribution.critical,
    agedWaitsDelta: Math.min(enterpriseRollup.waitingAged, 9),
    confidenceDelta: enterpriseRollup.confidenceScore >= 75 ? 0 : -1,
    direction: enterpriseRollup.healthTrend,
  };

  const operationalSummary = {
    pressureStatement: `Portfolio health ${enterpriseRollup.health} · Confidence ${enterpriseRollup.confidenceScore} (${enterpriseRollup.confidenceBand}) · ${enterpriseRollup.exceptionsCritical} critical exceptions · ${enterpriseRollup.waitingAged} aged waits`,
    decisionCount: projectNodes.reduce((s, p) => s + (p.exceptionsOpen > 0 ? 1 : 0), 0),
  };

  const enterprise = {
    ...enterpriseRollup,
    initiatives: initiativeNodes,
    objectives: objectiveSummary,
    deliveryTrend,
    operationalSummary,
    forecastOutlook: {
      offTrack: enterpriseRollup.forecastOffTrack,
      atRisk: enterpriseRollup.forecastAtRisk,
      projectedConfidenceDelta: enterpriseRollup.projectedConfidenceDelta,
    },
  };

  if (level === "project") {
    return jsonDataResponse({ level, items: projectNodes }, context.tracing);
  }
  if (level === "programme") {
    return jsonDataResponse({ level, items: programmeNodes }, context.tracing);
  }
  if (level === "initiative") {
    return jsonDataResponse({ level, items: initiativeNodes }, context.tracing);
  }
  return jsonDataResponse({ level: "enterprise", item: enterprise }, context.tracing);
}
