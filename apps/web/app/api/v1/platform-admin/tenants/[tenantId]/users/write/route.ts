export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import {
  addTenantUser,
  listProductRolesForWrite,
  listStaffFunctionsForWrite,
} from "@/lib/platform-admin/iam-write-service";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(
  _request: Request,
  context: { params: Promise<{ tenantId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;
  void (await context.params);
  return NextResponse.json({
    data: {
      staffFunctions: listStaffFunctionsForWrite(),
      productRoles: listProductRolesForWrite(),
    },
    meta: { permission: PLATFORM_ADMIN_PERMISSION },
  });
}

export async function POST(
  request: Request,
  context: { params: Promise<{ tenantId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;

  const { tenantId: raw } = await context.params;
  const tenantId = decodeURIComponent(raw);

  try {
    const body = (await request.json()) as {
      email?: string;
      displayName?: string;
      staffFunctionId?: string;
      jobTitle?: string;
      productKeys?: string[];
      productRoles?: { productKey: string; roleId: string }[];
      resourceScopeGrants?: string[];
      professionalToolIds?: string[];
      professionalToolsReason?: string;
      professionalToolsExpiresAt?: string;
      ensureOrgSubscriptions?: boolean;
    };

    if (!body.email?.trim() || !body.staffFunctionId?.trim()) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "email and staffFunctionId are required",
          },
        },
        { status: 400 },
      );
    }

    const result = await addTenantUser({
      tenantId,
      invitedBy: guard.session.user.id,
      email: body.email,
      displayName: body.displayName?.trim() || body.email.split("@")[0] || "User",
      staffFunctionId: body.staffFunctionId,
      jobTitle: body.jobTitle,
      productKeys: body.productKeys,
      productRoles: body.productRoles,
      resourceScopeGrants: body.resourceScopeGrants,
      professionalToolIds: body.professionalToolIds as
        ("workflow-designer" | "analytics-models")[] | undefined,
      professionalToolsReason: body.professionalToolsReason,
      professionalToolsExpiresAt: body.professionalToolsExpiresAt,
      ensureOrgSubscriptions: body.ensureOrgSubscriptions,
    });

    return NextResponse.json({
      data: result,
      meta: { permission: PLATFORM_ADMIN_PERMISSION },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "ADD_USER_FAILED",
          message: error instanceof Error ? error.message : "Add user failed",
        },
      },
      { status: 500 },
    );
  }
}
