import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import { handleGetPersonalisationDiagnostics } from "@apzhub/platform-personalisation/server";

async function resolveSession() {
  return getValidatedSession(await headers());
}

export async function GET(): Promise<Response> {
  return handleGetPersonalisationDiagnostics(resolveSession);
}
