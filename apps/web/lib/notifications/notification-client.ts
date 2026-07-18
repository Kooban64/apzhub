/**
 * Typed Platform Notification HTTP client — calls ONLY `/api/v1/notifications/*`.
 * No delivery / provider / queue / Event Bus methods. No platform-services imports.
 */

import { assertNotificationApiPath, NOTIFICATIONS_API_BASE } from "./routes";
import { NotificationClientError } from "./notification-errors";
import type {
  CreateNotificationClientInput,
  CreateNotificationTemplateClientInput,
  ListNotificationsClientQuery,
  NotificationAuditViewModel,
  NotificationCategoryViewModel,
  NotificationChannelViewModel,
  NotificationClientRequestOptions,
  NotificationCollectionResult,
  NotificationManagementPlaneViewModel,
  NotificationPreferenceViewModel,
  NotificationRecipientViewModel,
  NotificationReferenceViewModel,
  NotificationTemplateViewModel,
  NotificationViewModel,
  TransitionNotificationClientInput,
  UpdateNotificationClientInput,
  UpdateNotificationPreferenceClientInput,
  UpdateNotificationTemplateClientInput,
} from "./notification-types";

const API_BASE = NOTIFICATIONS_API_BASE;

type JsonRecord = Record<string, unknown>;
type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

function mapNotification(raw: unknown): NotificationViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId !== undefined && r.organisationId !== null
        ? String(r.organisationId)
        : undefined,
    key: r.key !== undefined && r.key !== null ? String(r.key) : undefined,
    title: String(r.title ?? ""),
    summary:
      r.summary !== undefined && r.summary !== null ? String(r.summary) : undefined,
    body: r.body !== undefined && r.body !== null ? String(r.body) : undefined,
    status: String(r.status ?? ""),
    priority: String(r.priority ?? ""),
    categoryId:
      r.categoryId !== undefined && r.categoryId !== null
        ? String(r.categoryId)
        : undefined,
    templateId:
      r.templateId !== undefined && r.templateId !== null
        ? String(r.templateId)
        : undefined,
    channelKinds: Array.isArray(r.channelKinds) ? r.channelKinds.map(String) : [],
    expiresAt:
      r.expiresAt !== undefined && r.expiresAt !== null
        ? String(r.expiresAt)
        : undefined,
    archivedAt:
      r.archivedAt !== undefined && r.archivedAt !== null
        ? String(r.archivedAt)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapTemplate(raw: unknown): NotificationTemplateViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId !== undefined && r.organisationId !== null
        ? String(r.organisationId)
        : undefined,
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description:
      r.description !== undefined && r.description !== null
        ? String(r.description)
        : undefined,
    categoryId:
      r.categoryId !== undefined && r.categoryId !== null
        ? String(r.categoryId)
        : undefined,
    defaultPriority: String(r.defaultPriority ?? ""),
    defaultChannelKinds: Array.isArray(r.defaultChannelKinds)
      ? r.defaultChannelKinds.map(String)
      : [],
    subjectTemplate:
      r.subjectTemplate !== undefined && r.subjectTemplate !== null
        ? String(r.subjectTemplate)
        : undefined,
    bodyTemplate:
      r.bodyTemplate !== undefined && r.bodyTemplate !== null
        ? String(r.bodyTemplate)
        : undefined,
    locale: r.locale !== undefined && r.locale !== null ? String(r.locale) : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
    createdBy: String(r.createdBy ?? ""),
    updatedBy: String(r.updatedBy ?? ""),
    revision: Number(r.revision ?? 0),
  };
}

