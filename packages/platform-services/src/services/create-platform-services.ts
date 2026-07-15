import type { PlaneCoreServices } from "@apzhub/integration-plane";
import type { ZammadCoreServices } from "@apzhub/integration-zammad";
import type { GitHubActionsCoreServices } from "@apzhub/integration-github-actions";
import { createGitHubActionsPipelineResultAdapter } from "@apzhub/integration-github-actions";
import { createGenericCiAdapter } from "@apzhub/testing-services";
import type {
  ProjectService,
  SearchService,
  SupportAnalyticsService,
  SupportArticleService,
  SupportGroupService,
  SupportHistoryService,
  SupportOrganizationService,
  SupportSearchService,
  SupportService,
  SupportUserService,
  TaskService,
  TeamService,
  UserService,
  WorkspaceService,
} from "@apzhub/platform-service-contracts";
import type { PlatformReportingService } from "@apzhub/reporting-contracts";

import type { AuthorizationProvider } from "../authorization/authorization-provider";
import { AllowAllAuthorizationProvider } from "../authorization/authorization-provider";
import type { AuthorizationAccessResolver } from "../authorization/authorization-access-resolver";
import type { AuthorizationAuditSink } from "../authorization/authorization-audit";
import {
  createAuthorizationRuntime,
  type AuthorizationProviderMode,
  type AuthorizationBootstrapEnv,
} from "../authorization/create-authorization-provider";
import { RequestPipeline, type RequestPipelineOptions } from "../execution/request-pipeline";
import { wrapServiceWithPipeline } from "../execution/wrap-service";
import type { PipelineLogger } from "../execution/logging";
import type { PipelineMetrics } from "../execution/metrics";
import { InMemoryEntityMappingStore } from "../mapping/in-memory-entity-mapping-store";
import {
  createEntityMappingStore,
  type CreateEntityMappingStoreOptions,
} from "../mapping/create-entity-mapping-store";
import type { EntityMappingStore } from "../mapping/entity-mapping-store";
import { MappingOrchestrator } from "../orchestration/mapping-orchestrator";
import { PlatformServiceGateway } from "../gateway/platform-service-gateway";
import type { ServiceMiddleware } from "../middleware/service-middleware";
import type { Policy } from "../policy/policy-pipeline";
import {
  createPlaneProjectProvider,
  PLANE_PROJECT_PROVIDER_REGISTRATION,
} from "../providers/plane/plane-project-provider";
import {
  createPlaneTaskProvider,
  PLANE_TASK_PROVIDER_REGISTRATION,
} from "../providers/plane/plane-task-provider";
import {
  createPlaneSearchProvider,
  createPlaneUserProvider,
  PLANE_SEARCH_PROVIDER_REGISTRATION,
  PLANE_USER_PROVIDER_REGISTRATION,
} from "../providers/plane/plane-user-search-providers";
import {
  createPlaneTeamProvider,
  PLANE_TEAM_PROVIDER_REGISTRATION,
} from "../providers/plane/plane-team-provider";
import {
  createPlaneWorkspaceProvider,
  PLANE_WORKSPACE_PROVIDER_REGISTRATION,
} from "../providers/plane/plane-workspace-provider";
import { registerZammadProviders } from "../providers/zammad/register-zammad-providers";
import { registerGitHubActionsProviders } from "../providers/github-actions/register-github-actions-providers";
import { ProviderRegistry } from "../providers/registry/provider-registry";
import { ProviderResolver } from "../providers/registry/provider-resolver";
import {
  ProjectServiceImpl,
  SearchServiceImpl,
  TeamServiceImpl,
  UserServiceImpl,
  WorkspaceServiceImpl,
} from "./platform-service-impls";
import { TaskServiceImpl } from "./task-service-impl";
import {
  SupportAnalyticsServiceImpl,
  SupportArticleServiceImpl,
  SupportGroupServiceImpl,
  SupportHistoryServiceImpl,
  SupportOrganizationServiceImpl,
  SupportSearchServiceImpl,
  SupportServiceImpl,
  SupportUserServiceImpl,
} from "./support-service-impls";
import {
  createTestingPlatformServicesForTest,
  type TestingPlatformServicesBundle,
} from "./testing";
import type { PlatformQualityPlatformServicesBundle } from "./platform-quality";
import { PlatformReportingServiceImpl } from "./reporting/platform-reporting-service-impl";
import type { DocumentPlatformServicesBundle } from "./documents";
import type { SearchPlatformServicesBundle } from "./search";
import type { SearchExecutionServicesBundle } from "./search-execution";

