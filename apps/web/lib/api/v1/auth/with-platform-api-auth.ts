import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import type { EnrichedValidatedSession } from "@apzhub/auth/server";
import { runWithTenantContext } from "@apzhub/config";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import {
  applyTrafficHeaders,
  createTrafficDeniedBody,
  enforceTrafficGovernanceForHandler,
} from "@apzhub/platform-security/traffic";

import {
  authenticatePlatformApiRequest,
  requireAuthenticatedSession,
} from "./authenticate";
import {
  PlatformApiHttpError,
  translatePlatformApiError,
  validationError,
} from "../errors";
import { logPlatformApiRequest, logPlatformApiResponse } from "../logging";
import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "../request-context";
import { buildServiceRequestContext } from "../service-context";
import type { PlatformApiTracingContext } from "../types";

export interface PlatformApiRequestContext {
  readonly tracing: PlatformApiTracingContext;
  readonly session: EnrichedValidatedSession;
  readonly serviceContext: ServiceRequestContext;
}

export type PlatformApiRouteHandler = (
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) => NextResponse | Response | Promise<NextResponse | Response>;

export interface WithPlatformApiAuthOptions {
  readonly operation?: string;
}

/**
 * Wrap a platform API route handler with tracing, authentication, traffic governance,
 * logging, and error translation.
 *
 * APZQEP-152: attaches PermissionService grants to ServiceRequestContext and runs
 * the handler inside tenant RLS context. Cap A–F must fail closed (no elevation).
 */
export function withPlatformApiAuth(
  handler: PlatformApiRouteHandler,
  options: WithPlatformApiAuthOptions = {},
): (
  request: NextRequest,
  routeContext?: { params: Promise<Record<string, string>> },
) => Promise<NextResponse | Response> {
  return async (request, routeContext) => {
    const started = Date.now();
    const tracingResult = resolvePlatformApiTracing(request);
    if (!tracingResult.ok) {
      return translatePlatformApiError(
        validationError(tracingResult.message),
        createPlatformApiTracing(),
      ) as NextResponse;
    }

    const tracing = tracingResult.context;
    let session: EnrichedValidatedSession | undefined;
    let serviceContext: ServiceRequestContext | undefined;

    try {
      const auth = await authenticatePlatformApiRequest(request.headers);
      session = requireAuthenticatedSession(auth);
      const acceptLanguage = request.headers.get("accept-language") ?? undefined;
      const locale = acceptLanguage?.split(",")[0]?.trim().slice(0, 32);
      const tenantId =
        session.tenantId ?? session.user.tenantId ?? session.user.activeTenantId;

      const { resolveSessionAuthorization } =
        await import("@apzhub/platform-authorization/server");
      const authz = await resolveSessionAuthorization({
        userId: session.user.id,
        tenantId,
        productKey: "apzqep",
      });

      serviceContext = buildServiceRequestContext({
        session,
        tracing,
        locale: locale || undefined,
        permissions: authz.permissions,
      });

      const traffic = await enforceTrafficGovernanceForHandler(request, {
        userId: session.user.id,
        tenantId: session.tenantId ?? session.user.tenantId,
      });
      if (!traffic.allowed) {
        return NextResponse.json(createTrafficDeniedBody(), traffic.init);
      }

      const context: PlatformApiRequestContext = {
        tracing,
        session,
        serviceContext,
      };

      logPlatformApiRequest(request, context, options.operation);

      const response = await runWithTenantContext(serviceContext.tenantId, () =>
        handler(request, context, routeContext),
      );
      logPlatformApiResponse(
        { tracing, session, serviceContext },
        {
          method: request.method,
          path: request.nextUrl.pathname,
          status: response.status,
          durationMs: Date.now() - started,
          operation: options.operation,
        },
      );
      return applyTrafficHeaders(response, traffic.decision);
    } catch (error) {
      const response = translatePlatformApiError(error, tracing) as NextResponse;
      logPlatformApiResponse(
        { tracing, session, serviceContext },
        {
          method: request.method,
          path: request.nextUrl.pathname,
          status: response.status,
          durationMs: Date.now() - started,
          operation: options.operation,
          errorCode:
            error instanceof PlatformApiHttpError ? error.body.code : undefined,
        },
      );
      return response;
    }
  };
}
