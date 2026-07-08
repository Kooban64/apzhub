import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import { parseJsonBody, type LawApiValidationResult } from "../validation";
import type { LawApiRequestContext } from "../types";
import { malformedRequestResponse } from "./responses";

export type LawApiValidationStep<T> = () =>
  LawApiValidationResult<T> | Promise<LawApiValidationResult<T>>;

/**
 * Run validation steps in order; returns the first failure response or the last success.
 */
export async function runValidationPipeline<T>(
  steps: readonly LawApiValidationStep<T>[],
): Promise<LawApiValidationResult<T>> {
  if (steps.length === 0) {
    throw new Error("Validation pipeline requires at least one step.");
  }

  let lastSuccess: LawApiValidationResult<T> | undefined;

  for (const step of steps) {
    const result = await step();
    if (!result.ok) {
      return result;
    }
    lastSuccess = result;
  }

  return lastSuccess as LawApiValidationResult<T>;
}

/** Parse JSON body as the first step in a validation pipeline. */
export async function parseJsonBodyStep<T = unknown>(
  request: NextRequest,
  context: LawApiRequestContext,
): Promise<LawApiValidationResult<T>> {
  return parseJsonBody<T>(request, context);
}

/** Ensure required fields are present on a parsed JSON body. */
export function requireRequestFields(
  body: Record<string, unknown>,
  fields: readonly string[],
  context: LawApiRequestContext,
): LawApiValidationResult<Record<string, unknown>> {
  const missing = fields.filter((field) => typeof body[field] !== "string");

  if (missing.length > 0) {
    return {
      ok: false,
      response: malformedRequestResponse(
        context,
        `${missing.join(", ")} ${missing.length === 1 ? "is" : "are"} required.`,
      ),
    };
  }

  return { ok: true, value: body };
}

/** Type guard helper for validation pipeline field checks. */
export function assertRequiredStringFields(
  body: Record<string, unknown>,
  fields: readonly string[],
): body is Record<string, unknown> & Record<(typeof fields)[number], string> {
  return fields.every((field) => typeof body[field] === "string");
}

/** Wrap a handler with automatic Law API error translation. */
export async function withLawApiErrorHandling(
  context: LawApiRequestContext,
  handler: () => NextResponse | Promise<NextResponse>,
  translateError: (error: unknown, context: LawApiRequestContext) => NextResponse,
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error) {
    return translateError(error, context);
  }
}
