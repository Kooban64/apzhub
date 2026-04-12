import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";
import type { ProvisioningIntent } from "@/lib/access/access-intents";
import { buildProvisioningIdempotencyKey } from "@/lib/provisioning/idempotency/key";
import { findActiveJobByIdempotencyKey } from "@/lib/provisioning/repository/jobs-repository";
import { createProvisioningJob } from "@/lib/provisioning/service/provisioning-service";
import { runProvisioningWorkerDrain } from "@/lib/provisioning/worker/runner";

export type TriggerEnqueueResult = {
  enqueued: AdminProvisioningJob[];
  skipped: { key: string; reason: string }[];
};

/** Enqueue provisioning jobs from intents (legacy path: no access row persistence). */
export async function executeProvisioningIntents(
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
    const active = await findActiveJobByIdempotencyKey(idempotencyKey);
    if (active) {
      skipped.push({ key: idempotencyKey, reason: "active_job_exists" });
      continue;
    }
    const job = await createProvisioningJob({
      userId: intent.userId,
      serviceId: intent.serviceId,
      jobType: intent.jobType,
      desiredEffectiveRole: intent.desiredEffectiveRole,
      triggerSource: intent.triggerSource,
      subjectLabel: intent.subjectLabel,
      correlationId,
      deferWorkerTick: true,
    });
    enqueued.push(job);
  }

  await runProvisioningWorkerDrain();
  return { enqueued, skipped };
}