export interface PlatformServicesBundle {
  readonly registry: ProviderRegistry;
  readonly resolver: ProviderResolver;
  readonly mapping: MappingOrchestrator;
  readonly mappingStore: EntityMappingStore;
  readonly pipeline: RequestPipeline;
  readonly workspace: WorkspaceServiceImpl;
  readonly project: ProjectServiceImpl;
  readonly task: TaskServiceImpl;
  readonly team: TeamServiceImpl;
  readonly user: UserServiceImpl;
  readonly search: SearchServiceImpl;
  readonly support: SupportServiceImpl;
  readonly supportOrganization: SupportOrganizationServiceImpl;
  readonly supportGroup: SupportGroupServiceImpl;
  readonly supportUser: SupportUserServiceImpl;
  readonly supportArticle: SupportArticleServiceImpl;
  readonly supportSearch: SupportSearchServiceImpl;
  readonly supportHistory: SupportHistoryServiceImpl;
  readonly supportAnalytics: SupportAnalyticsServiceImpl;
  readonly testing?: TestingPlatformServicesBundle;
  readonly platformQuality?: PlatformQualityPlatformServicesBundle;
  readonly documents?: DocumentPlatformServicesBundle;
  readonly searchPlatform?: SearchPlatformServicesBundle;
  readonly searchExecution?: SearchExecutionServicesBundle;
  readonly gateway: PlatformServiceGateway;
}

export interface CreatePlatformServicesInput {
  readonly registry?: ProviderRegistry;
  readonly resolver?: ProviderResolver;
  readonly mappingStore?: EntityMappingStore;
  readonly mapping?: MappingOrchestrator;
  readonly pipeline?: RequestPipeline;
  readonly authorization?: AuthorizationProvider;
  readonly accessResolver?: AuthorizationAccessResolver;
  readonly authorizationMode?: AuthorizationProviderMode;
  readonly authorizationEnv?: AuthorizationBootstrapEnv;
  readonly auditSink?: AuthorizationAuditSink;
  readonly logger?: PipelineLogger;
  readonly metrics?: PipelineMetrics;
  readonly policies?: readonly Policy[];
  readonly middlewares?: readonly ServiceMiddleware[];
  readonly pipelineOptions?: RequestPipelineOptions;
  readonly isMaintenanceMode?: () => boolean;
  readonly testing?: TestingPlatformServicesBundle;
  readonly platformQuality?: PlatformQualityPlatformServicesBundle;
  readonly documents?: DocumentPlatformServicesBundle;
  readonly searchPlatform?: SearchPlatformServicesBundle;
  readonly searchExecution?: SearchExecutionServicesBundle;
}

export interface CreatePlatformServicesFromEnvInput
  extends Omit<CreatePlatformServicesInput, "mappingStore"> {
  readonly mappingStoreOptions?: CreateEntityMappingStoreOptions;
}

export interface RegisterPlaneProvidersInput {
  readonly registry: ProviderRegistry;
  readonly planeCore: PlaneCoreServices;
}

