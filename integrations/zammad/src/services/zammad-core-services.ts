import type { AdapterContext } from "@apzhub/integration-sdk/adapter";
import type { FetchFn, IntegrationClient } from "@apzhub/integration-sdk/client";

import {
  discoverZammadCoreServiceCapabilities,
  type ZammadServiceCapability,
} from "../capabilities/service-capabilities";
import type { ZammadBootstrapConfiguration } from "../zammad-bootstrap";
import { ZammadRestClient } from "../internal/zammad-rest-client";
import { ZammadAnalyticsService } from "./analytics-service";
import { ZammadArticleService } from "./article-service";
import { ZammadEventService } from "./event-service";
import { ZammadGroupService } from "./group-service";
import { ZammadHistoryService } from "./history-service";
import { ZammadOrganizationService } from "./organization-service";
import { ZammadSearchService } from "./search-service";
import { ZammadSyncService } from "./sync-service";
import {
  ZammadOperationRunner,
  type ZammadServiceContext,
  type ZammadServiceDeps,
} from "./zammad-operation-runner";
import { ZammadSupportService } from "./support-service";
import { ZammadUserService } from "./user-service";
import { ZammadWebhookService } from "./webhook-service";

export interface CreateZammadCoreServicesInput {
  readonly context: AdapterContext;
  readonly configuration: ZammadBootstrapConfiguration;
  readonly client: IntegrationClient;
  readonly fetchFn?: FetchFn;
  readonly resolveApiToken: (
    credentialRef: string,
    tenantId: string,
    correlationId: string,
  ) => Promise<string>;
}

/**
 * Core Support-domain services exposed on `adapter.core`.
 * Includes search/history/analytics (OSS-102-05) and sync/events/webhooks (OSS-102-06).
 */
export class ZammadCoreServices {
  readonly support: ZammadSupportService;
  readonly organizations: ZammadOrganizationService;
  readonly groups: ZammadGroupService;
  readonly users: ZammadUserService;
  readonly articles: ZammadArticleService;
  readonly search: ZammadSearchService;
  readonly history: ZammadHistoryService;
  readonly analytics: ZammadAnalyticsService;
  readonly webhooks: ZammadWebhookService;
  readonly events: ZammadEventService;
  readonly synchronisation: ZammadSyncService;
  private readonly restClient: ZammadRestClient;

  constructor(private readonly deps: ZammadServiceDeps) {
    this.restClient = deps.client;
    this.support = new ZammadSupportService(deps);
    this.organizations = new ZammadOrganizationService(deps);
    this.groups = new ZammadGroupService(deps);
    this.users = new ZammadUserService(deps);
    this.articles = new ZammadArticleService(deps);
    this.search = new ZammadSearchService(deps);
    this.history = new ZammadHistoryService(deps);
    this.analytics = new ZammadAnalyticsService(deps);
    this.webhooks = new ZammadWebhookService(deps);
    this.events = new ZammadEventService(deps);
    this.synchronisation = new ZammadSyncService(deps);
  }

  /** Package-internal REST client for operational probes. */
  getRestClient(): ZammadRestClient {
    return this.restClient;
  }

  discoverCapabilities(): readonly ZammadServiceCapability[] {
    return discoverZammadCoreServiceCapabilities();
  }
}

export function createZammadCoreServices(
  input: CreateZammadCoreServicesInput,
): ZammadCoreServices {
  const { configuration, context } = input;
  const tenantId = configuration.connection?.tenantId ?? "unknown";

  const restClient = new ZammadRestClient({
    client: input.client,
    fetchFn: input.fetchFn,
    apiBaseUrl: configuration.zammad.apiBaseUrl,
    timeoutMs: configuration.zammad.timeoutMs,
    getAuth: async () => ({
      apiToken: await input.resolveApiToken(
        configuration.zammad.apiTokenRef,
        tenantId,
        "zammad-core-services",
      ),
    }),
  });

  const runner = new ZammadOperationRunner({
    adapterId: context.adapterId,
    circuitBreaker: context.circuitBreaker,
    metrics: context.metrics,
    logger: context.logger,
    errorSummary: context.errorSummary,
    clock: context.clock,
  });

  const serviceContext: ZammadServiceContext = {
    tenantId,
  };

  const deps: ZammadServiceDeps = {
    runner,
    client: restClient,
    serviceContext,
    metricsProvider: context.metricsProvider,
    logger: context.logger,
    clock: context.clock,
  };

  return new ZammadCoreServices(deps);
}
