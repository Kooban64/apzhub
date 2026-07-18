export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  handlePostPlatformWebhookIngress,
  platformEventsMethodNotAllowed,
} from "@/lib/api/v1/handlers/platform-events";

const ALLOWED = ["POST"] as const;

export async function POST(request: NextRequest) {
  return handlePostPlatformWebhookIngress(request);
}

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
