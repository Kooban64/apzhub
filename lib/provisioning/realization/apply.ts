import type { AdminProvisioningJobStatus, AdminProvisioningJobType } from "@/lib/admin/provisioning/job-contract";
import type { AccessRealizationStatus } from "@/lib/admin/access/realization-status";
import { accessRealizationStatusSchema } from "@/lib/admin/access/realization-status";
import type { AppDbClient } from "@/db/client";
import { getDb } from "@/db/client";
import { accessServiceRealizations } from "@/db/schema/provisioning";

function realizationForTerminalJob(
  status: AdminProvisioningJobStatus,
  jobType: AdminProvisioningJobType,
): AccessRealizationStatus | null {
  if (status === "queued" || status === "running") {
    return "pending";
  }
  if (status === "awaiting_manual") {
    return "manual_action";
  }
  if (status === "failed") {
    return "failed";
  }
  if (status === "succeeded") {
    if (jobType === "revoke") {
      return "revoked";
    }
    return "provisioned";
  }
  if (status === "cancelled" || status === "superseded") {
    return "pending";
  }
  return null;
}

export type ApplyRealizationInput = {
  userId: string;
  serviceId: string;
  jobId: string;
  jobStatus: AdminProvisioningJobStatus;
  jobType: AdminProvisioningJobType;
  lastJobSummary: string;
};

/**
 * Single write path for access realization projection (user + service).
 * Call after job status transitions that affect downstream posture.
 */
export async function applyAccessRealizationFromJobOutcomeInTx(tx: AppDbClient, input: ApplyRealizationInput): Promise<void> {
  const next = realizationForTerminalJob(input.jobStatus, input.jobType);
  if (!next) {
    return;
  }
  const status = accessRealizationStatusSchema.parse(next);
  const activeJobId =
    input.jobStatus === "queued" || input.jobStatus === "running" ? input.jobId : null;
  await tx
    .insert(accessServiceRealizations)
    .values({
      userId: input.userId,
      serviceId: input.serviceId,
      realizationStatus: status,
      activeJobId,
      lastJobSummary: input.lastJobSummary,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: [accessServiceRealizations.userId, accessServiceRealizations.serviceId],
      set: {
        realizationStatus: status,
        activeJobId,
        lastJobSummary: input.lastJobSummary,
        updatedAt: new Date(),
      },
    });
}

export async function applyAccessRealizationFromJobOutcome(input: ApplyRealizationInput): Promise<void> {
  try {
    const db = getDb();
    await applyAccessRealizationFromJobOutcomeInTx(db, input);
  } catch {
    // No DB / insert failed — non-fatal for admin reads that still use mock overlay path.
  }
}
