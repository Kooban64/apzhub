import type {
  PollingSource,
  PollingSourceDefinition,
} from "@apzhub/integration-sdk/events";
import {
  createPollingSourceFromSync,
  wrapSyncCursorAsPollingCursor,
} from "@apzhub/integration-sdk/events";
import type { SyncCursor } from "@apzhub/platform-service-contracts";

import { ZAMMAD_INTEGRATION_ID } from "../zammad-error-mapper";
import type { ZammadSyncService } from "../services/sync-service";
import { ZAMMAD_PROVIDER_ID } from "./sdk-events";

export const ZAMMAD_POLLING_SOURCE_DEFINITION: PollingSourceDefinition = {
  id: "zammad-sync-polling",
  integrationId: ZAMMAD_INTEGRATION_ID,
  providerId: ZAMMAD_PROVIDER_ID,
  resourceTypes: ["support_request", "organization", "group", "support_user"],
  supportedModes: ["full", "incremental", "resume", "validation"],
  description: "Zammad CE sync delegated as PollingSource",
};

/**
 * Wrap ZammadSyncService as a SDK PollingSource.
 * Delegates to existing sync methods — no scheduler or workers.
 */
export function createZammadPollingSource(syncService: ZammadSyncService): PollingSource {
  return createPollingSourceFromSync({
    definition: ZAMMAD_POLLING_SOURCE_DEFINITION,
    syncService,
  });
}

/** Wrap adapter SyncCursor as PollingCursor. */
export function toZammadPollingCursor(cursor: SyncCursor) {
  return wrapSyncCursorAsPollingCursor(cursor);
}
