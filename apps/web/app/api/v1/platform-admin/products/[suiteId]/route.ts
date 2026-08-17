export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminProductDetail } from "@/lib/platform-admin/build-platform-products";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(
  _request: Request,
  context: { params: Promise<{ suiteId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;

  const { suiteId: raw } = await context.params;
  const suiteId = decodeURIComponent(raw);

  try {
    const data = await buildPlatformAdminProductDetail(suiteId);
    if (!data) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Product not found" } },
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
          code: "PRODUCT_DETAIL_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 500 },
    );
  }
}
