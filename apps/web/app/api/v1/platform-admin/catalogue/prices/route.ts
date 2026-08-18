/**
 * Platform Admin — catalogue list price overlay (compat).
 * Prefer /api/v1/platform-admin/commerce/control-plane for draft/publish.
 */

import { NextResponse } from "next/server";

import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import {
  listResolvedPackagePrices,
  listResolvedProductPrices,
  listUnsetResolvedPackagePriceFields,
  setPackageListPrice,
  setProductListPrice,
} from "@/lib/commercial/catalogue-price-overlay";
import {
  canManageCommercePricing,
  canReadCommercePricing,
} from "@/lib/commercial/commerce-permissions";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;
  const authz = await resolveSessionAuthorization({
    userId: guard.session.user.id,
    tenantId: guard.session.tenantId,
    productKey: "platform",
  });
  if (!canReadCommercePricing(authz.permissions) && !authz.permissions.includes("*")) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Missing commerce.pricing.read" } },
      { status: 403 },
    );
  }
  return NextResponse.json({
    data: {
      packages: listResolvedPackagePrices(),
      products: listResolvedProductPrices(),
      unsetPriceFields: listUnsetResolvedPackagePriceFields(),
    },
    meta: { permission: PLATFORM_ADMIN_PERMISSION },
  });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;
  const authz = await resolveSessionAuthorization({
    userId: guard.session.user.id,
    tenantId: guard.session.tenantId,
    productKey: "platform",
  });
  if (
    !canManageCommercePricing(authz.permissions) &&
    !authz.permissions.includes("*")
  ) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Missing commerce.pricing.manage" } },
      { status: 403 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as {
    packageId?: string;
    productKey?: string;
    amountCents?: number | null;
    reason?: string;
  };
  if (!body.reason || body.reason.trim().length < 3) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_FAILED",
          message: "commerce.change_reason_required",
        },
      },
      { status: 400 },
    );
  }
  try {
    if (body.packageId?.trim()) {
      setPackageListPrice(body.packageId.trim(), body.amountCents ?? null);
    } else if (body.productKey?.trim()) {
      setProductListPrice(body.productKey.trim(), body.amountCents ?? null);
    } else {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_FAILED",
            message: "packageId or productKey required",
          },
        },
        { status: 400 },
      );
    }
    return NextResponse.json({
      data: {
        packages: listResolvedPackagePrices(),
        products: listResolvedProductPrices(),
        unsetPriceFields: listUnsetResolvedPackagePriceFields(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "PRICE_UPDATE_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 400 },
    );
  }
}
