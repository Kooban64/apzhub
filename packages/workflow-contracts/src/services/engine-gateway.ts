/**
 * Workflow Engine gateway facets (APZWORKFLOW-007).
 * Nested under WorkflowPlatformGateway.engine — read-only adapter surface.
 * No HTTP, Workbench, execution, or scheduling.
 */

import type { WorkflowPlatformServiceContext } from "./platform-gateway";

/** Vendor-neutral engine workflow metadata (secrets never present). */
export type WorkflowEngineWorkflowMetadata = {
  readonly id: string;
  readonly name: string;
  readonly active: boolean;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly tagNames: readonly string[];
  readonly nodeCount: number;
  readonly connectionCount: number;
  readonly versionHint?: string;
  readonly engine: string;
};

export type WorkflowEngineTemplateMetadata = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly tagNames: readonly string[];
  readonly engine: string;
  readonly support: "supported" | "partial" | "not_supported";
};

export type WorkflowEngineTagMetadata = {
  readonly id: string;
  readonly name: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly engine: string;
};

export type WorkflowEngineUserMetadata = {
  readonly id: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly role?: string;
  readonly engine: string;
};

export type WorkflowEngineProjectMetadata = {
  readonly id: string;
  readonly name: string;
  readonly type?: string;
  readonly engine: string;
  readonly support: "supported" | "partial" | "not_supported";
};

export type WorkflowEngineListQuery = {
  readonly limit?: number;
  readonly cursor?: string;
};

export type WorkflowEngineCapabilitiesSnapshot = {
  readonly services: readonly {
    readonly serviceId: string;
    readonly support: "supported" | "partial" | "not_supported";
    readonly implemented: boolean;
    readonly operations: readonly string[];
    readonly notes?: readonly string[];
  }[];
  readonly unsupportedOperations: readonly string[];
};

export type WorkflowEngineHealthSnapshot = {
  readonly level: "healthy" | "degraded" | "unhealthy";
  readonly reasons: readonly string[];
  readonly sdkStatus: "healthy" | "degraded" | "unavailable";
};

export type WorkflowEngineDiagnosticsSnapshot = {
  readonly adapterVersion: string;
  readonly healthLevel: "healthy" | "degraded" | "unhealthy";
  readonly reasons: readonly string[];
  readonly apiStatus: string;
  readonly authenticationStatus: string;
  readonly authMode: string;
  readonly lastLatencyMs?: number;
  readonly coreServiceCount: number;
  readonly compatibilityStatus: string;
};

export type WorkflowEngineCompatibilitySnapshot = {
  readonly compatibilityStatus: "compatible" | "partial" | "incompatible";
  readonly supportedApi: string;
  readonly adapterVersion: string;
  readonly unsupportedOperations: readonly string[];
  readonly notes: readonly string[];
};

export type WorkflowEngineConnectionValidationResult = {
  readonly ok: boolean;
  readonly message: string;
};

export type WorkflowEngineWorkflowsService = {
  list(
    ctx: WorkflowPlatformServiceContext,
    query?: WorkflowEngineListQuery,
  ): Promise<readonly WorkflowEngineWorkflowMetadata[]>;
  get(
    ctx: WorkflowPlatformServiceContext,
    workflowId: string,
  ): Promise<WorkflowEngineWorkflowMetadata>;
  /** Always NOT_SUPPORTED in APZWORKFLOW-007. */
  create(
    ctx: WorkflowPlatformServiceContext,
    input: unknown,
  ): Promise<WorkflowEngineWorkflowMetadata>;
  /** Always NOT_SUPPORTED in APZWORKFLOW-007. */
  update(
    ctx: WorkflowPlatformServiceContext,
    workflowId: string,
    input: unknown,
  ): Promise<WorkflowEngineWorkflowMetadata>;
  /** Always NOT_SUPPORTED in APZWORKFLOW-007. */
  delete(ctx: WorkflowPlatformServiceContext, workflowId: string): Promise<void>;
  /** Always NOT_SUPPORTED in APZWORKFLOW-007. */
  execute(
    ctx: WorkflowPlatformServiceContext,
    workflowId: string,
    input?: unknown,
  ): Promise<never>;
};

export type WorkflowEngineTemplatesService = {
  list(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowEngineTemplateMetadata[]>;
  get(
    ctx: WorkflowPlatformServiceContext,
    templateId: string,
  ): Promise<WorkflowEngineTemplateMetadata>;
};

export type WorkflowEngineTagsService = {
  list(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowEngineTagMetadata[]>;
  get(
    ctx: WorkflowPlatformServiceContext,
    tagId: string,
  ): Promise<WorkflowEngineTagMetadata>;
};

export type WorkflowEngineUsersService = {
  list(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowEngineUserMetadata[]>;
  get(
    ctx: WorkflowPlatformServiceContext,
    userId: string,
  ): Promise<WorkflowEngineUserMetadata>;
};

export type WorkflowEngineProjectsService = {
  list(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<readonly WorkflowEngineProjectMetadata[]>;
  get(
    ctx: WorkflowPlatformServiceContext,
    projectId: string,
  ): Promise<WorkflowEngineProjectMetadata>;
};

export type WorkflowEngineCapabilitiesService = {
  get(ctx: WorkflowPlatformServiceContext): Promise<WorkflowEngineCapabilitiesSnapshot>;
};

export type WorkflowEngineHealthService = {
  get(ctx: WorkflowPlatformServiceContext): Promise<WorkflowEngineHealthSnapshot>;
};

export type WorkflowEngineDiagnosticsService = {
  get(ctx: WorkflowPlatformServiceContext): Promise<WorkflowEngineDiagnosticsSnapshot>;
};

export type WorkflowEngineCompatibilityService = {
  get(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<WorkflowEngineCompatibilitySnapshot>;
};

export type WorkflowEngineConnectionService = {
  validate(
    ctx: WorkflowPlatformServiceContext,
  ): Promise<WorkflowEngineConnectionValidationResult>;
};

/**
 * Nested engine surface: gateway.workflow.engine.*
 * Platform Services only — never called from clients/Workbench directly.
 */
export type WorkflowEngineGateway = {
  readonly workflows: WorkflowEngineWorkflowsService;
  readonly templates: WorkflowEngineTemplatesService;
  readonly tags: WorkflowEngineTagsService;
  readonly users: WorkflowEngineUsersService;
  readonly projects: WorkflowEngineProjectsService;
  readonly capabilities: WorkflowEngineCapabilitiesService;
  readonly health: WorkflowEngineHealthService;
  readonly diagnostics: WorkflowEngineDiagnosticsService;
  readonly compatibility: WorkflowEngineCompatibilityService;
  readonly connection: WorkflowEngineConnectionService;
};
