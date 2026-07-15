import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  handleGetFeatureFlags,
  handlePatchFeatureFlag,
} from "@apzhub/platform-governance/server";

async function resolveSession() {
  const session = await getValidatedSession(await headers());
  if (!session?.user?.id) return null;
  return { user: session.user, tenantId: session.tenantId };
}

export async function GET(): Promise<Response> {
  return handleGetFeatureFlags(resolveSession);
}

export async function PATCH(request: Request): Promise<Response> {
  return handlePatchFeatureFlag(resolveSession, request);
}
