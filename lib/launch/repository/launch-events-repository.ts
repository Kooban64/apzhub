import { desc, inArray } from "drizzle-orm";

import type { AppDbClient } from "@/db/client";
import { getDb } from "@/db/client";
import { launchEvents, type LaunchEventOutcome } from "@/db/schema/launch";
import type { LaunchMethod } from "@/lib/launch/launch-method";

export type InsertLaunchEventInput = {
  userId?: string | null;
  serviceId: string;
  launchMethod: LaunchMethod;
  readinessAtDecision?: string | null;
  outcome: LaunchEventOutcome;
  reasonCode?: string | null;
  userMessage: string;
  operatorMessage?: string | null;
  correlationId?: string;
  authSessionId?: string | null;
};

function dbOrTx(tx?: AppDbClient): AppDbClient {
  return tx ?? getDb();
}

/** Best-effort persistence: callers should try/catch if user flow must not depend on logging. */
export async function insertLaunchEvent(input: InsertLaunchEventInput, tx?: AppDbClient): Promise<void> {
  await dbOrTx(tx).insert(launchEvents).values({
    userId: input.userId ?? null,
    serviceId: input.serviceId,
    launchMethod: input.launchMethod,
    readinessAtDecision: input.readinessAtDecision ?? null,
    outcome: input.outcome,
    reasonCode: input.reasonCode ?? null,
    userMessage: input.userMessage,
    operatorMessage: input.operatorMessage ?? null,
    correlationId: input.correlationId?.trim() || "",
    authSessionId: input.authSessionId ?? null,
  });
}

/** Swallow DB errors so launch UX is never blocked by telemetry. */
export async function tryInsertLaunchEvent(input: InsertLaunchEventInput, tx?: AppDbClient): Promise<void> {
  try {
    await insertLaunchEvent(input, tx);
  } catch (err) {
    console.error("[launch_events] insert failed", err);
  }
}

export async function listRecentLaunchEvents(
  opts: { limit: number; outcomes?: LaunchEventOutcome[] },
  tx?: AppDbClient,
) {
  const d = dbOrTx(tx);
  const lim = Math.min(Math.max(opts.limit, 1), 500);
  if (opts.outcomes?.length) {
    return d
      .select()
      .from(launchEvents)
      .where(inArray(launchEvents.outcome, opts.outcomes))
      .orderBy(desc(launchEvents.createdAt))
      .limit(lim);
  }
  return d.select().from(launchEvents).orderBy(desc(launchEvents.createdAt)).limit(lim);
}

export async function listRecentLaunchFailures(opts: { limit: number }, tx?: AppDbClient) {
  return listRecentLaunchEvents({ limit: opts.limit, outcomes: ["failed", "rejected"] }, tx);
}
