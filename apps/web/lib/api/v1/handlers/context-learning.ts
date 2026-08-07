/**
 * Enterprise Context Product Learning HTTP handlers (APZHUB-CONTEXT-LEARNING-001).
 */

import type { NextRequest } from "next/server";

import {
  CONTEXT_LEARNING_EVENT_NAMES,
  type ContextLearningEventName,
  type RecordProductLearningEventInput,
} from "@apzhub/platform-service-contracts";
import {
  createProductLearningService,
  getMemoryProductLearningStore,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function learningService() {
  // Postgres after migration; createProductLearningService falls back to memory on write/list failure.
  try {
    return createProductLearningService();
  } catch {
    return createProductLearningService(getMemoryProductLearningStore());
  }
}

function isEventName(value: unknown): value is ContextLearningEventName {
  return (
    typeof value === "string" &&
    (CONTEXT_LEARNING_EVENT_NAMES as readonly string[]).includes(value)
  );
}

export async function handlePostContextLearningEvent(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }

  if (typeof body !== "object" || body === null) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Body must be an object." },
      context.tracing,
    );
  }

  const record = body as Record<string, unknown>;
  if (!isEventName(record.eventName)) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Unsupported eventName." },
      context.tracing,
    );
  }

  const input: RecordProductLearningEventInput = {
    featureKey: "enterprise-context",
    eventName: record.eventName,
    properties:
      typeof record.properties === "object" && record.properties !== null
        ? (record.properties as Record<string, unknown>)
        : {},
    occurredAt: typeof record.occurredAt === "string" ? record.occurredAt : undefined,
    correlationId: context.tracing.correlationId,
  };

  await learningService().record(context.serviceContext, input);
  return jsonDataResponse({ accepted: true }, context.tracing, { status: 202 });
}

export async function handleGetContextLearningSummary(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const summary = await learningService().summarizeEnterpriseContext(
    context.serviceContext,
  );
  return jsonDataResponse(summary, context.tracing);
}
