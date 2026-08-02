import type { ProcessingLifecycleState, ProcessingStatus } from "./types";

export function toProcessingLifecycleState(
  status: ProcessingStatus,
): ProcessingLifecycleState {
  switch (status) {
    case "pending":
      return "Event";
    case "reserved":
      return "Reserved";
    case "leased":
      return "Leased";
    case "processing":
      return "Executing";
    case "acknowledged":
      return "Acknowledged";
    case "retry_scheduled":
      return "Retry";
    case "dead_letter_ready":
    case "failed":
      return "DeadLetter";
    case "cancelled":
      return "Cancelled";
    default:
      return "DeadLetter";
  }
}

export function processingContractTransitions(): ReadonlyArray<{
  readonly from: ProcessingLifecycleState;
  readonly to: ProcessingLifecycleState;
  readonly trigger: string;
}> {
  return [
    { from: "Event", to: "Reserved", trigger: "reserveBatch" },
    { from: "Reserved", to: "Leased", trigger: "acquireLease" },
    { from: "Leased", to: "Executing", trigger: "processor.execute" },
    { from: "Executing", to: "Acknowledged", trigger: "ack" },
    { from: "Executing", to: "Retry", trigger: "retry" },
    { from: "Executing", to: "DeadLetter", trigger: "dead_letter|poison" },
    { from: "Retry", to: "Reserved", trigger: "reserveBatch.due" },
    { from: "Event", to: "Cancelled", trigger: "cancel" },
    { from: "Retry", to: "Cancelled", trigger: "cancel" },
  ];
}
