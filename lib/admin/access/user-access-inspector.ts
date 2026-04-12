import { z } from "zod";

import { accessSourceVisibilitySchema } from "@/lib/admin/access/access-source-visibility";
import { accessRealizationStatusSchema } from "@/lib/admin/access/realization-status";

export const adminBundleAssignmentSchema = z.object({
  bundleId: z.string(),
  bundleName: z.string(),
});

export type AdminBundleAssignment = z.infer<typeof adminBundleAssignmentSchema>;

export const adminServiceAccessLineSchema = z.object({
  serviceId: z.string(),
  serviceName: z.string(),
  effectiveRole: z.string(),
  source: accessSourceVisibilitySchema,
  realizationStatus: accessRealizationStatusSchema,
  activeJobId: z.string().optional(),
  lastJobSummary: z.string().optional(),
});

export type AdminServiceAccessLine = z.infer<typeof adminServiceAccessLineSchema>;

export const adminUserAccessDetailSchema = z.object({
  userId: z.string(),
  displayName: z.string(),
  email: z.string().email(),
  platformRole: z.enum(["user", "admin", "superadmin"]),
  bundleAssignments: z.array(adminBundleAssignmentSchema),
  serviceAccess: z.array(adminServiceAccessLineSchema),
});

export type AdminUserAccessDetail = z.infer<typeof adminUserAccessDetailSchema>;
