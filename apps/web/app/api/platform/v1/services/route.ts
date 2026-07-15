export const runtime = "nodejs";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { Runtime } from "@apzhub/platform-runtime/server";

import { ensurePlatformRuntimeReady } from "@/lib/runtime-init";

function mapCapability(record: ReturnType<ReturnType<typeof Runtime.registry>["getServices"]>[number]) {
  return {
    id: record.id,
    name: record.name,
    kind: record.kind,
    version: record.version,
    lifecycleState: record.lifecycleState,
    healthState: record.healthState,
    category: record.metadata.category,
  };
}

export async function GET(): Promise<NextResponse> {
  await getValidatedSession(await headers());
  await ensurePlatformRuntimeReady();
  const services = Runtime.registry().getServices().map(mapCapability);

  return NextResponse.json({
    data: services,
    meta: { count: services.length },
  });
}
