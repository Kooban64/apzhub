export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminProducts } from "@/lib/organisation-admin/build-products";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

export async function GET(): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(
    ORG_ADMIN_SURFACE_PERMISSIONS.products,
  );
  if (!guard.ok) return guard.response as NextResponse;

  try {
    const data = await buildOrganisationAdminProducts(guard.tenantId);
    if (!data) {
      return NextResponse.json(
        { error: { code: "TENANT_NOT_FOUND", message: "Organisation not found" } },
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
          code: "ORG_ADMIN_PRODUCTS_FAILED",
          message: error instanceof Error ? error.message : "Failed to list products",
        },
      },
      { status: 500 },
    );
  }
}
