/**
 * Persisted access mutations + provisioning enqueue.
 *
 * Ordering (Postgres `real` access + `real` provisioning):
 * 1. Open a single transaction.
 * 2. Read **before** snapshot via `buildAdminAccessDataFromDb(tx)` (read-your-writes).
 * 3. Persist access rows (assignments / overrides / flags).
 * 4. Read **after** snapshot via `tx` and compute intents from the **before** graph + requested delta
 *    (same pure helpers as the legacy path).
 * 5. Insert provisioning jobs + job-created audit + realization projection using the **same** `tx`.
 * 6. Commit, then run {@link runProvisioningWorkerDrain} so workers only see committed jobs.
 *
 * If `APZHUB_ACCESS_SOURCE` is not `real`, this falls back to the legacy path: intents from
 * `getAdminAccessData()` and `executeProvisioningIntents` (no durable access mutation).
 */
import { getAccessSource } from "@/lib/adapters/env";
import { getAdminAccessData } from "@/lib/adapters/access/access-adapter";
import { buildAdminAccessDataFromDb } from "@/lib/access/materialize-admin-access";
import {
  deleteServiceOverride,
  replaceBundleAssignmentsForSubject,
  upsertServiceOverride,
  upsertSubjectSuspended,
} from "@/lib/access/repository/access-repository";
import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";
import { appendProvisioningAuditEvent, appendProvisioningAuditEventInTx } from "@/lib/provisioning/audit/append";
import type { ProvisioningIntent } from "@/lib/access/access-intents";
import {
  computeBundleAssignmentIntents,
  computeServiceOverrideIntents,
  computeUserResumeIntents,
  computeUserSuspendIntents,
} from "@/lib/access/access-intents";
import type { TriggerEnqueueResult } from "@/lib/provisioning/access-trigger-enqueue";
import { executeProvisioningIntents } from "@/lib/provisioning/access-trigger-enqueue";
import { provisioningRowToAdminJob } from "@/lib/provisioning/contracts/mappers";
import { buildProvisioningIdempotencyKey } from "@/lib/provisioning/idempotency/key";
import {
  findActiveJobByIdempotencyKeyInTx,
  insertProvisioningJobInTx,
} from "@/lib/provisioning/repository/jobs-repository";
import { defaultMaxRetries } from "@/lib/provisioning/retry-policy/policy";
import { applyAccessRealizationFromJobOutcomeInTx } from "@/lib/provisioning/realization/apply";
import { isProvisioningEngineConfigured } from "@/lib/provisioning/service/provisioning-service";
import { runProvisioningWorkerDrain } from "@/lib/provisioning/worker/runner";
import { getDb } from "@/db/client";
import type { AppDbClient } from "@/db/client";

async function enqueueIntentsInTx(
  tx: AppDbClient,
  intents: ProvisioningIntent[],
  correlationId: string | null,
): Promise<TriggerEnqueueResult> {
  const enqueued: AdminProvisioningJob[] = [];
  const skipped: { key: string; reason: string }[] = [];

  for (const intent of intents) {
    const idempotencyKey = buildProvisioningIdempotencyKey({
      userId: intent.userId,
      serviceId: intent.serviceId,
      jobType: intent.jobType,
      desiredEffectiveRole: intent.desiredEffectiveRole,
      triggerSource: intent.triggerSource,
    });
    const active = await findActiveJobByIdempotencyKeyInTx(tx, idempotencyKey);
    if (active) {
      skipped.push({ key: idempotencyKey, reason: "active_job_exists" });
      continue;
    }
    try {
      const row = await insertProvisioningJobInTx(tx, {
        userId: intent.userId,
        serviceId: intent.serviceId,
        jobType: intent.jobType,
        desiredEffectiveRole: intent.desiredEffectiveRole ?? null,
        status: "queued",
        priority: 0,
        idempotencyKey,
        triggerSource: intent.triggerSource,
        requestedBy: null,
        correlationId: correlationId ?? null,
        subjectLabel: intent.subjectLabel,
        payloadJson: {},
        maxRetries: defaultMaxRetries(),
        retryCount: 0,
      });

      await appendProvisioningAuditEventInTx(tx, {
        type: "provisioning_job_created",
        jobId: row.id,
        userId: row.userId,
        correlationId: row.correlationId,
        metadata: { serviceId: row.serviceId, jobType: row.jobType, idempotencyKey },
      });

      await applyAccessRealizationFromJobOutcomeInTx(tx, {
        userId: row.userId,
        serviceId: row.serviceId,
        jobId: row.id,
        jobStatus: "queued",
        jobType: intent.jobType,
        lastJobSummary: "Job queued.",
      });

      enqueued.push(provisioningRowToAdminJob(row));
    } catch (e) {
      const code = e && typeof e === "object" && "code" in e ? String((e as { code: unknown }).code) : "";
      if (code === "23505") {
        const again = await findActiveJobByIdempotencyKeyInTx(tx, idempotencyKey);
        if (again) {
          skipped.push({ key: idempotencyKey, reason: "active_job_exists" });
          continue;
        }
      }
      throw e;
    }
  }

  return { enqueued, skipped };
}

function usesPersistedAccessPath(): boolean {
  return getAccessSource() === "real" && isProvisioningEngineConfigured();
}

