/**
 * Zod schemas for Platform Notification HTTP API (APZNOTIFY-003).
 * Metadata / lifecycle only — no delivery, provider, or transport bodies.
 */

import { z } from "zod";

import { paginationQuerySchema } from "./common";

const idPattern = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

const idParam = (label: string) =>
  z.string().min(1).max(128).regex(idPattern, `Invalid ${label} identifier format`);

export const notificationIdParamSchema = idParam("notification");
export const notificationTemplateIdParamSchema = idParam("template");
export const notificationPreferenceIdParamSchema = idParam("preference");
export const notificationCategoryIdParamSchema = idParam("category");
export const notificationChannelIdParamSchema = idParam("channel");
export const notificationRecipientIdParamSchema = idParam("recipient");
export const notificationReferenceIdParamSchema = idParam("reference");
export const notificationAuditIdParamSchema = idParam("audit");

export const notificationStatusSchema = z.enum([
  "draft",
  "pending",
  "queued",
  "delivered",
  "read",
  "acknowledged",
  "dismissed",
  "expired",
  "archived",
]);

export const notificationPrioritySchema = z.enum([
  "critical",
  "high",
  "normal",
  "low",
  "informational",
]);

export const notificationChannelKindSchema = z.enum([
  "email",
  "sms",
  "push",
  "in_app",
  "webhook",
  "microsoft_teams",
  "slack",
  "future",
]);

export const notificationReferenceKindSchema = z.enum([
  "projects",
  "support",
  "testing",
  "reporting",
  "documents",
  "workflow",
  "search",
  "future",
]);

export const notificationsListQuerySchema = paginationQuerySchema
  .extend({
    status: notificationStatusSchema.optional(),
    priority: notificationPrioritySchema.optional(),
    categoryId: z.string().min(1).max(128).optional(),
    channel: notificationChannelKindSchema.optional(),
  })
  .strict();

export const createNotificationBodySchema = z
  .object({
    title: z.string().min(1).max(512),
    summary: z.string().max(2000).optional(),
    body: z.string().max(10000).optional(),
    key: z.string().min(1).max(128).optional(),
    priority: notificationPrioritySchema.optional(),
    categoryId: z.string().min(1).max(128).optional(),
    templateId: z.string().min(1).max(128).optional(),
    channelKinds: z.array(notificationChannelKindSchema).max(16).optional(),
    organisationId: z.string().min(1).max(128).optional(),
    expiresAt: z.string().datetime().optional(),
    recipients: z
      .array(
        z
          .object({
            userId: z.string().min(1).max(128).optional(),
            addressHint: z.string().max(256).optional(),
            channelKind: notificationChannelKindSchema,
          })
          .strict(),
      )
      .max(100)
      .optional(),
    references: z
      .array(
        z
          .object({
            kind: notificationReferenceKindSchema,
            resourceId: z.string().min(1).max(256),
            label: z.string().max(256).optional(),
          })
          .strict(),
      )
      .max(50)
      .optional(),
  })
  .strict();

export const updateNotificationBodySchema = z
  .object({
    title: z.string().min(1).max(512).optional(),
    summary: z.string().max(2000).nullable().optional(),
    body: z.string().max(10000).nullable().optional(),
    priority: notificationPrioritySchema.optional(),
    categoryId: z.string().min(1).max(128).nullable().optional(),
    templateId: z.string().min(1).max(128).nullable().optional(),
    channelKinds: z.array(notificationChannelKindSchema).max(16).optional(),
    expiresAt: z.string().datetime().nullable().optional(),
  })
  .strict();

export const transitionNotificationBodySchema = z
  .object({
    to: notificationStatusSchema,
    reason: z.string().max(512).optional(),
  })
  .strict();

export const createNotificationTemplateBodySchema = z
  .object({
    key: z.string().min(1).max(128),
    name: z.string().min(1).max(256),
    description: z.string().max(2000).optional(),
    categoryId: z.string().min(1).max(128).optional(),
    defaultPriority: notificationPrioritySchema.optional(),
    defaultChannelKinds: z.array(notificationChannelKindSchema).max(16).optional(),
    subjectTemplate: z.string().max(512).optional(),
    bodyTemplate: z.string().max(10000).optional(),
    locale: z.string().max(32).optional(),
    organisationId: z.string().min(1).max(128).optional(),
  })
  .strict();

export const updateNotificationTemplateBodySchema = z
  .object({
    name: z.string().min(1).max(256).optional(),
    description: z.string().max(2000).nullable().optional(),
    categoryId: z.string().min(1).max(128).nullable().optional(),
    defaultPriority: notificationPrioritySchema.optional(),
    defaultChannelKinds: z.array(notificationChannelKindSchema).max(16).optional(),
    subjectTemplate: z.string().max(512).nullable().optional(),
    bodyTemplate: z.string().max(10000).nullable().optional(),
    locale: z.string().max(32).nullable().optional(),
  })
  .strict();

export const updateNotificationPreferenceBodySchema = z
  .object({
    enabled: z.boolean().optional(),
    quietHours: z.string().max(128).nullable().optional(),
    categoryId: z.string().min(1).max(128).nullable().optional(),
    channelKind: notificationChannelKindSchema.optional(),
  })
  .strict();
