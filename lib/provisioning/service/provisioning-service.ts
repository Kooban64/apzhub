import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";
import type { AdminProvisioningJobType } from "@/lib/admin/provisioning/job-contract";
import { appendProvisioningAuditEvent } from "@/lib/provisioning/audit/append";
import { provisioningRowToAdminJob } from "@/lib/provisioning/contracts/mappers";
import type { ProvisioningTriggerSource } from "@/lib/provisioning/contracts/enums";
import { buildProvisioningIdempotencyKey } from "@/lib/provisioning/idempotency/key";
import { defaultMaxRetries } from "@/lib/provisioning/retry-policy/policy";
import { applyAccessRealizationFromJobOutcome } from "@/lib/provisioning/realization/apply";
import {
  findActiveJobByIdempotencyKey,
  getProvisioningJobById,
  insertProvisioningJob,
  listProvisioningJobRows,
  updateJobById,
} from "@/lib/provisioning/repository/jobs-repository";
import { runProvisioningWorkerTick } from "@/lib/provisioning/worker/runner";
import { getDb } from "@/db/client";
import { loadAppSecrets } from "@/lib/config/secrets";

export function isProvisioningEngineConfigured(): boolean {
  const url =
    loadAppSecrets().databaseUrl?.trim() ??
    process.env.APZHUB_DATABASE_URL?.trim() ??
    process.env.DATABASE_URL?.trim();
  return Boolean(url);
}

export type CreateProvisioningJobInput = {
  userId: string;
  serviceId: string;
  jobType: AdminProvisioningJobType;
  desiredEffectiveRole?: string | null;
  triggerSource: ProvisioningTriggerSource;
  subjectLabel: string;
  payload?: Record<string, unknown>;
  correlationId?: string | null;
  requestedBy?: string | null;
  /** When true, skip in-process worker tick (caller runs drain after batch). */
  deferWorkerTick?: boolean;
};

export async function createProvisioningJob(input: CreateProvisioningJobInput): Promise<AdminProvisioningJob> {
  getDb();
  const idempotencyKey = buildProvisioningIdempotencyKey({
    userId: input.userId,
    serviceId: input.serviceId,
    jobType: input.jobType,
    desiredEffectiveRole: input.desiredEffectiveRole,
    triggerSource: input.triggerSource,
  });

  const existing = await findActiveJobByIdempotencyKey(idempotencyKey);
  if (existing) {
    return provisioningRowToAdminJob(existing);
  }

  try {
    const row = await insertProvisioningJob({
      userId: input.userId,
      serviceId: input.serviceId,
      jobType: input.jobType,
      desiredEffectiveRole: input.desiredEffectiveRole ?? null,
      status: "queued",
      priority: 0,
      idempotencyKey,
      triggerSource: input.triggerSource,
      requestedBy: input.requestedBy ?? null,
      correlationId: input.correlationId ?? null,
      subjectLabel: input.subjectLabel,
      payloadJson: input.payload ?? {},
      maxRetries: defaultMaxRetries(),
      retryCount: 0,
    });

    await appendProvisioningAuditEvent({
      type: "provisioning_job_created",
      jobId: row.id,
      userId: row.userId,
      correlationId: row.correlationId,
      metadata: { serviceId: row.serviceId, jobType: row.jobType, idempotencyKey },
    });

    await applyAccessRealizationFromJobOutcome({
      userId: row.userId,
      serviceId: row.serviceId,
      jobId: row.id,
      jobStatus: "queued",
      jobType: row.jobType as AdminProvisioningJobType,
      lastJobSummary: "Job queued.",
    });

    if (input.deferWorkerTick !== true) {
      await runProvisioningWorkerTick();
    }

    const latest = await getProvisioningJobById(row.id);
    return provisioningRowToAdminJob(latest ?? row);
  } catch (e) {
    const code = e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "";
    if (code === "23505") {
      const again = await findActiveJobByIdempotencyKey(idempotencyKey);
      if (again) {
        return provisioningRowToAdminJob(again);
      }
    }
    throw e;
  }
}

export async function listProvisioningJobsForAdmin(): Promise<AdminProvisioningJob[]> {
  getDb();
  const rows = await listProvisioningJobRows(200);
  return rows.map(provisioningRowToAdminJob);
}

export async function retryProvisioningJobDb(jobId: string): Promise<AdminProvisioningJob | null> {
  getDb();
  const row = await getProvisioningJobById(jobId);
  if (!row || row.status !== "failed") {
    return null;
  }
  const updated = await updateJobById(jobId, {
    status: "queued",
    scheduledAt: new Date(),
    lastErrorCode: null,
    lastErrorMessage: null,
    failedAt: null,
    retryCount: row.retryCount + 1,
  });
  if (!updated) {
    return null;
  }
  await appendProvisioningAuditEvent({
    type: "provisioning_retried",
    jobId: updated.id,
    userId: updated.userId,
    correlationId: updated.correlationId,
    metadata: { retryCount: updated.retryCount },
  });
  await applyAccessRealizationFromJobOutcome({
    userId: updated.userId,
    serviceId: updated.serviceId,
    jobId: updated.id,
    jobStatus: "queued",
    jobType: updated.jobType as AdminProvisioningJobType,
    lastJobSummary: "Job re-queued after retry.",
  });
  await runProvisioningWorkerTick();
  const latest = await getProvisioningJobById(jobId);
  return latest ? provisioningRowToAdminJob(latest) : null;
}

export async function resolveProvisioningJobManualDb(jobId: string): Promise<boolean> {
  getDb();
  const row = await getProvisioningJobById(jobId);
  if (!row || row.status !== "awaiting_manual") {
    return false;
  }
  await updateJobById(jobId, {
    status: "succeeded",
    completedAt: new Date(),
    manualActionReason: null,
    lastErrorCode: null,
    lastErrorMessage: null,
  });
  await appendProvisioningAuditEvent({
    type: "provisioning_resolved_manual",
    jobId: row.id,
    userId: row.userId,
    correlationId: row.correlationId,
  });
  const updated = await getProvisioningJobById(jobId);
  if (updated) {
    await applyAccessRealizationFromJobOutcome({
      userId: updated.userId,
      serviceId: updated.serviceId,
      jobId: updated.id,
      jobStatus: "succeeded",
      jobType: updated.jobType as AdminProvisioningJobType,
      lastJobSummary: "Manually resolved by operator.",
    });
  }
  return true;
}
