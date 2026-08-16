/**
 * Commerce onboarding HTTP handlers.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { onboardCommerceOrganisation } from "@/lib/commercial/commerce-onboarding";
import { checkoutPath, type CommerceCart } from "@/lib/commercial/commerce-cart";
import { getPackage } from "@/lib/commercial/catalogue";

export async function handleCommerceOnboardOrganisation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    slug?: string;
    packageId?: string;
    planId?: string;
    seats?: number;
  };

  const name = (body.name ?? "").trim();
  const slug = (body.slug ?? "").trim();
  if (!name) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Organisation name is required",
    });
  }

  try {
    const result = await onboardCommerceOrganisation({
      userId: context.session.user.id,
      name,
      slug: slug || name,
    });

    let checkoutHref = "/pricing/checkout?plan=plan.business";
    const packageId = (body.packageId ?? "").trim();
    if (packageId && getPackage(packageId)) {
      const cart: CommerceCart = {
        packageId,
        planId: body.planId === "plan.individual" ? "plan.individual" : "plan.business",
        seats:
          typeof body.seats === "number" && body.seats > 0 ? Math.floor(body.seats) : 1,
      };
      checkoutHref = checkoutPath(cart);
    }

    return jsonDataResponse(
      {
        ...result,
        checkoutHref,
      },
      context.tracing,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "commerce.org_slug_taken") {
      throw new PlatformApiHttpError(409, {
        code: "CONFLICT",
        message: "Organisation slug already taken",
      });
    }
    if (
      message === "commerce.org_name_required" ||
      message === "commerce.org_slug_invalid"
    ) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message,
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "ONBOARDING_FAILED",
      message,
    });
  }
}
