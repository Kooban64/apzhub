import type { NextRequest } from "next/server";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { getDefectRuntime } from "@/lib/qep/defect-runtime";
import { getQepAutomationRuntime } from "@/lib/qep/automation-runtime";
import { getTestManagementService } from "@/lib/qep/test-management-runtime";
import {
  requireQepPermission,
  sessionHasQepPermission,
  sessionTenantId,
} from "./require-qep-permission";
import { assertQepHttpEnabled } from "./qep";

type RouteContext = { params: Promise<Record<string, string>> };

function actorId(context: PlatformApiRequestContext): string {
  return context.serviceContext.userId;
}

function actorFromContext(context: PlatformApiRequestContext) {
  return {
    userId: context.serviceContext.userId,
    tenantId: context.serviceContext.tenantId,
    permissions: context.serviceContext.permissions,
  };
}

function mapError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) throw error;
  if (error instanceof PlatformServiceError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "FORBIDDEN" || error.code === "PERMISSION_DENIED"
          ? 403
          : error.code === "CONFLICT"
            ? 409
            : 400;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (
    message.includes("mismatch") ||
    message.includes("required") ||
    message.includes("empty") ||
    message.includes("invalid") ||
    message.includes("secrets") ||
    message.includes("unbound") ||
    message.includes("eligibility") ||
    message.includes("not_allowed")
  ) {
    throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
  }
  throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
}

async function requireApplication(
  tenantId: string,
  applicationId: string,
): Promise<string> {
  try {
    const app = await getApplicationService().get(tenantId, applicationId);
    return app.id;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
}

async function requireExecutionGateway() {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.qepEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "QEP_SERVICE_UNAVAILABLE",
      message: "QEP platform services are not enabled",
    });
  }
  const gateway = await getPlatformServiceGateway();
  return gateway.qep.executions;
}

async function readJson(request: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "invalid_json",
    });
  }
}

function collection<T>(context: PlatformApiRequestContext, items: readonly T[]) {
  return jsonCollectionResponse(
    items,
    { cursor: null, nextCursor: null, limit: items.length, hasMore: false },
    context.tracing,
  );
}

export async function handleListPresentedExecutions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const canReadTe = sessionHasQepPermission(context, "qep.execution.read");
  const canReadWs = sessionHasQepPermission(context, "qep.execution_workspace.read");
  if (!canReadTe && !canReadWs) {
    requireQepPermission(context, "qep.execution.read", "qep.execution_workspace.read");
  }
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const applicationId = request.nextUrl.searchParams.get("applicationId")?.trim();
  if (!applicationId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "applicationId is required",
    });
  }
  await requireApplication(tenantId, applicationId);
  try {
    const items = await getTestManagementService().listPresentedExecutions({
      tenantId,
      applicationId,
      includeUnbound: request.nextUrl.searchParams.get("includeUnbound") === "true",
    });
    const visible = items.filter((row) => {
      if (row.engine === "test_execution") return canReadTe;
      if (row.engine === "workspace_session") return canReadWs;
      return false;
    });
    return collection(context, visible);
  } catch (error) {
    mapError(error);
  }
}

