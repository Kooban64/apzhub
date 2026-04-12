/**
 * Strict adapter contracts (Step 13 tightening) — implementations must not drift when swapping mock → real.
 */

import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import type { AdminAccessData } from "@/lib/admin/mock-access-data";
import type { AdminAuditEvent } from "@/lib/admin/contracts/audit";
import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";

export type { AdapterHealthResult, AdapterSignal } from "@/lib/adapters/adapter-health-types";
export type { IdentityAdapter as IdentityAdapterContract } from "@/lib/adapters/identity/types";

export interface ProfileAdapterContract {
  getHealth(): AdapterHealthResult;
  connectGoogle(): Promise<Response>;
  disconnectGoogle(): Promise<Response>;
}

export interface AccessAdapterContract {
  getAccessData(): Promise<AdminAccessData>;
  getHealth(): AdapterHealthResult;
}

export interface ProvisioningAdapterContract {
  listJobs(): Promise<AdminProvisioningJob[]>;
  retryJob(jobId: string): Promise<AdminProvisioningJob | null>;
  resolveManual(jobId: string): Promise<boolean>;
  getHealth(): AdapterHealthResult;
}

/** Launch transport only — no session/UI reads (pure targets). */
export interface LaunchAdapterContract {
  getHealth(): AdapterHealthResult;
}

export interface AuditAdapterContract {
  getControlPlaneHomeSnapshot(): import("@/lib/admin/mock-admin-home-data").AdminHomeData;
  getPrivilegedTraces(): import("@/lib/admin/contracts/privileged-action-trace").AdminPrivilegedActionTrace[];
  appendAuditEvent(input: unknown, meta?: { correlationId?: string }): AdminAuditEvent;
  getHealth(): AdapterHealthResult;
}
