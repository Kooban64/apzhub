import { z } from "zod";

export const adminBundleImpactSummarySchema = z.object({
  servicesAffectedCount: z.number().int().nonnegative(),
  usersAffectedCount: z.number().int().nonnegative(),
  overridesPresentCount: z.number().int().nonnegative(),
  conflictsCount: z.number().int().nonnegative(),
});

export type AdminBundleImpactSummary = z.infer<typeof adminBundleImpactSummarySchema>;

export const adminBundleServiceRoleSchema = z.object({
  serviceId: z.string(),
  roleId: z.string(),
  roleLabel: z.string(),
});

export type AdminBundleServiceRole = z.infer<typeof adminBundleServiceRoleSchema>;

export const adminBundleSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export type AdminBundle = z.infer<typeof adminBundleSchema>;

export const adminBundleDetailSchema = adminBundleSchema.extend({
  serviceRoles: z.array(adminBundleServiceRoleSchema),
  previewLines: z.array(z.string()),
  affectedUserCount: z.number().int().nonnegative(),
  affectedUserSample: z.array(z.string()),
  impact: adminBundleImpactSummarySchema,
});

export type AdminBundleDetail = z.infer<typeof adminBundleDetailSchema>;

export const adminBundleListSchema = z.object({
  bundles: z.array(adminBundleSchema),
});

export type AdminBundleList = z.infer<typeof adminBundleListSchema>;
