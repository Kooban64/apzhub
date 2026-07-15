import { NextResponse } from "next/server";

import {
  getPlatformTenantDiagnostics,
  getSharedTenantManagementService,
  listPlatformTenants,
} from "@apzhub/platform-identity/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";

export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute();
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  let tenants = getSharedTenantManagementService().listTenants();
  let diagnostics = getSharedTenantManagementService().getDiagnostics();

  if (process.env.DATABASE_URL) {
    try {
      tenants = await listPlatformTenants();
      const postgresDiagnostics = await getPlatformTenantDiagnostics();
      diagnostics = {
        ...diagnostics,
        tenantCount: postgresDiagnostics.tenantCount,
        membershipCount: postgresDiagnostics.membershipCount,
      };
    } catch {
      // Use in-memory when database is unavailable.
    }
  }

  return NextResponse.json({
    data: tenants,
    meta: {
      count: tenants.length,
      diagnostics,
      authenticated: true,
      sessionTenantId: guard.session.tenantId ?? null,
    },
  });
}
