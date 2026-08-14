export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import {
  createApiCredential,
  listApiCredentials,
  listConsoleCustomers,
  listPaymentProviders,
  listPlatformLimits,
  listSecretRefs,
  removeConsoleCustomer,
  revokeApiCredential,
  updatePaymentProvider,
  updatePlatformLimit,
  upsertConsoleCustomer,
} from "@/lib/commercial/platform-console-store";
import {
  ensureApzorAllSuitesFree,
  subscribeOrganisationToSuites,
} from "@/lib/commercial/provisioning";
import { listSuites, getPublicCatalogue } from "@/lib/commercial/catalogue";
import type { SuiteId } from "@/lib/commercial/catalogue";

function requireSuperadmin(context: PlatformApiRequestContext): void {
  const perms = context.serviceContext.permissions ?? [];
  const ok =
    perms.includes("*") ||
    perms.includes("admin.platform") ||
    perms.includes("platform.*");
  if (!ok) {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Superadmin required",
    });
  }
}

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  requireSuperadmin(context);
  ensureApzorAllSuitesFree();
  return jsonDataResponse(
    {
      customers: listConsoleCustomers(),
      payments: listPaymentProviders(),
      apiCredentials: listApiCredentials(),
      limits: listPlatformLimits(),
      secrets: listSecretRefs(),
      suites: listSuites(),
      catalogue: getPublicCatalogue(),
    },
    context.tracing,
  );
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireSuperadmin(context);
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    organisationId?: string;
    name?: string;
    suiteIds?: SuiteId[];
    customerId?: string;
    providerId?: string;
    enabled?: boolean;
    merchantIdRef?: string;
    webhookUrl?: string;
    credentialId?: string;
    limitId?: string;
    value?: number;
  };

  switch (body.action) {
    case "customer.upsert": {
      if (!body.organisationId || !body.name) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_ERROR",
          message: "organisationId and name required",
        });
      }
      const customer = upsertConsoleCustomer({
        organisationId: body.organisationId,
        name: body.name,
        suiteIds: body.suiteIds,
      });
      if (body.suiteIds?.length) {
        subscribeOrganisationToSuites({
          organisationId: body.organisationId,
          suiteIds: body.suiteIds,
          planId: "plan.custom",
        });
      }
      return jsonDataResponse({ customer }, context.tracing);
    }
    case "customer.remove": {
      if (!body.customerId) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_ERROR",
          message: "customerId required",
        });
      }
      return jsonDataResponse(
        { removed: removeConsoleCustomer(body.customerId) },
        context.tracing,
      );
    }
    case "payment.update": {
      if (!body.providerId) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_ERROR",
          message: "providerId required",
        });
      }
      return jsonDataResponse(
        {
          provider: updatePaymentProvider(body.providerId, {
            enabled: body.enabled,
            merchantIdRef: body.merchantIdRef,
            webhookUrl: body.webhookUrl,
          }),
        },
        context.tracing,
      );
    }
    case "api_key.create": {
      const created = createApiCredential(body.name?.trim() || "API key");
      return jsonDataResponse(created, context.tracing);
    }
    case "api_key.revoke": {
      if (!body.credentialId) {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_ERROR",
          message: "credentialId required",
        });
      }
      return jsonDataResponse(
        { credential: revokeApiCredential(body.credentialId) },
        context.tracing,
      );
    }
    case "limit.update": {
      if (!body.limitId || typeof body.value !== "number") {
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_ERROR",
          message: "limitId and value required",
        });
      }
      return jsonDataResponse(
        { limit: updatePlatformLimit(body.limitId, body.value) },
        context.tracing,
      );
    }
    case "apzor.ensure_suites": {
      return jsonDataResponse({ result: ensureApzorAllSuitesFree() }, context.tracing);
    }
    default:
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "Unknown action",
      });
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "console.platform.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "console.platform.write",
});
