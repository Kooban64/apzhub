/**
 * Notification structural / reference / lifecycle validation (APZNOTIFY-001).
 */

import type {
  Notification,
  NotificationAttachmentMetadata,
  NotificationChannelKind,
  NotificationPriority,
  NotificationReference,
  NotificationStatus,
  NotificationValidationIssue,
  NotificationValidationResult,
} from "@apzhub/notification-contracts";
import {
  isNotificationChannelKind,
  isNotificationPriority,
  isNotificationReferenceKind,
  isNotificationStatus,
} from "@apzhub/notification-contracts";

export type ValidateNotificationInput = {
  readonly notification: Notification;
  readonly references?: readonly NotificationReference[];
  readonly attachments?: readonly NotificationAttachmentMetadata[];
  readonly knownCategoryIds?: ReadonlySet<string>;
  readonly knownTemplateIds?: ReadonlySet<string>;
};

function issue(
  code: string,
  message: string,
  path?: string,
): NotificationValidationIssue {
  return { code, message, path };
}

export function validateNotificationStructural(
  notification: Notification,
): readonly NotificationValidationIssue[] {
  const issues: NotificationValidationIssue[] = [];
  if (!notification.id?.trim()) {
    issues.push(issue("missing_id", "id is required", "id"));
  }
  if (!notification.tenantId?.trim()) {
    issues.push(issue("missing_tenant", "tenantId is required", "tenantId"));
  }
  if (!notification.title?.trim()) {
    issues.push(issue("missing_title", "title is required", "title"));
  }
  if (!isNotificationStatus(notification.status)) {
    issues.push(
      issue(
        "invalid_status",
        `status must be a known NotificationStatus`,
        "status",
      ),
    );
  }
  if (!isNotificationPriority(notification.priority)) {
    issues.push(
      issue(
        "invalid_priority",
        `priority must be a known NotificationPriority`,
        "priority",
      ),
    );
  }
  if (!Array.isArray(notification.channelKinds)) {
    issues.push(
      issue(
        "invalid_channels",
        "channelKinds must be an array",
        "channelKinds",
      ),
    );
  } else {
    for (let i = 0; i < notification.channelKinds.length; i++) {
      const kind = notification.channelKinds[i] as string;
      if (!isNotificationChannelKind(kind)) {
        issues.push(
          issue(
            "invalid_channel_kind",
            `unknown channel kind: ${kind}`,
            `channelKinds[${i}]`,
          ),
        );
      }
    }
  }
  if (
    notification.revision != null &&
    (!Number.isInteger(notification.revision) || notification.revision < 1)
  ) {
    issues.push(
      issue("invalid_revision", "revision must be an integer >= 1", "revision"),
    );
  }
  return issues;
}

export function validateNotificationReferences(
  input: ValidateNotificationInput,
): readonly NotificationValidationIssue[] {
  const issues: NotificationValidationIssue[] = [];
  const { notification, references = [], knownCategoryIds, knownTemplateIds } =
    input;

  if (notification.categoryId && knownCategoryIds) {
    if (!knownCategoryIds.has(notification.categoryId)) {
      issues.push(
        issue(
          "unknown_category",
          `categoryId not found: ${notification.categoryId}`,
          "categoryId",
        ),
      );
    }
  }
  if (notification.templateId && knownTemplateIds) {
    if (!knownTemplateIds.has(notification.templateId)) {
      issues.push(
        issue(
          "unknown_template",
          `templateId not found: ${notification.templateId}`,
          "templateId",
        ),
      );
    }
  }

  for (let i = 0; i < references.length; i++) {
    const ref = references[i];
    if (!ref) continue;
    if (ref.notificationId !== notification.id) {
      issues.push(
        issue(
          "reference_notification_mismatch",
          "reference.notificationId must match notification.id",
          `references[${i}].notificationId`,
        ),
      );
    }
    if (!isNotificationReferenceKind(ref.kind)) {
      issues.push(
        issue(
          "invalid_reference_kind",
          `unknown reference kind: ${ref.kind}`,
          `references[${i}].kind`,
        ),
      );
    }
    if (!ref.resourceId?.trim()) {
      issues.push(
        issue(
          "missing_resource_id",
          "reference.resourceId is required",
          `references[${i}].resourceId`,
        ),
      );
    }
  }
  return issues;
}

export function validateNotificationAttachments(
  input: ValidateNotificationInput,
): readonly NotificationValidationIssue[] {
  const issues: NotificationValidationIssue[] = [];
  const { notification, attachments = [] } = input;
  for (let i = 0; i < attachments.length; i++) {
    const att = attachments[i];
    if (!att) continue;
    if (att.notificationId !== notification.id) {
      issues.push(
        issue(
          "attachment_notification_mismatch",
          "attachment.notificationId must match notification.id",
          `attachments[${i}].notificationId`,
        ),
      );
    }
    if (!att.fileName?.trim()) {
      issues.push(
        issue(
          "missing_file_name",
          "attachment.fileName is required",
          `attachments[${i}].fileName`,
        ),
      );
    }
    if (att.sizeBytes != null && att.sizeBytes < 0) {
      issues.push(
        issue(
          "invalid_size",
          "attachment.sizeBytes must be >= 0",
          `attachments[${i}].sizeBytes`,
        ),
      );
    }
  }
  return issues;
}

export function validateNotificationLifecycleFields(
  notification: Notification,
): readonly NotificationValidationIssue[] {
  const issues: NotificationValidationIssue[] = [];
  if (notification.status === "archived" && !notification.archivedAt) {
    issues.push(
      issue(
        "missing_archived_at",
        "archivedAt is required when status is archived",
        "archivedAt",
      ),
    );
  }
  if (notification.status === "expired" && !notification.expiresAt) {
    issues.push(
      issue(
        "missing_expires_at",
        "expiresAt is required when status is expired",
        "expiresAt",
      ),
    );
  }
  return issues;
}

export function validateNotification(
  input: ValidateNotificationInput,
): NotificationValidationResult {
  const issues: NotificationValidationIssue[] = [
    ...validateNotificationStructural(input.notification),
    ...validateNotificationReferences(input),
    ...validateNotificationAttachments(input),
    ...validateNotificationLifecycleFields(input.notification),
  ];
  return {
    valid: issues.length === 0,
    issues,
  };
}

export type {
  NotificationChannelKind,
  NotificationPriority,
  NotificationStatus,
};
