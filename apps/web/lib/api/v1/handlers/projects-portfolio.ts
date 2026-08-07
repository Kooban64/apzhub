/**
 * Portfolio Projection — W005 operational roll-up (Slice 3 Priority 4).
 * Hierarchy: Project → Programme → Initiative → Enterprise Portfolio.
 */

import type { NextRequest } from "next/server";

import {
  createProjectsDeliveryService,
  createProjectsLifecycleService,
  createProjectsOperationalService,
  getMemoryProjectsDeliveryStore,
  getMemoryProjectsLifecycleStore,
  getMemoryProjectsOperationalStore,
  setProjectsDeliveryStoreForTests,
  setProjectsLifecycleStoreForTests,
  setProjectsOperationalStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonDataResponse } from "../response";

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

function registers() {
  const d = delivery();
  return {
    listRisks: d.listRisks.bind(d),
    listMilestones: d.listMilestones.bind(d),
  };
}

type NodeLevel = "project" | "programme" | "initiative" | "enterprise";

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

  const projectNodes = await Promise.all(
    listed.items.map(async (project) => {
      const [health, confidence, forecast, waiting, deps, exceptions, lc] =
        await Promise.all([
          o.getHealth(context.serviceContext, project.id, reg),
          o.getConfidence(context.serviceContext, project.id, reg),
          o.getForecast(context.serviceContext, project.id, 14, reg),
          o.listWaiting(context.serviceContext, project.id),
          o.listDependencies(context.serviceContext, project.id),
          o.listExceptions(context.serviceContext, project.id),
          life.getLifecycle(context.serviceContext, project.id),
        ]);
      const activeWaits = waiting.filter((w) => w.status === "active");
      const brokenDeps = deps.filter((d) => d.status === "broken");
      const openEx = exceptions.filter((e) => e.status !== "concluded");
      return {
        level: "project" as const,
        id: project.id,
        name: project.name,
        identifier: project.identifier,
        programmeId: lc?.programmeId,
        health: health.status,
        confidenceScore: confidence.score,
        confidenceBand: confidence.band,
        exceptionsOpen: openEx.length,
        exceptionsCritical: openEx.filter((e) => e.severity === "critical").length,
        waitingActive: activeWaits.length,
        waitingAged: activeWaits.filter((w) => {
          const age = Math.floor((Date.now() - Date.parse(w.since)) / 86400000);
          return age > (w.slaDays || 7);
        }).length,
        dependenciesBroken: brokenDeps.length,
        dependenciesActive: deps.filter((d) => d.status === "active").length,
        forecastOutcome: forecast.predictedOutcome,
        projectedConfidenceDelta: forecast.projectedConfidenceDelta,
      };
    }),
  );

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
    const meanConf = Math.round(nodes.reduce((s, x) => s + x.confidenceScore, 0) / n);
    return {
      level: nodeLevel,
      id,
      name,
      health: critical > 0 ? "Critical" : watch > 0 ? "Watch" : ("Healthy" as const),
      healthDistribution: { healthy, watch, critical },
      confidenceScore: nodes.length ? meanConf : 0,
      confidenceBand:
        meanConf >= 75 ? "High" : meanConf >= 45 ? "Medium" : ("Low" as const),
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
    };
  }

  // Group projects by programme → initiative (programme prefix) → enterprise
  const byProgramme = new Map<string, typeof projectNodes>();
  for (const p of projectNodes) {
    const key = p.programmeId?.trim() || "unassigned";
    const list = byProgramme.get(key) ?? [];
    list.push(p);
    byProgramme.set(key, list);
  }

  const programmes = [...byProgramme.entries()].map(([pid, nodes]) =>
    rollup(nodes, "programme", pid, pid === "unassigned" ? "Unassigned" : pid),
  );

  // Initiative: group programmes by first path segment of id (placeholder hierarchy)
  const byInitiative = new Map<string, typeof programmes>();
  for (const prog of programmes) {
    const key =
      prog.id === "unassigned" ? "enterprise-default" : prog.id.split("/")[0]!;
    const list = byInitiative.get(key) ?? [];
    list.push(prog);
    byInitiative.set(key, list);
  }

  const initiatives = [...byInitiative.entries()].map(([iid, progs]) => {
    const flat = progs.flatMap((p) => p.children);
    return {
      ...rollup(flat, "initiative", iid, iid),
      programmes: progs,
    };
  });

  const enterprise = {
    ...rollup(projectNodes, "enterprise", "enterprise", "Enterprise Portfolio"),
    initiatives,
  };

  if (level === "project") {
    return jsonDataResponse({ level, items: projectNodes }, context.tracing);
  }
  if (level === "programme") {
    return jsonDataResponse({ level, items: programmes }, context.tracing);
  }
  if (level === "initiative") {
    return jsonDataResponse({ level, items: initiatives }, context.tracing);
  }
  return jsonDataResponse({ level: "enterprise", item: enterprise }, context.tracing);
}
