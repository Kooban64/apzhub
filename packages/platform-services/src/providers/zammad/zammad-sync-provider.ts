import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type { SyncRunOptions } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import type { SupportSyncProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_SYNC_PROVIDER_ID = "zammad-sync";

export const ZAMMAD_SYNC_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_SYNC_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_sync" as const,
  priority: 100,
};

export function createZammadSyncProvider(core: ZammadCoreServices): SupportSyncProvider {
  return {
    getSyncState(ctx) {
      return withProviderErrorMapping(ctx.correlationId, async () =>
        core.synchronisation.getSyncState(),
      );
    },

    getLastSyncTimestamp(ctx) {
      return withProviderErrorMapping(ctx.correlationId, async () =>
        core.synchronisation.getLastSyncTimestamp(),
      );
    },

    safeRestart(ctx) {
      return withProviderErrorMapping(ctx.correlationId, async () =>
        core.synchronisation.safeRestart(),
      );
    },

    runFullSync(ctx, options?: SyncRunOptions) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.synchronisation.runFullSync(toIntegrationContext(ctx), options),
      );
    },

    runIncrementalSync(ctx, options?: SyncRunOptions) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.synchronisation.runIncrementalSync(toIntegrationContext(ctx), options),
      );
    },
  };
}
