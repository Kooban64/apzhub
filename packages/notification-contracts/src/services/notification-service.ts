/**
 * Notification Platform service surface (APZNOTIFY-001).
 * Domain contracts only — no Gateway / HTTP / delivery.
 */

import type { NotificationRequestContext } from "../common/context";
import type {
  Notification,
  NotificationAuditEntry,
  NotificationCategory,
  NotificationChannel,
  NotificationPreference,
  NotificationRecipient,
  NotificationRule,
  NotificationTemplate,
} from "../domain/notification";
import type { NotificationStatus } from "../enums/catalogue";
import type { NotificationId, NotificationTemplateId } from "../identifiers";

export type NotificationValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly path?: string;
};

export type NotificationValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly NotificationValidationIssue[];
};

export interface NotificationPlatformService {
  create(
    ctx: NotificationRequestContext,
    notification: Notification,
  ): Promise<Notification>;
  get(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
  ): Promise<Notification | null>;
  update(
    ctx: NotificationRequestContext,
    notification: Notification,
  ): Promise<Notification>;
  transitionStatus(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
    to: NotificationStatus,
  ): Promise<Notification>;
  list(ctx: NotificationRequestContext): Promise<readonly Notification[]>;
  validate(notification: Notification): NotificationValidationResult;
  listTemplates(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationTemplate[]>;
  getTemplate(
    ctx: NotificationRequestContext,
    templateId: NotificationTemplateId,
  ): Promise<NotificationTemplate | null>;
  listCategories(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationCategory[]>;
  listChannels(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationChannel[]>;
  listPreferences(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationPreference[]>;
  listRules(ctx: NotificationRequestContext): Promise<readonly NotificationRule[]>;
  listRecipients(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
  ): Promise<readonly NotificationRecipient[]>;
  listAudit(
    ctx: NotificationRequestContext,
    notificationId?: NotificationId,
  ): Promise<readonly NotificationAuditEntry[]>;
}
