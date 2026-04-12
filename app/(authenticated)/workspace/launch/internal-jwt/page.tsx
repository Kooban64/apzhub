import Link from "next/link";
import { cookies } from "next/headers";

import {
  getLaunchJwtAudienceForService,
  getLaunchJwtClockSkewSeconds,
  getLaunchJwtIssuer,
  getLaunchJwtSigningSecret,
  getLaunchJwtSingleUseEnabled,
} from "@/lib/adapters/env";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import { LAUNCH_INTERNAL_JWT_COOKIE, LAUNCH_INTERNAL_JWT_COOKIE_PATH } from "@/lib/launch/constants";
import {
  LAUNCH_EXECUTION_ERROR_CODES,
  launchExecutionOperatorMessage,
  launchExecutionUserMessage,
} from "@/lib/launch/launch-execution-errors";
import { verifyLaunchJwt } from "@/lib/launch/jwt/hmac-jwt";
import { consumeLaunchJtiOnce } from "@/lib/launch/jwt/jti-replay-cache";
import { tryInsertLaunchEvent } from "@/lib/launch/repository/launch-events-repository";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";

export default async function InternalJwtLaunchPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; launch_cid?: string }>;
}) {
  const sp = await searchParams;
  const serviceRaw = sp.service;
  const correlationId = typeof sp.launch_cid === "string" ? sp.launch_cid : "";

  const serviceParsed = workspaceServiceIdSchema.safeParse(serviceRaw ?? "");
  if (!serviceParsed.success) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.SERVICE_INVALID),
      serviceId: typeof serviceRaw === "string" && serviceRaw ? serviceRaw : "—",
      userId: null,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">Missing or invalid service. Start again from the workspace launcher.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  const jar = await cookies();
  const token = jar.get(LAUNCH_INTERNAL_JWT_COOKIE)?.value;
  const secret = getLaunchJwtSigningSecret();

  if (!secret || !token) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_NO_SESSION,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_NO_SESSION),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_NO_SESSION),
      serviceId: serviceParsed.data,
      userId: null,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">Missing launch session. Start again from the workspace launcher.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  const skew = getLaunchJwtClockSkewSeconds();
  const v = verifyLaunchJwt(token, secret, {
    expectedIssuer: getLaunchJwtIssuer(),
    expectedAudience: getLaunchJwtAudienceForService(serviceParsed.data),
    clockSkewSec: skew,
  });
  if (!v.ok) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_VERIFY_FAILED,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_VERIFY_FAILED),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_VERIFY_FAILED),
      serviceId: serviceParsed.data,
      userId: null,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">Launch token is invalid or expired. Start again from the launcher.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  if (v.serviceId !== serviceParsed.data) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SERVICE_MISMATCH,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SERVICE_MISMATCH),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SERVICE_MISMATCH),
      serviceId: serviceParsed.data,
      userId: v.sub,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">Service mismatch — do not tamper with launch URLs.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  const snapshot = await getSessionSnapshot();
  if (snapshot.sessionStatus !== "active" || !snapshot.user) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SESSION_REQUIRED,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SESSION_REQUIRED),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SESSION_REQUIRED),
      serviceId: serviceParsed.data,
      userId: v.sub,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">Sign in again to confirm this launch.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  if (v.sub !== snapshot.user.id) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_USER_MISMATCH,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_USER_MISMATCH),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_USER_MISMATCH),
      serviceId: serviceParsed.data,
      userId: snapshot.user.id,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      authSessionId: snapshot.authSessionId ?? null,
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">This launch belongs to a different signed-in user.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  if (v.sid != null && snapshot.authSessionId !== v.sid) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SESSION_ROTATED,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SESSION_ROTATED),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_SESSION_ROTATED),
      serviceId: serviceParsed.data,
      userId: snapshot.user.id,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      authSessionId: snapshot.authSessionId ?? null,
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">Your session was rotated after this token was minted. Start the launch again.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  if (getLaunchJwtSingleUseEnabled() && !consumeLaunchJtiOnce(v.jti, v.exp)) {
    await tryInsertLaunchEvent({
      outcome: "failed",
      reasonCode: LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_JTI_REUSED,
      userMessage: launchExecutionUserMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_JTI_REUSED),
      operatorMessage: launchExecutionOperatorMessage(LAUNCH_EXECUTION_ERROR_CODES.JWT_LANDING_JTI_REUSED),
      serviceId: serviceParsed.data,
      userId: snapshot.user.id,
      launchMethod: "jwt",
      correlationId: correlationId || "",
      authSessionId: snapshot.authSessionId ?? null,
      readinessAtDecision: null,
    });
    return (
      <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
        <h1 className="text-lg font-semibold">Internal launch</h1>
        <p className="text-destructive">This launch link was already used. Start again from the launcher.</p>
        <Link href="/workspace" className="text-primary underline">
          Back to workspace
        </Link>
      </div>
    );
  }

  await tryInsertLaunchEvent({
    outcome: "succeeded",
    userId: snapshot.user.id,
    serviceId: serviceParsed.data,
    launchMethod: "jwt",
    userMessage: "Internal JWT launch confirmed.",
    operatorMessage: "Landing verification passed (aud, exp, sub, sid, jti policy).",
    correlationId: correlationId || "",
    authSessionId: snapshot.authSessionId ?? null,
    readinessAtDecision: null,
  });

  return (
    <div className="mx-auto max-w-lg space-y-3 p-6 text-sm" data-testid="internal-jwt-launch-page">
      <h1 className="text-lg font-semibold">Internal JWT launch</h1>
      <p className="text-muted-foreground">
        Session established for service <span className="font-mono text-foreground">{v.serviceId}</span> (subject{" "}
        <span className="font-mono text-foreground">{v.sub}</span>). Token is in an HttpOnly cookie scoped to{" "}
        <span className="font-mono text-foreground">{LAUNCH_INTERNAL_JWT_COOKIE_PATH}</span> and is not shown in the
        UI.
      </p>
      <p className="text-xs text-muted-foreground">
        Audience is bound to this service. Downstream apps should validate <span className="font-mono">aud</span>,{" "}
        <span className="font-mono">exp</span> (with clock skew), and <span className="font-mono">jti</span> if using
        single-use mode.
      </p>
      <Link href="/workspace" className="text-primary underline">
        Back to workspace
      </Link>
    </div>
  );
}
