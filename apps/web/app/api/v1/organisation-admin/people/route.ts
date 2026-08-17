export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminPeople } from "@/lib/organisation-admin/build-people";
import { ORGANISATION_ADMIN_PERMISSION } from "@/lib/organisation-admin/nav";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

/**
 * Organisation Admin People list — session tenant memberships only.
 */
export async function GET(): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(ORGANISATION_ADMIN_PERMISSION);
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  try {
    const data = await buildOrganisationAdminPeople(guard.tenantId);
    if (!data) {
      return NextResponse.json(
        {
          error: {
            code: "TENANT_NOT_FOUND",
            message: "Active organisation was not found",
          },
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      data,
      meta: {
        permission: ORGANISATION_ADMIN_PERMISSION,
        tenantId: guard.tenantId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ORG_ADMIN_PEOPLE_FAILED",
          message:
            error instanceof Error
              ? error.message
              : "Failed to list organisation people",
        },
      },
      { status: 500 },
    );
  }
}
