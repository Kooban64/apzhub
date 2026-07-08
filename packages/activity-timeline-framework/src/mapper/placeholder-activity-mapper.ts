import type { EventEnvelope } from "@apzhub/event-notification-framework";

import type {
  ActivityMapperDiagnostics,
  ActivityMapperResult,
} from "../types/activity-mapper-diagnostics";
import type { ActivityMapper } from "./activity-mapper";

/** No-op mapper — Event Bus subscription deferred to app wiring (AT-013). */
export class PlaceholderActivityMapper implements ActivityMapper {
  readonly idempotencyStrategy = "none" as const;

  map(_envelope: EventEnvelope): ActivityMapperResult {
    return Object.freeze({
      ok: true,
      createdCount: 0,
      matchedTypeCount: 0,
      documents: [],
      issues: [],
    });
  }

  getDiagnostics(): ActivityMapperDiagnostics {
    return Object.freeze({
      status: "scaffold",
      mappedCount: 0,
      lastMappedCount: 0,
      lastMatchedTypeCount: 0,
      templateErrorCount: 0,
      message: "PlaceholderActivityMapper — mapping deferred until AT-007 wiring",
    });
  }
}

export function createPlaceholderActivityMapper(): ActivityMapper {
  return new PlaceholderActivityMapper();
}
