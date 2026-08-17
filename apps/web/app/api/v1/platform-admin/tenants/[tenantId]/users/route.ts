export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminTenantUsers } from "@/lib/platform-admin/build-tenant-users";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tenantId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const { tenantId: raw } = await context.params;
  const tenantId = decodeURIComponent(raw);

  try {
    const data = await buildPlatformAdminTenantUsers(tenantId);
    if (!data) {
      return NextResponse.json(
        {
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Tenant not found",
          },
        },
        { status: 404 },
      );
    }
    return NextResponse.json({
      data,
      meta: { permission: PLATFORM_ADMIN_PERMISSION },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "TENANT_USERS_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to load tenant users",
        },
      },
      { status: 500 },
    );
  }
}
