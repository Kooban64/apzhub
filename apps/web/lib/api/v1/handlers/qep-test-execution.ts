/**
 * QEP Test Execution HTTP handlers (APZQEP-ENG-100D, OES-ENG-090A PART-04) —
 * presentation only. Business logic lives in the Test Execution Application
 * services (`@apzhub/qep-test-execution`); this layer parses/validates HTTP
 * input and translates platform errors to HTTP responses.
 */

import type { NextRequest } from "next/server";

import { PlatformServiceError } from "@apzhub/platform-service-contracts";
import {
  performQepTestExecutionAction,
  type ExecutionActionKey,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepExecutionActionBodySchema,
  qepExecutionActionParamSchema,
  qepExecutionAssociateEvidenceBodySchema,
  qepExecutionCreateBodySchema,
  qepExecutionIdParamSchema,
  qepExecutionIngestBodySchema,
  qepExecutionListQuerySchema,
  qepExecutionPlanIdParamSchema,
  qepExecutionRecordObservationBodySchema,
  qepExecutionRecordStepResultBodySchema,
  qepExecutionStepOrderParamSchema,
} from "../schemas/qep-test-execution";
import { captureExecutionSnapshots } from "@/lib/qep/capture-execution-snapshots";
import { requireQepProjectMembership } from "@/lib/qep/project-acl";
import { getTestManagementService } from "@/lib/qep/test-management-runtime";

type RouteContext = { params: Promise<Record<string, string>> };

async function param(
  routeContext: RouteContext | undefined,
  name: string,
  schema: typeof qepExecutionIdParamSchema,
): Promise<string> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(schema, params[name] ?? "", name);
}

function listPage(total: number, limit: number, offset: number) {
  return {
    cursor: null,
    nextCursor: null,
    limit,
    offset,
    total,
    hasMore: offset + limit < total,
  };
}

async function requireQepTestExecutionGateway() {
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

function mapHandlerError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) {
    throw error;
  }
  if (error instanceof PlatformServiceError) {
    const status =
      error.code === "NOT_FOUND"
        ? 404
        : error.code === "FORBIDDEN" || error.code === "PERMISSION_DENIED"
          ? 403
          : error.code === "CONFLICT"
            ? 409
            : error.code === "VALIDATION_FAILED"
              ? 400
              : 503;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function invoke<T>(
  _context: PlatformApiRequestContext,
  fn: () => Promise<T>,
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    mapHandlerError(error);
  }
}

export async function handleListQepExecutions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepExecutionListQuerySchema, request.nextUrl.searchParams);
  await requireQepProjectMembership(context, query.projectId);
  const service = await requireQepTestExecutionGateway();
  const limit = query.limit ?? query.perPage;
  const offset = query.offset ?? 0;
  const items = await invoke(context, () =>
    service.list(context.serviceContext, {
      status: query.status,
      assigneeId: query.assigneeId,
      reviewerId: query.reviewerId,
      ownerId: query.ownerId,
      planId: query.planId,
      specId: query.specId,
      projectId: query.projectId,
      workspaceId: query.workspaceId,
      reviewQueue: query.reviewQueue === "true",
      limit,
      offset,
    }),
  );
  return jsonCollectionResponse(
    items,
    listPage(items.length, limit ?? items.length, offset),
    context.tracing,
  );
}

export async function handleCreateQepExecution(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    qepExecutionCreateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  await requireQepProjectMembership(context, body.projectId);
  const service = await requireQepTestExecutionGateway();
  const created = await invoke(context, () =>
    service.createExecution(context.serviceContext, body),
  );
  await captureExecutionSnapshots({
    tenantId: context.serviceContext.tenantId,
    executionId: created.id,
    executionKind: "test_execution",
    ...(body.sourceRefs.specRef?.id
      ? { specificationId: body.sourceRefs.specRef.id }
      : {}),
    ...(body.sourceRefs.planRef?.id ? { planId: body.sourceRefs.planRef.id } : {}),
  });
  return jsonDataResponse(created, context.tracing, { status: 201 });
}

export async function handleListQepAssignedExecutions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepExecutionListQuerySchema, request.nextUrl.searchParams);
  await requireQepProjectMembership(context, query.projectId);
  const service = await requireQepTestExecutionGateway();
  const limit = query.limit ?? query.perPage;
  const offset = query.offset ?? 0;
  const items = await invoke(context, () =>
    service.listAssigned(context.serviceContext, {
      status: query.status,
      reviewerId: query.reviewerId,
      ownerId: query.ownerId,
      planId: query.planId,
      specId: query.specId,
      projectId: query.projectId,
      workspaceId: query.workspaceId,
      reviewQueue: query.reviewQueue === "true",
      limit,
      offset,
    }),
  );
  return jsonCollectionResponse(
    items,
    listPage(items.length, limit ?? items.length, offset),
    context.tracing,
  );
}

export async function handleListQepReviewQueueExecutions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(qepExecutionListQuerySchema, request.nextUrl.searchParams);
  await requireQepProjectMembership(context, query.projectId);
  const service = await requireQepTestExecutionGateway();
  const limit = query.limit ?? query.perPage;
  const offset = query.offset ?? 0;
  const items = await invoke(context, () =>
    service.listReviewQueue(context.serviceContext, {
      assigneeId: query.assigneeId,
      reviewerId: query.reviewerId,
      ownerId: query.ownerId,
      planId: query.planId,
      specId: query.specId,
      projectId: query.projectId,
      workspaceId: query.workspaceId,
      limit,
      offset,
    }),
  );
  return jsonCollectionResponse(
    items,
    listPage(items.length, limit ?? items.length, offset),
    context.tracing,
  );
}

