/**
 * Observe alert delivery hook seam (ADR-0070).
 * Architectural integration point for future Notification Delivery (ADR-0071).
 *
 * MUST NOT contain SMTP, email templates, SMS, push, Teams, Slack, WhatsApp,
 * provider credentials, or notification routing implementation.
 */

import type { AlertDefinition, AlertState } from "@apzhub/observe-contracts";

export type ObserveAlertDeliveryHookInput = {
  readonly eventId: string;
  readonly alertState: AlertState;
  readonly definition: AlertDefinition;
};

export type ObserveAlertDeliveryHook = (input: ObserveAlertDeliveryHookInput) => void;

/** No-op delivery hook — records nothing; Notification consumers bind later. */
export function createNoopObserveAlertDeliveryHook(): ObserveAlertDeliveryHook {
  return () => {
    /* seam only */
  };
}

/**
 * Recording hook for tests / diagnostics — still no provider I/O.
 */
export function createRecordingObserveAlertDeliveryHook(sink: {
  readonly calls: ObserveAlertDeliveryHookInput[];
}): ObserveAlertDeliveryHook {
  return (input) => {
    sink.calls.push(input);
  };
}
