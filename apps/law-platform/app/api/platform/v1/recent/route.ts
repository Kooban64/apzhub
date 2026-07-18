import { headers } from "next/headers";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  handleGetRecent,
  handlePostRecent,
} from "@apzhub/platform-personalisation/server";

async function resolveSession() {
  return getValidatedSession(await headers());
}

export async function GET(): Promise<Response> {
  return handleGetRecent(resolveSession);
}

export async function POST(request: Request): Promise<Response> {
  return handlePostRecent(resolveSession, request);
}
