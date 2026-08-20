import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getApplicationService } from "@/lib/qep/application-runtime";
import { getAssuranceService } from "@/lib/qep/assurance-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

function mapError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message.includes("human_actor_required")) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
}

async function requireApplication(
  tenantId: string,
  applicationId: string | undefined,
): Promise<string> {
  const id = applicationId?.trim() ?? "";
  if (!id) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
  try {
    const app = await getApplicationService().get(tenantId, id);
    return app.id;
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "application.required",
    });
  }
}

async function requireEnvironment(
  tenantId: string,
  applicationId: string,
  environmentId: string | undefined,
): Promise<{ id: string; name: string }> {
  const id = environmentId?.trim() ?? "";
  if (!id) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "environment.required",
    });
  }
  try {
    const env = await getApplicationService().getEnvironment(
      tenantId,
      applicationId,
      id,
    );
    return { id: env.id, name: env.name };
  } catch {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "environment.required",
    });
  }
}

export async function handleListQualityGates(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.gate.read", "qep.risk.read");
  const tenantId = sessionTenantId(context);
  const applicationId = await requireApplication(
    tenantId,
    request.nextUrl.searchParams.get("applicationId") ?? undefined,
  );
  try {
    const items = await getAssuranceService().listGateDefinitions(
      tenantId,
      applicationId,
    );
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateQualityGate(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.gate.define", "qep.risk.operate");
  const tenantId = sessionTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    applicationId?: string;
    name?: string;
    description?: string;
    gateType?: string;
    conditionKind?: string;
    conditionValue?: number;
  };
  const applicationId = await requireApplication(tenantId, body.applicationId);
  try {
    const gate = await getAssuranceService().createGateDefinition({
      tenantId,
      applicationId,
      actorId: context.serviceContext.userId,
      name: body.name ?? "",
      description: body.description ?? "",
      gateType: (body.gateType as "blocking") ?? "blocking",
      condition: {
        kind:
          (body.conditionKind as "unresolved_blocking_risks") ??
          "unresolved_blocking_risks",
        operator: "eq",
        value: body.conditionValue ?? 0,
      },
    });
    return jsonDataResponse({ gate }, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetQualityGate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.gate.read", "qep.risk.read");
  const gateId = (await routeContext?.params)?.gateId?.trim();
  if (!gateId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "gateId is required",
    });
  }
  try {
    const gate = await getAssuranceService().getGateDefinition(
      sessionTenantId(context),
      gateId,
    );
    return jsonDataResponse({ gate }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleEvaluateQualityGate(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.gate.evaluate", "qep.certification.decide");
  const gateId = (await routeContext?.params)?.gateId?.trim();
  if (!gateId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "gateId is required",
    });
  }
  const tenantId = sessionTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    applicationId?: string;
    environmentId?: string;
    changeEventId?: string;
    scmKind?: string;
    scmExternalKey?: string;
    scmSha?: string;
  };
  const applicationId = await requireApplication(tenantId, body.applicationId);
  const environment = await requireEnvironment(
    tenantId,
    applicationId,
    body.environmentId,
  );
  const changeEventId = body.changeEventId?.trim();
  if (!changeEventId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "changeEventId is required",
    });
  }
  try {
    const evaluation = await getAssuranceService().evaluateGate({
      tenantId,
      gateId,
      actorId: context.serviceContext.userId,
      context: {
        applicationId,
        environmentId: environment.id,
        environmentSnapshot: environment,
        changeEventId,
        scmIdentity: {
          changeEventId,
          ...(body.scmKind ? { kind: body.scmKind } : {}),
          ...(body.scmExternalKey ? { externalKey: body.scmExternalKey } : {}),
          ...(body.scmSha ? { sha: body.scmSha } : {}),
        },
      },
    });
    return jsonDataResponse({ evaluation }, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleListGateEvaluations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.gate.read", "qep.risk.read");
  const tenantId = sessionTenantId(context);
  const applicationId = await requireApplication(
    tenantId,
    request.nextUrl.searchParams.get("applicationId") ?? undefined,
  );
  try {
    const items = await getAssuranceService().listGateEvaluations(
      tenantId,
      applicationId,
    );
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetReadiness(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.release_readiness.read", "qep.gate.read");
  const tenantId = sessionTenantId(context);
  const applicationId = await requireApplication(
    tenantId,
    request.nextUrl.searchParams.get("applicationId") ?? undefined,
  );
  try {
    const composed = await getAssuranceService().composeReadiness({
      tenantId,
      applicationId,
      changeEventId: request.nextUrl.searchParams.get("changeEventId") ?? undefined,
    });
    return jsonDataResponse(composed, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAuthoriseException(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.certification.decide");
  const body = (await request.json().catch(() => ({}))) as {
    gateEvaluationId?: string;
    reason?: string;
  };
  if (!body.gateEvaluationId?.trim()) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "gateEvaluationId is required",
    });
  }
  try {
    const exception = await getAssuranceService().authoriseException({
      tenantId: sessionTenantId(context),
      actorId: context.serviceContext.userId,
      gateEvaluationId: body.gateEvaluationId,
      reason: body.reason ?? "",
    });
    return jsonDataResponse({ exception }, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}
