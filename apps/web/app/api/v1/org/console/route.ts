export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import {
  listOrgProductSubscriptions,
  listUserProductGrants,
  setUserProductGrants,
  resolveEffectiveProductKeys,
} from "@/lib/commercial/product-access";
import {
  listSuites,
  listPackages,
  getProduct,
  type PackageId,
  type ProductKey,
  type SuiteId,
} from "@/lib/commercial/catalogue";
import {
  subscribeOrganisationToPackage,
  subscribeOrganisationToSuites,
} from "@/lib/commercial/provisioning";
import { resolveTenantEntitlements } from "@/lib/commercial/resolve-entitlements";
import { upsertPostgresRoleAssignment } from "@apzhub/platform-authorization/postgres";

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  const organisationId =
    context.serviceContext.tenantId ??
    context.session.tenantId ??
    context.session.user.activeTenantId ??
    "";
  if (!organisationId) {
    throw new PlatformApiHttpError(403, {
      code: "TENANT_MEMBERSHIP_REQUIRED",
      message: "Organisation context required",
    });
  }

  const subscriptions = listOrgProductSubscriptions(organisationId);
  const suiteIds = [
    ...new Set(
      subscriptions.map((s) => getProduct(s.productKey)?.suiteId).filter(Boolean),
    ),
  ] as SuiteId[];

  const entitlements = resolveTenantEntitlements({
    organisationId,
    userId: context.session.user.id,
  });

  return jsonDataResponse(
    {
      organisationId,
      subscriptions,
      suiteIds,
      suites: listSuites(),
      packages: listPackages({ activeOnly: false }).map((pkg) => ({
        packageId: pkg.packageId,
        name: pkg.name,
        description: pkg.description,
        suiteId: pkg.suiteId,
        productKeys: pkg.productKeys,
        status: pkg.status,
        selfServe: pkg.selfServe,
        includesKnowledgeLite: pkg.includesKnowledgeLite,
      })),
      effectiveForSelf: entitlements.productKeys,
      entitlements,
    },
    context.tracing,
  );
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  const organisationId =
    context.serviceContext.tenantId ??
    context.session.tenantId ??
    context.session.user.activeTenantId ??
    "";
  if (!organisationId) {
    throw new PlatformApiHttpError(403, {
      code: "TENANT_MEMBERSHIP_REQUIRED",
      message: "Organisation context required",
    });
  }

  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    userId?: string;
    productKeys?: ProductKey[];
    suiteIds?: SuiteId[];
    packageId?: PackageId | string;
    roleId?: string;
    productKey?: string;
  };

  if (body.action === "grants.set") {
    if (!body.userId || !Array.isArray(body.productKeys)) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "userId and productKeys required",
      });
    }
    const grants = setUserProductGrants({
      organisationId,
      userId: body.userId,
      productKeys: body.productKeys,
    });
    return jsonDataResponse({ grants }, context.tracing);
  }

  if (body.action === "suites.subscribe") {
    if (!body.suiteIds?.length) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "suiteIds required",
      });
    }
    const result = subscribeOrganisationToSuites({
      organisationId,
      suiteIds: body.suiteIds,
      grantUserIds: [context.session.user.id],
    });
    return jsonDataResponse({ result }, context.tracing);
  }

  if (body.action === "packages.subscribe") {
    if (!body.packageId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "packageId required",
      });
    }
    try {
      const result = subscribeOrganisationToPackage({
        organisationId,
        packageId: body.packageId,
        grantUserIds: [context.session.user.id],
      });
      return jsonDataResponse({ result }, context.tracing);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "product.package_unknown";
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message,
      });
    }
  }

  if (body.action === "service_role.assign") {
    if (!body.userId || !body.roleId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "userId and roleId required",
      });
    }
    const subscribed = new Set(
      listOrgProductSubscriptions(organisationId).map((s) => s.productKey),
    );
    if (body.productKey && !subscribed.has(body.productKey as ProductKey)) {
      throw new PlatformApiHttpError(403, {
        code: "PRODUCT_ACCESS_DENIED",
        message: "Cannot assign role for unsubscribed product",
      });
    }
    await upsertPostgresRoleAssignment({
      userId: body.userId,
      roleId: body.roleId,
      tenantId: organisationId,
      productKey: body.productKey ?? null,
    });
    return jsonDataResponse({ ok: true }, context.tracing);
  }

  if (body.action === "grants.read") {
    if (!body.userId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "userId required",
      });
    }
    return jsonDataResponse(
      {
        grants: listUserProductGrants({
          organisationId,
          userId: body.userId,
        }),
        effective: resolveEffectiveProductKeys({
          organisationId,
          userId: body.userId,
        }),
      },
      context.tracing,
    );
  }

  throw new PlatformApiHttpError(400, {
    code: "VALIDATION_ERROR",
    message: "Unknown action",
  });
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "org.console.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "org.console.write",
});
