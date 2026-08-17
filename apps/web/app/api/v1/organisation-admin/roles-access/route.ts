export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminRolesAccess } from "@/lib/organisation-admin/build-roles-access";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

export async function GET(): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(
    ORG_ADMIN_SURFACE_PERMISSIONS.rolesAccess,
  );
  if (!guard.ok) return guard.response as NextResponse;

  try {
    const data = await buildOrganisationAdminRolesAccess(guard.tenantId);
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
          code: "ORG_ADMIN_ROLES_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to load roles & access",
        },
      },
      { status: 500 },
    );
  }
}
