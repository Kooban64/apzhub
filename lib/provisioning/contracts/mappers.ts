import { explainProvisioningJobStatus } from "@/lib/admin/provisioning/job-status-explanations";
import type { AdminProvisioningJob, AdminProvisioningJobStatus } from "@/lib/admin/provisioning/job-contract";
import { adminProvisioningJobSchema } from "@/lib/admin/provisioning/job-contract";
import { capabilitySummary } from "@/lib/provisioning/connectors/types";
import {
  getConnectorMetadata,
  getProvisioningConnectorProfile,
} from "@/lib/provisioning/connectors/registry";
import type { ProvisioningJobRow } from "@/lib/provisioning/repository/jobs-repository";
import { verificationJsonSnippet } from "@/lib/provisioning/verification/normalize";

export function provisioningRowToAdminJob(row: ProvisioningJobRow): AdminProvisioningJob {
  const meta = getConnectorMetadata(row.serviceId);
  return adminProvisioningJobSchema.parse({
    id: row.id,
    jobType: row.jobType,
    userId: row.userId,
    serviceId: row.serviceId,
    subjectLabel: row.subjectLabel,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    status: row.status,
    failureCode: row.lastErrorCode ?? undefined,
    failureMessage: row.lastErrorMessage ?? row.manualActionReason ?? undefined,
    retryCount: row.retryCount,
    manualHold: row.status === "awaiting_manual" ? true : undefined,
    connectorId: meta.connectorId,
    connectorProfile: getProvisioningConnectorProfile(),
    connectorCapabilitySummary: capabilitySummary(meta.capabilities),
    lastVerificationSnippet: verificationJsonSnippet(row.verificationJson),
    jobStatusExplanation: explainProvisioningJobStatus(row.status as AdminProvisioningJobStatus, {
      failureCode: row.lastErrorCode,
      retryCount: row.retryCount,
    }),
  });
}
