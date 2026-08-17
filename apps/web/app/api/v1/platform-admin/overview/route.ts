export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminOverview } from "@/lib/platform-admin/build-overview";
import type { OverviewWindow } from "@/lib/platform-admin/overview-types";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

function parseWindow(raw: string | null): OverviewWindow {
  if (raw === "7d" || raw === "30d" || raw === "24h") return raw;
  return "24h";
}

/**
 * Platform Admin Overview aggregate.
 * Permission: platform.nav.administration.view
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const window = parseWindow(request.nextUrl.searchParams.get("window"));
  try {
    const data = await buildPlatformAdminOverview(window);
    return NextResponse.json({
      data,
      meta: {
        permission: PLATFORM_ADMIN_PERMISSION,
        generatedAt: data.generatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "OVERVIEW_BUILD_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to build Platform Admin Overview",
        },
      },
      { status: 500 },
    );
  }
}
