import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

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
 * Wrap a Law API route handler with authentication, tenant binding, and persistence scope.
 * (LAW-014-02)
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

    const execute = async () => handler(request, result.context);

    if (result.context.persistenceContext) {
      return runWithLawApiPersistenceScopeAsync(
        result.context.persistenceContext,
        execute,
      );
    }

    return execute();
  };
}
