/**
 * Platform Admin commercial control-plane HTTP API.
 */

import { NextResponse } from "next/server";

import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";

import { requirePlatformAdminRoute } from "@/lib/api/platform/platform-route-guard";
import {
  canManageCommerceCatalogue,
  canManageCommerceDiscounts,
  canManageCommercePricing,
  canManageCommerceTax,
  canReadCommercePricing,
} from "@/lib/commercial/commerce-permissions";
import {
  getCommercialPlane,
  getOrInitItem,
  listCatalogueItemsForAdmin,
  listPlansForAdmin,
  listPriceHistory,
  listRegions,
  publishItemRegion,
  publishPlan,
  setItemAvailability,
  setItemDraftPrice,
  setSubscriptionRepricePolicy,
  upsertDiscountRule,
  upsertPlanState,
  upsertRegion,
  upsertTaxRule,
  type CatalogueAvailability,
  type PricingUnit,
} from "@/lib/commercial/commercial-config";
import { quoteCommerceBasket } from "@/lib/commercial/commerce-quote";
import {
  commercialReadiness,
  listPublicPricing,
} from "@/lib/commercial/public-pricing";
import { PLATFORM_ADMIN_PERMISSION } from "@/lib/platform-admin/nav";

async function sessionPermissions(
  userId: string,
  tenantId: string | undefined,
): Promise<readonly string[]> {
  const snap = await resolveSessionAuthorization({
    userId,
    tenantId,
    productKey: "platform",
  });
  return snap.permissions;
}

function forbid(message: string): NextResponse {
  return NextResponse.json({ error: { code: "FORBIDDEN", message } }, { status: 403 });
}

export async function GET(): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;
  const granted = await sessionPermissions(
    guard.session.user.id,
    guard.session.tenantId,
  );
  if (!canReadCommercePricing(granted) && !granted.includes("*")) {
    return forbid("Missing permission: commerce.pricing.read");
  }
  const plane = getCommercialPlane();
  return NextResponse.json({
    data: {
      regions: listRegions(),
      items: listCatalogueItemsForAdmin().map((row) => ({
        ...row,
        item: getOrInitItem(row.packageId),
      })),
      plans: listPlansForAdmin(),
      taxRules: plane.taxRules,
      discounts: plane.discounts,
      history: listPriceHistory().slice(0, 100),
      repricePolicy: plane.subscriptionRepricePolicy,
      quoteTtlMs: plane.quoteTtlMs,
      readiness: commercialReadiness(),
      previewBook: listPublicPricing({ regionId: "SOUTH_AFRICA", layer: "draft" }),
      publishedBook: listPublicPricing({
        regionId: "SOUTH_AFRICA",
        layer: "published",
      }),
      canManage: {
        pricing: canManageCommercePricing(granted) || granted.includes("*"),
        catalogue: canManageCommerceCatalogue(granted) || granted.includes("*"),
        discounts: canManageCommerceDiscounts(granted) || granted.includes("*"),
        tax: canManageCommerceTax(granted) || granted.includes("*"),
      },
    },
    meta: { permission: PLATFORM_ADMIN_PERMISSION },
  });
}

