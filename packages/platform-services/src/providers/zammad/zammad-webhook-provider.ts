import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type { CreateWebhookInput, UpdateWebhookInput } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import type { SupportWebhookProvider } from "../capability-providers";

const ZAMMAD_INTEGRATION_ID = "zammad";
const ZAMMAD_WEBHOOK_PROVIDER_ID = "zammad-webhook";

export const ZAMMAD_WEBHOOK_PROVIDER_REGISTRATION = {
  providerId: ZAMMAD_WEBHOOK_PROVIDER_ID,
  integrationId: ZAMMAD_INTEGRATION_ID,
  capability: "support_webhook" as const,
  priority: 100,
};

export function createZammadWebhookProvider(core: ZammadCoreServices): SupportWebhookProvider {
  return {
    validateConfiguration(input) {
      return core.webhooks.validateConfiguration(input);
    },

    list(ctx) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.webhooks.list(toIntegrationContext(ctx)),
      );
    },

    get(ctx, webhookId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.webhooks.get(toIntegrationContext(ctx), webhookId),
      );
    },

    create(ctx, input: CreateWebhookInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.webhooks.create(toIntegrationContext(ctx), input),
      );
    },

    update(ctx, webhookId, input: UpdateWebhookInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.webhooks.update(toIntegrationContext(ctx), webhookId, input),
      );
    },

    delete(ctx, webhookId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.webhooks.delete(toIntegrationContext(ctx), webhookId),
      );
    },

    supportedEventTypes() {
      return core.webhooks.supportedEventTypes();
    },

    supportedOperations() {
      return core.webhooks.supportedOperations();
    },
  };
}
