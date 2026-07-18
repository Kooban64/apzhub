/**
 * Typed Platform Administration HTTP client — calls ONLY `/api/v1/administration/*`.
 * No workbench, runtime admin, user management, or platform-services imports.
 */

import { assertAdministrationApiPath, ADMINISTRATION_API_BASE } from "./routes";
import { AdministrationClientError } from "./administration-errors";
import type {
  AdministrationActionViewModel,
  AdministrationAuditViewModel,
  AdministrationCapabilityViewModel,
  AdministrationCategoryViewModel,
  AdministrationClientRequestOptions,
  AdministrationCollectionResult,
  AdministrationDashboardViewModel,
  AdministrationDiagnosticViewModel,
  AdministrationHistoryViewModel,
  AdministrationManagementPlaneViewModel,
  AdministrationMetadataViewModel,
  AdministrationModuleViewModel,
  AdministrationNavigationViewModel,
  AdministrationPermissionViewModel,
  AdministrationPolicyViewModel,
  AdministrationReferenceViewModel,
  AdministrationRegistrationViewModel,
  AdministrationSectionViewModel,
  AdministrationShortcutViewModel,
  AdministrationWidgetViewModel,
  CreateAdministrationModuleClientInput,
  ListAdministrationModulesClientQuery,
  TransitionAdministrationModuleClientInput,
  UpdateAdministrationModuleClientInput,
} from "./administration-types";

const API_BASE = ADMINISTRATION_API_BASE;

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

