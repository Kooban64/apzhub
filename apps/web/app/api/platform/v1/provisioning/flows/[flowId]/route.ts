import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { handleGetProvisioningFlowStatus } from "@apzhub/platform-provisioning/server";

import { getPlatformProvisioningRuntime } from "@/lib/platform-provisioning/runtime";

async function resolveSession() {
  const session = await getValidatedSession(await headers());
  if (!session?.user?.id) return null;
  return { user: session.user, tenantId: session.tenantId };
}

async function resolveRuntime() {
  return getPlatformProvisioningRuntime();
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ flowId: string }> },
): Promise<Response> {
  const { flowId } = await context.params;
  return handleGetProvisioningFlowStatus(resolveSession, resolveRuntime, flowId);
}
