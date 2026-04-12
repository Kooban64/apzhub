import { z } from "zod";

export const adminProvisioningStageSchema = z.enum([
  "queued",
  "validating",
  "provisioning",
  "awaiting_approval",
  "completed",
  "failed",
]);

export type AdminProvisioningStage = z.infer<typeof adminProvisioningStageSchema>;

export const adminProvisioningQueueRowSchema = z.object({
  id: z.string(),
  tenantLabel: z.string(),
  requestType: z.string(),
  stage: adminProvisioningStageSchema,
  updatedAt: z.string(),
});

export type AdminProvisioningQueueRow = z.infer<typeof adminProvisioningQueueRowSchema>;

export const adminProvisioningPreviewSchema = z.object({
  rows: z.array(adminProvisioningQueueRowSchema),
});

export type AdminProvisioningPreview = z.infer<typeof adminProvisioningPreviewSchema>;
