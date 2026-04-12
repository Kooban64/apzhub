import { appendProvisioningAuditEvent } from "@/lib/provisioning/audit/append";
import { getConnectorForService } from "@/lib/provisioning/connectors/registry";
import { capabilitySummary, type ConnectorExecuteResult } from "@/lib/provisioning/connectors/types";
import { readbackSnippetFromResult, verificationJsonFromResult } from "@/lib/provisioning/verification/normalize";
import { retryBackoffSeconds } from "@/lib/provisioning/retry-policy/policy";
import { applyAccessRealizationFromJobOutcome } from "@/lib/provisioning/realization/apply";
import {
  claimNextProvisioningJob,
  countAttemptsForJob,
  getProvisioningJobById,
  insertJobAttempt,
  updateJobById,
} from "@/lib/provisioning/repository/jobs-repository";
import type { AdminProvisioningJobStatus } from "@/lib/admin/provisioning/job-contract";

function jobSummary(status: AdminProvisioningJobStatus, result: ConnectorExecuteResult): string {
  if (result.outcome === "success") {
    return status === "succeeded" ? "Connector completed successfully." : "Completed.";
  }
  if (result.outcome === "transient_failure") {
    return "Transient failure — will retry.";
  }
  if (result.outcome === "manual_action") {
    return result.errorMessage ?? "Manual action required.";
  }
  return result.errorMessage ?? "Provisioning failed.";
}

async function persistTerminalFailure(
  jobId: string,
  result: ConnectorExecuteResult,
  ctx: { connectorId: string; serviceId: string },
): Promise<void> {
  await updateJobById(jobId, {
    status: "failed",
    failedAt: new Date(),
    lastErrorCode: result.errorCode ?? "UNKNOWN",
    lastErrorMessage: result.errorMessage ?? "Unknown error",
    verificationJson: verificationJsonFromResult(result),
  });
  const row = await getProvisioningJobById(jobId);
  if (row) {
    await appendProvisioningAuditEvent({
      type: "provisioning_failed",
      jobId: row.id,
      userId: row.userId,
      correlationId: row.correlationId,
      metadata: {
        code: result.errorCode,
        connectorId: ctx.connectorId,
        serviceId: ctx.serviceId,
      },
    });
    await applyAccessRealizationFromJobOutcome({
      userId: row.userId,
      serviceId: row.serviceId,
      jobId: row.id,
      jobStatus: "failed",
      jobType: row.jobType as "grant" | "revoke" | "repair" | "reconcile",
      lastJobSummary: jobSummary("failed", result),
    });
  }
}

/** Drain queued jobs up to `maxTicks` worker iterations (batch enqueue helper). */
export async function runProvisioningWorkerDrain(maxTicks = 50): Promise<number> {
  let ran = 0;
  for (let i = 0; i < maxTicks; i++) {
    const tick = await runProvisioningWorkerTick();
    if (!tick) {
      break;
    }
    ran++;
  }
  return ran;
}

