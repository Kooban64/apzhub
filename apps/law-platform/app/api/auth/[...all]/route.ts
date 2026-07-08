export const runtime = "nodejs";

import { createAuth } from "@apzhub/auth/server";
import { toNextJsHandler } from "better-auth/next-js";

function getHandlers() {
  return toNextJsHandler(createAuth());
}

export async function GET(request: Request) {
  return getHandlers().GET(request);
}

export async function POST(request: Request) {
  return getHandlers().POST(request);
}
