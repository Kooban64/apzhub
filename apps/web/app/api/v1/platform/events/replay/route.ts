export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handlePostPlatformEventBusReplay,
  platformEventsMethodNotAllowed,
} from "@/lib/api/v1/handlers/platform-events";

const ALLOWED = ["POST"] as const;

export const POST = withPlatformApiAuth(handlePostPlatformEventBusReplay, {
  operation: "platform.events.replay.post",
});

export async function GET(request: NextRequest) {
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
