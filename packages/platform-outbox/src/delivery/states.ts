/**
 * APZQEP-120-S08 / Enterprise Outbox — Owner-facing delivery lifecycle.
 * Maps to store statuses without breaking LAW/TE consumers.
 */

import type { OutboxStatus } from "../types";

export const DELIVERY_LIFECYCLE_STATES = [
  "Pending",
  "Reserved",
  "Delivering",
  "Delivered",
  "Failed",
  "RetryScheduled",
  "DeadLetterReady",
  "Cancelled",
] as const;

export type DeliveryLifecycleState = (typeof DELIVERY_LIFECYCLE_STATES)[number];

/** Project store status → Owner lifecycle state. */
export function toDeliveryLifecycleState(status: OutboxStatus): DeliveryLifecycleState {
  switch (status) {
    case "pending":
      return "Pending";
    case "processing":
      return "Reserved"; // claimed/locked; Delivering during transport handler
    case "published":
      return "Delivered";
    case "failed":
      return "Failed";
    case "retrying":
      return "RetryScheduled";
    case "dead-letter":
      return "DeadLetterReady";
    case "cancelled":
      return "Cancelled";
    default:
      return "Failed";
  }
}

export function deliveryLifecycleTransitions(): ReadonlyArray<{
  readonly from: DeliveryLifecycleState;
  readonly to: DeliveryLifecycleState;
  readonly trigger: string;
}> {
  return [
    { from: "Pending", to: "Reserved", trigger: "claimBatch" },
    { from: "Reserved", to: "Delivering", trigger: "transport.start" },
    { from: "Delivering", to: "Delivered", trigger: "transport.ok" },
    { from: "Delivering", to: "Failed", trigger: "transport.fail" },
    { from: "Failed", to: "RetryScheduled", trigger: "retry.schedule" },
    { from: "RetryScheduled", to: "Reserved", trigger: "claimBatch.due" },
    { from: "Failed", to: "DeadLetterReady", trigger: "retry.exhausted|permanent" },
    { from: "Pending", to: "Cancelled", trigger: "cancel" },
    { from: "RetryScheduled", to: "Cancelled", trigger: "cancel" },
  ];
}
