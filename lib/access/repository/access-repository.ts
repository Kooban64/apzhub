import { and, eq } from "drizzle-orm";

import type { AppDbClient } from "@/db/client";
import { getDb } from "@/db/client";
import {
  accessSubjectBundleAssignments,
  accessSubjectFlags,
  accessSubjectServiceOverrides,
} from "@/db/schema/access";

function dbOrTx(tx?: AppDbClient): AppDbClient {
  return tx ?? getDb();
}

export async function listAllBundleAssignments(tx?: AppDbClient) {
  return dbOrTx(tx).select().from(accessSubjectBundleAssignments);
}

export async function listAllServiceOverrides(tx?: AppDbClient) {
  return dbOrTx(tx).select().from(accessSubjectServiceOverrides);
}

export async function listAllSubjectFlags(tx?: AppDbClient) {
  return dbOrTx(tx).select().from(accessSubjectFlags);
}

export async function deleteBundleAssignmentsForSubject(subjectId: string, tx?: AppDbClient): Promise<void> {
  await dbOrTx(tx).delete(accessSubjectBundleAssignments).where(eq(accessSubjectBundleAssignments.subjectId, subjectId));
}

export async function insertBundleAssignments(
  subjectId: string,
  bundleIds: string[],
  tx?: AppDbClient,
): Promise<void> {
  const d = dbOrTx(tx);
  if (bundleIds.length === 0) {
    return;
  }
  await d.insert(accessSubjectBundleAssignments).values(
    bundleIds.map((bundleId) => ({
      subjectId,
      bundleId,
    })),
  );
}

/** Marks bundle list as DB-backed and replaces assignment rows. */
export async function replaceBundleAssignmentsForSubject(
  subjectId: string,
  bundleIds: string[],
  tx?: AppDbClient,
): Promise<void> {
  const d = dbOrTx(tx);
  await d
    .insert(accessSubjectFlags)
    .values({
      subjectId,
      suspended: null,
      bundlesFromDb: true,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: accessSubjectFlags.subjectId,
      set: { bundlesFromDb: true, updatedAt: new Date() },
    });

  await deleteBundleAssignmentsForSubject(subjectId, tx);
  await insertBundleAssignments(subjectId, bundleIds, tx);
}

export async function upsertServiceOverride(
  subjectId: string,
  serviceId: string,
  effectiveRole: string,
  tx?: AppDbClient,
): Promise<void> {
  const d = dbOrTx(tx);
  await d
    .insert(accessSubjectServiceOverrides)
    .values({ subjectId, serviceId, effectiveRole, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: [accessSubjectServiceOverrides.subjectId, accessSubjectServiceOverrides.serviceId],
      set: { effectiveRole, updatedAt: new Date() },
    });
}

export async function deleteServiceOverride(subjectId: string, serviceId: string, tx?: AppDbClient): Promise<void> {
  await dbOrTx(tx)
    .delete(accessSubjectServiceOverrides)
    .where(
      and(eq(accessSubjectServiceOverrides.subjectId, subjectId), eq(accessSubjectServiceOverrides.serviceId, serviceId)),
    );
}

/** Sets explicit suspended flag; new rows default `bundlesFromDb` false (mock bundle list until a bundle mutation runs). */
export async function upsertSubjectSuspended(subjectId: string, suspended: boolean, tx?: AppDbClient): Promise<void> {
  const d = dbOrTx(tx);
  await d
    .insert(accessSubjectFlags)
    .values({
      subjectId,
      suspended,
      bundlesFromDb: false,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: accessSubjectFlags.subjectId,
      set: { suspended, updatedAt: new Date() },
    });
}
