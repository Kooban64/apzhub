import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  handleGetPreferences,
  handlePatchPreferences,
} from "@apzhub/platform-personalisation/server";

async function resolveSession() {
  return getValidatedSession(await headers());
}

export async function GET(): Promise<Response> {
  return handleGetPreferences(resolveSession);
}

export async function PATCH(request: Request): Promise<Response> {
  return handlePatchPreferences(resolveSession, request);
}
