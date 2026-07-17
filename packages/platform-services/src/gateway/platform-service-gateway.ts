import type {
  PlatformGovernanceGateway,
  PlatformQualityGateway,
  PlatformReleaseGateway,
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
  TestingPlatformGateway,
  ServiceRequestContext,
  TaskService,
  TeamService,
  UserService,
  WorkspaceService,
} from "@apzhub/platform-service-contracts";
import type { PlatformReportingService } from "@apzhub/reporting-contracts";
import type { DocumentPlatformGateway } from "@apzhub/document-contracts";
import type { NotificationPlatformGateway } from "@apzhub/notification-contracts";
import type { ConfigurationPlatformGateway } from "@apzhub/configuration-contracts";
import type { AdministrationPlatformGateway } from "@apzhub/admin-contracts";
import type { IdentityPlatformGateway } from "@apzhub/identity-contracts";
import type { ObservePlatformGateway } from "@apzhub/observe-contracts";
import type { WorkflowPlatformGateway } from "@apzhub/workflow-contracts";
import { PlatformServiceError } from "@apzhub/platform-service-contracts";

import type { EntityMappingStore } from "../mapping/entity-mapping-store";
import type { MappingOrchestrator } from "../orchestration/mapping-orchestrator";
import type { ProviderRegistry } from "../providers/registry/provider-registry";
import type { ProviderResolver } from "../providers/registry/provider-resolver";
import type { RequestPipeline } from "../execution/request-pipeline";
import type {
  ProjectServiceImpl,
  SearchServiceImpl,
  TeamServiceImpl,
  UserServiceImpl,
  WorkspaceServiceImpl,
} from "../services/platform-service-impls";
import type { TaskServiceImpl } from "../services/task-service-impl";
import type {
  SupportAnalyticsServiceImpl,
  SupportArticleServiceImpl,
  SupportGroupServiceImpl,
  SupportHistoryServiceImpl,
  SupportOrganizationServiceImpl,
  SupportSearchServiceImpl,
  SupportServiceImpl,
  SupportUserServiceImpl,
} from "../services/support-service-impls";
import type { TestingPlatformGatewayWithReporting } from "../services/testing";
import type { SearchPlatformServiceImpls } from "../services/search/search-service-impls";
import type { SearchExecutionServiceImpls } from "../services/search-execution/create-search-execution-services";

export interface PlatformServiceGatewayDeps {
  readonly workspace: WorkspaceServiceImpl;
  readonly project: ProjectServiceImpl;
  readonly task?: TaskServiceImpl;
  readonly team: TeamServiceImpl;
  readonly user: UserServiceImpl;
  readonly search: SearchServiceImpl;
  readonly support?: SupportServiceImpl;
  readonly supportOrganization?: SupportOrganizationServiceImpl;
  readonly supportGroup?: SupportGroupServiceImpl;
  readonly supportUser?: SupportUserServiceImpl;
  readonly supportArticle?: SupportArticleServiceImpl;
  readonly supportSearch?: SupportSearchServiceImpl;
  readonly supportHistory?: SupportHistoryServiceImpl;
  readonly supportAnalytics?: SupportAnalyticsServiceImpl;
  /** Pipeline-wrapped contract surfaces exposed to application code. */
  readonly workspaceApi: WorkspaceService;
  readonly projectApi: ProjectService;
  readonly taskApi?: TaskService;
  readonly teamApi: TeamService;
  readonly userApi: UserService;
  readonly searchApi: SearchService;
  readonly supportApi?: SupportService;
  readonly supportOrganizationApi?: SupportOrganizationService;
  readonly supportGroupApi?: SupportGroupService;
  readonly supportUserApi?: SupportUserService;
  readonly supportArticleApi?: SupportArticleService;
  readonly supportSearchApi?: SupportSearchService;
  readonly supportHistoryApi?: SupportHistoryService;
  readonly supportAnalyticsApi?: SupportAnalyticsService;
  readonly testingApi?: TestingPlatformGatewayWithReporting;
  readonly reportingApi?: PlatformReportingService;
  readonly documentsApi?: DocumentPlatformGateway;
  readonly searchPlatformApi?: SearchPlatformServiceImpls;
  readonly searchExecutionApi?: SearchExecutionServiceImpls;
  readonly workflowApi?: WorkflowPlatformGateway;
  readonly notificationApi?: NotificationPlatformGateway;
  readonly configurationApi?: ConfigurationPlatformGateway;
  readonly administrationApi?: AdministrationPlatformGateway;
  readonly identityApi?: IdentityPlatformGateway;
  readonly observeApi?: ObservePlatformGateway;
  readonly platformQualityApi?: PlatformQualityGateway;
  readonly platformReleaseApi?: PlatformReleaseGateway;
  readonly platformGovernanceApi?: PlatformGovernanceGateway;
  readonly mapping: MappingOrchestrator;
  readonly resolver: ProviderResolver;
  readonly registry: ProviderRegistry;
  readonly pipeline: RequestPipeline;
}