export async function PATCH(request: Request): Promise<NextResponse> {
  const guard = await requirePlatformAdminRoute(PLATFORM_ADMIN_PERMISSION);
  if (!guard.ok) return guard.response as NextResponse;
  const granted = await sessionPermissions(
    guard.session.user.id,
    guard.session.tenantId,
  );
  const actorUserId = guard.session.user.id;
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const action = String(body.action ?? "").trim();
  const reason = typeof body.reason === "string" ? body.reason : "";

  try {
    if (action === "preview-quote") {
      const layer = body.layer === "draft" ? "draft" : "published";
      const adminPreview = body.adminPreview === true || layer === "draft";
      const quote = quoteCommerceBasket({
        packageIds: Array.isArray(body.packageIds) ? (body.packageIds as string[]) : [],
        lines: Array.isArray(body.lines)
          ? (body.lines as { packageId: string; quantity?: number }[])
          : undefined,
        countryCode: typeof body.countryCode === "string" ? body.countryCode : "ZA",
        interval: body.interval === "year" ? "year" : "month",
        seats: typeof body.seats === "number" ? body.seats : 1,
        layer,
        adminPreview,
      });
      return NextResponse.json({ data: { quote } });
    }

    const managePricing = canManageCommercePricing(granted) || granted.includes("*");
    const manageCatalogue =
      canManageCommerceCatalogue(granted) || granted.includes("*");
    const manageDiscount = canManageCommerceDiscounts(granted) || granted.includes("*");
    const manageTax = canManageCommerceTax(granted) || granted.includes("*");

    if (action === "draft-price") {
      if (!managePricing) return forbid("Missing permission: commerce.pricing.manage");
      const item = setItemDraftPrice({
        packageId: String(body.packageId ?? ""),
        regionId: String(body.regionId ?? "SOUTH_AFRICA"),
        price: {
          amountCents:
            body.amountCents === null || body.amountCents === ""
              ? null
              : Number(body.amountCents),
          currency: String(body.currency ?? "ZAR"),
          annualAmountCents:
            body.annualAmountCents === null || body.annualAmountCents === ""
              ? null
              : Number(body.annualAmountCents),
          annualDiscountBps:
            body.annualDiscountBps === null || body.annualDiscountBps === ""
              ? null
              : Number(body.annualDiscountBps),
        },
        pricingUnit: body.pricingUnit as PricingUnit | undefined,
        actorUserId,
        reason,
      });
      return NextResponse.json({ data: { item } });
    }

    if (action === "publish-price") {
      if (!managePricing) return forbid("Missing permission: commerce.pricing.manage");
      const item = publishItemRegion({
        packageId: String(body.packageId ?? ""),
        regionId: typeof body.regionId === "string" ? body.regionId : undefined,
        actorUserId,
        reason,
        effectiveFrom:
          typeof body.effectiveFrom === "string" ? body.effectiveFrom : null,
      });
      return NextResponse.json({ data: { item } });
    }

    if (action === "availability") {
      if (!manageCatalogue)
        return forbid("Missing permission: commerce.catalogue.manage");
      const item = setItemAvailability({
        packageId: String(body.packageId ?? ""),
        status: String(body.status ?? "") as CatalogueAvailability,
        actorUserId,
        reason,
      });
      return NextResponse.json({ data: { item } });
    }

    if (action === "upsert-region") {
      if (!managePricing) return forbid("Missing permission: commerce.pricing.manage");
      const region = upsertRegion(
        {
          regionId: String(body.regionId ?? ""),
          name: String(body.name ?? body.regionId ?? ""),
          countryCodes: Array.isArray(body.countryCodes)
            ? (body.countryCodes as string[])
            : [],
          currency: String(body.currency ?? "USD"),
          strategy:
            body.strategy === "percentage_from_parent"
              ? "percentage_from_parent"
              : "fixed",
          parentRegionId:
            typeof body.parentRegionId === "string" ? body.parentRegionId : null,
          adjustmentBps:
            body.adjustmentBps === null || body.adjustmentBps === ""
              ? null
              : Number(body.adjustmentBps),
          status: body.status === "inactive" ? "inactive" : "active",
        },
        actorUserId,
        reason,
      );
      return NextResponse.json({ data: { region } });
    }

    if (action === "upsert-tax") {
      if (!manageTax) return forbid("Missing permission: commerce.tax.manage");
      const tax = upsertTaxRule(
        {
          taxRuleId: typeof body.taxRuleId === "string" ? body.taxRuleId : undefined,
          countryCode: String(body.countryCode ?? "ZA"),
          name: String(body.name ?? "VAT"),
          rateBps: Number(body.rateBps ?? 0),
          pricesExclusive: body.pricesExclusive !== false,
          status: body.status === "published" ? "published" : "draft",
        },
        actorUserId,
        reason,
      );
      return NextResponse.json({ data: { tax } });
    }

    if (action === "upsert-discount") {
      if (!manageDiscount)
        return forbid("Missing permission: commerce.discount.manage");
      const discount = upsertDiscountRule(
        {
          discountId: typeof body.discountId === "string" ? body.discountId : undefined,
          kind:
            (body.kind as "regional" | "annual" | "promotional" | "manual") ??
            "promotional",
          name: String(body.name ?? "Discount"),
          code: typeof body.code === "string" ? body.code : undefined,
          adjustmentBps:
            body.adjustmentBps === null || body.adjustmentBps === ""
              ? null
              : Number(body.adjustmentBps),
          amountCents:
            body.amountCents === null || body.amountCents === ""
              ? null
              : Number(body.amountCents),
          status: body.status === "published" ? "published" : "draft",
        },
        actorUserId,
        reason,
      );
      return NextResponse.json({ data: { discount } });
    }

    if (action === "upsert-plan") {
      if (!managePricing) return forbid("Missing permission: commerce.pricing.manage");
      const plan = upsertPlanState(
        {
          planId: String(body.planId ?? ""),
          status:
            body.status === "contact_sales" || body.status === "hidden"
              ? body.status
              : "active",
          draft: {
            amountCents:
              body.amountCents === null || body.amountCents === ""
                ? null
                : Number(body.amountCents),
            currency: String(body.currency ?? "ZAR"),
            trialDays:
              body.trialDays === null || body.trialDays === ""
                ? null
                : Number(body.trialDays),
            annualEnabled: body.annualEnabled === true,
            annualDiscountBps:
              body.annualDiscountBps === null || body.annualDiscountBps === ""
                ? null
                : Number(body.annualDiscountBps),
            annualAmountCents:
              body.annualAmountCents === null || body.annualAmountCents === ""
                ? null
                : Number(body.annualAmountCents),
          },
        },
        actorUserId,
        reason,
      );
      return NextResponse.json({ data: { plan } });
    }

    if (action === "publish-plan") {
      if (!managePricing) return forbid("Missing permission: commerce.pricing.manage");
      const plan = publishPlan(String(body.planId ?? ""), actorUserId, reason);
      return NextResponse.json({ data: { plan } });
    }

    if (action === "reprice-policy") {
      if (!managePricing) return forbid("Missing permission: commerce.pricing.manage");
      const policy = setSubscriptionRepricePolicy(
        body.policy === "next_renewal" || body.policy === "immediately"
          ? body.policy
          : "new_customers_only",
        actorUserId,
        reason,
      );
      return NextResponse.json({ data: { policy } });
    }

    return NextResponse.json(
      { error: { code: "VALIDATION_FAILED", message: "Unknown action" } },
      { status: 400 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: {
          code: "COMMERCE_CONTROL_FAILED",
          message: error instanceof Error ? error.message : "Failed",
        },
      },
      { status: 400 },
    );
  }
}
