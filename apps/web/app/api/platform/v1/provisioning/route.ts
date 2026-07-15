import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  handleGetProvisioning,
  handlePostProvisioning,
} from "@apzhub/platform-governance/server";

async function resolveSession() {
  const session = await getValidatedSession(await headers());
  if (!session?.user?.id) return null;
  return { user: session.user, tenantId: session.tenantId };
}

export async function GET(): Promise<Response> {
  return handleGetProvisioning(resolveSession);
}

export async function POST(request: Request): Promise<Response> {
  return handlePostProvisioning(resolveSession, request);
}
