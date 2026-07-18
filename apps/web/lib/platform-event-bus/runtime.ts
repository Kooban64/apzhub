import {
  createPlatformEventBus,
  type PlatformEventBusRuntime,
} from "@apzhub/platform-event-bus";
import { createInMemoryOutboxStore } from "@apzhub/platform-outbox";

let runtime: PlatformEventBusRuntime | undefined;

/**
 * Process-local Platform Event Bus runtime for HTTP ingress / diagnostics.
 * Durable Postgres drain remains on `pnpm worker:outbox`.
 */
export function getPlatformEventBusRuntime(): PlatformEventBusRuntime {
  if (!runtime) {
    const secret = process.env.APZHUB_WEBHOOK_INGRESS_SECRET;
    const useMemoryOutbox =
      process.env.APZHUB_EVENT_BUS_MEMORY_OUTBOX === "1" ||
      process.env.APZHUB_EVENT_BUS_MEMORY_OUTBOX === "true";

    runtime = createPlatformEventBus({
      webhookSecret: secret,
      allowUnsignedIngress: !secret,
      outboxStore: useMemoryOutbox ? createInMemoryOutboxStore() : undefined,
      defaultDispatchMode: useMemoryOutbox ? "bus_and_outbox" : "bus",
    });
  }
  return runtime;
}

/** Test helper — reset singleton. */
export function resetPlatformEventBusRuntimeForTests(): void {
  runtime = undefined;
}