export async function mutateBundleAssignment(input: {
  userId: string;
  addBundleIds?: string[];
  removeBundleIds?: string[];
  correlationId?: string | null;
}): Promise<TriggerEnqueueResult> {
  const add = input.addBundleIds ?? [];
  const remove = input.removeBundleIds ?? [];
  const correlationId = input.correlationId ?? null;

  if (!usesPersistedAccessPath()) {
    const data = await getAdminAccessData();
    if (!data.userAccessByUserId[input.userId]) {
      return { enqueued: [], skipped: [] };
    }
    const intents = computeBundleAssignmentIntents(data, input.userId, add, remove);
    const result = await executeProvisioningIntents(intents, correlationId);
    await appendProvisioningAuditEvent({
      type: "provisioning_access_trigger_bundle",
      userId: input.userId,
      correlationId,
      metadata: {
        addBundleIds: add,
        removeBundleIds: remove,
        enqueuedCount: result.enqueued.length,
        skippedCount: result.skipped.length,
      },
    });
    return result;
  }

  const result = await getDb().transaction(async (tx) => {
    const before = await buildAdminAccessDataFromDb(tx);
    const detail = before.userAccessByUserId[input.userId];
    if (!detail) {
      return { enqueued: [] as AdminProvisioningJob[], skipped: [] as { key: string; reason: string }[] };
    }
    const previousBundleIds = detail.bundleAssignments.map((b) => b.bundleId);
    const nextIds = new Set(previousBundleIds);
    for (const r of remove) {
      nextIds.delete(r);
    }
    for (const a of add) {
      nextIds.add(a);
    }
    await replaceBundleAssignmentsForSubject(input.userId, [...nextIds], tx);
    const intents = computeBundleAssignmentIntents(before, input.userId, add, remove);
    return enqueueIntentsInTx(tx, intents, correlationId);
  });

  await runProvisioningWorkerDrain();
  await appendProvisioningAuditEvent({
    type: "provisioning_access_trigger_bundle",
    userId: input.userId,
    correlationId,
    metadata: {
      addBundleIds: add,
      removeBundleIds: remove,
      enqueuedCount: result.enqueued.length,
      skippedCount: result.skipped.length,
    },
  });
  return result;
}

export async function mutateServiceOverride(input: {
  userId: string;
  serviceId: string;
  effectiveRole: string | null;
  correlationId?: string | null;
}): Promise<TriggerEnqueueResult> {
  const correlationId = input.correlationId ?? null;

  if (!usesPersistedAccessPath()) {
    const data = await getAdminAccessData();
    if (!data.userAccessByUserId[input.userId]) {
      return { enqueued: [], skipped: [] };
    }
    const intents = computeServiceOverrideIntents(data, input.userId, input.serviceId, input.effectiveRole);
    const result = await executeProvisioningIntents(intents, correlationId);
    await appendProvisioningAuditEvent({
      type: "provisioning_access_trigger_override",
      userId: input.userId,
      correlationId,
      metadata: {
        serviceId: input.serviceId,
        effectiveRole: input.effectiveRole,
        enqueuedCount: result.enqueued.length,
        skippedCount: result.skipped.length,
      },
    });
    return result;
  }

  const result = await getDb().transaction(async (tx) => {
    const before = await buildAdminAccessDataFromDb(tx);
    if (!before.userAccessByUserId[input.userId]) {
      return { enqueued: [] as AdminProvisioningJob[], skipped: [] as { key: string; reason: string }[] };
    }
    if (input.effectiveRole) {
      await upsertServiceOverride(input.userId, input.serviceId, input.effectiveRole, tx);
    } else {
      await deleteServiceOverride(input.userId, input.serviceId, tx);
    }
    const intents = computeServiceOverrideIntents(before, input.userId, input.serviceId, input.effectiveRole);
    return enqueueIntentsInTx(tx, intents, correlationId);
  });

  await runProvisioningWorkerDrain();
  await appendProvisioningAuditEvent({
    type: "provisioning_access_trigger_override",
    userId: input.userId,
    correlationId,
    metadata: {
      serviceId: input.serviceId,
      effectiveRole: input.effectiveRole,
      enqueuedCount: result.enqueued.length,
      skippedCount: result.skipped.length,
    },
  });
  return result;
}

export async function mutateUserStatus(input: {
  userId: string;
  status: "active" | "suspended";
  correlationId?: string | null;
}): Promise<TriggerEnqueueResult> {
  const correlationId = input.correlationId ?? null;

  if (!usesPersistedAccessPath()) {
    const data = await getAdminAccessData();
    if (!data.userAccessByUserId[input.userId]) {
      return { enqueued: [], skipped: [] };
    }
    const intents =
      input.status === "suspended"
        ? computeUserSuspendIntents(data, input.userId)
        : computeUserResumeIntents(data, input.userId);
    const result = await executeProvisioningIntents(intents, correlationId);
    await appendProvisioningAuditEvent({
      type: "provisioning_access_trigger_user_status",
      userId: input.userId,
      correlationId,
      metadata: {
        status: input.status,
        enqueuedCount: result.enqueued.length,
        skippedCount: result.skipped.length,
      },
    });
    return result;
  }

  const result = await getDb().transaction(async (tx) => {
    const before = await buildAdminAccessDataFromDb(tx);
    if (!before.userAccessByUserId[input.userId]) {
      return { enqueued: [] as AdminProvisioningJob[], skipped: [] as { key: string; reason: string }[] };
    }
    await upsertSubjectSuspended(input.userId, input.status === "suspended", tx);
    const intents =
      input.status === "suspended"
        ? computeUserSuspendIntents(before, input.userId)
        : computeUserResumeIntents(before, input.userId);
    return enqueueIntentsInTx(tx, intents, correlationId);
  });

  await runProvisioningWorkerDrain();
  await appendProvisioningAuditEvent({
    type: "provisioning_access_trigger_user_status",
    userId: input.userId,
    correlationId,
    metadata: {
      status: input.status,
      enqueuedCount: result.enqueued.length,
      skippedCount: result.skipped.length,
    },
  });
  return result;
}
