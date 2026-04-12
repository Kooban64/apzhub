import { explainProvisioningJobStatus } from "@/lib/admin/provisioning/job-status-explanations";
import type { AdminProvisioningJob } from "@/lib/admin/provisioning/job-contract";
import { adminProvisioningJobSchema } from "@/lib/admin/provisioning/job-contract";
import { capabilitySummary } from "@/lib/provisioning/connectors/types";
import {
  getConnectorMetadata,
  getProvisioningConnectorProfile,
} from "@/lib/provisioning/connectors/registry";

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const seedJobs: AdminProvisioningJob[] = [
  adminProvisioningJobSchema.parse({
    id: "job-mail-1",
    jobType: "grant",
    userId: "u-1001",
    serviceId: "mail",
    subjectLabel: "Alex Rivera · Mail",
    createdAt: "2026-04-11T09:00:00Z",
    updatedAt: "2026-04-11T09:02:00Z",
    status: "succeeded",
    retryCount: 0,
  }),
  adminProvisioningJobSchema.parse({
    id: "job-cal-2",
    jobType: "repair",
    userId: "u-1001",
    serviceId: "calendar",
    subjectLabel: "Alex Rivera · Calendar",
    createdAt: "2026-04-11T09:05:00Z",
    updatedAt: "2026-04-11T09:06:00Z",
    status: "running",
    retryCount: 0,
  }),
  adminProvisioningJobSchema.parse({
    id: "job-cal-fail",
    jobType: "grant",
    userId: "u-1002",
    serviceId: "calendar",
    subjectLabel: "Jordan Lee · Calendar",
    createdAt: "2026-04-10T18:00:00Z",
    updatedAt: "2026-04-10T18:05:00Z",
    status: "failed",
    failureCode: "CONNECTOR_TIMEOUT",
    failureMessage: "Upstream directory sync timed out.",
    retryCount: 1,
  }),
  adminProvisioningJobSchema.parse({
    id: "job-manual-1",
    jobType: "revoke",
    userId: "u-1003",
    serviceId: "mail",
    subjectLabel: "Sam Patel · Mail",
    createdAt: "2026-04-09T12:00:00Z",
    updatedAt: "2026-04-09T12:30:00Z",
    status: "awaiting_manual",
    manualHold: true,
    failureMessage: "Policy requires human confirmation before revoke propagates.",
    retryCount: 0,
  }),
];

let jobs: AdminProvisioningJob[] = [...seedJobs];

function enrichMockProvisioningJob(job: AdminProvisioningJob): AdminProvisioningJob {
  const meta = getConnectorMetadata(job.serviceId ?? "");
  return adminProvisioningJobSchema.parse({
    ...job,
    connectorId: meta.connectorId,
    connectorProfile: getProvisioningConnectorProfile(),
    connectorCapabilitySummary: capabilitySummary(meta.capabilities),
    jobStatusExplanation: explainProvisioningJobStatus(job.status, {
      failureCode: job.failureCode,
      retryCount: job.retryCount,
    }),
  });
}

/** Prevents duplicate replacement rows if two retries race for the same failed job id. */
const inflightRetries = new Set<string>();

export function getProvisioningJobsSnapshot(): AdminProvisioningJob[] {
  return jobs.map(enrichMockProvisioningJob);
}

export function resetProvisioningMockStore() {
  jobs = [...seedJobs];
  emit();
}

export function retryProvisioningJob(jobId: string): AdminProvisioningJob | null {
  const deterministicId = `${jobId}__retry`;
  const existing = jobs.find((j) => j.id === deterministicId);
  if (existing) {
    return existing;
  }
  if (inflightRetries.has(jobId)) {
    return jobs.find((j) => j.id === deterministicId) ?? null;
  }

  const idx = jobs.findIndex((j) => j.id === jobId);
  if (idx === -1) {
    return null;
  }
  const job = jobs[idx];
  if (!job || job.status !== "failed") {
    return null;
  }

  inflightRetries.add(jobId);
  try {
    const now = new Date().toISOString();
    const superseded = adminProvisioningJobSchema.parse({
      ...job,
      status: "superseded",
      updatedAt: now,
    });
    const replacement = adminProvisioningJobSchema.parse({
      id: deterministicId,
      jobType: job.jobType,
      userId: job.userId,
      serviceId: job.serviceId,
      subjectLabel: job.subjectLabel,
      createdAt: now,
      updatedAt: now,
      status: "queued",
      retryCount: job.retryCount + 1,
    });
    jobs = [...jobs.slice(0, idx), superseded, replacement, ...jobs.slice(idx + 1)];
    emit();
    return replacement;
  } finally {
    inflightRetries.delete(jobId);
  }
}

export function resolveProvisioningJobManual(jobId: string): boolean {
  const idx = jobs.findIndex((j) => j.id === jobId);
  if (idx === -1) {
    return false;
  }
  const job = jobs[idx];
  if (!job || job.status !== "awaiting_manual") {
    return false;
  }
  const now = new Date().toISOString();
  jobs[idx] = adminProvisioningJobSchema.parse({
    ...job,
    status: "succeeded",
    updatedAt: now,
    manualHold: false,
    failureMessage: undefined,
  });
  emit();
  return true;
}
