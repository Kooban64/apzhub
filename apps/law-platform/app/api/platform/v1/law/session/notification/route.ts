import type { NextRequest } from "next/server";

import {
  handleGetLawNotificationSession,
  handlePutLawNotificationSession,
} from "@/lib/persistence/law-session-api-handlers";

export async function GET(request: NextRequest) {
  return handleGetLawNotificationSession(request);
}

export async function PUT(request: NextRequest) {
  return handlePutLawNotificationSession(request);
}