/** Registers all Plane-backed capability providers on the supplied registry. */
export function registerPlaneProviders(input: RegisterPlaneProvidersInput): void {
  const { registry, planeCore } = input;

  registry.register({
    ...PLANE_WORKSPACE_PROVIDER_REGISTRATION,
    provider: createPlaneWorkspaceProvider(planeCore),
  });

  registry.register({
    ...PLANE_PROJECT_PROVIDER_REGISTRATION,
    provider: createPlaneProjectProvider(planeCore),
  });

  registry.register({
    ...PLANE_TASK_PROVIDER_REGISTRATION,
    provider: createPlaneTaskProvider(planeCore),
  });

  registry.register({
    ...PLANE_TEAM_PROVIDER_REGISTRATION,
    provider: createPlaneTeamProvider(planeCore),
  });

  registry.register({
    ...PLANE_USER_PROVIDER_REGISTRATION,
    provider: createPlaneUserProvider(),
  });

  registry.register({
    ...PLANE_SEARCH_PROVIDER_REGISTRATION,
    provider: createPlaneSearchProvider(),
  });
}

/**
 * Creates mapping-aware platform service implementations, execution pipeline, and gateway.
 * Defaults to AllowAllAuthorizationProvider only when authorization is omitted and
 * authorizationMode is not production — production mode requires an access resolver
 * and never silently falls back to allow-all.
 *
 * Task gateway surface is exposed only when a task provider is registered.
 */
