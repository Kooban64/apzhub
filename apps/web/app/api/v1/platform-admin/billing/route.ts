export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminBilling } from "@/lib/platform-admin/build-platform-billing";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;
  try {
    const data = await buildPlatformAdminBilling();
    return NextResponse.json({
      data,
      meta: { permission: PLATFORM_ADMIN_PERMISSION },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "BILLING_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 500 },
    );
  }
}
