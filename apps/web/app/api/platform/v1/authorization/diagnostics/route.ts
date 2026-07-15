import { NextResponse } from "next/server";

import {
  getSharedAuthorizationEvents,
  getSharedAuthorizationService,
} from "@apzhub/platform-authorization";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";

export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute();
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const service = getSharedAuthorizationService();
  const inMemoryDiagnostics = service.getDiagnostics();
  let postgresDiagnostics: { roleCount: number; permissionCount: number; assignmentCount: number } | null =
    null;

  if (process.env.DATABASE_URL) {
    try {
      const { getPostgresAuthorizationDiagnostics } = await import(
        "@apzhub/platform-authorization/postgres"
      );
      postgresDiagnostics = await getPostgresAuthorizationDiagnostics();
    } catch {
      postgresDiagnostics = null;
    }
  }

  return NextResponse.json({
    data: {
      diagnostics: {
        inMemory: inMemoryDiagnostics,
        postgres: postgresDiagnostics,
      },
      events: getSharedAuthorizationEvents().listEvents().slice(-20),
      session: {
        userId: guard.session.user.id,
        tenantId: guard.session.tenantId ?? null,
      },
    },
  });
}
