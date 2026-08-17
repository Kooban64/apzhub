export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { buildOrganisationAdminTeamDetail } from "@/lib/organisation-admin/build-teams";
import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";
import { requireOrganisationAdminRoute } from "@/lib/organisation-admin/route-guard";

export async function GET(
  _request: Request,
  context: { params: Promise<{ teamId: string }> },
): Promise<NextResponse> {
  const guard = await requireOrganisationAdminRoute(
    ORG_ADMIN_SURFACE_PERMISSIONS.teams,
  );
  if (!guard.ok) return guard.response as NextResponse;

  const { teamId: raw } = await context.params;
  const teamId = decodeURIComponent(raw);

  try {
    const data = await buildOrganisationAdminTeamDetail(guard.tenantId, teamId);
    if (!data) {
      return NextResponse.json(
        {
          error: {
            code: "TEAM_NOT_FOUND",
            message: "Team not found in this organisation",
          },
        },
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
          code: "ORG_ADMIN_TEAM_DETAIL_FAILED",
          message: error instanceof Error ? error.message : "Failed to load team",
        },
      },
      { status: 500 },
    );
  }
}