export function createPlatformServices(
  input: CreatePlatformServicesInput = {},
): PlatformServicesBundle {
  const registry = input.registry ?? new ProviderRegistry();
  const resolver = input.resolver ?? new ProviderResolver({ registry });
  const mappingStore = input.mappingStore ?? new InMemoryEntityMappingStore();
  const mapping = input.mapping ?? new MappingOrchestrator({ store: mappingStore });

  const authzRuntime =
    input.authorization || input.pipelineOptions?.authorization
      ? {
          provider:
            input.authorization ??
            input.pipelineOptions?.authorization ??
            new AllowAllAuthorizationProvider(),
          policies: input.policies ?? input.pipelineOptions?.policies ?? [],
          auditSink: input.auditSink ?? input.pipelineOptions?.auditSink,
        }
      : createAuthorizationRuntime({
          env: input.authorizationEnv,
          mode: input.authorizationMode,
          accessResolver: input.accessResolver,
          mappingStore,
          auditSink: input.auditSink,
          isMaintenanceMode: input.isMaintenanceMode,
          policies: input.policies ?? input.pipelineOptions?.policies,
        });

  const pipeline =
    input.pipeline ??
    new RequestPipeline({
      ...input.pipelineOptions,
      authorization: authzRuntime.provider,
      logger: input.logger ?? input.pipelineOptions?.logger,
      metrics: input.metrics ?? input.pipelineOptions?.metrics,
      policies: [...authzRuntime.policies],
      middlewares: input.middlewares ?? input.pipelineOptions?.middlewares,
      auditSink: authzRuntime.auditSink,
    });

  const workspace = new WorkspaceServiceImpl(resolver, mapping);
  const project = new ProjectServiceImpl(resolver, mapping);
  const task = new TaskServiceImpl(resolver, mapping);
  const team = new TeamServiceImpl(resolver, mapping);
  const user = new UserServiceImpl(resolver, mapping);
  const search = new SearchServiceImpl(resolver, mapping);
  const support = new SupportServiceImpl(resolver, mapping);
  const supportOrganization = new SupportOrganizationServiceImpl(resolver, mapping);
  const supportGroup = new SupportGroupServiceImpl(resolver, mapping);
  const supportUser = new SupportUserServiceImpl(resolver, mapping);
  const supportArticle = new SupportArticleServiceImpl(resolver, mapping);
  const supportSearch = new SupportSearchServiceImpl(resolver, mapping);
  const supportHistory = new SupportHistoryServiceImpl(resolver, mapping);
  const supportAnalytics = new SupportAnalyticsServiceImpl(resolver);

  const workspaceApi = wrapServiceWithPipeline(
    workspace,
    pipeline,
    "workspace",
  ) as WorkspaceService;
  const projectApi = wrapServiceWithPipeline(project, pipeline, "project") as ProjectService;
  const teamApi = wrapServiceWithPipeline(team, pipeline, "team") as TeamService;
  const userApi = wrapServiceWithPipeline(user, pipeline, "user") as UserService;
  const searchApi = wrapServiceWithPipeline(search, pipeline, "search") as SearchService;

  const hasTaskProvider = registry.list("task").length > 0;
  const taskApi = hasTaskProvider
    ? (wrapServiceWithPipeline(task, pipeline, "task") as TaskService)
    : undefined;

  const hasSupportProvider = registry.list("support_request").length > 0;
  const supportApi = hasSupportProvider
    ? (wrapServiceWithPipeline(support, pipeline, "support") as SupportService)
    : undefined;
  const supportOrganizationApi = hasSupportProvider
    ? (wrapServiceWithPipeline(
        supportOrganization,
        pipeline,
        "supportOrganization",
      ) as SupportOrganizationService)
    : undefined;
  const supportGroupApi = hasSupportProvider
    ? (wrapServiceWithPipeline(supportGroup, pipeline, "supportGroup") as SupportGroupService)
    : undefined;
  const supportUserApi = hasSupportProvider
    ? (wrapServiceWithPipeline(supportUser, pipeline, "supportUser") as SupportUserService)
    : undefined;
  const supportArticleApi = hasSupportProvider
    ? (wrapServiceWithPipeline(supportArticle, pipeline, "supportArticle") as SupportArticleService)
    : undefined;
  const supportSearchApi = hasSupportProvider
    ? (wrapServiceWithPipeline(supportSearch, pipeline, "supportSearch") as SupportSearchService)
    : undefined;
  const supportHistoryApi = hasSupportProvider
    ? (wrapServiceWithPipeline(supportHistory, pipeline, "supportHistory") as SupportHistoryService)
    : undefined;
  const supportAnalyticsApi = hasSupportProvider
    ? (wrapServiceWithPipeline(
        supportAnalytics,
        pipeline,
        "supportAnalytics",
      ) as SupportAnalyticsService)
    : undefined;
  const testingApi = input.testing?.wrapWithPipeline(pipeline);
  const reportingApi = input.testing
    ? (wrapServiceWithPipeline(
        new PlatformReportingServiceImpl(input.testing.domain),
        pipeline,
        "platformReporting",
      ) as PlatformReportingService)
    : undefined;
  const platformQualityApi = input.platformQuality?.wrapPlatformQualityWithPipeline(
    pipeline,
  );
  const platformReleaseApi = input.platformQuality?.wrapPlatformReleaseWithPipeline(
    pipeline,
  );
  const platformGovernanceApi =
    input.platformQuality?.wrapPlatformGovernanceWithPipeline(pipeline);
  const documentsApi = input.documents?.wrapWithPipeline(pipeline);
  const searchPlatformApi = input.searchPlatform?.wrapWithPipeline(pipeline);
  const searchExecutionApi = input.searchExecution?.wrapWithPipeline(pipeline);

  const gateway = new PlatformServiceGateway({
    workspace,
    project,
    task: hasTaskProvider ? task : undefined,
    team,
    user,
    search,
    support: hasSupportProvider ? support : undefined,
    supportOrganization: hasSupportProvider ? supportOrganization : undefined,
    supportGroup: hasSupportProvider ? supportGroup : undefined,
    supportUser: hasSupportProvider ? supportUser : undefined,
    supportArticle: hasSupportProvider ? supportArticle : undefined,
    supportSearch: hasSupportProvider ? supportSearch : undefined,
    supportHistory: hasSupportProvider ? supportHistory : undefined,
    supportAnalytics: hasSupportProvider ? supportAnalytics : undefined,
    workspaceApi,
    projectApi,
    taskApi,
    teamApi,
    userApi,
    searchApi,
    supportApi,
    supportOrganizationApi,
    supportGroupApi,
    supportUserApi,
    supportArticleApi,
    supportSearchApi,
    supportHistoryApi,
    supportAnalyticsApi,
    testingApi,
    reportingApi,
    documentsApi,
    searchPlatformApi,
    searchExecutionApi,
    platformQualityApi,
    platformReleaseApi,
    platformGovernanceApi,
    mapping,
    resolver,
    registry,
    pipeline,
  });

  return {
    registry,
    resolver,
    mapping,
    mappingStore,
    pipeline,
    workspace,
    project,
    task,
    team,
    user,
    search,
    support,
    supportOrganization,
    supportGroup,
    supportUser,
    supportArticle,
    supportSearch,
    supportHistory,
    supportAnalytics,
    testing: input.testing,
    platformQuality: input.platformQuality,
    documents: input.documents,
    searchPlatform: input.searchPlatform,
    searchExecution: input.searchExecution,
    gateway,
  };
}

