/**
 * Quality Flow Workspace HTTP handlers — QX-P1-03.
 * Presentation over @apzhub/platform-orchestration. No new orchestration behaviour.
 */

import type { NextRequest } from "next/server";

import {
  isTerminalQualityFlowState,
  type QualityFlowInstance,
  type QualityFlowState,
} from "@apzhub/platform-orchestration";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getQepOrchestrationRuntime } from "@/lib/qep/orchestration-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

const WAITING_STATES: readonly QualityFlowState[] = [
  "awaiting_gates",
  "awaiting_approval",
  "recommendation_ready",
];

const EXCEPTION_STATES: readonly QualityFlowState[] = [
  "failed",
  "rejected",
  "timed_out",
  "cancelled",
  "superseded",
];

function refsMatch(ref: string | undefined, instance: QualityFlowInstance): boolean {
  if (!ref) return false;
  const trimmed = ref.trim();
  return (
    trimmed === instance.instanceId ||
    trimmed === instance.qualityFlowId ||
    trimmed === instance.flowDefinitionId ||
    trimmed.includes(instance.instanceId) ||
    trimmed.includes(instance.correlationId)
  );
}

function nextAction(instance: QualityFlowInstance): string {
  if (instance.paused) return "Resume the flow to continue progression";
  switch (instance.currentState) {
    case "registered":
      return "Advance to ready";
    case "ready":
      return "Trigger the flow";
    case "awaiting_gates":
      return "Resolve outstanding gates";
    case "awaiting_approval":
      return "Complete required approvals";
    case "recommendation_ready":
      return "Review Decision Package and conclude";
    case "failed":
      return "Retry from recovery point or cancel";
    case "completed":
      return "No action — flow completed";
    default:
      if (isTerminalQualityFlowState(instance.currentState)) {
        return "No action — terminal state";
      }
      return "Continue stage progression";
  }
}

async function projectInstance(instance: QualityFlowInstance) {
  const orch = await getQepOrchestrationRuntime();
  const decisions = orch.decisions
    .listDecisionPackages()
    .filter((p) => refsMatch(p.qualityFlowRef, instance));
  const approvals = orch.approvals
    .listBundles()
    .filter((b) => refsMatch(b.qualityFlowRef, instance));
  const evidencePackages = orch.evidenceIntegration
    .listEvidenceIntegrationPackages()
    .filter((p) => refsMatch(p.qualityFlowRef, instance));

  const outstandingApprovals = approvals.flatMap((b) =>
    orch.approvals.getOutstandingAuthorities(b.bundleId).map((authorityId) => ({
      bundleId: b.bundleId,
      authorityId,
      finalStatus: b.finalStatus,
    })),
  );

  const failedGates = decisions.flatMap((d) => {
    // Decision packages carry governance refs; gate detail via governance when available
    void d.governanceDecisionRef;
    return [] as string[];
  });

  const outstandingEvidence = evidencePackages.flatMap((p) =>
    p.integrationStatus === "partial" || p.integrationStatus === "empty"
      ? [...p.evidenceRefs, `status:${p.integrationStatus}`]
      : [],
  );

  const blockedRelease =
    instance.currentState === "awaiting_gates" ||
    instance.currentState === "awaiting_approval" ||
    instance.currentState === "failed" ||
    instance.currentState === "rejected" ||
    outstandingApprovals.length > 0;

  return {
    instance,
    status: orch.qualityFlows.getStatus(instance.instanceId),
    timeline: orch.qualityFlows.getHistory(instance.instanceId),
    allowedTransitions: orch.qualityFlows.allowedTransitions(instance.instanceId),
    nextAction: nextAction(instance),
    decisions,
    approvals,
    outstandingApprovals,
    evidencePackages,
    outstandingEvidence,
    failedGates,
    blockedRelease,
    waiting: WAITING_STATES.includes(instance.currentState) || instance.paused,
    exception: EXCEPTION_STATES.includes(instance.currentState),
  };
}

