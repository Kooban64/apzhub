import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import {
  getPlatformTenantDiagnostics,
  getSharedTenantManagementService,
} from "@apzhub/platform-identity/server";

export async function GET(): Promise<NextResponse> {
  const session = await getValidatedSession(await headers());

  const inMemoryDiagnostics = getSharedTenantManagementService().getDiagnostics();
  let postgresDiagnostics: { tenantCount: number; membershipCount: number } | undefined;

  if (process.env.DATABASE_URL) {
    try {
      postgresDiagnostics = await getPlatformTenantDiagnostics();
    } catch {
      postgresDiagnostics = undefined;
    }
  }

  return NextResponse.json({
    data: {
      tenant: {
        inMemory: inMemoryDiagnostics,
        postgres: postgresDiagnostics ?? null,
      },
      session: session
        ? {
            userId: session.user.id,
            tenantId: session.tenantId ?? null,
            tenantSource: session.tenantSource ?? null,
          }
        : null,
    },
  });
}