/** Claim at most one queued job and process it. Returns whether a job was claimed. */
export async function runProvisioningWorkerTick(): Promise<boolean> {
  const row = await claimNextProvisioningJob();
  if (!row) {
    return false;
  }

  const connector = getConnectorForService(row.serviceId);
  const connectorCtx = { connectorId: connector.connectorId, serviceId: row.serviceId };

  await appendProvisioningAuditEvent({
    type: "provisioning_started",
    jobId: row.id,
    userId: row.userId,
    correlationId: row.correlationId,
    metadata: {
      serviceId: row.serviceId,
      jobType: row.jobType,
      connectorId: connector.connectorId,
    },
  });

  const priorAttempts = await countAttemptsForJob(row.id);
  if (priorAttempts >= row.maxRetries) {
    await persistTerminalFailure(
      row.id,
      {
        outcome: "terminal_failure",
        errorCode: "RETRY_EXHAUSTED",
        errorMessage: "Maximum provisioning attempts reached without success.",
      },
      connectorCtx,
    );
    return true;
  }

  const startedAt = new Date();
  let result = await connector.execute(row);

  if (result.outcome === "transient_failure" && priorAttempts + 1 >= row.maxRetries) {
    result = {
      outcome: "terminal_failure",
      errorCode: "RETRY_EXHAUSTED",
      errorMessage: "Transient failures exceeded retry budget.",
    };
  }

  const finishedAt = new Date();
  const attemptNumber = priorAttempts + 1;
  await insertJobAttempt({
    jobId: row.id,
    attemptNumber,
    startedAt,
    finishedAt,
    outcome: result.outcome,
    errorCode: result.errorCode ?? null,
    errorMessage: result.errorMessage ?? null,
    logContextJson: {
      serviceId: row.serviceId,
      connectorId: connector.connectorId,
      capabilitySummary: capabilitySummary(connector.capabilities),
      readbackSnippet: readbackSnippetFromResult(result),
    },
  });

  if (result.outcome === "success") {
    await updateJobById(row.id, {
      status: "succeeded",
      completedAt: new Date(),
      lastErrorCode: null,
      lastErrorMessage: null,
      manualActionReason: null,
      verificationJson: verificationJsonFromResult(result, row),
    });
    await appendProvisioningAuditEvent({
      type: "provisioning_completed",
      jobId: row.id,
      userId: row.userId,
      correlationId: row.correlationId,
      metadata: {
        serviceId: row.serviceId,
        connectorId: connector.connectorId,
      },
    });
    const fresh = await getProvisioningJobById(row.id);
    if (fresh) {
      await applyAccessRealizationFromJobOutcome({
        userId: fresh.userId,
        serviceId: fresh.serviceId,
        jobId: fresh.id,
        jobStatus: "succeeded",
        jobType: fresh.jobType as "grant" | "revoke" | "repair" | "reconcile",
        lastJobSummary: jobSummary("succeeded", result),
      });
    }
    return true;
  }

  if (result.outcome === "transient_failure") {
    const delaySec = retryBackoffSeconds(priorAttempts);
    await updateJobById(row.id, {
      status: "queued",
      scheduledAt: new Date(Date.now() + delaySec * 1000),
      lastErrorCode: result.errorCode ?? "TRANSIENT",
      lastErrorMessage: result.errorMessage ?? "Transient failure",
    });
    const fresh = await getProvisioningJobById(row.id);
    if (fresh) {
      await applyAccessRealizationFromJobOutcome({
        userId: fresh.userId,
        serviceId: fresh.serviceId,
        jobId: fresh.id,
        jobStatus: "queued",
        jobType: fresh.jobType as "grant" | "revoke" | "repair" | "reconcile",
        lastJobSummary: jobSummary("queued", result),
      });
    }
    return true;
  }

  if (result.outcome === "manual_action") {
    await updateJobById(row.id, {
      status: "awaiting_manual",
      manualActionReason: result.errorMessage ?? "Manual action required",
      lastErrorCode: result.errorCode ?? "MANUAL_ACTION",
      lastErrorMessage: result.errorMessage ?? null,
      verificationJson: verificationJsonFromResult(result, row),
    });
    await appendProvisioningAuditEvent({
      type: "provisioning_manual_action",
      jobId: row.id,
      userId: row.userId,
      correlationId: row.correlationId,
      metadata: {
        serviceId: row.serviceId,
        connectorId: connector.connectorId,
        code: result.errorCode,
      },
    });
    const fresh = await getProvisioningJobById(row.id);
    if (fresh) {
      await applyAccessRealizationFromJobOutcome({
        userId: fresh.userId,
        serviceId: fresh.serviceId,
        jobId: fresh.id,
        jobStatus: "awaiting_manual",
        jobType: fresh.jobType as "grant" | "revoke" | "repair" | "reconcile",
        lastJobSummary: jobSummary("awaiting_manual", result),
      });
    }
    return true;
  }

  // terminal_failure
  await persistTerminalFailure(row.id, result, connectorCtx);
  return true;
}