function mapPreference(raw: unknown): NotificationPreferenceViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId !== undefined && r.organisationId !== null
        ? String(r.organisationId)
        : undefined,
    userId: String(r.userId ?? ""),
    categoryId:
      r.categoryId !== undefined && r.categoryId !== null
        ? String(r.categoryId)
        : undefined,
    channelKind: String(r.channelKind ?? ""),
    enabled: Boolean(r.enabled),
    quietHours:
      r.quietHours !== undefined && r.quietHours !== null
        ? String(r.quietHours)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapCategory(raw: unknown): NotificationCategoryViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId !== undefined && r.organisationId !== null
        ? String(r.organisationId)
        : undefined,
    key: String(r.key ?? ""),
    name: String(r.name ?? ""),
    description:
      r.description !== undefined && r.description !== null
        ? String(r.description)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapChannel(raw: unknown): NotificationChannelViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId !== undefined && r.organisationId !== null
        ? String(r.organisationId)
        : undefined,
    kind: String(r.kind ?? ""),
    name: String(r.name ?? ""),
    enabled: Boolean(r.enabled),
    configRef:
      r.configRef !== undefined && r.configRef !== null
        ? String(r.configRef)
        : undefined,
    deliveryAvailable: false,
    providersConfigured: false,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapRecipient(raw: unknown): NotificationRecipientViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    notificationId: String(r.notificationId ?? ""),
    tenantId: String(r.tenantId ?? ""),
    userId: r.userId !== undefined && r.userId !== null ? String(r.userId) : undefined,
    addressHint:
      r.addressHint !== undefined && r.addressHint !== null
        ? String(r.addressHint)
        : undefined,
    channelKind: String(r.channelKind ?? ""),
    status: String(r.status ?? ""),
    readAt: r.readAt !== undefined && r.readAt !== null ? String(r.readAt) : undefined,
    acknowledgedAt:
      r.acknowledgedAt !== undefined && r.acknowledgedAt !== null
        ? String(r.acknowledgedAt)
        : undefined,
    dismissedAt:
      r.dismissedAt !== undefined && r.dismissedAt !== null
        ? String(r.dismissedAt)
        : undefined,
    createdAt: String(r.createdAt ?? ""),
    updatedAt: String(r.updatedAt ?? ""),
  };
}

function mapReference(raw: unknown): NotificationReferenceViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    notificationId: String(r.notificationId ?? ""),
    kind: String(r.kind ?? ""),
    resourceId: String(r.resourceId ?? ""),
    label: r.label !== undefined && r.label !== null ? String(r.label) : undefined,
  };
}

function mapAudit(raw: unknown): NotificationAuditViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    tenantId: String(r.tenantId ?? ""),
    organisationId:
      r.organisationId !== undefined && r.organisationId !== null
        ? String(r.organisationId)
        : undefined,
    notificationId:
      r.notificationId !== undefined && r.notificationId !== null
        ? String(r.notificationId)
        : undefined,
    action: String(r.action ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    detail: r.detail !== undefined && r.detail !== null ? String(r.detail) : undefined,
    createdAt: String(r.createdAt ?? ""),
  };
}

function mapManagement(raw: unknown): NotificationManagementPlaneViewModel {
  const r = asRecord(raw);
  return {
    notificationEnabled: Boolean(r.notificationEnabled),
    managementPlaneReady:
      r.managementPlaneReady !== undefined
        ? Boolean(r.managementPlaneReady)
        : undefined,
    deliveryPlaneReady: false,
    deliveryEnabled: false,
    providersConfigured: false,
    workersReady: false,
    eventBusReady: false,
    realtimeReady: false,
    persistenceMode: String(r.persistenceMode ?? "unknown"),
    capabilities:
      r.capabilities && typeof r.capabilities === "object"
        ? asRecord(r.capabilities)
        : undefined,
    status: r.status !== undefined ? String(r.status) : undefined,
    healthy: r.healthy !== undefined ? Boolean(r.healthy) : undefined,
    ready: r.ready !== undefined ? Boolean(r.ready) : undefined,
    platformServicesVersion:
      r.platformServicesVersion !== undefined
        ? String(r.platformServicesVersion)
        : undefined,
  };
}

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: NotificationClientRequestOptions,
): Promise<T> {
  assertNotificationApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...options?.headers,
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiSuccessEnvelope<T> | ApiCollectionEnvelope<unknown> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new NotificationClientError({
      message: err.error?.message ?? `Notification request failed (${response.status})`,
      code: err.error?.code ?? "NOTIFICATION_HTTP_ERROR",
      correlationId: err.meta?.correlationId,
      status: response.status,
    });
  }
  return (payload as ApiSuccessEnvelope<T>).data;
}

