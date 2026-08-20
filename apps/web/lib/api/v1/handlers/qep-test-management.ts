import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { getTestManagementService } from "@/lib/qep/test-management-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";
import { assertQepHttpEnabled } from "./qep";
import type {
  CreateStrategyInput,
  VerificationCapability,
} from "@apzhub/qep-test-management";

type RouteContext = { params: Promise<Record<string, string>> };

function actorId(context: PlatformApiRequestContext): string {
  return context.serviceContext.userId;
}

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name]?.trim();
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `${name} is required`,
    });
  }
  return value;
}

function mapError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message.endsWith(".not_found") || message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (
    message.includes("mismatch") ||
    message.includes("required") ||
    message.includes("invalid") ||
    message.includes("forbidden") ||
    message.includes("secrets") ||
    message.includes("surface_not_allowed")
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

function collection<T>(context: PlatformApiRequestContext, items: readonly T[]) {
  return jsonCollectionResponse(
    items,
    {
      cursor: null,
      nextCursor: null,
      limit: items.length,
      hasMore: false,
    },
    context.tracing,
  );
}

function data<T>(context: PlatformApiRequestContext, value: T) {
  return jsonDataResponse(value, context.tracing);
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

export async function handleListTestCases(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.specification.read");
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
    const items = await getTestManagementService().listTestCases({
      tenantId,
      applicationId,
      includeUnbound: request.nextUrl.searchParams.get("includeUnbound") === "true",
    });
    return collection(context, items);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateTestCase(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.specification.create", "qep.specification.write");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const applicationId = String(body.applicationId ?? "").trim();
  await requireApplication(tenantId, applicationId);
  try {
    const item = await getTestManagementService().createTestCase({
      tenantId,
      applicationId,
      actorId: actorId(context),
      title: String(body.title ?? ""),
      ...(typeof body.number === "string" ? { number: body.number } : {}),
      ...(typeof body.description === "string"
        ? { description: body.description }
        : {}),
      ...(typeof body.type === "string" ? { type: body.type } : {}),
      ...(typeof body.priority === "string" ? { priority: body.priority } : {}),
      ...(Array.isArray(body.tags) ? { tags: body.tags.map(String) } : {}),
      ...(Array.isArray(body.preconditions)
        ? { preconditions: body.preconditions.map(String) }
        : {}),
      ...(Array.isArray(body.steps)
        ? {
            steps: (body.steps as Record<string, unknown>[]).map((step, index) => ({
              order: Number(step.order ?? index + 1),
              action: String(step.action ?? ""),
              ...(typeof step.testDataRef === "string"
                ? { testDataRef: step.testDataRef }
                : {}),
              expectedResult: String(step.expectedResult ?? ""),
            })),
          }
        : {}),
    });
    return data(context, { testCase: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetTestCase(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.specification.read");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  try {
    const item = await getTestManagementService().getTestCase(
      sessionTenantId(context),
      requireParam(params, "testCaseId"),
    );
    return data(context, { testCase: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleUpdateTestCase(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.specification.update", "qep.specification.write");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const body = await readJson(request);
  try {
    const item = await getTestManagementService().updateTestCase(
      sessionTenantId(context),
      requireParam(params, "testCaseId"),
      actorId(context),
      {
        ...(typeof body.title === "string" ? { title: body.title } : {}),
        ...(typeof body.description === "string"
          ? { description: body.description }
          : {}),
        ...(typeof body.type === "string" ? { type: body.type } : {}),
        ...(typeof body.priority === "string" ? { priority: body.priority } : {}),
        ...(typeof body.status === "string" ? { status: body.status } : {}),
        ...(Array.isArray(body.tags) ? { tags: body.tags.map(String) } : {}),
        ...(Array.isArray(body.preconditions)
          ? { preconditions: body.preconditions.map(String) }
          : {}),
        ...(Array.isArray(body.steps)
          ? {
              steps: (body.steps as Record<string, unknown>[]).map((step, index) => ({
                order: Number(step.order ?? index + 1),
                action: String(step.action ?? ""),
                ...(typeof step.testDataRef === "string"
                  ? { testDataRef: step.testDataRef }
                  : {}),
                expectedResult: String(step.expectedResult ?? ""),
              })),
            }
          : {}),
      },
    );
    return data(context, { testCase: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleLinkTestCaseCriterion(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.specification.update", "qep.specification.write");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const body = await readJson(request);
  try {
    await getTestManagementService().linkAcceptanceCriterion({
      tenantId: sessionTenantId(context),
      specificationId: requireParam(params, "testCaseId"),
      criterionId: String(body.criterionId ?? ""),
      actorId: actorId(context),
    });
    return data(context, { linked: true });
  } catch (error) {
    mapError(error);
  }
}

export async function handleListTestSuites(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.suites.read");
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
    const items = await getTestManagementService().listSuites({
      tenantId,
      applicationId,
    });
    return collection(context, items);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateTestSuite(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.suites.create", "qep.suites.write");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const applicationId = String(body.applicationId ?? "").trim();
  await requireApplication(tenantId, applicationId);
  try {
    const item = await getTestManagementService().createSuite({
      tenantId,
      applicationId,
      actorId: actorId(context),
      name: String(body.name ?? ""),
      ...(typeof body.description === "string"
        ? { description: body.description }
        : {}),
      ...(typeof body.kind === "string" ? { kind: body.kind } : {}),
    });
    return data(context, { suite: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetTestSuite(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.suites.read");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  try {
    const item = await getTestManagementService().getSuite(
      sessionTenantId(context),
      requireParam(params, "suiteId"),
    );
    return data(context, { suite: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleAddSuiteMember(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.suites.update", "qep.suites.write");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const body = await readJson(request);
  try {
    const item = await getTestManagementService().addSuiteMember({
      tenantId: sessionTenantId(context),
      suiteId: requireParam(params, "suiteId"),
      specificationId: String(body.specificationId ?? body.testCaseId ?? ""),
      actorId: actorId(context),
    });
    return data(context, { suite: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleListTestPlans(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.plan.read");
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
    const items = await getTestManagementService().listPlans({
      tenantId,
      applicationId,
    });
    return collection(context, items);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateTestPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.plan.create", "qep.plan.write");
  await assertQepHttpEnabled();
  const tenantId = sessionTenantId(context);
  const body = await readJson(request);
  const applicationId = String(body.applicationId ?? "").trim();
  await requireApplication(tenantId, applicationId);
  try {
    const item = await getTestManagementService().createPlan({
      tenantId,
      applicationId,
      actorId: actorId(context),
      title: String(body.title ?? ""),
      objective: String(body.objective ?? body.title ?? ""),
      ...(typeof body.description === "string"
        ? { description: body.description }
        : {}),
    });
    return data(context, { plan: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetTestPlan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.plan.read");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  try {
    const item = await getTestManagementService().getPlan(
      sessionTenantId(context),
      requireParam(params, "planId"),
    );
    return data(context, { plan: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleAddPlanMember(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.plan.update", "qep.plan.write");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const body = await readJson(request);
  const tenantId = sessionTenantId(context);
  const planId = requireParam(params, "planId");
  try {
    if (typeof body.suiteId === "string" && body.suiteId.trim()) {
      const item = await getTestManagementService().addPlanSuite({
        tenantId,
        planId,
        suiteId: body.suiteId.trim(),
        actorId: actorId(context),
      });
      return data(context, { plan: item });
    }
    const item = await getTestManagementService().addPlanTestCase({
      tenantId,
      planId,
      specificationId: String(body.specificationId ?? body.testCaseId ?? ""),
      actorId: actorId(context),
    });
    return data(context, { plan: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleAddPlanStrategy(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.plan.update", "qep.plan.write");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  const body = await readJson(request);
  const strategy: CreateStrategyInput = {
    name: String(body.name ?? ""),
    verificationCapability: String(
      body.verificationCapability ?? "",
    ) as VerificationCapability,
    ...(typeof body.executionSurface === "string"
      ? {
          executionSurface:
            body.executionSurface as CreateStrategyInput["executionSurface"],
        }
      : {}),
    ...(typeof body.environmentId === "string"
      ? { environmentId: body.environmentId }
      : {}),
    ...(typeof body.infrastructureTargetType === "string"
      ? { infrastructureTargetType: body.infrastructureTargetType }
      : {}),
    ...(typeof body.infrastructureTargetId === "string"
      ? { infrastructureTargetId: body.infrastructureTargetId }
      : {}),
    ...(typeof body.testDataRef === "string" ? { testDataRef: body.testDataRef } : {}),
    ...(typeof body.scheduleNote === "string"
      ? { scheduleNote: body.scheduleNote }
      : {}),
  };
  try {
    const item = await getTestManagementService().addStrategyGroup({
      tenantId: sessionTenantId(context),
      planId: requireParam(params, "planId"),
      actorId: actorId(context),
      strategy,
    });
    return data(context, { plan: item });
  } catch (error) {
    mapError(error);
  }
}

export async function handleListPlanExecutions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext: RouteContext,
) {
  requireQepPermission(context, "qep.plan.read", "qep.execution.read");
  await assertQepHttpEnabled();
  const params = await routeContext.params;
  try {
    const items = await getTestManagementService().listPlanExecutions(
      sessionTenantId(context),
      requireParam(params, "planId"),
    );
    return collection(context, items);
  } catch (error) {
    mapError(error);
  }
}
