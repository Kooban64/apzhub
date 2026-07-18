import { getSharedPlatformSecurityService } from "./index";
import { jsonPlatformResponse, securePlatformResponse } from "./http-security-response";
import {
  guardFailureResponse,
  requirePlatformPermission,
  requirePlatformSession,
  type PlatformApiGuardSession,
} from "./platform-api-guard";

type SessionResolver = () => Promise<PlatformApiGuardSession | null>;

export async function handleGetSecurity(
  resolveSession: SessionResolver,
): Promise<Response> {
  const guard = await requirePlatformSession(await resolveSession());
  if (!guard.ok) return guardFailureResponse(guard);

  const service = getSharedPlatformSecurityService();
  const summary = await service.getPlatformSummary({});

  return jsonPlatformResponse({ data: summary }, undefined, "api");
}

export async function handleGetSecurityDiagnostics(
  resolveSession: SessionResolver,
): Promise<Response> {
  const guard = await requirePlatformPermission(await resolveSession());
  if (!guard.ok) return guardFailureResponse(guard);

  const service = getSharedPlatformSecurityService();
  const security = service.securityDiagnostics.getSecurityDiagnostics();
  const consolidated =
    await service.operationalDiagnostics.getConsolidatedDiagnostics();

  return jsonPlatformResponse(
    {
      data: {
        security,
        consolidated,
      },
    },
    undefined,
    "diagnostics",
  );
}

export async function handleGetSystemHealth(
  input: {
    readonly runtimeReady?: boolean;
    readonly runtimeDiagnostics?: Record<string, unknown>;
  } = {},
): Promise<Response> {
  const service = getSharedPlatformSecurityService();
  const resilience = await service.resilience.getResilienceSnapshot({
    runtimeReady: input.runtimeReady,
  });
  const security = service.securityDiagnostics.getSecurityDiagnostics();

  return jsonPlatformResponse(
    {
      status: resilience.health.status,
      timestamp: new Date().toISOString(),
      dependencies: resilience.health.dependencies,
      security: {
        environmentValid: security.environment.valid,
        rateLimit: security.rateLimit,
      },
      runtime: input.runtimeDiagnostics,
    },
    { status: resilience.health.status === "healthy" ? 200 : 503 },
    "health",
  );
}

export async function handleGetSystemReadiness(
  input: { readonly runtimeReady?: boolean } = {},
): Promise<Response> {
  const service = getSharedPlatformSecurityService();
  const readiness = await service.resilience.getReadiness(input);
  return jsonPlatformResponse(
    { data: readiness },
    { status: readiness.status === "healthy" ? 200 : 503 },
    "health",
  );
}

export async function handleGetSystemLiveness(): Promise<Response> {
  const service = getSharedPlatformSecurityService();
  const liveness = await service.resilience.getLiveness();
  return jsonPlatformResponse({ data: liveness }, undefined, "health");
}

export async function checkPlatformRateLimit(
  key: string,
  pathname = "/api/platform/v1/system/health",
): Promise<{ allowed: boolean; headers: Record<string, string> }> {
  const service = getSharedPlatformSecurityService();
  const decision = await service.trafficGovernance.evaluate({
    pathname,
    method: "GET",
    ip: key,
    service: "platform",
  });

  return {
    allowed: decision.allowed,
    headers: { ...decision.headers },
  };
}

export async function handlePostCspReport(
  app: "web" | "law-platform",
  request: Request,
): Promise<Response> {
  const rawBody = await request.text();
  const contentLengthHeader = request.headers.get("content-length");
  const contentLength = contentLengthHeader ? Number(contentLengthHeader) : null;

  const service = getSharedPlatformSecurityService();
  const result = service.cspViolations.ingestReport(
    app,
    rawBody,
    Number.isFinite(contentLength) ? contentLength : null,
  );

  if (!result.accepted) {
    return jsonPlatformResponse(
      { error: { code: "csp_report_rejected", message: result.reason ?? "rejected" } },
      { status: result.reason === "payload_too_large" ? 413 : 400 },
      "api",
      app,
    );
  }

  return securePlatformResponse(new Response(null, { status: 204 }), "api", app);
}
