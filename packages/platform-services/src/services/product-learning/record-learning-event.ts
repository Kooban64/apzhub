import { randomUUID } from "node:crypto";

import type {
  ProductLearningEvent,
  RecordProductLearningEventInput,
  ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  CONTEXT_LEARNING_EVENT_NAMES,
  PRODUCT_LEARNING_FEATURE_KEYS,
} from "@apzhub/platform-service-contracts";

import type { ProductLearningEventStore } from "./store";

const MAX_COMMENT_LENGTH = 280;

const FORBIDDEN_PROPERTY_KEYS = new Set([
  "userId",
  "actorId",
  "email",
  "title",
  "summary",
  "content",
  "documentContent",
  "projectName",
  "body",
]);

function sanitizeProperties(
  properties: Readonly<Record<string, unknown>> | undefined,
): Record<string, unknown> {
  if (!properties) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (FORBIDDEN_PROPERTY_KEYS.has(key)) continue;
    if (key === "comment" && typeof value === "string") {
      out.comment = value.slice(0, MAX_COMMENT_LENGTH);
      continue;
    }
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      out[key] = value;
      continue;
    }
    if (Array.isArray(value) && value.every((item) => typeof item === "string")) {
      out[key] = value.slice(0, 20);
    }
  }
  return out;
}

export function assertValidLearningEventInput(
  input: RecordProductLearningEventInput,
): void {
  if (
    !PRODUCT_LEARNING_FEATURE_KEYS.includes(
      input.featureKey as (typeof PRODUCT_LEARNING_FEATURE_KEYS)[number],
    )
  ) {
    throw new Error("product_learning_feature_unsupported");
  }
  if (
    !CONTEXT_LEARNING_EVENT_NAMES.includes(
      input.eventName as (typeof CONTEXT_LEARNING_EVENT_NAMES)[number],
    )
  ) {
    throw new Error("product_learning_event_unsupported");
  }
}

export async function recordProductLearningEvent(
  ctx: ServiceRequestContext,
  store: ProductLearningEventStore,
  input: RecordProductLearningEventInput,
): Promise<ProductLearningEvent> {
  assertValidLearningEventInput(input);

  const event: ProductLearningEvent = Object.freeze({
    id: `ple_${randomUUID().replace(/-/g, "")}`,
    tenantId: ctx.tenantId ?? "default",
    featureKey: input.featureKey,
    eventName: input.eventName,
    properties: Object.freeze(sanitizeProperties(input.properties)),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    correlationId: input.correlationId ?? ctx.correlationId,
  });

  await store.append(event);
  return event;
}
