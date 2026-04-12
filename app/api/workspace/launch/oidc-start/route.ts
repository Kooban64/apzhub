import { NextResponse } from "next/server";

import {
  getLaunchJwtClockSkewSeconds,
  getLaunchOidcStateSigningSecret,
  getLaunchOidcUseInternalStart,
  getLaunchSource,
} from "@/lib/adapters/env";
import { appendPrivilegedTrace } from "@/lib/adapters/audit/control-plane-adapter";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import {
  httpStatusForLaunchExecution,
  LAUNCH_EXECUTION_ERROR_CODES,
  launchExecutionOperatorMessage,
  launchExecutionUserMessage,
} from "@/lib/launch/launch-execution-errors";
import { mintOidcLaunchState } from "@/lib/launch/oidc/launch-oidc-state";
import { tryInsertLaunchEvent } from "@/lib/launch/repository/launch-events-repository";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";

function oidcTemplate(): string {
  return (
    (typeof process !== "undefined" ? process.env.APZHUB_LAUNCH_OIDC_URL_TEMPLATE : undefined)?.trim() ??
    process.env.NEXT_PUBLIC_APZHUB_LAUNCH_OIDC_URL_TEMPLATE?.trim() ??
    ""
  );
}

/**
 * OIDC-ready internal start: validates session, generates `state`, expands template, redirects to IdP.
 * Enabled when `APZHUB_LAUNCH_OIDC_USE_INTERNAL_START=true` and transport points here.
 */
export async function GET(request: Request) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);

  if (getLaunchSource() !== "real" || !getLaunchOidcUseInternalStart()) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID),
      operatorMessage: "OIDC internal start not enabled (LAUNCH_SOURCE or APZHUB_LAUNCH_OIDC_USE_INTERNAL_START).",
      serviceId: "—",
      userId: null,
      launchMethod: "oidc",
      correlationId,
      readinessAtDecision: null,
    });
    return attach(
      NextResponse.json(
        { error: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID) },
        { status: httpStatusForLaunchExecution(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID) },
      ),
    );
  }

  const stateSecret = getLaunchOidcStateSigningSecret();
  if (!stateSecret) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_SIGNING_MISCONFIGURED,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_SIGNING_MISCONFIGURED),
      operatorMessage:
        "Set APZHUB_LAUNCH_OIDC_STATE_SECRET or APZHUB_LAUNCH_JWT_SIGNING_SECRET for signed OIDC state.",
      serviceId: "—",
      userId: null,
      launchMethod: "oidc",
      correlationId,
      readinessAtDecision: null,
    });
    return attach(
      NextResponse.json(
        { error: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_SIGNING_MISCONFIGURED) },
        { status: httpStatusForLaunchExecution(LAUNCH_EXECUTION_ERROR_CODES.JWT_SIGNING_MISCONFIGURED) },
      ),
    );
  }

  const tpl = oidcTemplate();
  if (!tpl) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID),
      serviceId: "—",
      userId: null,
      launchMethod: "oidc",
      correlationId,
      readinessAtDecision: null,
    });
    return attach(
      NextResponse.json(
        { error: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID) },
        { status: httpStatusForLaunchExecution(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID) },
      ),
    );
  }

  const snapshot = await getSessionSnapshot();
  if (snapshot.sessionStatus !== "active" || !snapshot.user) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.SESSION_REQUIRED,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.SESSION_REQUIRED),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.SESSION_REQUIRED),
      serviceId: "—",
      userId: null,
      launchMethod: "oidc",
      correlationId,
      readinessAtDecision: null,
    });
    return attach(
      NextResponse.json(
        { error: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.SESSION_REQUIRED) },
        { status: httpStatusForLaunchExecution(LAUNCH_EXECUTION_ERROR_CODES.SESSION_REQUIRED) },
      ),
    );
  }

  const url = new URL(request.url);
  const serviceRaw = url.searchParams.get("service") ?? "";
  const parsed = workspaceServiceIdSchema.safeParse(serviceRaw);
  if (!parsed.success) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID),
      serviceId: serviceRaw || "—",
      userId: snapshot.user.id,
      launchMethod: "oidc",
      correlationId,
      readinessAtDecision: null,
    });
    return attach(
      NextResponse.json(
        { error: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID) },
        { status: httpStatusForLaunchExecution(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID) },
      ),
    );
  }

  const serviceId = parsed.data;
  const qs = new URLSearchParams(url.search);
  qs.delete("service");
  const queryString = qs.toString();

  const state = mintOidcLaunchState(stateSecret, {
    serviceId,
    userId: snapshot.user.id,
    ttlSec: 600 + getLaunchJwtClockSkewSeconds(),
  });
  let href = tpl
    .replaceAll("{service}", serviceId)
    .replaceAll("{query}", queryString)
    .replaceAll("{state}", state);

  if (!tpl.includes("{state}") && !/[?&]state=/.test(href)) {
    href += `${href.includes("?") ? "&" : "?"}state=${encodeURIComponent(state)}`;
  }

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(href, request.url);
  } catch {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID),
      operatorMessage: "Resolved href is not a valid URL.",
      serviceId,
      userId: snapshot.user.id,
      launchMethod: "oidc",
      correlationId,
      readinessAtDecision: null,
    });
    return attach(
      NextResponse.json(
        { error: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID) },
        { status: httpStatusForLaunchExecution(LAUNCH_EXECUTION_ERROR_CODES.OIDC_TEMPLATE_INVALID) },
      ),
    );
  }

  await tryInsertLaunchEvent({
    outcome: "redirect_started",
    userId: snapshot.user.id,
    serviceId,
    launchMethod: "oidc",
    userMessage: "Redirecting to identity provider for sign-on.",
    operatorMessage: `OIDC redirect to ${redirectUrl.origin}${redirectUrl.pathname}`,
    correlationId,
    authSessionId: snapshot.authSessionId ?? null,
    readinessAtDecision: null,
  });

  appendPrivilegedTrace({
    actor: snapshot.user.email,
    verb: "service_launch",
    target: `${serviceId}:oidc`,
    domain: "launch",
    outcome: "pending",
    contextSummary: `OIDC redirect issued; signed-state v1 prefix=${state.slice(0, 12)}…`,
    correlationId,
  });

  return attach(NextResponse.redirect(redirectUrl));
}
