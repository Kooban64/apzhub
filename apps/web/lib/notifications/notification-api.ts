/**
 * Module-level Platform Notification client accessor + facades (APZNOTIFY-003).
 */

import {
  createHttpNotificationClient,
  type NotificationClient,
} from "./notification-client";
import { createMockNotificationClient } from "./mock-notification-client";
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

let notificationClient: NotificationClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockNotificationClient()
    : createHttpNotificationClient();

export function setNotificationClient(client: NotificationClient): void {
  notificationClient = client;
}

export function getNotificationClient(): NotificationClient {
  return notificationClient;
}

export function resetNotificationClient(): void {
  notificationClient = createMockNotificationClient();
}

export function listNotifications(
  query?: ListNotificationsClientQuery,
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationViewModel>> {
  return getNotificationClient().listNotifications(query, options);
}

export function getNotification(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().getNotification(notificationId, options);
}

export function createNotification(
  input: CreateNotificationClientInput,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().createNotification(input, options);
}

export function updateNotification(
  notificationId: string,
  input: UpdateNotificationClientInput,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().updateNotification(
    notificationId,
    input,
    options,
  );
}

export function archiveNotification(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().archiveNotification(notificationId, options);
}

export function restoreNotification(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().restoreNotification(notificationId, options);
}

export function transitionNotification(
  notificationId: string,
  input: TransitionNotificationClientInput,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().transitionNotification(
    notificationId,
    input,
    options,
  );
}

export function markNotificationRead(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().markNotificationRead(notificationId, options);
}

export function acknowledgeNotification(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().acknowledgeNotification(
    notificationId,
    options,
  );
}

export function dismissNotification(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationViewModel> {
  return getNotificationClient().dismissNotification(notificationId, options);
}

export function listNotificationTemplates(
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationTemplateViewModel>> {
  return getNotificationClient().listTemplates(options);
}

export function getNotificationTemplate(
  templateId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationTemplateViewModel> {
  return getNotificationClient().getTemplate(templateId, options);
}

export function createNotificationTemplate(
  input: CreateNotificationTemplateClientInput,
  options?: NotificationClientRequestOptions,
): Promise<NotificationTemplateViewModel> {
  return getNotificationClient().createTemplate(input, options);
}

export function updateNotificationTemplate(
  templateId: string,
  input: UpdateNotificationTemplateClientInput,
  options?: NotificationClientRequestOptions,
): Promise<NotificationTemplateViewModel> {
  return getNotificationClient().updateTemplate(templateId, input, options);
}

export function archiveNotificationTemplate(
  templateId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationTemplateViewModel> {
  return getNotificationClient().archiveTemplate(templateId, options);
}

export function listNotificationPreferences(
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationPreferenceViewModel>> {
  return getNotificationClient().listPreferences(options);
}

export function getNotificationPreference(
  preferenceId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationPreferenceViewModel> {
  return getNotificationClient().getPreference(preferenceId, options);
}

export function updateNotificationPreference(
  preferenceId: string,
  input: UpdateNotificationPreferenceClientInput,
  options?: NotificationClientRequestOptions,
): Promise<NotificationPreferenceViewModel> {
  return getNotificationClient().updatePreference(
    preferenceId,
    input,
    options,
  );
}

export function listNotificationCategories(
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationCategoryViewModel>> {
  return getNotificationClient().listCategories(options);
}

export function getNotificationCategory(
  categoryId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationCategoryViewModel> {
  return getNotificationClient().getCategory(categoryId, options);
}

export function listNotificationChannels(
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationChannelViewModel>> {
  return getNotificationClient().listChannels(options);
}

export function getNotificationChannel(
  channelId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationChannelViewModel> {
  return getNotificationClient().getChannel(channelId, options);
}

export function listNotificationRecipients(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationRecipientViewModel>> {
  return getNotificationClient().listRecipients(notificationId, options);
}

export function getNotificationRecipient(
  notificationId: string,
  recipientId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationRecipientViewModel> {
  return getNotificationClient().getRecipient(
    notificationId,
    recipientId,
    options,
  );
}

export function listNotificationReferences(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationReferenceViewModel>> {
  return getNotificationClient().listReferences(notificationId, options);
}

export function getNotificationReference(
  referenceId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationReferenceViewModel> {
  return getNotificationClient().getReference(referenceId, options);
}

export function listNotificationAudit(
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationAuditViewModel>> {
  return getNotificationClient().listAudit(options);
}

export function listScopedNotificationAudit(
  notificationId: string,
  options?: NotificationClientRequestOptions,
): Promise<NotificationCollectionResult<NotificationAuditViewModel>> {
  return getNotificationClient().listNotificationAudit(notificationId, options);
}

export function getNotificationCapabilities(
  options?: NotificationClientRequestOptions,
): Promise<NotificationManagementPlaneViewModel> {
  return getNotificationClient().getCapabilities(options);
}

export function getNotificationHealth(
  options?: NotificationClientRequestOptions,
): Promise<NotificationManagementPlaneViewModel> {
  return getNotificationClient().getHealth(options);
}

export function getNotificationReadiness(
  options?: NotificationClientRequestOptions,
): Promise<NotificationManagementPlaneViewModel> {
  return getNotificationClient().getReadiness(options);
}

export function getNotificationDiagnostics(
  options?: NotificationClientRequestOptions,
): Promise<NotificationManagementPlaneViewModel> {
  return getNotificationClient().getDiagnostics(options);
}

export {
  createHttpNotificationClient,
  createMockNotificationClient,
  type NotificationClient,
};
export * from "./notification-types";
export * from "./notification-errors";
export * from "./routes";
export * from "./query-keys";
