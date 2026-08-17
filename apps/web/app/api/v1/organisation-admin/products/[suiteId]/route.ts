export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminProductDetail } from "@/lib/organisation-admin/build-products";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

export async function GET(
  _request: Request,
  context: { params: Promise<{ suiteId: string }> },
): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(
    ORG_ADMIN_SURFACE_PERMISSIONS.products,
  );
  if (!guard.ok) return guard.response as NextResponse;

  const { suiteId: raw } = await context.params;
  const suiteId = decodeURIComponent(raw);

  try {
    const data = await buildOrganisationAdminProductDetail(guard.tenantId, suiteId);
    if (!data) {
      return NextResponse.json(
        { error: { code: "PRODUCT_NOT_FOUND", message: "Product suite not found" } },
        { status: 404 },
      );
    }
    return NextResponse.json({
      data,
      meta: { permission: guard.permission, tenantId: guard.tenantId },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ORG_ADMIN_PRODUCT_DETAIL_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to load product detail",
        },
      },
      { status: 500 },
    );
  }
}
