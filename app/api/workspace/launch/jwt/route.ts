import { NextResponse } from "next/server";

import {
  getLaunchJwtAudienceForService,
  getLaunchJwtIssuer,
  getLaunchJwtSigningSecret,
  getLaunchJwtTtlSeconds,
  getLaunchSource,
} from "@/lib/adapters/env";
import { appendPrivilegedTrace } from "@/lib/adapters/audit/control-plane-adapter";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import {
  LAUNCH_CORRELATION_QUERY_PARAM,
  LAUNCH_INTERNAL_JWT_COOKIE,
  LAUNCH_INTERNAL_JWT_COOKIE_PATH,
} from "@/lib/launch/constants";
import {
  httpStatusForLaunchExecution,
  LAUNCH_EXECUTION_ERROR_CODES,
  launchExecutionOperatorMessage,
  launchExecutionUserMessage,
} from "@/lib/launch/launch-execution-errors";
import { signLaunchJwt } from "@/lib/launch/jwt/hmac-jwt";
import { tryInsertLaunchEvent } from "@/lib/launch/repository/launch-events-repository";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";

async function fail(
  code: (typeof LAUNCH_EXECUTION_ERROR_CODES)[keyof typeof LAUNCH_EXECUTION_ERROR_CODES],
  attach: ReturnType<typeof apiCorrelationFromRequest>["attach"],
  correlationId: string,
  ctx?: { serviceId?: string; userId?: string | null },
) {
  await tryInsertLaunchEvent({
    outcome: "failed",
    reasonCode: code,
    userMessage: launchExecutionUserMessage(code),
    operatorMessage: launchExecutionOperatorMessage(code),
    serviceId: ctx?.serviceId ?? "—",
    userId: ctx?.userId ?? null,
    launchMethod: "jwt",
    correlationId,
    readinessAtDecision: null,
  });
  return attach(
    NextResponse.json(
      { error: launchExecutionUserMessage(code), code },
      { status: httpStatusForLaunchExecution(code) },
    ),
  );
}

/**
 * Internal JWT launch: validates session, mints HS256 JWT, sets HttpOnly cookie, redirects to landing page.
 * Client navigates here via `buildLaunchTransportTarget` when `APZHUB_LAUNCH_SOURCE=real` and signing secret is set.
 */
export async function GET(request: Request) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);

  if (getLaunchSource() !== "real") {
    return fail(LAUNCH_EXECUTION_ERROR_CODES.LAUNCH_NOT_REAL_MODE, attach, correlationId);
  }

  const secret = getLaunchJwtSigningSecret();
  if (!secret) {
    return fail(LAUNCH_EXECUTION_ERROR_CODES.JWT_SIGNING_MISCONFIGURED, attach, correlationId);
  }

  const url = new URL(request.url);
  const serviceRaw = url.searchParams.get("service") ?? "";

  const snapshot = await getSessionSnapshot();
  if (snapshot.sessionStatus !== "active" || !snapshot.user) {
    return fail(LAUNCH_EXECUTION_ERROR_CODES.SESSION_REQUIRED, attach, correlationId);
  }

  const parsedEarly = workspaceServiceIdSchema.safeParse(serviceRaw);
  const serviceIdForInit = parsedEarly.success ? parsedEarly.data : (serviceRaw || "—");
  await tryInsertLaunchEvent({
    outcome: "initiated",
    userId: snapshot.user.id,
    serviceId: serviceIdForInit,
    launchMethod: "jwt",
    userMessage: "JWT internal launch mint requested.",
    operatorMessage: "Session OK; validating service and minting token.",
    correlationId,
    authSessionId: snapshot.authSessionId ?? null,
    readinessAtDecision: null,
  });

  const parsed = workspaceServiceIdSchema.safeParse(serviceRaw);
  if (!parsed.success) {
    return fail(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID, attach, correlationId, {
      serviceId: serviceRaw || "—",
      userId: snapshot.user.id,
    });
  }

  const serviceId = parsed.data;
  const ttl = getLaunchJwtTtlSeconds();
  let token: string;
  try {
    token = signLaunchJwt({
      secret,
      sub: snapshot.user.id,
      serviceId,
      ttlSec: ttl,
      issuer: getLaunchJwtIssuer(),
      audience: getLaunchJwtAudienceForService(serviceId),
      authSessionId: snapshot.authSessionId,
    });
  } catch {
    return fail(LAUNCH_EXECUTION_ERROR_CODES.INTERNAL_ERROR, attach, correlationId, {
      serviceId,
      userId: snapshot.user.id,
    });
  }

  await tryInsertLaunchEvent({
    outcome: "redirect_started",
    userId: snapshot.user.id,
    serviceId,
    launchMethod: "jwt",
    userMessage: "Redirecting to launch confirmation.",
    operatorMessage: `JWT mint OK; ttl=${ttl}s; redirect to internal-jwt`,
    correlationId,
    authSessionId: snapshot.authSessionId ?? null,
    readinessAtDecision: null,
  });

  const landing = new URL("/workspace/launch/internal-jwt", request.url);
  landing.searchParams.set("service", serviceId);
  landing.searchParams.set(LAUNCH_CORRELATION_QUERY_PARAM, correlationId);

  appendPrivilegedTrace({
    actor: snapshot.user.email,
    verb: "service_launch",
    target: `${serviceId}:jwt`,
    domain: "launch",
    outcome: "success",
    contextSummary: `Internal JWT mint; ttl=${ttl}s; aud=per-service`,
    correlationId,
  });

  const res = NextResponse.redirect(landing);
  res.cookies.set(LAUNCH_INTERNAL_JWT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: LAUNCH_INTERNAL_JWT_COOKIE_PATH,
    maxAge: ttl,
  });
  return attach(res);
}
