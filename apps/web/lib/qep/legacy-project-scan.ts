/**
 * Scan Cap/QEP tables for distinct legacy project identifiers.
 * Observed refs are recorded as UNRESOLVED unless a deterministic Application mapping exists.
 * Does not rewrite historical records.
 */
import {
  getDb,
  qepDefect,
  qepEnterpriseRequirement,
  qepEvidence,
  qepExecutionPlan,
  qepExecutionSession,
  qepRequirement,
  qepSuite,
  qepTestExecution,
} from "@apzhub/config";
import { and, eq, isNotNull, ne } from "drizzle-orm";

function addRef(target: Set<string>, value: string | null | undefined): void {
  const ref = value?.trim();
  if (ref) target.add(ref);
}

export async function collectObservedLegacyProjectRefs(
  tenantId: string,
): Promise<readonly string[]> {
  const refs = new Set<string>();
  const db = getDb();

  const requirementRows = await db
    .select({ projectId: qepRequirement.projectId })
    .from(qepRequirement)
    .where(eq(qepRequirement.tenantId, tenantId));
  for (const row of requirementRows) addRef(refs, row.projectId);

  const defectRows = await db
    .select({ projectId: qepDefect.projectId })
    .from(qepDefect)
    .where(eq(qepDefect.tenantId, tenantId));
  for (const row of defectRows) addRef(refs, row.projectId);

  const evidenceRows = await db
    .select({ projectId: qepEvidence.projectId })
    .from(qepEvidence)
    .where(eq(qepEvidence.tenantId, tenantId));
  for (const row of evidenceRows) addRef(refs, row.projectId);

  const executionRows = await db
    .select({ projectId: qepTestExecution.projectId })
    .from(qepTestExecution)
    .where(eq(qepTestExecution.tenantId, tenantId));
  for (const row of executionRows) addRef(refs, row.projectId);

  const suiteRows = await db
    .select({ projectId: qepSuite.projectId })
    .from(qepSuite)
    .where(
      and(
        eq(qepSuite.tenantId, tenantId),
        isNotNull(qepSuite.projectId),
        ne(qepSuite.projectId, ""),
      ),
    );
  for (const row of suiteRows) addRef(refs, row.projectId);

  const planRows = await db
    .select({ projectId: qepExecutionPlan.projectId })
    .from(qepExecutionPlan)
    .where(eq(qepExecutionPlan.tenantId, tenantId));
  for (const row of planRows) addRef(refs, row.projectId);

  const sessionRows = await db
    .select({ projectId: qepExecutionSession.projectId })
    .from(qepExecutionSession)
    .where(eq(qepExecutionSession.tenantId, tenantId));
  for (const row of sessionRows) addRef(refs, row.projectId);

  const enterpriseRows = await db
    .select({ projectId: qepEnterpriseRequirement.projectId })
    .from(qepEnterpriseRequirement)
    .where(eq(qepEnterpriseRequirement.tenantId, tenantId));
  for (const row of enterpriseRows) addRef(refs, row.projectId);

  return [...refs];
}
