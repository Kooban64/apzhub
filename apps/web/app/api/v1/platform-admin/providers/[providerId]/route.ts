export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminProviderDetail } from "@/lib/platform-admin/build-platform-providers";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(
  _request: Request,
  context: { params: Promise<{ providerId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;

  const { providerId: raw } = await context.params;
  const providerId = decodeURIComponent(raw);

  try {
    const data = await buildPlatformAdminProviderDetail(providerId);
    if (!data) {
      return NextResponse.json(
        { error: { code: "PROVIDER_NOT_FOUND", message: "Provider not found" } },
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
          code: "PROVIDER_DETAIL_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 500 },
    );
  }
}
