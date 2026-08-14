export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import {
  listComplianceSignups,
  upsertComplianceSignup,
} from "@/lib/commercial/platform-console-store";
import {
  listAllUserProductGrantsForOrg,
  listOrgProductSubscriptions,
} from "@/lib/commercial/product-access";
import { listSuites } from "@/lib/commercial/catalogue";

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  const organisationId =
    context.serviceContext.tenantId ??
    context.session.tenantId ??
    context.session.user.activeTenantId ??
    "";

  return jsonDataResponse(
    {
      signups: listComplianceSignups(),
      entitlementsPreview: organisationId
        ? {
            organisationId,
            subscriptions: listOrgProductSubscriptions(organisationId),
            grants: listAllUserProductGrantsForOrg(organisationId),
          }
        : null,
      suites: listSuites(),
      statutory: [
        { id: "vat", label: "VAT registration on file", status: "review" },
        { id: "popia", label: "POPIA processing agreement", status: "review" },
        { id: "bbee", label: "B-BBEE affidavit (SA orgs)", status: "optional" },
      ],
    },
    context.tracing,
  );
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    organisationId?: string;
    organisationName?: string;
    status?: "pending" | "approved" | "rejected";
    notes?: string;
  };
  if (body.action === "signup.review") {
    if (!body.organisationId || !body.organisationName) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_ERROR",
        message: "organisationId and organisationName required",
      });
    }
    const signup = upsertComplianceSignup({
      organisationId: body.organisationId,
      organisationName: body.organisationName,
      status: body.status,
      notes: body.notes,
    });
    return jsonDataResponse({ signup }, context.tracing);
  }
  throw new PlatformApiHttpError(400, {
    code: "VALIDATION_ERROR",
    message: "Unknown action",
  });
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "compliance.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "compliance.write",
});
