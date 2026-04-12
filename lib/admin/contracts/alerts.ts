import { z } from "zod";

import { adminTraceDomainSchema } from "@/lib/admin/contracts/admin-trace-domain";

export const adminAlertSeveritySchema = z.enum(["critical", "warning", "info"]);

export type AdminAlertSeverity = z.infer<typeof adminAlertSeveritySchema>;

export const alertPointerKindSchema = z.enum(["none", "user", "service", "job", "route", "bundle"]);

export type AlertPointerKind = z.infer<typeof alertPointerKindSchema>;

export const adminActionRequiredItemSchema = z.object({
  id: z.string(),
  severity: adminAlertSeveritySchema,
  title: z.string(),
  summary: z.string(),
  /** Product domain for cross-linking to audit / queues. */
  domain: adminTraceDomainSchema.optional(),
  /** What this alert points an operator at. */
  pointerKind: alertPointerKindSchema.default("none"),
  pointerId: z.string().optional(),
  /** In-app route (e.g. /admin/provisioning) when actionable. */
  pointerRoute: z.string().optional(),
  /** Deterministic recovery copy (what to do next). */
  recoveryHint: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
  blocked: z.boolean(),
});

export type AdminActionRequiredItem = z.infer<typeof adminActionRequiredItemSchema>;

export const adminAlertsPanelSchema = z.object({
  items: z.array(adminActionRequiredItemSchema),
});

export type AdminAlertsPanel = z.infer<typeof adminAlertsPanelSchema>;