export async function handleQualityFlowCommandCentre(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.quality_flows.read");
  const orch = await getQepOrchestrationRuntime();
  const tenantId = sessionTenantId(context);

  let instances = orch.qualityFlows.listInstances();
  if (tenantId) {
    instances = instances.filter((i) => i.tenantId === tenantId);
  }

  const projected = await Promise.all(instances.map((i) => projectInstance(i)));
  const active = projected.filter(
    (p) => !isTerminalQualityFlowState(p.instance.currentState),
  );
  const waiting = projected.filter((p) => p.waiting);
  const exceptions = projected.filter((p) => p.exception);
  const blocked = projected.filter((p) => p.blockedRelease && !p.exception);

  const recentChanges = projected
    .flatMap((p) =>
      p.timeline.map((t) => ({
        instanceId: p.instance.instanceId,
        qualityFlowId: p.instance.qualityFlowId,
        ...t,
      })),
    )
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, 25);

  const decisions = orch.decisions
    .listDecisionPackages()
    .filter((d) => (tenantId ? d.tenantId === tenantId : true));

  return jsonDataResponse(
    {
      summary: {
        activeCount: active.length,
        waitingCount: waiting.length,
        exceptionCount: exceptions.length,
        blockedReleaseCount: blocked.length,
        decisionCount: decisions.length,
        definitionCount: orch.qualityFlows.listDefinitions().length,
      },
      active: active.map((p) => ({
        instanceId: p.instance.instanceId,
        qualityFlowId: p.instance.qualityFlowId,
        flowDefinitionId: p.instance.flowDefinitionId,
        definitionVersion: p.instance.definitionVersion,
        currentState: p.instance.currentState,
        paused: p.instance.paused,
        tenantId: p.instance.tenantId,
        projectId: p.instance.projectId,
        correlationId: p.instance.correlationId,
        createdAt: p.instance.createdAt,
        nextAction: p.nextAction,
        blockedRelease: p.blockedRelease,
        outstandingApprovalCount: p.outstandingApprovals.length,
        outstandingEvidenceCount: p.outstandingEvidence.length,
      })),
      waiting: waiting.map((p) => ({
        instanceId: p.instance.instanceId,
        qualityFlowId: p.instance.qualityFlowId,
        currentState: p.instance.currentState,
        paused: p.instance.paused,
        nextAction: p.nextAction,
        outstandingApprovals: p.outstandingApprovals,
      })),
      exceptions: exceptions.map((p) => ({
        instanceId: p.instance.instanceId,
        qualityFlowId: p.instance.qualityFlowId,
        currentState: p.instance.currentState,
        nextAction: p.nextAction,
      })),
      recentChanges,
      decisions: decisions.slice(0, 20),
    },
    context.tracing,
  );
}

export async function handleListQualityFlowInstances(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.quality_flows.read");
  const orch = await getQepOrchestrationRuntime();
  const tenantId = sessionTenantId(context);
  const filter = request.nextUrl.searchParams.get("filter"); // active|waiting|exceptions|all

  let instances = orch.qualityFlows.listInstances();
  if (tenantId) {
    instances = instances.filter((i) => i.tenantId === tenantId);
  }

  const projected = await Promise.all(instances.map((i) => projectInstance(i)));
  let rows = projected;
  if (filter === "active") {
    rows = projected.filter(
      (p) => !isTerminalQualityFlowState(p.instance.currentState),
    );
  } else if (filter === "waiting") {
    rows = projected.filter((p) => p.waiting);
  } else if (filter === "exceptions") {
    rows = projected.filter((p) => p.exception);
  }

  return jsonDataResponse(
    {
      instances: rows.map((p) => ({
        instanceId: p.instance.instanceId,
        qualityFlowId: p.instance.qualityFlowId,
        flowDefinitionId: p.instance.flowDefinitionId,
        definitionVersion: p.instance.definitionVersion,
        currentState: p.instance.currentState,
        previousState: p.instance.previousState,
        paused: p.instance.paused,
        tenantId: p.instance.tenantId,
        projectId: p.instance.projectId,
        correlationId: p.instance.correlationId,
        createdAt: p.instance.createdAt,
        completedAt: p.instance.completedAt,
        nextAction: p.nextAction,
        blockedRelease: p.blockedRelease,
        waiting: p.waiting,
        exception: p.exception,
      })),
    },
    context.tracing,
  );
}

export async function handleGetQualityFlowInstance(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.quality_flows.read");
  const params = await routeContext?.params;
  const instanceId = params?.instanceId;
  if (!instanceId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Missing instanceId",
    });
  }

  const orch = await getQepOrchestrationRuntime();
  const tenantId = sessionTenantId(context);
  try {
    const instance = orch.qualityFlows.getInstance(instanceId);
    if (instance.tenantId !== tenantId) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Quality Flow instance not found",
      });
    }
    const projected = await projectInstance(instance);
    const definition = orch.qualityFlows.getDefinition(
      instance.flowDefinitionId,
      instance.definitionVersion,
    );
    return jsonDataResponse(
      {
        ...projected,
        definition,
      },
      context.tracing,
    );
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message,
    });
  }
}

export async function handleListQualityFlowDefinitions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.quality_flows.read");
  const orch = await getQepOrchestrationRuntime();
  return jsonDataResponse(
    { definitions: orch.qualityFlows.listDefinitions() },
    context.tracing,
  );
}

