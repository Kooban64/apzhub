export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminIntegrationDetail } from "@/lib/organisation-admin/build-integrations";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

export async function GET(
  _request: Request,
  context: { readonly params: Promise<{ readonly integrationId: string }> },
): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(
    ORG_ADMIN_SURFACE_PERMISSIONS.integrations,
  );
  if (!guard.ok) return guard.response as NextResponse;
  try {
    const { integrationId } = await context.params;
    const data = await buildOrganisationAdminIntegrationDetail(
      guard.tenantId,
      integrationId,
    );
    if (!data) {
      return NextResponse.json(
        { error: { code: "NOT_FOUND", message: "Integration not found" } },
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
          code: "ORG_ADMIN_INTEGRATION_DETAIL_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 500 },
    );
  }
}
