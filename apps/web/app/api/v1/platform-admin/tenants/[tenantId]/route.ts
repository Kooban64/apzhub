export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import { buildPlatformAdminTenants } from "@/lib/platform-admin/build-tenants-list";
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
    const list = await buildPlatformAdminTenants();
    const tenant = list.tenants.find((t) => t.tenantId === tenantId);
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
    return NextResponse.json({
      data: {
        tenant,
        tabs: [
          "overview",
          "subscription",
          "products",
          "users",
          "provisioning",
          "security",
          "audit",
        ] as const,
        detailAvailability: {
          overview: "partial" as const,
          subscription: "not_configured" as const,
          products: "not_configured" as const,
          users: "not_configured" as const,
          provisioning: "not_configured" as const,
          security: "not_configured" as const,
          audit: "not_configured" as const,
        },
      },
      meta: { permission: PLATFORM_ADMIN_PERMISSION },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "TENANT_DETAIL_FAILED",
          message: error instanceof Error ? error.message : "Failed to load tenant",
        },
      },
      { status: 500 },
    );
  }
}
