/**
 * Typed Platform Configuration HTTP client — calls ONLY `/api/v1/configuration/*`.
 * No runtime resolution, feature flags, secrets, or platform-services imports.
 */

import { assertConfigurationApiPath, CONFIGURATION_API_BASE } from "./routes";
import { ConfigurationClientError } from "./configuration-errors";
import type {
  ConfigurationAuditViewModel,
  ConfigurationClientRequestOptions,
  ConfigurationCollectionResult,
  ConfigurationGroupViewModel,
  ConfigurationManagementPlaneViewModel,
  ConfigurationNamespaceViewModel,
  ConfigurationOverrideViewModel,
  ConfigurationReferenceViewModel,
  ConfigurationScopeDescriptorViewModel,
  ConfigurationValidationResultViewModel,
  ConfigurationValidationRuleViewModel,
  ConfigurationVersionViewModel,
  ConfigurationViewModel,
  CreateConfigurationClientInput,
  CreateConfigurationOverrideClientInput,
  CreateConfigurationVersionClientInput,
  ListConfigurationsClientQuery,
  TransitionConfigurationClientInput,
  UpdateConfigurationClientInput,
  UpdateConfigurationOverrideClientInput,
  ValidateConfigurationMetadataClientInput,
} from "./configuration-types";

const API_BASE = CONFIGURATION_API_BASE;

type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function mapConfiguration(raw: unknown): ConfigurationViewModel {
  const r = asRecord(raw);
  const scope = asRecord(r.scope);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId != null ? String(r.organisationId) : undefined,
    namespaceId: String(r.namespaceId ?? ""),
    groupId: r.groupId != null ? String(r.groupId) : undefined,
    keyId: String(r.keyId ?? ""),
    hierarchyLevel: String(r.hierarchyLevel ?? ""),
    scope: {
      kind: String(scope.kind ?? ""),
      tenantId: scope.tenantId != null ? String(scope.tenantId) : undefined,
      organisationId:
        scope.organisationId != null ? String(scope.organisationId) : undefined,
      productId: scope.productId != null ? String(scope.productId) : undefined,
      environmentId:
        scope.environmentId != null ? String(scope.environmentId) : undefined,
      userId: scope.userId != null ? String(scope.userId) : undefined,
    },
    status: String(r.status ?? ""),
    currentVersionId:
      r.currentVersionId != null ? String(r.currentVersionId) : undefined,
    inheritsFromConfigurationId:
      r.inheritsFromConfigurationId != null
        ? String(r.inheritsFromConfigurationId)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function buildQuery(query?: Record<string, string | number | undefined>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: ConfigurationClientRequestOptions,
): Promise<T> {
  assertConfigurationApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    | ApiSuccessEnvelope<T>
    | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new ConfigurationClientError({
      message: err.error?.message ?? "Configuration request failed",
      code: err.error?.code,
      status: response.status,
      correlationId: err.meta?.correlationId,
      requestId: err.meta?.requestId,
    });
  }
  return (payload as ApiSuccessEnvelope<T>).data;
}

async function requestCollection<T>(
  path: string,
  map: (raw: unknown) => T,
  options?: ConfigurationClientRequestOptions,
): Promise<ConfigurationCollectionResult<T>> {
  assertConfigurationApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    method: "GET",
    credentials: "include",
    signal: options?.signal,
    headers: { accept: "application/json", ...(options?.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => ({}))) as
    | ApiCollectionEnvelope<unknown>
    | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new ConfigurationClientError({
      message: err.error?.message ?? "Configuration request failed",
      code: err.error?.code,
      status: response.status,
      correlationId: err.meta?.correlationId,
      requestId: err.meta?.requestId,
    });
  }
  const body = payload as ApiCollectionEnvelope<unknown>;
  return {
    items: (body.data ?? []).map(map),
    page: body.page,
  };
}

export type ConfigurationClient = ReturnType<typeof createHttpConfigurationClient>;

