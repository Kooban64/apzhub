import { NextResponse, type NextRequest } from "next/server";

import {
  applyTrafficHeaders,
  createTrafficDeniedBody,
  enforceTrafficGovernanceForHandler,
} from "@apzhub/platform-security/traffic";

import {
  buildLawApiAuthenticatedContext,
  type BuildLawApiAuthenticatedContextOptions,
  type LawApiAuthenticatedContext,
} from "../context/build-authenticated-context";
import { runWithLawApiPersistenceScopeAsync } from "../persistence/law-api-persistence-scope";

export type LawApiRouteHandler = (
  request: NextRequest,
  context: LawApiAuthenticatedContext,
) => NextResponse | Promise<NextResponse>;

export type WithLawApiAuthOptions = BuildLawApiAuthenticatedContextOptions;

/**
 * Wrap a Law API route handler with authentication, tenant binding, persistence scope,
 * and platform traffic governance (PRH-005).
 */
export function withLawApiAuth(
  handler: LawApiRouteHandler,
  options: WithLawApiAuthOptions = {},
): (request: NextRequest) => Promise<NextResponse> {
  return async (request: NextRequest) => {
    const result = await buildLawApiAuthenticatedContext(request, options);
    if (!result.ok) {
      return result.response;
    }

    const traffic = await enforceTrafficGovernanceForHandler(request, {
      userId: result.context.user?.userId,
      tenantId: result.context.tenantId,
    });
    if (!traffic.allowed) {
      return NextResponse.json(createTrafficDeniedBody(), traffic.init);
    }

    const execute = async () => {
      const response = await handler(request, result.context);
      return applyTrafficHeaders(response, traffic.decision);
    };

    if (result.context.persistenceContext) {
      return runWithLawApiPersistenceScopeAsync(
        result.context.persistenceContext,
        execute,
      );
    }

    return execute();
  };
}
