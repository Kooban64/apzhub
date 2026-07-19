/**
 * In-memory Platform Notification client for tests (APZNOTIFY-003).
 */

import type { NotificationClient } from "./notification-client";
import type {
  NotificationManagementPlaneViewModel,
  NotificationTemplateViewModel,
  NotificationViewModel,
} from "./notification-types";

export const MOCK_NOTIFICATION: NotificationViewModel = {
  id: "ntf_mock_1",
  tenantId: "tenant_a",
  organisationId: "org_a",
  key: "mock.notice",
  title: "Mock notification",
  summary: "Read-only mock for client tests",
  status: "pending",
  priority: "normal",
  categoryId: "ntc_mock_1",
  templateId: "ntt_mock_1",
  channelKinds: ["in_app"],
  createdAt: "2026-07-16T10:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

export const MOCK_NOTIFICATION_TEMPLATE: NotificationTemplateViewModel = {
  id: "ntt_mock_1",
  tenantId: "tenant_a",
  key: "mock-template",
  name: "Mock Template",
  defaultPriority: "normal",
  defaultChannelKinds: ["in_app"],
  createdAt: "2026-07-16T10:00:00.000Z",
  updatedAt: "2026-07-16T12:00:00.000Z",
  createdBy: "user_1",
  updatedBy: "user_1",
  revision: 1,
};

const MOCK_PLANE: NotificationManagementPlaneViewModel = {
  notificationEnabled: true,
  managementPlaneReady: true,
  deliveryPlaneReady: false,
  deliveryEnabled: false,
  providersConfigured: false,
  workersReady: false,
  eventBusReady: false,
  realtimeReady: false,
  persistenceMode: "memory",
  healthy: true,
  ready: true,
  status: "ok",
  capabilities: {
    delivery: false,
    metadataCrud: true,
    lifecycle: true,
  },
  platformServicesVersion: "0.26.1",
};

export function createMockNotificationClient(): NotificationClient {
  return {
    async listNotifications(query) {
      const items =
        query?.status && query.status !== MOCK_NOTIFICATION.status
          ? []
          : [MOCK_NOTIFICATION];
      return { items, page: { limit: items.length, hasMore: false } };
    },
    async getNotification(notificationId) {
      return { ...MOCK_NOTIFICATION, id: notificationId };
    },
    async createNotification(input) {
      return {
        ...MOCK_NOTIFICATION,
        title: input.title,
        summary: input.summary,
        status: "draft",
      };
    },
    async updateNotification(notificationId, input) {
      return {
        ...MOCK_NOTIFICATION,
        id: notificationId,
        title: input.title ?? MOCK_NOTIFICATION.title,
        revision: MOCK_NOTIFICATION.revision + 1,
      };
    },
    async archiveNotification(notificationId) {
      return {
        ...MOCK_NOTIFICATION,
        id: notificationId,
        status: "archived",
        archivedAt: "2026-07-16T13:00:00.000Z",
      };
    },
    async restoreNotification(notificationId) {
      return { ...MOCK_NOTIFICATION, id: notificationId, status: "draft" };
    },
    async transitionNotification(notificationId, input) {
      return { ...MOCK_NOTIFICATION, id: notificationId, status: input.to };
    },
    async markNotificationRead(notificationId) {
      return { ...MOCK_NOTIFICATION, id: notificationId, status: "read" };
    },
    async acknowledgeNotification(notificationId) {
      return {
        ...MOCK_NOTIFICATION,
        id: notificationId,
        status: "acknowledged",
      };
    },
    async dismissNotification(notificationId) {
      return { ...MOCK_NOTIFICATION, id: notificationId, status: "dismissed" };
    },
    async listTemplates() {
      return {
        items: [MOCK_NOTIFICATION_TEMPLATE],
        page: { limit: 1, hasMore: false },
      };
    },
    async getTemplate(templateId) {
      return { ...MOCK_NOTIFICATION_TEMPLATE, id: templateId };
    },
    async createTemplate(input) {
      return {
        ...MOCK_NOTIFICATION_TEMPLATE,
        key: input.key,
        name: input.name,
      };
    },
    async updateTemplate(templateId, input) {
      return {
        ...MOCK_NOTIFICATION_TEMPLATE,
        id: templateId,
        name: input.name ?? MOCK_NOTIFICATION_TEMPLATE.name,
      };
    },
    async archiveTemplate(templateId) {
      return { ...MOCK_NOTIFICATION_TEMPLATE, id: templateId };
    },
    async listPreferences() {
      return {
        items: [
          {
            id: "ntp_mock_1",
            tenantId: "tenant_a",
            userId: "user_1",
            channelKind: "in_app",
            enabled: true,
            createdAt: "2026-07-16T10:00:00.000Z",
            updatedAt: "2026-07-16T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getPreference(preferenceId) {
      return {
        id: preferenceId,
        tenantId: "tenant_a",
        userId: "user_1",
        channelKind: "in_app",
        enabled: true,
        createdAt: "2026-07-16T10:00:00.000Z",
        updatedAt: "2026-07-16T10:00:00.000Z",
      };
    },
    async updatePreference(preferenceId, input) {
      return {
        id: preferenceId,
        tenantId: "tenant_a",
        userId: "user_1",
        channelKind: input.channelKind ?? "in_app",
        enabled: input.enabled ?? true,
        createdAt: "2026-07-16T10:00:00.000Z",
        updatedAt: "2026-07-16T11:00:00.000Z",
      };
    },
    async listCategories() {
      return {
        items: [
          {
            id: "ntc_mock_1",
            tenantId: "tenant_a",
            key: "system",
            name: "System",
            createdAt: "2026-07-16T10:00:00.000Z",
            updatedAt: "2026-07-16T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getCategory(categoryId) {
      return {
        id: categoryId,
        tenantId: "tenant_a",
        key: "system",
        name: "System",
        createdAt: "2026-07-16T10:00:00.000Z",
        updatedAt: "2026-07-16T10:00:00.000Z",
      };
    },
    async listChannels() {
      return {
        items: [
          {
            id: "ntch_mock_1",
            tenantId: "tenant_a",
            kind: "in_app",
            name: "In-app",
            enabled: true,
            deliveryAvailable: false,
            providersConfigured: false,
            createdAt: "2026-07-16T10:00:00.000Z",
            updatedAt: "2026-07-16T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getChannel(channelId) {
      return {
        id: channelId,
        tenantId: "tenant_a",
        kind: "in_app",
        name: "In-app",
        enabled: true,
        deliveryAvailable: false,
        providersConfigured: false,
        createdAt: "2026-07-16T10:00:00.000Z",
        updatedAt: "2026-07-16T10:00:00.000Z",
      };
    },
    async listRecipients(notificationId) {
      return {
        items: [
          {
            id: "ntr_mock_1",
            notificationId,
            tenantId: "tenant_a",
            userId: "user_1",
            channelKind: "in_app",
            status: "pending",
            createdAt: "2026-07-16T10:00:00.000Z",
            updatedAt: "2026-07-16T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getRecipient(notificationId, recipientId) {
      return {
        id: recipientId,
        notificationId,
        tenantId: "tenant_a",
        userId: "user_1",
        channelKind: "in_app",
        status: "pending",
        addressHint: "masked@example.com",
        createdAt: "2026-07-16T10:00:00.000Z",
        updatedAt: "2026-07-16T10:00:00.000Z",
      };
    },
    async listReferences(notificationId) {
      return {
        items: [
          {
            id: "ntref_mock_1",
            notificationId,
            kind: "projects",
            resourceId: "proj_1",
            label: "Portal",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getReference(referenceId) {
      return {
        id: referenceId,
        notificationId: MOCK_NOTIFICATION.id,
        kind: "projects",
        resourceId: "proj_1",
      };
    },
    async listAudit() {
      return {
        items: [
          {
            id: "nta_mock_1",
            tenantId: "tenant_a",
            notificationId: MOCK_NOTIFICATION.id,
            action: "notification.created",
            actorUserId: "user_1",
            detail: "Created in draft",
            createdAt: "2026-07-16T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async listNotificationAudit(notificationId) {
      return {
        items: [
          {
            id: "nta_mock_1",
            tenantId: "tenant_a",
            notificationId,
            action: "notification.created",
            actorUserId: "user_1",
            detail: "Created in draft",
            createdAt: "2026-07-16T10:00:00.000Z",
          },
        ],
        page: { limit: 1, hasMore: false },
      };
    },
    async getCapabilities() {
      return { ...MOCK_PLANE };
    },
    async getHealth() {
      return { ...MOCK_PLANE, status: "ok", healthy: true };
    },
    async getReadiness() {
      return { ...MOCK_PLANE, ready: true, status: "ready" };
    },
    async getDiagnostics() {
      return { ...MOCK_PLANE, platformServicesVersion: "0.26.1" };
    },
  };
}
