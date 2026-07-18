export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGetPlatformEventBusHealth,
  platformEventsMethodNotAllowed,
} from "@/lib/api/v1/handlers/platform-events";

const ALLOWED = ["GET"] as const;

export const GET = withPlatformApiAuth(handleGetPlatformEventBusHealth, {
  operation: "platform.events.health.get",
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
