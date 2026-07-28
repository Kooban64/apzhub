/**
 * Workflow notification intent port — interfaces only (APZHUB-PLATFORM-WORKFLOW-003).
 * Delivery remains Notification Framework (021); this is publish-intent only.
 */

import type { WorkflowNotification } from "../domain/runtime";
import type {
  WorkflowNotificationId,
  WorkflowRunId,
  WorkflowTaskId,
} from "../identifiers";
import type { WorkflowPlatformServiceContext } from "./platform-gateway";

export type PublishWorkflowNotificationInput = {
  readonly templateKey: string;
  readonly runId?: WorkflowRunId;
  readonly taskId?: WorkflowTaskId;
  readonly recipientPrincipalIds?: readonly string[];
  readonly payload?: Readonly<Record<string, unknown>>;
  readonly channelHint?: string;
};

/**
 * Owner programme name: NotificationService (workflow-scoped).
 * Prefer {@link WorkflowNotificationService} at call sites to avoid confusion
 * with platform Notification Framework services.
 */
export type WorkflowNotificationService = {
  readonly publishIntent: (
    ctx: WorkflowPlatformServiceContext,
    input: PublishWorkflowNotificationInput,
  ) => Promise<WorkflowNotification>;
  readonly getIntent: (
    ctx: WorkflowPlatformServiceContext,
    notificationId: WorkflowNotificationId,
  ) => Promise<WorkflowNotification>;
  readonly listIntents: (
    ctx: WorkflowPlatformServiceContext,
    input?: { readonly limit?: number },
  ) => Promise<readonly WorkflowNotification[]>;
};

/** Owner-listed alias. */
export type NotificationService = WorkflowNotificationService;
