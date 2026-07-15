import type { ZammadCoreServices } from "@apzhub/integration-zammad";

import type { ProviderRegistry } from "../registry/provider-registry";
import {
  createZammadAnalyticsProvider,
  ZAMMAD_ANALYTICS_PROVIDER_REGISTRATION,
} from "./zammad-analytics-provider";
import {
  createZammadArticleProvider,
  ZAMMAD_ARTICLE_PROVIDER_REGISTRATION,
} from "./zammad-article-provider";
import {
  createZammadGroupProvider,
  ZAMMAD_GROUP_PROVIDER_REGISTRATION,
} from "./zammad-group-provider";
import {
  createZammadHistoryProvider,
  ZAMMAD_HISTORY_PROVIDER_REGISTRATION,
} from "./zammad-history-provider";
import {
  createZammadOrganizationProvider,
  ZAMMAD_ORGANIZATION_PROVIDER_REGISTRATION,
} from "./zammad-organization-provider";
import {
  createZammadSearchProvider,
  ZAMMAD_SEARCH_PROVIDER_REGISTRATION,
} from "./zammad-search-provider";
import {
  createZammadSupportProvider,
  ZAMMAD_SUPPORT_PROVIDER_REGISTRATION,
} from "./zammad-support-provider";
import {
  createZammadSyncProvider,
  ZAMMAD_SYNC_PROVIDER_REGISTRATION,
} from "./zammad-sync-provider";
import {
  createZammadUserProvider,
  ZAMMAD_USER_PROVIDER_REGISTRATION,
} from "./zammad-user-provider";
import {
  createZammadWebhookProvider,
  ZAMMAD_WEBHOOK_PROVIDER_REGISTRATION,
} from "./zammad-webhook-provider";

export interface RegisterZammadProvidersInput {
  readonly registry: ProviderRegistry;
  readonly zammadCore: ZammadCoreServices;
}

/** Registers all Zammad-backed Support capability providers on the supplied registry. */
export function registerZammadProviders(input: RegisterZammadProvidersInput): void {
  const { registry, zammadCore } = input;

  registry.register({
    ...ZAMMAD_SUPPORT_PROVIDER_REGISTRATION,
    provider: createZammadSupportProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_ORGANIZATION_PROVIDER_REGISTRATION,
    provider: createZammadOrganizationProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_GROUP_PROVIDER_REGISTRATION,
    provider: createZammadGroupProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_USER_PROVIDER_REGISTRATION,
    provider: createZammadUserProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_ARTICLE_PROVIDER_REGISTRATION,
    provider: createZammadArticleProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_SEARCH_PROVIDER_REGISTRATION,
    provider: createZammadSearchProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_HISTORY_PROVIDER_REGISTRATION,
    provider: createZammadHistoryProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_ANALYTICS_PROVIDER_REGISTRATION,
    provider: createZammadAnalyticsProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_SYNC_PROVIDER_REGISTRATION,
    provider: createZammadSyncProvider(zammadCore),
  });

  registry.register({
    ...ZAMMAD_WEBHOOK_PROVIDER_REGISTRATION,
    provider: createZammadWebhookProvider(zammadCore),
  });
}