function unsupportedSupportCapability(serviceName: string): PlatformServiceError {
  return new PlatformServiceError({
    category: "configuration",
    code: "PROVIDER_CAPABILITY_UNSUPPORTED",
    message: `${serviceName} is not available — no support provider is registered`,
    correlationId: "platform-gateway",
    retryable: false,
  });
}

function unsupportedTestingCapability(): PlatformServiceError {
  return new PlatformServiceError({
    category: "configuration",
    code: "PROVIDER_CAPABILITY_UNSUPPORTED",
    message: "Testing service is not enabled",
    correlationId: "platform-gateway",
    retryable: false,
  });
}

function unsupportedPlatformQualityCapability(serviceName: string): PlatformServiceError {
  return new PlatformServiceError({
    category: "configuration",
    code: "PROVIDER_CAPABILITY_UNSUPPORTED",
    message: `${serviceName} is not enabled`,
    correlationId: "platform-gateway",
    retryable: false,
  });
}

/**
 * Application-facing entry point for platform services.
 *
 * Public accessors return contract interfaces executed through the
 * platform request pipeline (OSS-110-04 / OSS-110-08).
 */
export class PlatformServiceGateway {
  constructor(private readonly deps: PlatformServiceGatewayDeps) {}

  /** Workspace capability — contract surface only. */
  get workspaces(): WorkspaceService {
    return this.deps.workspaceApi;
  }

  /** Project capability — contract surface only. */
  get projects(): ProjectService {
    return this.deps.projectApi;
  }

