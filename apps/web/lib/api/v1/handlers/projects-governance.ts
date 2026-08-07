/**
 * Organisation Governance Administration — W010 / P3.
 */

import type { NextRequest } from "next/server";

import type {
  CreateOperationalPolicyInput,
  CreateOrgGovernanceProfileInput,
  OperationalPolicyArea,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsGovernanceService,
  createProjectsOperationalService,
  createProjectsPortfolioService,
  getMemoryProjectsGovernanceStore,
  getMemoryProjectsOperationalStore,
  getMemoryProjectsPortfolioStore,
  setProjectsGovernanceStoreForTests,
  setProjectsOperationalStoreForTests,
  setProjectsPortfolioStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function governance() {
  try {
    return createProjectsGovernanceService(undefined, {
      loadImpact: async (ctx, profileId) => {
        const pf = portfolio();
        const [programmes, initiatives, enterprise] = await Promise.all([
          pf.listProgrammes(ctx),
          pf.listInitiatives(ctx),
          pf.getEnterprise(ctx),
        ]);
        const withProfile = programmes.filter(
          (p) => p.governanceProfileId === profileId,
        );
        const iniWith = initiatives.filter((i) => i.governanceProfileId === profileId);
        const projectIds = withProfile.flatMap((p) => [...p.memberProjectIds]);
        return {
          portfolioCount: enterprise ? 1 : 0,
          initiativeCount: iniWith.length,
          projectCount: projectIds.length,
          programmeCount: withProfile.length,
          sampleProjectIds: projectIds.slice(0, 5),
          sampleProgrammeIds: withProfile.map((p) => p.id).slice(0, 5),
        };
      },
    });
  } catch {
    setProjectsGovernanceStoreForTests(getMemoryProjectsGovernanceStore());
    return createProjectsGovernanceService(getMemoryProjectsGovernanceStore());
  }
}

function portfolio() {
  try {
    return createProjectsPortfolioService();
  } catch {
    setProjectsPortfolioStoreForTests(getMemoryProjectsPortfolioStore());
    return createProjectsPortfolioService(getMemoryProjectsPortfolioStore());
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

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  if (message.includes("simulation_confirmation_required")) {
    return {
      status: 400,
      code: "SIMULATION_REQUIRED",
      message: "Publish requires confirmSimulation after running simulation.",
    };
  }
  return { status: 400, code: "VALIDATION_ERROR", message };
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleListOrgProfiles(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await governance().listOrgProfiles(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateOrgProfile(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateOrgGovernanceProfileInput = {
      key: String(body.key ?? ""),
      name: String(body.name ?? ""),
      requiresHoldDecision: Boolean(body.requiresHoldDecision),
      requiresClosureApproval: Boolean(body.requiresClosureApproval),
      requiresEvidenceOnClose:
        typeof body.requiresEvidenceOnClose === "boolean"
          ? body.requiresEvidenceOnClose
          : undefined,
      initiationRequiresMilestone:
        typeof body.initiationRequiresMilestone === "boolean"
          ? body.initiationRequiresMilestone
          : undefined,
      milestoneDateToleranceDays:
        typeof body.milestoneDateToleranceDays === "number"
          ? body.milestoneDateToleranceDays
          : undefined,
      waitingBreachEscalationDays:
        typeof body.waitingBreachEscalationDays === "number"
          ? body.waitingBreachEscalationDays
          : undefined,
    };
    const item = await governance().createProfile(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleSimulateProfilePublish(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const profileId = String((await routeContext?.params)?.profileId ?? "");
  try {
    const item = await governance().simulateProfilePublish(
      context.serviceContext,
      profileId,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handlePublishProfile(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const profileId = String((await routeContext?.params)?.profileId ?? "");
  const body = await readBody(request);
  try {
    const item = await governance().publishProfile(context.serviceContext, profileId, {
      confirmSimulation: Boolean(body?.confirmSimulation),
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListPolicies(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await governance().listPolicies(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreatePolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const areas = Array.isArray(body.areas)
      ? body.areas.filter((x): x is OperationalPolicyArea => typeof x === "string")
      : [];
    const input: CreateOperationalPolicyInput = {
      key: String(body.key ?? ""),
      name: String(body.name ?? ""),
      areas,
      rules:
        body.rules && typeof body.rules === "object"
          ? (body.rules as Record<string, unknown>)
          : undefined,
    };
    const item = await governance().createPolicy(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleSimulatePolicyPublish(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const policyId = String((await routeContext?.params)?.policyId ?? "");
  try {
    const item = await governance().simulatePolicyPublish(
      context.serviceContext,
      policyId,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handlePublishPolicy(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const policyId = String((await routeContext?.params)?.policyId ?? "");
  const body = await readBody(request);
  try {
    const item = await governance().publishPolicy(context.serviceContext, policyId, {
      confirmSimulation: Boolean(body?.confirmSimulation),
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleGetEffectiveGovernance(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const scopeType = String(url.searchParams.get("scopeType") ?? "project");
  const scopeId = String(url.searchParams.get("scopeId") ?? "");
  const boundProfileId = url.searchParams.get("boundProfileId") ?? undefined;
  const parentProfileId = url.searchParams.get("parentProfileId") ?? undefined;
  try {
    const item = await governance().getEffectiveConfig(context.serviceContext, {
      scopeType: scopeType as never,
      scopeId,
      boundProfileId,
      parentProfileId,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleGetGovernanceCompliance(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const scopeType = String(url.searchParams.get("scopeType") ?? "project");
  const scopeId = String(url.searchParams.get("scopeId") ?? "");
  try {
    const item = await governance().computeCompliance(context.serviceContext, {
      scopeType: scopeType as never,
      scopeId,
      openCriticalExceptions: Number(
        url.searchParams.get("openCriticalExceptions") ?? 0,
      ),
      openMajorExceptions: Number(url.searchParams.get("openMajorExceptions") ?? 0),
      overdueCheckpoints: Number(url.searchParams.get("overdueCheckpoints") ?? 0),
      missingEvidence: Number(url.searchParams.get("missingEvidence") ?? 0),
      unauthorisedOverrides: Number(url.searchParams.get("unauthorisedOverrides") ?? 0),
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleGetGovernanceAdminSummary(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const item = await governance().getAdminSummary(context.serviceContext);
    const pf = portfolio();
    const o = ops();
    const [programmes, initiatives, enterprise] = await Promise.all([
      pf.listProgrammes(context.serviceContext),
      pf.listInitiatives(context.serviceContext),
      pf.getEnterprise(context.serviceContext),
    ]);

    let gatewayProjects: readonly { id: string }[] = [];
    try {
      const gateway = await getPlatformServiceGateway();
      const listed = await gateway.projects.listProjects(context.serviceContext, {
        page: { page: 1, perPage: 80 },
        filter: { status: "active" },
      });
      gatewayProjects = listed.items;
    } catch {
      gatewayProjects = [];
    }

    const complianceRollup = {
      Compliant: 0,
      Advisory: 0,
      "Non-Compliant": 0,
      Critical: 0,
    };
    let overrideCount = 0;
    let governanceExceptionCount = 0;
    let delegationCount = 0;

    const scopeSignals: {
      scopeType: "project" | "programme" | "initiative" | "portfolio";
      scopeId: string;
      openCriticalExceptions: number;
      openMajorExceptions: number;
      overdueCheckpoints: number;
      missingEvidence: number;
      unauthorisedOverrides: number;
    }[] = [];

    for (const project of gatewayProjects) {
      const [exceptions, checkpoints] = await Promise.all([
        o.listExceptions(context.serviceContext, project.id),
        o.listCheckpoints(context.serviceContext, project.id),
      ]);
      const open = exceptions.filter((e) => e.status !== "concluded");
      const critical = open.filter((e) => e.severity === "critical").length;
      const major = open.filter((e) => e.severity === "major").length;
      const overdue = checkpoints.filter(
        (c) =>
          c.status !== "approved" &&
          c.status !== "waived" &&
          c.dueAt &&
          new Date(c.dueAt).getTime() < Date.now(),
      ).length;
      const waived = checkpoints.filter((c) => c.status === "waived").length;
      overrideCount += waived;
      governanceExceptionCount += open.filter(
        (e) =>
          e.type === "checkpoint_rejected" ||
          e.type === "wait_breach" ||
          e.type === "date_exception",
      ).length;
      scopeSignals.push({
        scopeType: "project",
        scopeId: project.id,
        openCriticalExceptions: critical,
        openMajorExceptions: major,
        overdueCheckpoints: overdue,
        missingEvidence: 0,
        unauthorisedOverrides: waived,
      });
    }

    for (const programme of programmes) {
      const memberSignals = scopeSignals.filter(
        (s) =>
          s.scopeType === "project" && programme.memberProjectIds.includes(s.scopeId),
      );
      scopeSignals.push({
        scopeType: "programme",
        scopeId: programme.id,
        openCriticalExceptions: memberSignals.reduce(
          (n, s) => n + s.openCriticalExceptions,
          0,
        ),
        openMajorExceptions: memberSignals.reduce(
          (n, s) => n + s.openMajorExceptions,
          0,
        ),
        overdueCheckpoints: memberSignals.reduce((n, s) => n + s.overdueCheckpoints, 0),
        missingEvidence: 0,
        unauthorisedOverrides: memberSignals.reduce(
          (n, s) => n + s.unauthorisedOverrides,
          0,
        ),
      });
      if (programme.ownerUserId) delegationCount += 1;
    }

    for (const initiative of initiatives) {
      const childProgrammes = programmes.filter(
        (p) => p.strategicInitiativeId === initiative.id,
      );
      const childSignals = scopeSignals.filter(
        (s) =>
          s.scopeType === "programme" &&
          childProgrammes.some((p) => p.id === s.scopeId),
      );
      scopeSignals.push({
        scopeType: "initiative",
        scopeId: initiative.id,
        openCriticalExceptions: childSignals.reduce(
          (n, s) => n + s.openCriticalExceptions,
          0,
        ),
        openMajorExceptions: childSignals.reduce(
          (n, s) => n + s.openMajorExceptions,
          0,
        ),
        overdueCheckpoints: childSignals.reduce((n, s) => n + s.overdueCheckpoints, 0),
        missingEvidence: 0,
        unauthorisedOverrides: childSignals.reduce(
          (n, s) => n + s.unauthorisedOverrides,
          0,
        ),
      });
    }

    if (enterprise) {
      const initiativeSignals = scopeSignals.filter(
        (s) => s.scopeType === "initiative",
      );
      scopeSignals.push({
        scopeType: "portfolio",
        scopeId: enterprise.id,
        openCriticalExceptions: initiativeSignals.reduce(
          (n, s) => n + s.openCriticalExceptions,
          0,
        ),
        openMajorExceptions: initiativeSignals.reduce(
          (n, s) => n + s.openMajorExceptions,
          0,
        ),
        overdueCheckpoints: initiativeSignals.reduce(
          (n, s) => n + s.overdueCheckpoints,
          0,
        ),
        missingEvidence: 0,
        unauthorisedOverrides: initiativeSignals.reduce(
          (n, s) => n + s.unauthorisedOverrides,
          0,
        ),
      });
    }

    for (const signal of scopeSignals) {
      const band = (
        await governance().computeCompliance(context.serviceContext, signal)
      ).band;
      complianceRollup[band] += 1;
    }

    return jsonDataResponse(
      {
        ...item,
        complianceRollup,
        overrideCount,
        delegationCount,
        governanceExceptionCount,
      },
      context.tracing,
    );
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}