async function instantiateTestExecution(input: {
  readonly context: PlatformApiRequestContext;
  readonly applicationId: string;
  readonly planId: string;
  readonly specificationId: string;
  readonly mode: "manual" | "automated";
  readonly environmentId?: string;
  readonly previousExecutionId?: string;
  readonly relationKind?: "rerun" | "retest";
  readonly triggeringDefectId?: string;
}) {
  const tenantId = sessionTenantId(input.context);
  const service = getTestManagementService();
  const testCase = await service.getTestCase(tenantId, input.specificationId);
  if (!testCase.applicationId) throw new Error("test_case.unbound");
  if (testCase.applicationId !== input.applicationId) {
    throw new Error("test_management.application_mismatch");
  }
  const executions = await requireExecutionGateway();
  const created = await executions.createExecution(input.context.serviceContext, {
    projectId: input.applicationId,
    workspaceId: `qep:${input.applicationId}`,
    mode: input.mode,
    sourceRefs: {
      specRef: {
        capability: "test_specification",
        id: testCase.id,
        versionLabel: String(testCase.definitionVersion),
      },
      planRef: {
        capability: "test_plan",
        id: input.planId,
        versionLabel: "1",
      },
    },
    ownerId: actorId(input.context),
    context: {
      applicationId: input.applicationId,
      ...(input.environmentId ? { environmentId: input.environmentId } : {}),
    },
  });
  await service.bindTestExecutionApplication(tenantId, created.id, input.applicationId);
  await service.freezeExecutionStart({
    tenantId,
    executionId: created.id,
    executionKind: "test_execution",
    specificationId: testCase.id,
    planId: input.planId,
  });
  const definition = await service.getDefinitionSnapshot(
    tenantId,
    created.id,
    testCase.id,
  );
  if (!definition) throw new Error("definition_snapshot.required");
  const steps = definition.steps.map((step) => ({
    order: step.order,
    instruction: step.action,
    expectedResult: step.expectedResult,
    ...(step.testDataRef ? { testDataRef: step.testDataRef } : {}),
    requireActualResult: true,
    allowUnordered: false,
  }));
  let current = await executions.prepareExecution(
    input.context.serviceContext,
    created.id,
    {
      expectedRevision: created.revision,
      resolved: { steps, preconditions: [...testCase.preconditions] },
    },
  );
  current = await executions.assignExecutor(input.context.serviceContext, current.id, {
    expectedRevision: current.revision,
    executorId: actorId(input.context),
  });
  current = await executions.startExecution(input.context.serviceContext, current.id, {
    expectedRevision: current.revision,
  });
  if (input.relationKind && input.previousExecutionId) {
    await service.recordRelation({
      tenantId,
      executionId: current.id,
      relationKind: input.relationKind,
      previousExecutionId: input.previousExecutionId,
      ...(input.triggeringDefectId
        ? { triggeringDefectId: input.triggeringDefectId }
        : {}),
      actorId: actorId(input.context),
    });
  }
  return current;
}

