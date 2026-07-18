import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { getSharedGovernanceService } from "@apzhub/platform-governance";
import { handleGetCommercialReadiness } from "@apzhub/platform-provisioning/server";

import { getPlatformProvisioningRuntime } from "@/lib/platform-provisioning/runtime";

async function resolveSession() {
  const session = await getValidatedSession(await headers());
  if (!session?.user?.id) return null;
  return { user: session.user, tenantId: session.tenantId };
}

async function resolveRuntime() {
  return getPlatformProvisioningRuntime();
}

async function resolveGovernance() {
  return getSharedGovernanceService();
}

export async function GET(): Promise<Response> {
  return handleGetCommercialReadiness(
    resolveSession,
    resolveRuntime,
    resolveGovernance,
  );
}
