export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminUserInspector } from "@/lib/platform-admin/build-user-inspector";
import { listPlatformTenants } from "@apzhub/platform-identity/server";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tenantId: string; userId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const { tenantId: rawTenant, userId: rawUser } = await context.params;
  const tenantId = decodeURIComponent(rawTenant);
  const userId = decodeURIComponent(rawUser);

  try {
    const tenants = await listPlatformTenants();
    const tenant = tenants.find((t) => t.tenantId === tenantId);
    if (!tenant) {
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

    const data = await buildPlatformAdminUserInspector({
      tenantId,
      userId,
      tenantName: tenant.name,
    });
    if (!data) {
      return NextResponse.json(
        {
          error: {
            code: "MEMBERSHIP_NOT_FOUND",
            message: "User is not a member of this tenant",
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
          code: "USER_INSPECTOR_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to load user inspector",
        },
      },
      { status: 500 },
    );
  }
}
