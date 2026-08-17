export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminAudit } from "@/lib/organisation-admin/build-audit";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

export async function GET(request: Request): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(
    ORG_ADMIN_SURFACE_PERMISSIONS.audit,
  );
  if (!guard.ok) return guard.response as NextResponse;
  try {
    const url = new URL(request.url);
    const data = await buildOrganisationAdminAudit(guard.tenantId, {
      q: url.searchParams.get("q") ?? undefined,
      area: url.searchParams.get("area") ?? undefined,
      actor: url.searchParams.get("actor") ?? undefined,
      limit: url.searchParams.get("limit")
        ? Number(url.searchParams.get("limit"))
        : undefined,
    });
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
          code: "ORG_ADMIN_AUDIT_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 500 },
    );
  }
}