export async function handleIngestQepExecutionResult(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepExecutionIngestBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const service = await requireQepTestExecutionGateway();
    const { automationExecutionId, ...ingestBody } = body;
    const tenantId = context.serviceContext.tenantId;
    const specId = ingestBody.create?.sourceRefs.specRef?.id;
    const planId = ingestBody.create?.sourceRefs.planRef?.id;
    let resolved:
      | {
          readonly steps: readonly {
            readonly order: number;
            readonly instruction: string;
            readonly expectedResult: string;
            readonly requireActualResult: boolean;
            readonly allowUnordered: boolean;
            readonly testDataRef?: string;
          }[];
          readonly preconditions: readonly string[];
        }
      | undefined;
    if (specId) {
      const testCase = await getTestManagementService().getTestCase(tenantId, specId);
      resolved = {
        steps: testCase.steps.map((step) => ({
          order: step.order,
          instruction: step.action,
          expectedResult: step.expectedResult,
          requireActualResult: true,
          allowUnordered: false,
          ...(step.testDataRef ? { testDataRef: step.testDataRef } : {}),
        })),
        preconditions: [...testCase.preconditions],
      };
    }
    const result = await invoke(context, () =>
      service.ingestExternalResult(context.serviceContext, {
        ...ingestBody,
        ...(resolved ? { resolved } : {}),
      }),
    );
    const applicationId = ingestBody.create?.projectId;
    if (applicationId) {
      await getTestManagementService().bindTestExecutionApplication(
        tenantId,
        result.id,
        applicationId,
      );
    }
    await captureExecutionSnapshots({
      tenantId,
      executionId: result.id,
      executionKind: "test_execution",
      ...(specId ? { specificationId: specId } : {}),
      ...(planId ? { planId } : {}),
    });
    if (automationExecutionId) {
      await getTestManagementService().correlateAutomation({
        tenantId,
        testExecutionId: result.id,
        automationExecutionId,
        correlationId: body.idempotencyKey,
      });
    }
    return jsonDataResponse(result, context.tracing, { status: 201 });
  } catch (error) {
    mapHandlerError(error);
  }
}

export async function handleGetQepPlanExecutionProgress(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const planId = await param(routeContext, "planId", qepExecutionPlanIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const progress = await invoke(context, () =>
    service.getPlanExecutionProgress(context.serviceContext, planId),
  );
  return jsonDataResponse(progress, context.tracing);
}

export async function handleGetQepExecution(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const item = await invoke(context, () => service.get(context.serviceContext, id));
  if (!item) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: `Test execution not found: ${id}`,
    });
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleGetQepExecutionManifest(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const manifest = await invoke(context, () =>
    service.getManifest(context.serviceContext, id),
  );
  return jsonDataResponse(manifest, context.tracing);
}

export async function handleGetQepExecutionHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const history = await invoke(context, () =>
    service.getHistory(context.serviceContext, id),
  );
  return jsonDataResponse(history, context.tracing);
}

export async function handleGetQepExecutionAvailableActions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const actions = await invoke(context, () =>
    service.getAvailableActions(context.serviceContext, id),
  );
  return jsonDataResponse(actions, context.tracing);
}

/**
 * OES PART-04: `GET .../steps` projects from the Test Execution aggregate's
 * `steps` collection — there is no dedicated Application query (ENG-100D
 * engineering resolution #2).
 */
export async function handleGetQepExecutionSteps(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const steps = await invoke(context, () =>
    service.getSteps(context.serviceContext, id),
  );
  return jsonDataResponse(steps, context.tracing);
}

export async function handlePerformQepExecutionAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = routeContext ? await routeContext.params : {};
  const id = parsePathParam(
    qepExecutionIdParamSchema,
    params.executionId ?? "",
    "executionId",
  );
  const action = parsePathParam(
    qepExecutionActionParamSchema,
    params.action ?? "",
    "action",
  ) as ExecutionActionKey;
  const body = await parseJsonBody(
    request,
    qepExecutionActionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestExecutionGateway();
  const result = await invoke(context, () =>
    performQepTestExecutionAction(service, context.serviceContext, id, action, body),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleRecordQepExecutionStepResult(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = routeContext ? await routeContext.params : {};
  const id = parsePathParam(
    qepExecutionIdParamSchema,
    params.executionId ?? "",
    "executionId",
  );
  const stepOrder = parsePathParam(
    qepExecutionStepOrderParamSchema,
    params.stepId ?? "",
    "stepId",
  );
  const body = await parseJsonBody(
    request,
    qepExecutionRecordStepResultBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestExecutionGateway();
  const updated = await invoke(context, () =>
    service.recordStepResult(context.serviceContext, id, { ...body, order: stepOrder }),
  );
  return jsonDataResponse(updated, context.tracing);
}

export async function handleListQepExecutionEvidenceReferences(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const items = await invoke(context, () =>
    service.listEvidenceReferences(context.serviceContext, id),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleAssociateQepExecutionEvidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepExecutionAssociateEvidenceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestExecutionGateway();
  const updated = await invoke(context, () =>
    service.associateEvidence(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing, { status: 201 });
}

export async function handleListQepExecutionObservations(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const service = await requireQepTestExecutionGateway();
  const items = await invoke(context, () =>
    service.listObservations(context.serviceContext, id),
  );
  return jsonDataResponse(items, context.tracing);
}

export async function handleRecordQepExecutionObservation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const id = await param(routeContext, "executionId", qepExecutionIdParamSchema);
  const body = await parseJsonBody(
    request,
    qepExecutionRecordObservationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const service = await requireQepTestExecutionGateway();
  const updated = await invoke(context, () =>
    service.recordObservation(context.serviceContext, id, body),
  );
  return jsonDataResponse(updated, context.tracing, { status: 201 });
}
