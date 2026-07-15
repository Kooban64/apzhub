import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  handleGetGovernance,
  handlePatchGovernance,
} from "@apzhub/platform-governance/server";

async function resolveSession() {
  const session = await getValidatedSession(await headers());
  if (!session?.user?.id) return null;
  return { user: session.user, tenantId: session.tenantId };
}

export async function GET(): Promise<Response> {
  return handleGetGovernance(resolveSession);
}

export async function PATCH(request: Request): Promise<Response> {
  return handlePatchGovernance(resolveSession, request);
}
