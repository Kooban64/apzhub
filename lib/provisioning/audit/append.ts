import type { AppDbClient } from "@/db/client";
import { getDb } from "@/db/client";
import { provisioningAuditEvents } from "@/db/schema/provisioning";
import type { ProvisioningAuditType } from "@/lib/provisioning/contracts/enums";

export type AppendProvisioningAuditInput = {
  type: ProvisioningAuditType;
  jobId?: string | null;
  userId?: string | null;
  correlationId?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function appendProvisioningAuditEventInTx(tx: AppDbClient, input: AppendProvisioningAuditInput): Promise<void> {
  await tx.insert(provisioningAuditEvents).values({
    type: input.type,
    jobId: input.jobId ?? null,
    userId: input.userId ?? null,
    correlationId: input.correlationId ?? null,
    metadata: input.metadata ?? null,
  });
}

export async function appendProvisioningAuditEvent(input: AppendProvisioningAuditInput): Promise<void> {
  try {
    const db = getDb();
    await appendProvisioningAuditEventInTx(db, input);
  } catch {
    // Best-effort (no DB in some tests / CI).
  }
}
