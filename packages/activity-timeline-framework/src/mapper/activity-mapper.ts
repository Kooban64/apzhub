import type { EventEnvelope } from "@apzhub/event-notification-framework";

import type {
  ActivityMapperDiagnostics,
  ActivityMapperResult,
} from "../types/activity-mapper-diagnostics";

/** Maps platform events to immutable activity documents — no storage, service, or UI. */
export interface ActivityMapper {
  /** Optional idempotency strategy — default is no deduplication (SPR-007 locked decision). */
  readonly idempotencyStrategy?: "none" | "source-event-id";
  map(envelope: EventEnvelope): ActivityMapperResult;
  getDiagnostics(): ActivityMapperDiagnostics;
}