  /**
   * Task capability — available when a task provider is registered (OSS-110-08).
   * Throws a controlled configuration error when no task provider is wired.
   */
  get tasks(): TaskService {
    if (!this.deps.taskApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "TaskService is not available — no task provider is registered",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.taskApi;
  }

  /** Team capability — contract surface only. */
  get teams(): TeamService {
    return this.deps.teamApi;
  }

  /** User capability — contract surface only. */
  get users(): UserService {
    return this.deps.userApi;
  }

  /** Search capability — contract surface only. */
  get search(): SearchService {
    return this.deps.searchApi;
  }

  /** Support Request capability — available when a support provider is registered. */
  get support(): SupportService {
    if (!this.deps.supportApi) {
      throw unsupportedSupportCapability("SupportService");
    }
    return this.deps.supportApi;
  }

  get supportOrganizations(): SupportOrganizationService {
    if (!this.deps.supportOrganizationApi) {
      throw unsupportedSupportCapability("SupportOrganizationService");
    }
    return this.deps.supportOrganizationApi;
  }

  get supportGroups(): SupportGroupService {
    if (!this.deps.supportGroupApi) {
      throw unsupportedSupportCapability("SupportGroupService");
    }
    return this.deps.supportGroupApi;
  }

  get supportUsers(): SupportUserService {
    if (!this.deps.supportUserApi) {
      throw unsupportedSupportCapability("SupportUserService");
    }
    return this.deps.supportUserApi;
  }

  get supportArticles(): SupportArticleService {
    if (!this.deps.supportArticleApi) {
      throw unsupportedSupportCapability("SupportArticleService");
    }
    return this.deps.supportArticleApi;
  }

  get supportSearch(): SupportSearchService {
    if (!this.deps.supportSearchApi) {
      throw unsupportedSupportCapability("SupportSearchService");
    }
    return this.deps.supportSearchApi;
  }

  get supportHistory(): SupportHistoryService {
    if (!this.deps.supportHistoryApi) {
      throw unsupportedSupportCapability("SupportHistoryService");
    }
    return this.deps.supportHistoryApi;
  }

  get supportAnalytics(): SupportAnalyticsService {
    if (!this.deps.supportAnalyticsApi) {
      throw unsupportedSupportCapability("SupportAnalyticsService");
    }
    return this.deps.supportAnalyticsApi;
  }

  get testing(): TestingPlatformGateway {
    if (!this.deps.testingApi) {
      throw unsupportedTestingCapability();
    }
    return this.deps.testingApi;
  }

  /**
   * Platform reporting capability (APZREPORT-002).
   * Backed by the shared reporting engine; first consumer ports from Testing when enabled.
   */
  get reporting(): PlatformReportingService {
    if (!this.deps.reportingApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Reporting service is not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.reportingApi;
  }

  /**
   * Document Platform capability (APZDOCS-003).
   * Nested facets — products never call storage providers directly.
   */
  get documents(): DocumentPlatformGateway["documents"] {
    return this.documentGateway.documents;
  }

  get documentVersions(): DocumentPlatformGateway["documentVersions"] {
    return this.documentGateway.documentVersions;
  }

  get documentStorage(): DocumentPlatformGateway["documentStorage"] {
    return this.documentGateway.documentStorage;
  }

  get documentCollections(): DocumentPlatformGateway["documentCollections"] {
    return this.documentGateway.documentCollections;
  }

  get documentFolders(): DocumentPlatformGateway["documentFolders"] {
    return this.documentGateway.documentFolders;
  }

  get documentTags(): DocumentPlatformGateway["documentTags"] {
    return this.documentGateway.documentTags;
  }

  get documentRelationships(): DocumentPlatformGateway["documentRelationships"] {
    return this.documentGateway.documentRelationships;
  }

  get documentRetention(): DocumentPlatformGateway["documentRetention"] {
    return this.documentGateway.documentRetention;
  }

  get documentAudit(): DocumentPlatformGateway["documentAudit"] {
    return this.documentGateway.documentAudit;
  }

  get documentMetadata(): DocumentPlatformGateway["documentMetadata"] {
    return this.documentGateway.documentMetadata;
  }

  get documentClassification(): DocumentPlatformGateway["documentClassification"] {
    return this.documentGateway.documentClassification;
  }

  get documentSearchMetadata(): DocumentPlatformGateway["documentSearchMetadata"] {
    return this.documentGateway.documentSearchMetadata;
  }

  get documentDiagnostics(): DocumentPlatformGateway["documentDiagnostics"] {
    return this.documentGateway.documentDiagnostics;
  }

  /** Full nested document gateway (same facets as individual getters). */
  get documentPlatform(): DocumentPlatformGateway {
    return this.documentGateway;
  }

  /**
   * Workflow Platform capability (APZWORKFLOW-002).
   * Nested facets — metadata / lifecycle only; never execution / n8n.
   *
   * Shape: gateway.workflow.{workflows,versions,templates,categories,folders,validation,audit}
   */
  get workflow(): WorkflowPlatformGateway {
    return this.workflowGateway;
  }

  /**
   * Notification Platform capability (APZNOTIFY-002).
   * Nested facets — metadata / lifecycle only; never delivery.
   *
   * Shape: gateway.notification.{notifications,templates,preferences,categories,channels,recipients,references,audit,diagnostics}
   */
  get notification(): NotificationPlatformGateway {
    return this.notificationGateway;
  }

  /**
   * Configuration Platform capability (APZCONFIG-002).
   * Nested facets — metadata / lifecycle only; never runtime apply.
   *
   * Shape: gateway.configuration.{configurations,namespaces,groups,versions,overrides,scopes,validation,references,audit,diagnostics}
   */
  get configuration(): ConfigurationPlatformGateway {
    return this.configurationGateway;
  }

  /**
   * Administration Platform capability (APZADMIN-002).
   * Nested facets — metadata / lifecycle only; never runtime admin, workbench, or HTTP.
   *
   * Shape: gateway.administration.{modules,categories,sections,actions,permissions,audit,history,diagnostics,registrations,metadata,policies,references,capabilities,navigations,shortcuts,dashboards,widgets}
   */
  get administration(): AdministrationPlatformGateway {
    return this.administrationGateway;
  }

  /**
   * Identity Administration Platform capability (APZIDENTITY-002).
   * Nested facets — metadata / lifecycle only; never authentication, HTTP, or provisioning.
   *
   * Shape: gateway.identity.{users,groups,roles,organisations,tenants,departments,positions,memberships,serviceAssignments,invitations,activation,deactivation,policies,audit,history,references,diagnostics}
   */
  get identity(): IdentityPlatformGateway {
    return this.identityGateway;
  }

  /**
   * Observability Platform capability (APZOBSERVE-002).
   * Nested facets — metadata / lifecycle only; never provider execution.
   *
   * Shape: gateway.observe.{healthChecks,readinessChecks,livenessChecks,serviceHealth,serviceStatus,componentStatus,metricDefinitions,metricSamples,alertDefinitions,alertStates,dashboardDefinitions,logSources,traceDefinitions,traceSpans,incidentReferences,maintenanceWindows,healthSummaries,metadata,diagnostics}
   */
  get observe(): ObservePlatformGateway {
    return this.observeGateway;
  }

  /**
   * Search Platform capability (APZSEARCH-003).
   * Nested management-plane facets — never merges into legacy Plane search.
   */
  get searchQuery(): SearchPlatformServiceImpls["searchQuery"] {
    return this.searchPlatformGateway.searchQuery;
  }

  get searchProviders(): SearchPlatformServiceImpls["searchProviders"] {
    return this.searchPlatformGateway.searchProviders;
  }

  get searchConfigurations(): SearchPlatformServiceImpls["searchConfigurations"] {
    return this.searchPlatformGateway.searchConfigurations;
  }

  get searchCapabilities(): SearchPlatformServiceImpls["searchCapabilities"] {
    return this.searchPlatformGateway.searchCapabilities;
  }

  get searchHealth(): SearchPlatformServiceImpls["searchHealth"] {
    return this.searchPlatformGateway.searchHealth;
  }

  get searchDiagnostics(): SearchPlatformServiceImpls["searchDiagnostics"] {
    return this.searchPlatformGateway.searchDiagnostics;
  }

  get searchCollections(): SearchPlatformServiceImpls["searchCollections"] {
    return this.searchPlatformGateway.searchCollections;
  }

  get searchSources(): SearchPlatformServiceImpls["searchSources"] {
    return this.searchPlatformGateway.searchSources;
  }

  get searchScopes(): SearchPlatformServiceImpls["searchScopes"] {
    return this.searchPlatformGateway.searchScopes;
  }

  get searchProfiles(): SearchPlatformServiceImpls["searchProfiles"] {
    return this.searchPlatformGateway.searchProfiles;
  }

  get searchMetadata(): SearchPlatformServiceImpls["searchMetadata"] {
    return this.searchPlatformGateway.searchMetadata;
  }

  get searchAudit(): SearchPlatformServiceImpls["searchAudit"] {
    return this.searchPlatformGateway.searchAudit;
  }

  get searchStatistics(): SearchPlatformServiceImpls["searchStatistics"] {
    return this.searchPlatformGateway.searchStatistics;
  }

  get searchValidation(): SearchPlatformServiceImpls["searchValidation"] {
    return this.searchPlatformGateway.searchValidation;
  }

  /** Full nested search platform gateway. */
  get searchPlatform(): SearchPlatformServiceImpls {
    return this.searchPlatformGateway;
  }

  /**
   * Search Execution capability (APZSEARCH-006).
   * Distinct from management facets and legacy Plane gateway.search.
   */
  get searchExecution(): SearchExecutionServiceImpls["searchExecution"] {
    return this.searchExecutionGateway.searchExecution;
  }

  get searchIndexes(): SearchExecutionServiceImpls["searchIndexes"] {
    return this.searchExecutionGateway.searchIndexes;
  }

  get searchDocuments(): SearchExecutionServiceImpls["searchDocuments"] {
    return this.searchExecutionGateway.searchDocuments;
  }

  get searchExecutionHealth(): SearchExecutionServiceImpls["searchExecutionHealth"] {
    return this.searchExecutionGateway.searchExecutionHealth;
  }

  get searchExecutionDiagnostics(): SearchExecutionServiceImpls["searchExecutionDiagnostics"] {
    return this.searchExecutionGateway.searchExecutionDiagnostics;
  }

  /** Full nested search execution gateway. */
  get searchExecutionPlatform(): SearchExecutionServiceImpls {
    return this.searchExecutionGateway;
  }

  private get searchPlatformGateway(): SearchPlatformServiceImpls {
    if (!this.deps.searchPlatformApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Search Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.searchPlatformApi;
  }

  private get searchExecutionGateway(): SearchExecutionServiceImpls {
    if (!this.deps.searchExecutionApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message:
          "Search execution services are not enabled — Meilisearch provider not configured",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.searchExecutionApi;
  }

  private get documentGateway(): DocumentPlatformGateway {
    if (!this.deps.documentsApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Document Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.documentsApi;
  }

  private get workflowGateway(): WorkflowPlatformGateway {
    if (!this.deps.workflowApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Workflow Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.workflowApi;
  }

  private get notificationGateway(): NotificationPlatformGateway {
    if (!this.deps.notificationApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Notification Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.notificationApi;
  }

  private get configurationGateway(): ConfigurationPlatformGateway {
    if (!this.deps.configurationApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Configuration Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.configurationApi;
  }

  private get administrationGateway(): AdministrationPlatformGateway {
    if (!this.deps.administrationApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Administration Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.administrationApi;
  }

  private get identityGateway(): IdentityPlatformGateway {
    if (!this.deps.identityApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Identity Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.identityApi;
  }

  private get observeGateway(): ObservePlatformGateway {
    if (!this.deps.observeApi) {
      throw new PlatformServiceError({
        category: "configuration",
        code: "PROVIDER_CAPABILITY_UNSUPPORTED",
        message: "Observability Platform services are not enabled",
        correlationId: "platform-gateway",
        retryable: false,
      });
    }
    return this.deps.observeApi;
  }

  get platformQuality(): PlatformQualityGateway {
    if (!this.deps.platformQualityApi) {
      throw unsupportedPlatformQualityCapability("PlatformQualityGateway");
    }
    return this.deps.platformQualityApi;
  }

  get platformRelease(): PlatformReleaseGateway {
    if (!this.deps.platformReleaseApi) {
      throw unsupportedPlatformQualityCapability("PlatformReleaseGateway");
    }
    return this.deps.platformReleaseApi;
  }

  get platformGovernance(): PlatformGovernanceGateway {
    if (!this.deps.platformGovernanceApi) {
      throw unsupportedPlatformQualityCapability("PlatformGovernanceGateway");
    }
    return this.deps.platformGovernanceApi;
  }

  /** Mapping store access for reconciliation tooling — not for module business logic. */
  get mappingStore(): EntityMappingStore {
    return this.deps.mapping.store;
  }

  /** Execution pipeline for advanced registration of middleware/policies. */
  get pipeline(): RequestPipeline {
    return this.deps.pipeline;
  }

  /** Validates that a request context is present before service calls. */
  assertContext(ctx: ServiceRequestContext): void {
    this.deps.pipeline.assertContext(ctx);
  }
}
