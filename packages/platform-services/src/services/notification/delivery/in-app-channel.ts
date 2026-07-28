/**
 * In-app delivery channel abstraction (ENG-001B-P3).
 * Pure channel I/O — no Maps, no durable persistence, no SMTP/providers.
 */

import type {
  NotificationDeliveryRecord,
  NotificationFailureClass,
  NotificationInAppItem,
  NotificationIntent,
  NotificationReceiptLevel,
} from "@apzhub/notification-contracts";

import {
  isNotificationInAppEnabled,
  type NotificationDeliveryEnv,
} from "./delivery-env";

export type InAppChannelDispatchResult = {
  readonly ok: boolean;
  readonly receiptLevel: NotificationReceiptLevel;
  readonly failureClass?: NotificationFailureClass;
  readonly failureCode?: string;
  readonly item?: NotificationInAppItem;
  /** Provider accepted or may have accepted but confirmation unavailable. */
  readonly uncertain?: boolean;
};

export type InAppChannelDispatchInput = {
  readonly delivery: NotificationDeliveryRecord;
  readonly intent: NotificationIntent;
  readonly env?: NotificationDeliveryEnv;
  readonly id: () => string;
  readonly now: () => string;
  /** Test-only — force permanent failure. */
  readonly simulateFailure?: boolean;
  /** Test-only — simulate uncertain timeout after possible acceptance. */
  readonly simulateUncertainTimeout?: boolean;
};

function renderTemplate(input: {
  readonly subject: string;
  readonly summary?: string;
  readonly payload: Readonly<Record<string, unknown>>;
}): { readonly title: string; readonly summary?: string; readonly body?: string } {
  return {
    title: input.subject,
    summary: input.summary,
    body:
      typeof input.payload.body === "string"
        ? input.payload.body
        : (input.summary ?? input.subject),
  };
}

/**
 * Existing in-app certified path as a reusable channel function.
 * Persistence of the returned item is the caller's responsibility (durable or Maps).
 */
export function dispatchInAppChannel(
  input: InAppChannelDispatchInput,
): InAppChannelDispatchResult {
  const env = input.env ?? process.env;

  if (!isNotificationInAppEnabled(env)) {
    return {
      ok: false,
      receiptLevel: "failed",
      failureClass: "configuration",
      failureCode: "IN_APP_DISABLED",
    };
  }

  if (input.simulateFailure) {
    return {
      ok: false,
      receiptLevel: "failed",
      failureClass: "permanent_provider",
      failureCode: "SIMULATED_FAILURE",
    };
  }

  if (input.simulateUncertainTimeout) {
    return {
      ok: false,
      receiptLevel: "unknown",
      failureClass: "transient_provider",
      failureCode: "UNCERTAIN_TIMEOUT",
      uncertain: true,
    };
  }

  try {
    const rendered = renderTemplate({
      subject: input.intent.subject,
      summary: input.intent.summary,
      payload: input.intent.payload,
    });
    const inAppId = input.id();
    const item: NotificationInAppItem = {
      id: inAppId,
      deliveryId: input.delivery.id,
      intentId: input.intent.id,
      tenantId: input.delivery.tenantId,
      organisationId: input.delivery.organisationId,
      userId: input.delivery.userId,
      category: input.intent.category,
      priority: input.intent.priority,
      title: rendered.title,
      summary: rendered.summary,
      body: rendered.body,
      sourceProduct: input.intent.sourceProduct,
      sourceObjectRef:
        typeof input.intent.payload.sourceObjectRef === "string"
          ? input.intent.payload.sourceObjectRef
          : undefined,
      createdAt: input.now(),
      expiresAt: input.intent.expiresAt,
    };
    return {
      ok: true,
      receiptLevel: "delivered",
      item,
    };
  } catch {
    return {
      ok: false,
      receiptLevel: "failed",
      failureClass: "template_failure",
      failureCode: "RENDER_FAILED",
    };
  }
}