async function requestCollection<T>(
  path: string,
  mapItem: (raw: unknown) => T,
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<T>> {
  assertNotificationApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...options?.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiCollectionEnvelope<unknown> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new NotificationClientError({
      message: err.error?.message ?? `Notification request failed (${response.status})`,
      code: err.error?.code ?? "NOTIFICATION_HTTP_ERROR",
      correlationId: err.meta?.correlationId,
      status: response.status,
    });
  }
  const collection = payload as ApiCollectionEnvelope<unknown>;
  return {
    items: (collection.data ?? []).map(mapItem),
    page: collection.page
      ? {
          limit: collection.page.limit,
          hasMore: collection.page.hasMore,
        }
      : undefined,
  };
}

export interface NotificationClient {
  listNotifications(
    query?: ListNotificationsClientQuery,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationViewModel>>;
  getNotification(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  createNotification(
    input: CreateNotificationClientInput,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  updateNotification(
    notificationId: string,
    input: UpdateNotificationClientInput,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  archiveNotification(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  restoreNotification(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  transitionNotification(
    notificationId: string,
    input: TransitionNotificationClientInput,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  markNotificationRead(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  acknowledgeNotification(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  dismissNotification(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationViewModel>;
  listTemplates(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationTemplateViewModel>>;
  getTemplate(
    templateId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationTemplateViewModel>;
  createTemplate(
    input: CreateNotificationTemplateClientInput,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationTemplateViewModel>;
  updateTemplate(
    templateId: string,
    input: UpdateNotificationTemplateClientInput,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationTemplateViewModel>;
  archiveTemplate(
    templateId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationTemplateViewModel>;
  listPreferences(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationPreferenceViewModel>>;
  getPreference(
    preferenceId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationPreferenceViewModel>;
  updatePreference(
    preferenceId: string,
    input: UpdateNotificationPreferenceClientInput,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationPreferenceViewModel>;
  listCategories(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationCategoryViewModel>>;
  getCategory(
    categoryId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCategoryViewModel>;
  listChannels(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationChannelViewModel>>;
  getChannel(
    channelId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationChannelViewModel>;
  listRecipients(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationRecipientViewModel>>;
  getRecipient(
    notificationId: string,
    recipientId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationRecipientViewModel>;
  listReferences(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationReferenceViewModel>>;
  getReference(
    referenceId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationReferenceViewModel>;
  listAudit(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationAuditViewModel>>;
  listNotificationAudit(
    notificationId: string,
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationCollectionResult<NotificationAuditViewModel>>;
  getCapabilities(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationManagementPlaneViewModel>;
  getHealth(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationManagementPlaneViewModel>;
  getReadiness(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationManagementPlaneViewModel>;
  getDiagnostics(
    options?: NotificationClientRequestOptions,
  ): Promise<NotificationManagementPlaneViewModel>;
}

export function createHttpNotificationClient(): NotificationClient {
  return {
    listNotifications(query, options) {
      return requestCollection(
        `${API_BASE}${toQuery(query as Record<string, unknown> | undefined)}`,
        mapNotification,
        options,
      );
    },
    getNotification(notificationId, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}`,
        { method: "GET" },
        options,
      ).then(mapNotification);
    },
    createNotification(input, options) {
      return requestJson(
        API_BASE,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapNotification);
    },
    updateNotification(notificationId, input, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapNotification);
    },
    archiveNotification(notificationId, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}/archive`,
        { method: "POST" },
        options,
      ).then(mapNotification);
    },
    restoreNotification(notificationId, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}/restore`,
        { method: "POST" },
        options,
      ).then(mapNotification);
    },
    transitionNotification(notificationId, input, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}/transition`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapNotification);
    },
    markNotificationRead(notificationId, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}/mark-read`,
        { method: "POST" },
        options,
      ).then(mapNotification);
    },
    acknowledgeNotification(notificationId, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}/acknowledge`,
        { method: "POST" },
        options,
      ).then(mapNotification);
    },
    dismissNotification(notificationId, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}/dismiss`,
        { method: "POST" },
        options,
      ).then(mapNotification);
    },
    listTemplates(options) {
      return requestCollection(`${API_BASE}/templates`, mapTemplate, options);
    },
    getTemplate(templateId, options) {
      return requestJson(
        `${API_BASE}/templates/${encodeURIComponent(templateId)}`,
        { method: "GET" },
        options,
      ).then(mapTemplate);
    },
    createTemplate(input, options) {
      return requestJson(
        `${API_BASE}/templates`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapTemplate);
    },
    updateTemplate(templateId, input, options) {
      return requestJson(
        `${API_BASE}/templates/${encodeURIComponent(templateId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapTemplate);
    },
    archiveTemplate(templateId, options) {
      return requestJson(
        `${API_BASE}/templates/${encodeURIComponent(templateId)}/archive`,
        { method: "POST" },
        options,
      ).then(mapTemplate);
    },
    listPreferences(options) {
      return requestCollection(`${API_BASE}/preferences`, mapPreference, options);
    },
    getPreference(preferenceId, options) {
      return requestJson(
        `${API_BASE}/preferences/${encodeURIComponent(preferenceId)}`,
        { method: "GET" },
        options,
      ).then(mapPreference);
    },
    updatePreference(preferenceId, input, options) {
      return requestJson(
        `${API_BASE}/preferences/${encodeURIComponent(preferenceId)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapPreference);
    },
    listCategories(options) {
      return requestCollection(`${API_BASE}/categories`, mapCategory, options);
    },
    getCategory(categoryId, options) {
      return requestJson(
        `${API_BASE}/categories/${encodeURIComponent(categoryId)}`,
        { method: "GET" },
        options,
      ).then(mapCategory);
    },
    listChannels(options) {
      return requestCollection(`${API_BASE}/channels`, mapChannel, options);
    },
    getChannel(channelId, options) {
      return requestJson(
        `${API_BASE}/channels/${encodeURIComponent(channelId)}`,
        { method: "GET" },
        options,
      ).then(mapChannel);
    },
    listRecipients(notificationId, options) {
      return requestCollection(
        `${API_BASE}/${encodeURIComponent(notificationId)}/recipients`,
        mapRecipient,
        options,
      );
    },
    getRecipient(notificationId, recipientId, options) {
      return requestJson(
        `${API_BASE}/${encodeURIComponent(notificationId)}/recipients/${encodeURIComponent(recipientId)}`,
        { method: "GET" },
        options,
      ).then(mapRecipient);
    },
    listReferences(notificationId, options) {
      return requestCollection(
        `${API_BASE}/${encodeURIComponent(notificationId)}/references`,
        mapReference,
        options,
      );
    },
    getReference(referenceId, options) {
      return requestJson(
        `${API_BASE}/references/${encodeURIComponent(referenceId)}`,
        { method: "GET" },
        options,
      ).then(mapReference);
    },
    listAudit(options) {
      return requestCollection(`${API_BASE}/audit`, mapAudit, options);
    },
    listNotificationAudit(notificationId, options) {
      return requestCollection(
        `${API_BASE}/${encodeURIComponent(notificationId)}/audit`,
        mapAudit,
        options,
      );
    },
    getCapabilities(options) {
      return requestJson(`${API_BASE}/capabilities`, { method: "GET" }, options).then(
        mapManagement,
      );
    },
    getHealth(options) {
      return requestJson(`${API_BASE}/health`, { method: "GET" }, options).then(
        mapManagement,
      );
    },
    getReadiness(options) {
      return requestJson(`${API_BASE}/readiness`, { method: "GET" }, options).then(
        mapManagement,
      );
    },
    getDiagnostics(options) {
      return requestJson(`${API_BASE}/diagnostics`, { method: "GET" }, options).then(
        mapManagement,
      );
    },
  };
}
