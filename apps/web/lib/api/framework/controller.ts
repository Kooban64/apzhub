import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { translateLawApiError } from "./errors";
import { logLawApiRequest, logLawApiResponse } from "./logging";
import type { LawApiWorkflowRunner } from "./workflow-runner";

export type LawApiControllerHandler = (
  request: NextRequest,
  context: LawApiAuthenticatedContext,
) => NextResponse | Promise<NextResponse>;

/**
 * Wrap a controller handler with request/response logging and error translation.
 * Business logic should remain in the handler's workflow service delegation.
 */
export function createLawApiController(
  handler: LawApiControllerHandler,
  options: {
    readonly operation?: string;
  } = {},
): LawApiControllerHandler {
  return async (request, context) => {
    const started = Date.now();
    logLawApiRequest(
      request,
      context,
      options.operation ?? "Law API controller invoked",
    );

    try {
      const response = await handler(request, context);
      logLawApiResponse(context, {
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        durationMs: Date.now() - started,
      });
      return response;
    } catch (error) {
      const response = translateLawApiError(error, context);
      logLawApiResponse(context, {
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        durationMs: Date.now() - started,
        errorCode: "INTERNAL_ERROR",
      });
      return response;
    }
  };
}

/** Adapter binding a workflow runner to controller handlers. */
export interface LawApiResourceControllerAdapter<TService> {
  readonly runner: LawApiWorkflowRunner<TService>;
  readonly withService: <T>(
    context: LawApiAuthenticatedContext,
    operation: (service: TService) => T | Promise<T>,
  ) => Promise<T>;
}

/** Create a resource controller adapter from a workflow runner. */
export function createResourceControllerAdapter<TService>(
  runner: LawApiWorkflowRunner<TService>,
): LawApiResourceControllerAdapter<TService> {
  return {
    runner,
    withService: (context, operation) => runner.withService(context, operation),
  };
}
