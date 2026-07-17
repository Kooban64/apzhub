/** View models for Workflow Engine HTTP client (APZWORKFLOW-008). */

export type WorkflowEngineClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type WorkflowEngineCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page: {
    readonly limit: number;
    readonly hasMore: boolean;
  };
};

export type WorkflowEngineListQuery = {
  readonly limit?: number;
  readonly cursor?: string;
};

export type WorkflowEngineWorkflowViewModel = {
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

export type WorkflowEngineTemplateViewModel = {
  readonly id: string;
  readonly name: string;
  readonly description?: string;
  readonly tagNames: readonly string[];
  readonly engine: string;
  readonly support: string;
};

export type WorkflowEngineTagViewModel = {
  readonly id: string;
  readonly name: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly engine: string;
};

export type WorkflowEngineUserViewModel = {
  readonly id: string;
  readonly email?: string;
  readonly displayName?: string;
  readonly role?: string;
  readonly engine: string;
};

export type WorkflowEngineProjectViewModel = {
  readonly id: string;
  readonly name: string;
  readonly type?: string;
  readonly engine: string;
  readonly support?: string;
};

export type WorkflowEngineCapabilitiesViewModel = {
  readonly services: readonly {
    readonly serviceId: string;
    readonly support: string;
    readonly implemented: boolean;
    readonly operations: readonly string[];
    readonly notes?: readonly string[];
  }[];
  readonly unsupportedOperations: readonly string[];
};

export type WorkflowEngineHealthViewModel = {
  readonly level: string;
  readonly reasons: readonly string[];
  readonly sdkStatus: string;
};

export type WorkflowEngineDiagnosticsViewModel = {
  readonly adapterVersion: string;
  readonly healthLevel: string;
  readonly reasons: readonly string[];
  readonly apiStatus: string;
  readonly authenticationStatus: string;
  readonly authMode: string;
  readonly lastLatencyMs?: number;
  readonly coreServiceCount: number;
  readonly compatibilityStatus: string;
};

export type WorkflowEngineCompatibilityViewModel = {
  readonly compatibilityStatus: string;
  readonly supportedApi: string;
  readonly adapterVersion: string;
  readonly unsupportedOperations: readonly string[];
  readonly notes: readonly string[];
};

export type WorkflowEngineConnectionValidationViewModel = {
  readonly ok: boolean;
  readonly message: string;
};
