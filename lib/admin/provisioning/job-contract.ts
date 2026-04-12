import { z } from "zod";

/**
 * Provisioning **job** lifecycle (`status` below) is separate from **access realization**
 * (`AccessRealizationStatus` in `lib/admin/access/realization-status.ts`): jobs describe
 * workflow attempts; realization describes downstream posture for a user+service.
 */

export const adminProvisioningJobTypeSchema = z.enum(["grant", "revoke", "repair", "reconcile"]);

export type AdminProvisioningJobType = z.infer<typeof adminProvisioningJobTypeSchema>;

export const adminProvisioningJobStatusSchema = z.enum([
  "queued",
  "running",
  "succeeded",
  "failed",
  "cancelled",
  "awaiting_manual",
  "superseded",
]);

export type AdminProvisioningJobStatus = z.infer<typeof adminProvisioningJobStatusSchema>;

export const adminProvisioningConnectorProfileSchema = z.enum(["mock", "simulated"]);

export const adminProvisioningJobSchema = z.object({
  id: z.string(),
  jobType: adminProvisioningJobTypeSchema,
  userId: z.string().optional(),
  serviceId: z.string().optional(),
  subjectLabel: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  status: adminProvisioningJobStatusSchema,
  failureCode: z.string().optional(),
  failureMessage: z.string().optional(),
  retryCount: z.number().int().nonnegative(),
  manualHold: z.boolean().optional(),
  /** Resolved from service id via connector registry at read time. */
  connectorId: z.string().optional(),
  connectorProfile: adminProvisioningConnectorProfileSchema.optional(),
  connectorCapabilitySummary: z.string().optional(),
  /** Truncated `verification_json` for inspector / queue. */
  lastVerificationSnippet: z.string().optional(),
  /** Operator-facing description of lifecycle status (transient vs terminal vs manual). */
  jobStatusExplanation: z.string().optional(),
});

export type AdminProvisioningJob = z.infer<typeof adminProvisioningJobSchema>;

export const adminProvisioningQueueSchema = z.object({
  jobs: z.array(adminProvisioningJobSchema),
});

export type AdminProvisioningQueue = z.infer<typeof adminProvisioningQueueSchema>;
