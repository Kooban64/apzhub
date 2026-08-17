export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminRoleDetail } from "@/lib/platform-admin/build-platform-identity";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(
  _request: Request,
  context: { params: Promise<{ roleId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;

  const { roleId: raw } = await context.params;
  const roleId = decodeURIComponent(raw);

  try {
    const data = await buildPlatformAdminRoleDetail(roleId);
    if (!data) {
      return NextResponse.json(
        { error: { code: "ROLE_NOT_FOUND", message: "Role not found" } },
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
          code: "ROLE_DETAIL_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 500 },
    );
  }
}