/**
 * Async bootstrap — resolves EntityMappingStore from environment (postgres or memory)
 * then wires platform services. Fails clearly when postgres is required but unavailable.
 */
export async function createPlatformServicesFromEnv(
  input: CreatePlatformServicesFromEnvInput = {},
): Promise<PlatformServicesBundle> {
  const mappingStore = await createEntityMappingStore(input.mappingStoreOptions);
  return createPlatformServices({
    ...input,
    mappingStore,
  });
}

/** Convenience factory — registers Plane providers then returns wired services + gateway. */
export function createPlatformServicesWithPlane(
  planeCore: PlaneCoreServices,
  mappingStore?: EntityMappingStore,
): PlatformServicesBundle {
  const registry = new ProviderRegistry();
  registerPlaneProviders({ registry, planeCore });
  return createPlatformServices({ registry, mappingStore });
}

/** Convenience factory — registers Zammad providers then returns wired services + gateway. */
export function createPlatformServicesWithZammad(
  zammadCore: ZammadCoreServices,
  mappingStore?: EntityMappingStore,
): PlatformServicesBundle {
  const registry = new ProviderRegistry();
  registerZammadProviders({ registry, zammadCore });
  return createPlatformServices({ registry, mappingStore });
}

export interface CreatePlatformServicesWithGitHubActionsOptions {
  readonly mappingStore?: EntityMappingStore;
  readonly testing?: TestingPlatformServicesBundle;
  /**
   * When true (default) and no testing bundle is supplied, create an in-memory
   * testing bundle with github_actions + generic_ci parse adapters and the
   * GitHub Actions provider resolver attached for live facets.
   */
  readonly createTestingBundle?: boolean;
}

/** Convenience factory — registers GitHub Actions pipeline providers (APZTCMS-017). */
export function createPlatformServicesWithGitHubActions(
  githubActionsCore: GitHubActionsCoreServices,
  options: CreatePlatformServicesWithGitHubActionsOptions = {},
): PlatformServicesBundle {
  const registry = new ProviderRegistry();
  registerGitHubActionsProviders({ registry, githubActionsCore });
  const resolver = new ProviderResolver({ registry });

  const testing =
    options.testing ??
    (options.createTestingBundle === false
      ? undefined
      : createTestingPlatformServicesForTest({
          allowInMemoryPersistence: true,
          providerResolver: resolver,
          pipelineAdapters: [
            createGenericCiAdapter(),
            createGitHubActionsPipelineResultAdapter(),
          ],
        }));

  return createPlatformServices({
    registry,
    resolver,
    mappingStore: options.mappingStore,
    testing,
  });
}

export { registerZammadProviders } from "../providers/zammad/register-zammad-providers";
export type { RegisterZammadProvidersInput } from "../providers/zammad/register-zammad-providers";
export { registerGitHubActionsProviders } from "../providers/github-actions/register-github-actions-providers";
export type { RegisterGitHubActionsProvidersInput } from "../providers/github-actions/register-github-actions-providers";

export const PLATFORM_SERVICES_VERSION = "0.18.0";