export async function handleCreateQualityFlowInstance(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.quality_flows.operate");
  const body = (await request.json()) as {
    flowId?: string;
    definitionVersion?: string;
    triggerId?: string;
    correlationId?: string;
    tenantId?: string;
    projectId?: string;
    metadata?: Record<string, string>;
    /** Idempotent ensure of the built-in continuous certification definition. */
    ensureBuiltinDefinition?: boolean;
  };

  const orch = await getQepOrchestrationRuntime();
  const tenantId = sessionTenantId(context);
  const actor = context.serviceContext.userId ?? "quality-lead";

  try {
    if (body.ensureBuiltinDefinition) {
      const existing = orch.qualityFlows
        .listDefinitions()
        .find((d) => d.flowId === "qf_continuous_cert" && d.version === "1.0.0");
      if (!existing) {
        await orch.qualityFlows.registerDefinition({
          flowId: "qf_continuous_cert",
          name: "Continuous Certification",
          version: "1.0.0",
          description: "Governed continuous quality flow for enterprise releases",
          owner: "apzqep",
          supportedTriggerTypes: ["change.committed", "pipeline.completed", "manual"],
          supportedCapabilityStages: [
            "impact_correlation",
            "test_selection",
            "capability_coordination",
            "quality_gates",
            "human_approval",
            "release_recommendation",
          ],
          supportedPolicies: ["policy.change_impact"],
          supportedGates: ["gate.coverage"],
          lifecycleVersion: "1",
          documentationRef: "docs/products/apzqep/v1.1/apzqep-165-qo-004/",
          metadata: { domain: "quality", source: "quality-flow-workspace" },
        });
      }
    }

    const flowId = (body.flowId ?? "qf_continuous_cert").trim();
    const correlationId =
      body.correlationId?.trim() ||
      `corr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const triggerId = body.triggerId?.trim() || `trg_manual_${Date.now().toString(36)}`;

    const instance = await orch.qualityFlows.createInstance({
      flowId,
      definitionVersion: body.definitionVersion,
      triggerId,
      correlationId,
      tenantId,
      projectId: body.projectId,
      actor,
      metadata: body.metadata,
    });

    const projected = await projectInstance(instance);
    return jsonDataResponse({ ...projected }, context.tracing, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PlatformApiHttpError(400, {
      code: "QUALITY_FLOW_ERROR",
      message,
    });
  }
}

export async function handleQualityFlowInstanceAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.quality_flows.operate");
  const params = await routeContext?.params;
  const instanceId = params?.instanceId;
  if (!instanceId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Missing instanceId",
    });
  }

  const body = (await request.json()) as {
    action?: string;
    toState?: QualityFlowState;
    reason?: string;
    correlationId?: string;
  };

  const orch = await getQepOrchestrationRuntime();
  const tenantId = sessionTenantId(context);
  const existing = orch.qualityFlows.getInstance(instanceId);
  if (existing.tenantId !== tenantId) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Quality Flow instance not found",
    });
  }
  const actor = context.serviceContext.userId ?? "quality-lead";
  const reason = body.reason?.trim() || `workspace:${body.action ?? "action"}`;
  const correlationId = body.correlationId?.trim() || existing.correlationId;

  try {
    let instance: QualityFlowInstance;
    switch (body.action) {
      case "transition": {
        if (!body.toState) {
          throw new PlatformApiHttpError(400, {
            code: "VALIDATION_FAILED",
            message: "toState is required for transition",
          });
        }
        instance = await orch.qualityFlows.transition(instanceId, {
          toState: body.toState,
          actor,
          reason,
          correlationId,
        });
        break;
      }
      case "pause":
        instance = await orch.qualityFlows.pause(
          instanceId,
          actor,
          reason,
          correlationId,
        );
        break;
      case "resume":
        instance = await orch.qualityFlows.resume(
          instanceId,
          actor,
          reason,
          correlationId,
        );
        break;
      case "cancel":
        instance = await orch.qualityFlows.cancel(
          instanceId,
          actor,
          reason,
          correlationId,
        );
        break;
      case "fail":
        instance = await orch.qualityFlows.fail(
          instanceId,
          actor,
          reason,
          correlationId,
        );
        break;
      case "retry":
        instance = await orch.qualityFlows.retry(
          instanceId,
          actor,
          reason,
          correlationId,
        );
        break;
      default:
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_FAILED",
          message: "Unknown action",
        });
    }

    const projected = await projectInstance(instance);
    return jsonDataResponse(projected, context.tracing);
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    const message = error instanceof Error ? error.message : String(error);
    throw new PlatformApiHttpError(400, {
      code: "QUALITY_FLOW_ERROR",
      message,
    });
  }
}