export async function handleStartPlanExecution(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.execution.create");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const planId = params.planId?.trim();
  if (!planId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "planId is required",
    });
  }
  const tenantId = sessionTenantId(context);
  try {
    const scope = await getTestManagementService().resolvePlanExecutionScope({
      tenantId,
      planId,
    });
    await requireApplication(tenantId, scope.applicationId);
    const capability = scope.strategy?.verificationCapability;
    const mode =
      capability && capability !== "manual_verification" ? "automated" : "manual";
    const created = [];
    for (const specificationId of scope.memberSpecificationIds) {
      created.push(
        await instantiateTestExecution({
          context,
          applicationId: scope.applicationId,
          planId,
          specificationId,
          mode,
          ...(scope.strategy?.environmentId
            ? { environmentId: scope.strategy.environmentId }
            : {}),
        }),
      );
    }
    return jsonDataResponse(
      { executions: created, count: created.length },
      context.tracing,
      {
        status: 201,
      },
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetExecutionInvestigation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.execution.read", "qep.execution_workspace.read");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const executionId = params.executionId?.trim();
  if (!executionId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "executionId is required",
    });
  }
  const tenantId = sessionTenantId(context);
  try {
    const service = getTestManagementService();
    const executions = await requireExecutionGateway();
    let testExecution = null;
    try {
      testExecution = await executions.get(context.serviceContext, executionId);
    } catch {
      testExecution = null;
    }
    const presented =
      (await service.getPresentedExecution(tenantId, executionId)) ??
      (testExecution
        ? (
            await service.listPresentedExecutions({
              tenantId,
              applicationId: testExecution.projectId,
              includeUnbound: true,
            })
          ).find((row) => row.id === executionId)
        : undefined);
    if (
      presented?.engine === "test_execution" &&
      !sessionHasQepPermission(context, "qep.execution.read")
    ) {
      throw new PlatformApiHttpError(403, {
        code: "FORBIDDEN",
        message: "Missing permission: qep.execution.read",
      });
    }
    if (
      presented?.engine === "workspace_session" &&
      !sessionHasQepPermission(context, "qep.execution_workspace.read")
    ) {
      throw new PlatformApiHttpError(403, {
        code: "FORBIDDEN",
        message: "Missing permission: qep.execution_workspace.read",
      });
    }
    const specificationId = presented?.specificationId ?? testExecution?.specRef?.id;
    const applicationId = presented?.applicationId ?? testExecution?.projectId;
    const [
      definition,
      scope,
      strategy,
      relation,
      automation,
      defectIds,
      testCase,
      history,
      listed,
    ] = await Promise.all([
      specificationId
        ? service.getDefinitionSnapshot(tenantId, executionId, specificationId)
        : Promise.resolve(undefined),
      service.getScopeSnapshot(tenantId, executionId),
      service.getStrategySnapshot(tenantId, executionId),
      service.getExecutionRelation(tenantId, executionId),
      service.listAutomationLinks(tenantId, executionId),
      service.listTestExecutionDefects(tenantId, executionId),
      specificationId
        ? service.getTestCase(tenantId, specificationId).catch(() => undefined)
        : Promise.resolve(undefined),
      testExecution
        ? executions.getHistory(context.serviceContext, executionId).catch(() => ({
            executionId,
            entries: [],
          }))
        : Promise.resolve({ executionId, entries: [] }),
      applicationId
        ? service.listPresentedExecutions({
            tenantId,
            applicationId,
            includeUnbound: true,
          })
        : Promise.resolve([]),
    ]);
    const successorRerun = listed
      .filter(
        (row) =>
          row.previousExecutionId === executionId && row.relationKind === "rerun",
      )
      .map((row) => row.id);
    const successorRetest = listed
      .filter(
        (row) =>
          row.previousExecutionId === executionId && row.relationKind === "retest",
      )
      .map((row) => row.id);
    const defects = [];
    for (const defectId of defectIds) {
      try {
        defects.push(
          await getDefectRuntime().service.get(actorFromContext(context), defectId),
        );
      } catch {
        /* Permission-filtered: do not leak defects the caller cannot read. */
      }
    }
    const canReadAutomation = sessionHasQepPermission(context, "qep.automation.read");
    const providerExecutions = [];
    if (canReadAutomation) {
      try {
        const runtime = getQepAutomationRuntime();
        for (const link of automation) {
          const provider = await runtime.getExecution(link.automationExecutionId);
          if (provider && provider.tenantId === tenantId) {
            providerExecutions.push({
              id: provider.executionId,
              providerId: provider.providerId,
              state: provider.state,
              correlationId: provider.correlationId,
              artifacts: (provider.artifacts ?? []).map((artifact) => ({
                artifactId: artifact.artifactId,
                kind: artifact.kind,
                name: artifact.name,
                contentType: artifact.contentType,
                ...(artifact.uri ? { uri: artifact.uri } : {}),
                ...(artifact.sha256 ? { sha256: artifact.sha256 } : {}),
              })),
              logRefs: (provider.artifacts ?? [])
                .filter((artifact) => artifact.kind === "log" && artifact.uri)
                .map((artifact) => ({ name: artifact.name, uri: artifact.uri })),
            });
          }
        }
      } catch {
        /* Provider sidecar is secondary; do not fail the customer investigation. */
      }
    }
    void request;
    return jsonDataResponse(
      {
        presented: presented ?? null,
        testExecution,
        definition: definition ?? null,
        scope: scope ?? null,
        strategy: strategy ?? null,
        relation: relation ?? null,
        automation,
        providerExecutions,
        testCase: testCase
          ? {
              id: testCase.id,
              number: testCase.number,
              title: testCase.title,
              priority: testCase.priority,
              type: testCase.type,
              preconditions: testCase.preconditions,
              criterionIds: testCase.criterionIds,
              suiteIds: testCase.suiteIds,
              unbound: testCase.unbound,
            }
          : null,
        history,
        defects,
        linkedRecords: {
          requirement: [],
          acceptanceCriteria: testCase?.criterionIds ?? [],
          testCase: specificationId ? [specificationId] : [],
          suite: testCase?.suiteIds ?? [],
          testPlan: presented?.planId ? [presented.planId] : [],
          execution: [
            executionId,
            ...(relation?.previousExecutionId ? [relation.previousExecutionId] : []),
            ...successorRerun,
            ...successorRetest,
          ],
          evidence: testExecution?.evidenceReferences?.map((ref) => ref.id) ?? [],
          defects: defectIds,
          rerun: relation?.relationKind === "rerun" ? [executionId] : successorRerun,
          retest: relation?.relationKind === "retest" ? [executionId] : successorRetest,
        },
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateRetest(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.execution.create");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const executionId = params.executionId?.trim() ?? "";
  const body = await readJson(request);
  const tenantId = sessionTenantId(context);
  try {
    const service = getTestManagementService();
    const investigationExecutions = await requireExecutionGateway();
    const original = await investigationExecutions.get(
      context.serviceContext,
      executionId,
    );
    if (!original) throw new Error("execution.not_found");
    if ((original.outcome ?? "") !== "failed") {
      throw new Error("retest.requires_failed_execution");
    }
    const defectId = String(body.defectId ?? "").trim();
    if (!defectId) throw new Error("retest.defect_required");
    const defectAgg = await getDefectRuntime().service.get(
      actorFromContext(context),
      defectId,
    );
    if (defectAgg.defect.status !== "ready_for_retest") {
      throw new Error("retest.eligibility.ready_for_retest");
    }
    const planId = original.planRef?.id ?? String(body.planId ?? "").trim();
    const specificationId = original.specRef?.id ?? "";
    if (!planId || !specificationId) throw new Error("retest.scope.required");
    const testCase = await service.getTestCase(tenantId, specificationId);
    if (!testCase.applicationId) throw new Error("test_case.unbound");
    const strategy = await service.getStrategySnapshot(tenantId, executionId);
    const created = await instantiateTestExecution({
      context,
      applicationId: testCase.applicationId,
      planId,
      specificationId,
      mode:
        original.mode === "automated" || original.mode === "imported"
          ? "automated"
          : "manual",
      ...(strategy?.environmentId ? { environmentId: strategy.environmentId } : {}),
      previousExecutionId: executionId,
      relationKind: "retest",
      triggeringDefectId: defectId,
    });
    return jsonDataResponse(
      {
        execution: created,
        originalOutcome: original.outcome,
        strategy: {
          environmentId: strategy?.environmentId,
          environmentName: strategy?.environmentName,
          method: strategy?.verificationCapability,
          targetType: strategy?.infrastructureTargetType,
        },
      },
      context.tracing,
      { status: 201 },
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateRerun(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.execution.create");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const executionId = params.executionId?.trim() ?? "";
  const tenantId = sessionTenantId(context);
  try {
    const service = getTestManagementService();
    const executions = await requireExecutionGateway();
    const original = await executions.get(context.serviceContext, executionId);
    if (!original) throw new Error("execution.not_found");
    const planId = original.planRef?.id ?? "";
    const specificationId = original.specRef?.id ?? "";
    if (!planId || !specificationId) throw new Error("rerun.scope.required");
    const testCase = await service.getTestCase(tenantId, specificationId);
    if (!testCase.applicationId) throw new Error("test_case.unbound");
    const strategy = await service.getStrategySnapshot(tenantId, executionId);
    const created = await instantiateTestExecution({
      context,
      applicationId: testCase.applicationId,
      planId,
      specificationId,
      mode:
        original.mode === "automated" || original.mode === "imported"
          ? "automated"
          : "manual",
      ...(strategy?.environmentId ? { environmentId: strategy.environmentId } : {}),
      previousExecutionId: executionId,
      relationKind: "rerun",
    });
    return jsonDataResponse(
      { execution: created, originalId: executionId },
      context.tracing,
      {
        status: 201,
      },
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleCorrelateAutomation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.execution.update", "qep.execution.ingest");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const executionId = params.executionId?.trim() ?? "";
  const body = await readJson(request);
  try {
    await getTestManagementService().correlateAutomation({
      tenantId: sessionTenantId(context),
      testExecutionId: executionId,
      automationExecutionId: String(body.automationExecutionId ?? ""),
      ...(typeof body.correlationId === "string"
        ? { correlationId: body.correlationId }
        : {}),
    });
    return jsonDataResponse({ correlated: true }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}
