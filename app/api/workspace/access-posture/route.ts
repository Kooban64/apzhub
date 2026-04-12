import { NextResponse } from "next/server";

import { getAdminAccessData } from "@/lib/adapters/access/access-adapter";
import { getSessionSnapshot } from "@/lib/auth/get-session-server";
import { directorySubjectIdForSession, readMatrixPostureFromModel } from "@/lib/launch/workspace-launch-bridge";
import { workspaceServiceIdSchema } from "@/lib/workspace/workspace-config";
import { apiCorrelationFromRequest } from "@/lib/observability/next-api-response";

/**
 * Read-only matrix posture for the **signed-in** workspace user (no admin role required).
 */
export async function GET(request: Request) {
  const { attach } = apiCorrelationFromRequest(request);
  const snapshot = await getSessionSnapshot();
  if (snapshot.sessionStatus !== "active" || !snapshot.user) {
    return attach(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  }
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId") ?? "";
  const serviceIdRaw = url.searchParams.get("serviceId") ?? "";
  const serviceParsed = workspaceServiceIdSchema.safeParse(serviceIdRaw);
  const mapped = directorySubjectIdForSession(snapshot);
  if (!mapped || userId !== mapped || !serviceParsed.success) {
    return attach(NextResponse.json({ error: "Forbidden" }, { status: 403 }));
  }
  if (snapshot.platformRole === "superadmin") {
    return attach(
      NextResponse.json({
        effectiveRole: "superadmin",
        realization: "provisioned" as const,
      }),
    );
  }
  let data;
  try {
    data = await getAdminAccessData();
  } catch {
    return attach(
      NextResponse.json({ error: "Access catalog could not be loaded. Try again or contact an administrator." }, { status: 503 }),
    );
  }
  const posture = readMatrixPostureFromModel(data, userId, serviceParsed.data);
  return attach(NextResponse.json(posture));
}
