export const runtime = "nodejs";

import { NextResponse } from "next/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import {
  manageTenantUserAccess,
  previewProductRoleChange,
} from "@/lib/platform-admin/iam-write-service";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function POST(
  request: Request,
  context: { params: Promise<{ tenantId: string; userId: string }> },
): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;

  const { tenantId: rawTenant, userId: rawUser } = await context.params;
  const tenantId = decodeURIComponent(rawTenant);
  const userId = decodeURIComponent(rawUser);

  try {
    const body = (await request.json()) as {
      previewOnly?: boolean;
      productKey?: string;
      toRoleId?: string;
      productKeys?: string[];
      productRoles?: { productKey: string; roleId: string }[];
      resourceScopeGrants?: string[];
      professionalTools?: {
        toolId: "workflow-designer" | "analytics-models";
        action: "grant" | "revoke";
        reason?: string;
        expiresAt?: string;
        grantId?: string;
      }[];
    };

    if (body.previewOnly && body.productKey && body.toRoleId) {
      const preview = await previewProductRoleChange({
        tenantId,
        userId,
        productKey: body.productKey,
        toRoleId: body.toRoleId,
      });
      return NextResponse.json({
        data: { preview },
        meta: { permission: PLATFORM_ADMIN_PERMISSION },
      });
    }

    const result = await manageTenantUserAccess({
      tenantId,
      userId,
      actorUserId: guard.session.user.id,
      productKeys: body.productKeys,
      productRoles: body.productRoles,
      resourceScopeGrants: body.resourceScopeGrants,
      professionalTools: body.professionalTools,
    });

    return NextResponse.json({
      data: result,
      meta: { permission: PLATFORM_ADMIN_PERMISSION },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "MANAGE_ACCESS_FAILED",
          message: error instanceof Error ? error.message : "Manage access failed",
        },
      },
      { status: 500 },
    );
  }
}
