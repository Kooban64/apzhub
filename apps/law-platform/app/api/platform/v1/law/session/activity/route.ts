import type { NextRequest } from "next/server";

import {
  handleGetLawActivitySession,
  handlePutLawActivitySession,
} from "@/lib/persistence/law-session-api-handlers";

export async function GET(request: NextRequest) {
  return handleGetLawActivitySession(request);
}

export async function PUT(request: NextRequest) {
  return handlePutLawActivitySession(request);
}
