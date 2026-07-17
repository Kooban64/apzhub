/** Observability typed client view models (APZOBSERVE-003) — metadata only. */

export type ObserveClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: Record<string, string>;
};

export type ObserveCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page: { readonly limit: number; readonly hasMore: boolean };
};

export type ObserveEntityViewModel = {
  readonly id: string;
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly createdBy?: string;
  readonly updatedBy?: string;
  readonly revision?: number;
  readonly [key: string]: unknown;
};

export type ObserveManagementPlaneViewModel = {
  readonly observeEnabled: boolean;
  readonly managementPlaneReady: boolean;
  readonly persistenceReady: boolean;
  readonly providerExecutionEnabled: false;
  readonly workbenchReady: false;
  readonly grafanaIntegrationReady?: false;
  readonly prometheusIntegrationReady?: false;
  readonly lokiIntegrationReady?: false;
  readonly otelIntegrationReady?: false;
  readonly alertManagerIntegrationReady?: false;
  readonly metadataCompleteness?: string;
  readonly registrationState?: string;
  readonly persistenceMode?: string;
  readonly capabilities?: Record<string, boolean>;
  readonly [key: string]: unknown;
};

export type ObserveDiagnosticsHealthViewModel = {
  readonly status: string;
  readonly persistenceMode: string;
  readonly providerExecutionEnabled: false;
  readonly checkedAt: string;
};

export type ObserveDiagnosticsReadinessViewModel = {
  readonly ready: boolean;
  readonly observeEnabled: true;
  readonly persistenceMode: string;
  readonly providerExecutionEnabled: false;
  readonly capabilities: readonly string[];
};
