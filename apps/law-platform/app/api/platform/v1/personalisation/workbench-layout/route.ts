import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  handleGetWorkbenchLayout,
  handlePutWorkbenchLayout,
} from "@apzhub/platform-personalisation/server";

async function resolveSession() {
  return getValidatedSession(await headers());
}

export async function GET(): Promise<Response> {
  return handleGetWorkbenchLayout(resolveSession);
}

export async function PUT(request: Request): Promise<Response> {
  return handlePutWorkbenchLayout(resolveSession, request);
}
