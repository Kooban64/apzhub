import { NextResponse } from "next/server";

import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import { clientLaunchRejectedBodySchema } from "@/lib/launch/launch-event-types";
import { LAUNCH_REASON_OPERATOR_MESSAGES } from "@/lib/launch/launch-reason-code";
import { tryInsertLaunchEvent } from "@/lib/launch/repository/launch-events-repository";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

/**
 * Server-confirmed log when the user taps a blocked/deferred launcher tile (policy decision already computed client-side).
 */
export async function POST(request: Request) {
  const { attach, correlationId } = apiCorrelationFromRequest(request);
  const snapshot = await getSessionSnapshot();
  if (snapshot.sessionStatus !== "active" || !snapshot.user) {
    return attach(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return attach(NextResponse.json({ error: "Invalid JSON" }, { status: 400 }));
  }

  const parsed = clientLaunchRejectedBodySchema.safeParse(body);
  if (!parsed.success) {
    return attach(NextResponse.json({ error: "Invalid body" }, { status: 400 }));
  }

  const b = parsed.data;
  const operatorMessage =
    b.operatorMessage?.trim() ||
    (b.reasonCode ? LAUNCH_REASON_OPERATOR_MESSAGES[b.reasonCode] : undefined) ||
    null;

  await tryInsertLaunchEvent({
    outcome: "rejected",
    userId: snapshot.user.id,
    serviceId: b.serviceId,
    launchMethod: b.method,
    readinessAtDecision: b.readiness,
    reasonCode: b.reasonCode ?? null,
    userMessage: b.userMessage,
    operatorMessage,
    correlationId: b.correlationId?.trim() || correlationId,
    authSessionId: snapshot.authSessionId ?? null,
  });

  return attach(NextResponse.json({ ok: true }));
}
