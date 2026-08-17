export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminPerson } from "@/lib/organisation-admin/build-people";
import { ORGANISATION_ADMIN_PERMISSION } from "@/lib/organisation-admin/nav";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

/**
 * Organisation Admin person inspector — session tenant only.
 * Never accepts a client-supplied tenantId.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ userId: string }> },
): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(ORGANISATION_ADMIN_PERMISSION);
  if (!guard.ok) {
    return guard.response as NextResponse;
  }

  const { userId: rawUser } = await context.params;
  const userId = decodeURIComponent(rawUser);

  try {
    const data = await buildOrganisationAdminPerson(guard.tenantId, userId);
    if (!data) {
      return NextResponse.json(
        {
          error: {
            code: "MEMBERSHIP_NOT_FOUND",
            message: "User is not a member of this organisation",
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
          code: "ORG_ADMIN_PERSON_FAILED",
          message:
            error instanceof Error ? error.message : "Failed to load person inspector",
        },
      },
      { status: 500 },
    );
  }
}
