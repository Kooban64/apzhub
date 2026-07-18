import type { AdapterContext } from "@apzhub/integration-sdk/adapter";
import type { IntegrationClient } from "@apzhub/integration-sdk/client";

import {
  discoverPlaneCoreServiceCapabilities,
  type PlaneServiceCapability,
} from "../capabilities/service-capabilities";
import type { PlaneBootstrapConfiguration } from "../plane-bootstrap";
import { PlaneRestClient } from "../internal/plane-rest-client";
import { PlaneActivityService } from "./activity-service";
import { PlaneAnalyticsService } from "./analytics-service";
import { PlaneCommentService } from "./comment-service";
import { PlaneCycleService } from "./cycle-service";
import { PlaneEventService } from "./event-service";
import { PlaneLabelService } from "./label-service";
import { PlaneMemberService } from "./member-service";
import { PlaneModuleService } from "./module-service";
import {
  PlaneOperationRunner,
  type PlaneServiceContext,
  type PlaneServiceDeps,
} from "./plane-operation-runner";
import { PlaneProjectService } from "./project-service";
import { PlaneProjectStateService } from "./project-state-service";
import { PlaneSyncService } from "./sync-service";
import { PlaneTaskService } from "./task-service";
import { PlaneWatcherService } from "./watcher-service";
import { PlaneWebhookService } from "./webhook-service";
import { PlaneWorkspaceService } from "./workspace-service";

export interface CreatePlaneCoreServicesInput {
  readonly context: AdapterContext;
  readonly configuration: PlaneBootstrapConfiguration;
  readonly client: IntegrationClient;
  readonly workspaceId?: string;
  readonly resolveApiKey: (
    credentialRef: string,
    tenantId: string,
    correlationId: string,
  ) => Promise<string>;
}

export class PlaneCoreServices {
  readonly workspaces: PlaneWorkspaceService;
  readonly projects: PlaneProjectService;
  readonly projectStates: PlaneProjectStateService;
  readonly labels: PlaneLabelService;
  readonly cycles: PlaneCycleService;
  readonly modules: PlaneModuleService;
  readonly members: PlaneMemberService;
  readonly tasks: PlaneTaskService;
  readonly comments: PlaneCommentService;
  readonly activity: PlaneActivityService;
  readonly watchers: PlaneWatcherService;
  readonly analytics: PlaneAnalyticsService;
  readonly webhooks: PlaneWebhookService;
  readonly events: PlaneEventService;
  readonly synchronisation: PlaneSyncService;
  private readonly restClient: PlaneRestClient;

  constructor(private readonly deps: PlaneServiceDeps) {
    this.restClient = deps.client;
    this.workspaces = new PlaneWorkspaceService(deps);
    this.projects = new PlaneProjectService(deps);
    this.projectStates = new PlaneProjectStateService(deps);
    this.labels = new PlaneLabelService(deps);
    this.cycles = new PlaneCycleService(deps);
    this.modules = new PlaneModuleService(deps);
    this.members = new PlaneMemberService(deps);
    this.tasks = new PlaneTaskService(deps);
    this.comments = new PlaneCommentService(deps);
    this.activity = new PlaneActivityService(deps);
    this.watchers = new PlaneWatcherService(deps);
    this.analytics = new PlaneAnalyticsService(deps);
    this.webhooks = new PlaneWebhookService(deps);
    this.events = new PlaneEventService(deps);
    this.synchronisation = new PlaneSyncService(deps);
  }

  /** Package-internal REST client for operational feature probes. */
  getRestClient(): PlaneRestClient {
    return this.restClient;
  }

  discoverCapabilities(): readonly PlaneServiceCapability[] {
    return discoverPlaneCoreServiceCapabilities();
  }
}

export function createPlaneCoreServices(
  input: CreatePlaneCoreServicesInput,
): PlaneCoreServices {
  const { configuration, context } = input;
  const tenantId = configuration.connection?.tenantId ?? "unknown";

  const restClient = new PlaneRestClient({
    client: input.client,
    workspaceSlug: configuration.plane.workspaceSlug,
    getAuth: async () => ({
      apiKey: await input.resolveApiKey(
        configuration.plane.apiTokenRef,
        tenantId,
        "plane-core-services",
      ),
    }),
  });

  const runner = new PlaneOperationRunner({
    adapterId: context.adapterId,
    circuitBreaker: context.circuitBreaker,
    metrics: context.metrics,
    logger: context.logger,
    errorSummary: context.errorSummary,
    clock: context.clock,
  });

  const serviceContext: PlaneServiceContext = {
    tenantId,
    workspaceSlug: configuration.plane.workspaceSlug,
    workspaceId: input.workspaceId,
  };

  const deps: PlaneServiceDeps = {
    runner,
    client: restClient,
    serviceContext,
    metricsProvider: context.metricsProvider,
    logger: context.logger,
    clock: context.clock,
  };

  return new PlaneCoreServices(deps);
}