function optString(value: unknown): string | undefined {
  return value != null ? String(value) : undefined;
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
  options?: AdministrationClientRequestOptions,
): Promise<T> {
  assertAdministrationApiPath(path.split("?")[0] ?? path);
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
    ApiSuccessEnvelope<T> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new AdministrationClientError({
      message: err.error?.message ?? "Administration request failed",
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
  options?: AdministrationClientRequestOptions,
): Promise<AdministrationCollectionResult<T>> {
  assertAdministrationApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    method: "GET",
    credentials: "include",
    signal: options?.signal,
    headers: { accept: "application/json", ...(options?.headers ?? {}) },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiCollectionEnvelope<unknown> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new AdministrationClientError({
      message: err.error?.message ?? "Administration request failed",
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

function mapModule(raw: unknown): AdministrationModuleViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId: optString(r.organisationId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    status: String(r.status ?? ""),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapCategory(raw: unknown): AdministrationCategoryViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: optString(r.moduleId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    ordering: Number(r.ordering ?? 0),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapSection(raw: unknown): AdministrationSectionViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    categoryId: String(r.categoryId ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    ordering: Number(r.ordering ?? 0),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapAction(raw: unknown): AdministrationActionViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: optString(r.moduleId),
    sectionId: optString(r.sectionId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    kind: String(r.kind ?? ""),
    permissionKeys: Array.isArray(r.permissionKeys)
      ? r.permissionKeys.map(String)
      : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapPermission(raw: unknown): AdministrationPermissionViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapRegistration(raw: unknown): AdministrationRegistrationViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleKey: String(r.moduleKey ?? ""),
    version: String(r.version ?? ""),
    status: String(r.status ?? ""),
    registeredAt: String(r.registeredAt ?? ""),
    registeredBy: String(r.registeredBy ?? ""),
    notes: optString(r.notes),
  };
}

function mapPolicy(raw: unknown): AdministrationPolicyViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: optString(r.moduleId),
    kind: String(r.kind ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapCapability(raw: unknown): AdministrationCapabilityViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: String(r.moduleId ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    enabled: Boolean(r.enabled),
    available: Boolean(r.available),
    healthy: Boolean(r.healthy),
    certified: Boolean(r.certified),
    productionReady: Boolean(r.productionReady),
    limitations: Array.isArray(r.limitations) ? r.limitations.map(String) : undefined,
    owner: String(r.owner ?? ""),
    version: String(r.version ?? ""),
    documentation: optString(r.documentation),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapNavigation(raw: unknown): AdministrationNavigationViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: String(r.moduleId ?? ""),
    categoryId: optString(r.categoryId),
    sectionId: optString(r.sectionId),
    key: String(r.key ?? ""),
    label: String(r.label ?? ""),
    ordering: Number(r.ordering ?? 0),
    visibility: String(r.visibility ?? ""),
    permissionKeys: Array.isArray(r.permissionKeys)
      ? r.permissionKeys.map(String)
      : undefined,
    iconKey: optString(r.iconKey),
    routePath: optString(r.routePath),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapShortcut(raw: unknown): AdministrationShortcutViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: optString(r.moduleId),
    actionId: optString(r.actionId),
    key: String(r.key ?? ""),
    label: String(r.label ?? ""),
    ordering: Number(r.ordering ?? 0),
    permissionKeys: Array.isArray(r.permissionKeys)
      ? r.permissionKeys.map(String)
      : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapDashboard(raw: unknown): AdministrationDashboardViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: optString(r.moduleId),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description: optString(r.description),
    ordering: Number(r.ordering ?? 0),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapWidget(raw: unknown): AdministrationWidgetViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    dashboardId: String(r.dashboardId ?? ""),
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    kind: String(r.kind ?? ""),
    ordering: Number(r.ordering ?? 0),
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapMetadata(raw: unknown): AdministrationMetadataViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    moduleId: String(r.moduleId ?? ""),
    labels:
      r.labels && typeof r.labels === "object"
        ? (r.labels as Record<string, string>)
        : undefined,
    tags: Array.isArray(r.tags) ? r.tags.map(String) : undefined,
    notes: optString(r.notes),
  };
}

function mapReference(raw: unknown): AdministrationReferenceViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    moduleId: String(r.moduleId ?? ""),
    kind: String(r.kind ?? ""),
    resourceId: String(r.resourceId ?? ""),
    label: optString(r.label),
  };
}

function mapAudit(raw: unknown): AdministrationAuditViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: optString(r.moduleId),
    action: String(r.action ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    detail: optString(r.detail),
    createdAt: String(r.createdAt ?? ""),
  };
}

function mapHistory(raw: unknown): AdministrationHistoryViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    moduleId: String(r.moduleId ?? ""),
    summary: String(r.summary ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    createdAt: String(r.createdAt ?? ""),
  };
}

function mapDiagnostic(raw: unknown): AdministrationDiagnosticViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    moduleId: optString(r.moduleId),
    capabilityId: optString(r.capabilityId),
    severity: String(r.severity ?? ""),
    code: String(r.code ?? ""),
    message: String(r.message ?? ""),
    detail: optString(r.detail),
    createdAt: String(r.createdAt ?? ""),
  };
}

export type AdministrationClient = ReturnType<typeof createHttpAdministrationClient>;

export function createHttpAdministrationClient() {
  return {
    listModules(
      query?: ListAdministrationModulesClientQuery,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/modules${buildQuery(query as Record<string, string | number | undefined>)}`,
        mapModule,
        options,
      );
    },
    getModule(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}`,
        { method: "GET" },
        options,
      ).then(mapModule);
    },
    createModule(
      input: CreateAdministrationModuleClientInput,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/modules`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapModule);
    },
    updateModule(
      moduleId: string,
      input: UpdateAdministrationModuleClientInput,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapModule);
    },
    archiveModule(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}/archive`,
        { method: "POST" },
        options,
      ).then((raw) => mapModule(asRecord(raw).module ?? raw));
    },
    restoreModule(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}/restore`,
        { method: "POST" },
        options,
      ).then(mapModule);
    },
    transitionModule(
      moduleId: string,
      input: TransitionAdministrationModuleClientInput,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}/transition`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapModule);
    },
    listModuleAudit(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}/audit`,
        mapAudit,
        options,
      );
    },
    listModuleHistory(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}/history`,
        mapHistory,
        options,
      );
    },
    listModuleMetadata(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}/metadata`,
        mapMetadata,
        options,
      );
    },
    listModuleReferences(
      moduleId: string,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestCollection(
        `${API_BASE}/modules/${encodeURIComponent(moduleId)}/references`,
        mapReference,
        options,
      );
    },

    listCategories(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/categories`, mapCategory, options);
    },
    getCategory(categoryId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/categories/${encodeURIComponent(categoryId)}`,
        { method: "GET" },
        options,
      ).then(mapCategory);
    },
    createCategory(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/categories`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapCategory);
    },
    updateCategory(
      categoryId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/categories/${encodeURIComponent(categoryId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapCategory);
    },

    listSections(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/sections`, mapSection, options);
    },
    getSection(sectionId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/sections/${encodeURIComponent(sectionId)}`,
        { method: "GET" },
        options,
      ).then(mapSection);
    },
    createSection(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/sections`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapSection);
    },
    updateSection(
      sectionId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/sections/${encodeURIComponent(sectionId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapSection);
    },

    listActions(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/actions`, mapAction, options);
    },
    getAction(actionId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/actions/${encodeURIComponent(actionId)}`,
        { method: "GET" },
        options,
      ).then(mapAction);
    },
    createAction(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/actions`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapAction);
    },
    updateAction(
      actionId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/actions/${encodeURIComponent(actionId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapAction);
    },

    listPermissions(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/permissions`, mapPermission, options);
    },
    getPermission(permissionId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/permissions/${encodeURIComponent(permissionId)}`,
        { method: "GET" },
        options,
      ).then(mapPermission);
    },
    createPermission(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/permissions`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapPermission);
    },
    updatePermission(
      permissionId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/permissions/${encodeURIComponent(permissionId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapPermission);
    },

    listRegistrations(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/registrations`, mapRegistration, options);
    },
    getRegistration(
      registrationId: string,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/registrations/${encodeURIComponent(registrationId)}`,
        { method: "GET" },
        options,
      ).then(mapRegistration);
    },
    createRegistration(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/registrations`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapRegistration);
    },
    updateRegistration(
      registrationId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/registrations/${encodeURIComponent(registrationId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapRegistration);
    },

    listPolicies(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/policies`, mapPolicy, options);
    },
    getPolicy(policyId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/policies/${encodeURIComponent(policyId)}`,
        { method: "GET" },
        options,
      ).then(mapPolicy);
    },
    createPolicy(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/policies`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapPolicy);
    },
    updatePolicy(
      policyId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/policies/${encodeURIComponent(policyId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapPolicy);
    },

    listCapabilities(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/capabilities`, mapCapability, options);
    },
    getCapability(capabilityId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/capabilities/${encodeURIComponent(capabilityId)}`,
        { method: "GET" },
        options,
      ).then(mapCapability);
    },
    createCapability(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/capabilities`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapCapability);
    },
    updateCapability(
      capabilityId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/capabilities/${encodeURIComponent(capabilityId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapCapability);
    },

    listNavigations(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/navigations`, mapNavigation, options);
    },
    getNavigation(navigationId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/navigations/${encodeURIComponent(navigationId)}`,
        { method: "GET" },
        options,
      ).then(mapNavigation);
    },
    createNavigation(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/navigations`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapNavigation);
    },
    updateNavigation(
      navigationId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/navigations/${encodeURIComponent(navigationId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapNavigation);
    },

    listShortcuts(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/shortcuts`, mapShortcut, options);
    },
    getShortcut(shortcutId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/shortcuts/${encodeURIComponent(shortcutId)}`,
        { method: "GET" },
        options,
      ).then(mapShortcut);
    },
    createShortcut(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/shortcuts`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapShortcut);
    },
    updateShortcut(
      shortcutId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/shortcuts/${encodeURIComponent(shortcutId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapShortcut);
    },

    listDashboards(options?: AdministrationClientRequestOptions) {
      return requestCollection(`${API_BASE}/dashboards`, mapDashboard, options);
    },
    getDashboard(dashboardId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/dashboards/${encodeURIComponent(dashboardId)}`,
        { method: "GET" },
        options,
      ).then(mapDashboard);
    },
    createDashboard(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/dashboards`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapDashboard);
    },
    updateDashboard(
      dashboardId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/dashboards/${encodeURIComponent(dashboardId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapDashboard);
    },

    listWidgets(dashboardId: string, options?: AdministrationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/dashboards/${encodeURIComponent(dashboardId)}/widgets`,
        mapWidget,
        options,
      );
    },
    getWidget(widgetId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/widgets/${encodeURIComponent(widgetId)}`,
        { method: "GET" },
        options,
      ).then(mapWidget);
    },
    createWidget(
      dashboardId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/dashboards/${encodeURIComponent(dashboardId)}/widgets`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapWidget);
    },
    updateWidget(
      widgetId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/widgets/${encodeURIComponent(widgetId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapWidget);
    },

    listMetadata(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/metadata${buildQuery({ moduleId })}`,
        mapMetadata,
        options,
      );
    },
    getMetadata(metadataId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/metadata/${encodeURIComponent(metadataId)}`,
        { method: "GET" },
        options,
      ).then(mapMetadata);
    },
    createMetadata(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/metadata`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapMetadata);
    },
    updateMetadata(
      metadataId: string,
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/metadata/${encodeURIComponent(metadataId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapMetadata);
    },

    listReferences(moduleId: string, options?: AdministrationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/references${buildQuery({ moduleId })}`,
        mapReference,
        options,
      );
    },
    getReference(referenceId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/references/${encodeURIComponent(referenceId)}`,
        { method: "GET" },
        options,
      ).then(mapReference);
    },
    createReference(
      input: Record<string, unknown>,
      options?: AdministrationClientRequestOptions,
    ) {
      return requestJson(
        `${API_BASE}/references`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapReference);
    },

    listAudit(moduleId?: string, options?: AdministrationClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/audit${buildQuery(moduleId ? { moduleId } : undefined)}`,
        mapAudit,
        options,
      );
    },
    getAudit(auditId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/audit/${encodeURIComponent(auditId)}`,
        { method: "GET" },
        options,
      ).then(mapAudit);
    },
    getHistory(historyId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/history/${encodeURIComponent(historyId)}`,
        { method: "GET" },
        options,
      ).then(mapHistory);
    },

    getDiagnostics(options?: AdministrationClientRequestOptions) {
      return requestJson(`${API_BASE}/diagnostics`, { method: "GET" }, options);
    },
    getDiagnostic(diagnosticId: string, options?: AdministrationClientRequestOptions) {
      return requestJson(
        `${API_BASE}/diagnostics/${encodeURIComponent(diagnosticId)}`,
        { method: "GET" },
        options,
      ).then(mapDiagnostic);
    },
    getHealth(options?: AdministrationClientRequestOptions) {
      return requestJson(`${API_BASE}/health`, { method: "GET" }, options);
    },
    getReadiness(options?: AdministrationClientRequestOptions) {
      return requestJson(`${API_BASE}/readiness`, { method: "GET" }, options);
    },
    getManagementCapabilities(options?: AdministrationClientRequestOptions) {
      return requestJson<AdministrationManagementPlaneViewModel>(
        `${API_BASE}/management-capabilities`,
        { method: "GET" },
        options,
      );
    },
  };
}
