import { and, asc, count, desc, eq, inArray, lte } from "drizzle-orm";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

import type { AppDbClient } from "@/db/client";
import { getDb } from "@/db/client";
import { provisioningJobAttempts, provisioningJobs } from "@/db/schema/provisioning";

export type ProvisioningJobRow = InferSelectModel<typeof provisioningJobs>;
export type ProvisioningJobInsert = InferInsertModel<typeof provisioningJobs>;

const ACTIVE_STATUSES = ["queued", "running", "awaiting_manual"] as const;

export async function findActiveJobByIdempotencyKey(key: string): Promise<ProvisioningJobRow | null> {
  return findActiveJobByIdempotencyKeyInTx(getDb(), key);
}

export async function findActiveJobByIdempotencyKeyInTx(tx: AppDbClient, key: string): Promise<ProvisioningJobRow | null> {
  const rows = await tx
    .select()
    .from(provisioningJobs)
    .where(
      and(eq(provisioningJobs.idempotencyKey, key), inArray(provisioningJobs.status, [...ACTIVE_STATUSES])),
    )
    .limit(1);
  return rows[0] ?? null;
}

export async function insertProvisioningJob(values: ProvisioningJobInsert): Promise<ProvisioningJobRow> {
  return insertProvisioningJobInTx(getDb(), values);
}

export async function insertProvisioningJobInTx(tx: AppDbClient, values: ProvisioningJobInsert): Promise<ProvisioningJobRow> {
  const [row] = await tx.insert(provisioningJobs).values(values).returning();
  if (!row) {
    throw new Error("Insert provisioning job returned no row.");
  }
  return row;
}

export async function listProvisioningJobRows(limit = 200): Promise<ProvisioningJobRow[]> {
  const db = getDb();
  return db.select().from(provisioningJobs).orderBy(desc(provisioningJobs.updatedAt)).limit(limit);
}

export async function getProvisioningJobById(id: string): Promise<ProvisioningJobRow | null> {
  const db = getDb();
  const rows = await db.select().from(provisioningJobs).where(eq(provisioningJobs.id, id)).limit(1);
  return rows[0] ?? null;
}

export async function claimNextProvisioningJob(): Promise<ProvisioningJobRow | null> {
  const db = getDb();
  return db.transaction(async (tx) => {
    const candidates = await tx
      .select()
      .from(provisioningJobs)
      .where(and(eq(provisioningJobs.status, "queued"), lte(provisioningJobs.scheduledAt, new Date())))
      .orderBy(asc(provisioningJobs.priority), asc(provisioningJobs.requestedAt))
      .for("update", { skipLocked: true })
      .limit(1);

    if (candidates.length === 0) {
      return null;
    }

    const picked = candidates[0];
    if (!picked) {
      return null;
    }

    const [updated] = await tx
      .update(provisioningJobs)
      .set({
        status: "running",
        startedAt: picked.startedAt ?? new Date(),
        updatedAt: new Date(),
      })
      .where(eq(provisioningJobs.id, picked.id))
      .returning();

    return updated ?? null;
  });
}

export async function updateJobById(id: string, patch: Partial<ProvisioningJobInsert>): Promise<ProvisioningJobRow | null> {
  const db = getDb();
  const [row] = await db
    .update(provisioningJobs)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(provisioningJobs.id, id))
    .returning();
  return row ?? null;
}

export async function insertJobAttempt(values: InferInsertModel<typeof provisioningJobAttempts>) {
  const db = getDb();
  const [row] = await db.insert(provisioningJobAttempts).values(values).returning();
  if (!row) {
    throw new Error("Insert provisioning_job_attempts returned no row.");
  }
  return row;
}

export async function countAttemptsForJob(jobId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({ n: count() })
    .from(provisioningJobAttempts)
    .where(eq(provisioningJobAttempts.jobId, jobId));
  return Number(row?.n ?? 0);
}

export type ProvisioningAttemptSummary = {
  attemptCount: number;
  lastAttemptFinishedAt: string | null;
  lastOutcome: string | null;
  lastErrorCode: string | null;
  lastErrorMessage: string | null;
};

/** Aggregate attempt info for inspector / GET summary (null if job id unknown). */
export async function getProvisioningAttemptSummary(jobId: string): Promise<ProvisioningAttemptSummary | null> {
  const job = await getProvisioningJobById(jobId);
  if (!job) {
    return null;
  }
  const db = getDb();
  const [cntRow] = await db
    .select({ n: count() })
    .from(provisioningJobAttempts)
    .where(eq(provisioningJobAttempts.jobId, jobId));
  const attemptCount = Number(cntRow?.n ?? 0);
  const [last] = await db
    .select()
    .from(provisioningJobAttempts)
    .where(eq(provisioningJobAttempts.jobId, jobId))
    .orderBy(desc(provisioningJobAttempts.attemptNumber))
    .limit(1);
  if (!last) {
    return {
      attemptCount: 0,
      lastAttemptFinishedAt: null,
      lastOutcome: null,
      lastErrorCode: null,
      lastErrorMessage: null,
    };
  }
  return {
    attemptCount,
    lastAttemptFinishedAt: last.finishedAt?.toISOString() ?? null,
    lastOutcome: last.outcome,
    lastErrorCode: last.errorCode ?? null,
    lastErrorMessage: last.errorMessage ?? null,
  };
}
