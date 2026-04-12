import type { ProvisioningAdapterContract } from "@/lib/adapters/adapter-contracts";
import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import { getProvisioningSource } from "@/lib/adapters/env";
import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";
import {
  getProvisioningJobsSnapshot,
  resolveProvisioningJobManual,
  retryProvisioningJob,
} from "@/lib/admin/provisioning/provisioning-mock-jobs-core";
import {
  isProvisioningEngineConfigured,
  listProvisioningJobsForAdmin,
  resolveProvisioningJobManualDb,
  retryProvisioningJobDb,
} from "@/lib/provisioning/service/provisioning-service";

function provisioningHealth(): AdapterHealthResult {
  const src = getProvisioningSource();
  if (src === "mock") {
    return { domain: "provisioning", signal: "healthy", detail: "Mock in-process job store (server-safe core)." };
  }
  if (src === "real") {
    if (!isProvisioningEngineConfigured()) {
      return {
        domain: "provisioning",
        signal: "misconfigured",
        detail:
          "APZHUB_PROVISIONING_SOURCE=real requires a database URL (APZHUB_DATABASE_URL, DATABASE_URL, or APZHUB_DATABASE_URL_FILE).",
      };
    }
    return { domain: "provisioning", signal: "healthy", detail: "Postgres-backed provisioning engine." };
  }
  return { domain: "provisioning", signal: "degraded", detail: "Unknown provisioning source." };
}

export const provisioningAdapter: ProvisioningAdapterContract = {
  async listJobs(): Promise<AdminProvisioningJob[]> {
    if (getProvisioningSource() === "real") {
      if (!isProvisioningEngineConfigured()) {
        return [];
      }
      return listProvisioningJobsForAdmin();
    }
    return getProvisioningJobsSnapshot();
  },
  async retryJob(jobId: string): Promise<AdminProvisioningJob | null> {
    if (getProvisioningSource() === "real") {
      if (!isProvisioningEngineConfigured()) {
        return null;
      }
      return retryProvisioningJobDb(jobId);
    }
    return retryProvisioningJob(jobId);
  },
  async resolveManual(jobId: string): Promise<boolean> {
    if (getProvisioningSource() === "real") {
      if (!isProvisioningEngineConfigured()) {
        return false;
      }
      return resolveProvisioningJobManualDb(jobId);
    }
    return resolveProvisioningJobManual(jobId);
  },
  getHealth: provisioningHealth,
};

export function getProvisioningAdapter(): ProvisioningAdapterContract {
  return provisioningAdapter;
}

/** @deprecated Prefer getProvisioningAdapter().listJobs() */
export async function listProvisioningJobs(): Promise<AdminProvisioningJob[]> {
  return provisioningAdapter.listJobs();
}

/** @deprecated Prefer getProvisioningAdapter().retryJob */
export async function retryJob(jobId: string): Promise<AdminProvisioningJob | null> {
  return provisioningAdapter.retryJob(jobId);
}

/** @deprecated Prefer getProvisioningAdapter().resolveManual */
export async function resolveManual(jobId: string): Promise<boolean> {
  return provisioningAdapter.resolveManual(jobId);
}
