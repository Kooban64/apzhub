export const runtime = "nodejs";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { getSharedAuthorizationEvents } from "@apzhub/platform-authorization";
import {
  getSharedTenantManagementService,
} from "@apzhub/platform-identity/server";

export async function GET(): Promise<NextResponse> {
  await getValidatedSession(await headers());

  const authorizationEvents = getSharedAuthorizationEvents()
    .listEvents()
    .slice(-50)
    .map((event) => ({
      eventId: String(event.eventId ?? "unknown"),
      occurredAt: String(event.occurredAt ?? new Date().toISOString()),
      category: "authorization",
      payload: (event.payload as Record<string, unknown>) ?? {},
    }));

  const tenantDiagnostics = getSharedTenantManagementService().getDiagnostics();

  const tenantEvents = [
    {
      eventId: "platform.tenant.diagnostics",
      occurredAt: new Date().toISOString(),
      category: "tenant",
      payload: { ...tenantDiagnostics } as Record<string, unknown>,
    },
  ];

  return NextResponse.json({
    data: [...authorizationEvents, ...tenantEvents].sort((a, b) =>
      b.occurredAt.localeCompare(a.occurredAt),
    ),
    meta: { count: authorizationEvents.length + tenantEvents.length },
  });
}
