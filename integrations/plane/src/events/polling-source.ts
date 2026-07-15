import type {
  PollingSource,
  PollingSourceDefinition,
} from "@apzhub/integration-sdk/events";
import {
  createPollingSourceFromSync,
  wrapSyncCursorAsPollingCursor,
} from "@apzhub/integration-sdk/events";
import type { SyncCursor } from "@apzhub/platform-service-contracts";

import { PLANE_INTEGRATION_ID } from "../plane-error-mapper";
import type { PlaneSyncService } from "../services/sync-service";
import { PLANE_PROVIDER_ID } from "./sdk-events";

export const PLANE_POLLING_SOURCE_DEFINITION: PollingSourceDefinition = {
  id: "plane-sync-polling",
  integrationId: PLANE_INTEGRATION_ID,
  providerId: PLANE_PROVIDER_ID,
  resourceTypes: ["project", "task"],
  supportedModes: ["full", "incremental", "resume", "validation"],
  description: "Plane CE sync delegated as PollingSource",
};

/**
 * Wrap PlaneSyncService as a SDK PollingSource.
 * Delegates to existing sync methods — no scheduler or workers.
 */
export function createPlanePollingSource(syncService: PlaneSyncService): PollingSource {
  return createPollingSourceFromSync({
    definition: PLANE_POLLING_SOURCE_DEFINITION,
    syncService,
  });
}

/** Wrap adapter SyncCursor as PollingCursor. */
export function toPlanePollingCursor(cursor: SyncCursor) {
  return wrapSyncCursorAsPollingCursor(cursor);
}
