import type { AdminProvisioningJobType } from "@/lib/admin/provisioning/job-contract";
import type { ProvisioningTriggerSource } from "@/lib/provisioning/contracts/enums";

export type IdempotencyKeyInput = {
  userId: string;
  serviceId: string;
  jobType: AdminProvisioningJobType;
  desiredEffectiveRole?: string | null;
  triggerSource: ProvisioningTriggerSource;
};

/** Stable key: duplicate active jobs with the same key are rejected at DB level. */
export function buildProvisioningIdempotencyKey(input: IdempotencyKeyInput): string {
  const role = (input.desiredEffectiveRole ?? "").trim();
  return `${input.userId}:${input.serviceId}:${input.jobType}:${role}:${input.triggerSource}`;
}