export function createHttpConfigurationClient() {
  return {
    listConfigurations(query?: ListConfigurationsClientQuery, options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/configurations${buildQuery(query as Record<string, string | number | undefined>)}`,
        mapConfiguration,
        options,
      );
    },
    getConfiguration(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}`,
        { method: "GET" },
        options,
      ).then(mapConfiguration);
    },
    createConfiguration(input: CreateConfigurationClientInput, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/configurations`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapConfiguration);
    },
    updateConfiguration(
      configurationId: string,
      input: UpdateConfigurationClientInput,
      options?: ConfigurationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapConfiguration);
    },
    archiveConfiguration(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/archive`,
        { method: "POST" },
        options,
      ).then((raw) => mapConfiguration(asRecord(raw).configuration ?? raw));
    },
    restoreConfiguration(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/restore`,
        { method: "POST" },
        options,
      ).then(mapConfiguration);
    },
    transitionConfiguration(
      configurationId: string,
      input: TransitionConfigurationClientInput,
      options?: ConfigurationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/transition`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapConfiguration);
    },
    validateConfiguration(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson<ConfigurationValidationResultViewModel>(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/validate`,
        { method: "POST" },
        options,
      );
    },
    approveConfiguration(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/approve`,
        { method: "POST" },
        options,
      ).then(mapConfiguration);
    },
    publishConfiguration(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/publish`,
        { method: "POST" },
        options,
      ).then(mapConfiguration);
    },
    deprecateConfiguration(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/deprecate`,
        { method: "POST" },
        options,
      ).then(mapConfiguration);
    },
    listNamespaces(options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/namespaces`,
        (raw) => {
          const r = asRecord(raw);
          return {
            id: String(r.id ?? ""),
            tenantId: String(r.tenantId ?? ""),
            organisationId:
              r.organisationId != null ? String(r.organisationId) : undefined,
            key: String(r.key ?? ""),
            name: String(r.name ?? ""),
            description:
              r.description != null ? String(r.description) : undefined,
            createdAt: String(r.createdAt ?? ""),
            updatedAt: String(r.updatedAt ?? ""),
          } satisfies ConfigurationNamespaceViewModel;
        },
        options,
      );
    },
    getNamespace(namespaceId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/namespaces/${encodeURIComponent(namespaceId)}`,
        { method: "GET" },
        options,
      ).then((raw) => {
        const r = asRecord(raw);
        return {
          id: String(r.id ?? ""),
          tenantId: String(r.tenantId ?? ""),
          key: String(r.key ?? ""),
          name: String(r.name ?? ""),
          createdAt: String(r.createdAt ?? ""),
          updatedAt: String(r.updatedAt ?? ""),
        } satisfies ConfigurationNamespaceViewModel;
      });
    },
    listGroups(options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/groups`,
        (raw) => {
          const r = asRecord(raw);
          return {
            id: String(r.id ?? ""),
            tenantId: String(r.tenantId ?? ""),
            namespaceId: String(r.namespaceId ?? ""),
            key: String(r.key ?? ""),
            name: String(r.name ?? ""),
            createdAt: String(r.createdAt ?? ""),
            updatedAt: String(r.updatedAt ?? ""),
          } satisfies ConfigurationGroupViewModel;
        },
        options,
      );
    },
    listVersions(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/versions`,
        (raw) => {
          const r = asRecord(raw);
          return {
            id: String(r.id ?? ""),
            configurationId: String(r.configurationId ?? ""),
            versionNumber: Number(r.versionNumber ?? 0),
            immutable: Boolean(r.immutable),
            isCurrent: Boolean(r.isCurrent),
            label: r.label != null ? String(r.label) : undefined,
            createdAt: String(r.createdAt ?? ""),
            createdBy: String(r.createdBy ?? ""),
          } satisfies ConfigurationVersionViewModel;
        },
        options,
      );
    },
    createVersion(
      configurationId: string,
      input: CreateConfigurationVersionClientInput,
      options?: ConfigurationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/versions`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then((raw) => {
        const r = asRecord(raw);
        return {
          id: String(r.id ?? ""),
          configurationId: String(r.configurationId ?? configurationId),
          versionNumber: Number(r.versionNumber ?? 0),
          immutable: Boolean(r.immutable),
          isCurrent: Boolean(r.isCurrent),
          createdAt: String(r.createdAt ?? ""),
          createdBy: String(r.createdBy ?? ""),
        } satisfies ConfigurationVersionViewModel;
      });
    },
    publishVersion(
      configurationId: string,
      versionId: string,
      options?: ConfigurationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/versions/${encodeURIComponent(versionId)}/publish`,
        { method: "POST" },
        options,
      );
    },
    listOverrides(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/overrides${buildQuery({ configurationId })}`,
        (raw) => {
          const r = asRecord(raw);
          return {
            id: String(r.id ?? ""),
            configurationId: String(r.configurationId ?? ""),
            hierarchyLevel: String(r.hierarchyLevel ?? ""),
            scope: asRecord(r.scope) as ConfigurationOverrideViewModel["scope"],
            valueId: String(r.valueId ?? ""),
            precedenceRank: Number(r.precedenceRank ?? 0),
            createdAt: String(r.createdAt ?? ""),
            updatedAt: String(r.updatedAt ?? ""),
          } satisfies ConfigurationOverrideViewModel;
        },
        options,
      );
    },
    createOverride(
      input: CreateConfigurationOverrideClientInput,
      options?: ConfigurationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/overrides`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
    },
    updateOverride(
      overrideId: string,
      input: UpdateConfigurationOverrideClientInput,
      options?: ConfigurationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/overrides/${encodeURIComponent(overrideId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      );
    },
    listScopes(options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/scopes`,
        (raw) => raw as ConfigurationScopeDescriptorViewModel,
        options,
      );
    },
    getScope(scopeId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson<ConfigurationScopeDescriptorViewModel>(
        `${API_BASE}/scopes/${encodeURIComponent(scopeId)}`,
        { method: "GET" },
        options,
      );
    },
    listValidationRules(options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/validation/rules`,
        (raw) => raw as ConfigurationValidationRuleViewModel,
        options,
      );
    },
    validateMetadata(
      input: ValidateConfigurationMetadataClientInput,
      options?: ConfigurationClientRequestOptions,
    ) {
      return requestJson<ConfigurationValidationResultViewModel>(
        `${API_BASE}/validation`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
    },
    listReferences(configurationId: string, options?: ConfigurationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/references`,
        (raw) => raw as ConfigurationReferenceViewModel,
        options,
      );
    },
    getReference(referenceId: string, options?: ConfigurationClientRequestOptions) {
      return requestJson<ConfigurationReferenceViewModel>(
        `${API_BASE}/references/${encodeURIComponent(referenceId)}`,
        { method: "GET" },
        options,
      );
    },
    listAudit(configurationId?: string, options?: ConfigurationClientRequestOptions) {
      const path = configurationId
        ? `${API_BASE}/configurations/${encodeURIComponent(configurationId)}/audit`
        : `${API_BASE}/audit`;
      return requestCollection(path, (raw) => raw as ConfigurationAuditViewModel, options);
    },
    getCapabilities(options?: ConfigurationClientRequestOptions) {
      return requestJson<ConfigurationManagementPlaneViewModel>(
        `${API_BASE}/capabilities`,
        { method: "GET" },
        options,
      );
    },
    getHealth(options?: ConfigurationClientRequestOptions) {
      return requestJson(`${API_BASE}/health`, { method: "GET" }, options);
    },
    getReadiness(options?: ConfigurationClientRequestOptions) {
      return requestJson(`${API_BASE}/readiness`, { method: "GET" }, options);
    },
    getDiagnostics(options?: ConfigurationClientRequestOptions) {
      return requestJson(`${API_BASE}/diagnostics`, { method: "GET" }, options);
    },
  };
}
