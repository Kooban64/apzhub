export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetPlatformEventBusDiagnostics,
  platformEventsMethodNotAllowed,
} from "@/lib/api/v1/handlers/platform-events";

const ALLOWED = ["GET"] as const;

export const GET = withPlatformApiAuth(handleGetPlatformEventBusDiagnostics, {
  operation: "platform.events.diagnostics.get",
});

export async function POST(request: NextRequest) {
  return platformEventsMethodNotAllowed(request, ALLOWED);
}

export async function PATCH(request: NextRequest) {
  return platformEventsMethodNotAllowed(request, ALLOWED);
}

export async function PUT(request: NextRequest) {
  return platformEventsMethodNotAllowed(request, ALLOWED);
}

export async function DELETE(request: NextRequest) {
  return platformEventsMethodNotAllowed(request, ALLOWED);
}
