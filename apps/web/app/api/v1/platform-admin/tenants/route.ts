export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminTenants } from "@/lib/platform-admin/build-tenants-list";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

/** Platform Admin tenants directory — platform.nav.administration.view */
export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  try {
    const data = await buildPlatformAdminTenants();
    return NextResponse.json({
      data,
      meta: {
        permission: PLATFORM_ADMIN_PERMISSION,
        generatedAt: data.generatedAt,
        count: data.meta.total,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "TENANTS_LIST_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to load Platform Admin tenants",
        },
      },
      { status: 500 },
    );
  }
}
