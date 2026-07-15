import type { ZammadCoreServices } from "@apzhub/integration-zammad";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import type { SupportAnalyticsProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_ANALYTICS_PROVIDER_ID = "zammad-analytics";

export const ZAMMAD_ANALYTICS_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_ANALYTICS_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_analytics" as const,
  priority: 100,
};

export function createZammadAnalyticsProvider(
  core: ZammadCoreServices,
): SupportAnalyticsProvider {
  return {
    getSupportIntelligence(ctx) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.analytics.getSupportIntelligence(toIntegrationContext(ctx)),
      );
    },

    getSnapshot(ctx) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.analytics.getSnapshot(toIntegrationContext(ctx)),
      );
    },
  };
}
