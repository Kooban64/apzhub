/** Single source of truth for provisioning job action strings (aligned with `adminProvisioningJobTypeSchema`). */
export const PROVISIONING_JOB_ACTIONS = ["grant", "revoke", "repair", "reconcile"] as const;

export type ProvisioningJobAction = (typeof PROVISIONING_JOB_ACTIONS)[number];

export function isProvisioningJobAction(value: string): value is ProvisioningJobAction {
  return (PROVISIONING_JOB_ACTIONS as readonly string[]).includes(value);
}

/** Named handles (indices follow `PROVISIONING_JOB_ACTIONS`). */
export const PROVISIONING_JOB_ACTION = {
  grant: PROVISIONING_JOB_ACTIONS[0],
  revoke: PROVISIONING_JOB_ACTIONS[1],
  repair: PROVISIONING_JOB_ACTIONS[2],
  reconcile: PROVISIONING_JOB_ACTIONS[3],
} as const;
