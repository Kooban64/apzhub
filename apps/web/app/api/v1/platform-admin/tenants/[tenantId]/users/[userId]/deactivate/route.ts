export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { deactivateTenantUser } from "@/lib/platform-admin/iam-write-service";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function POST(
  _request: Request,
  context: { params: Promise<{ tenantId: string; userId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;

  const { tenantId: rawTenant, userId: rawUser } = await context.params;
  const tenantId = decodeURIComponent(rawTenant);
  const userId = decodeURIComponent(rawUser);

  try {
    const result = await deactivateTenantUser({ tenantId, userId });
    return NextResponse.json({
      data: result,
      meta: { permission: PLATFORM_ADMIN_PERMISSION },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "DEACTIVATE_FAILED",
          message: error instanceof Error ? error.message : "Deactivate failed",
        },
      },
      { status: 500 },
    );
  }
}
