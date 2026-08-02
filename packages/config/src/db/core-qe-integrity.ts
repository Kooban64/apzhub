/**
 * APZQEP-151 — read-only data integrity checks for Cap A–F tables.
 * Does not repair. Returns findings for operators.
 */
import { sql } from "drizzle-orm";

import type { DatabaseExecutor } from "./client";
import { getDatabaseExecutor } from "./transaction-context";

export type CoreQeIntegrityFinding = {
  readonly code: string;
  readonly severity: "error" | "warning";
  readonly message: string;
  readonly count: number;
};

export type CoreQeIntegrityReport = {
  readonly checkedAt: string;
  readonly findings: readonly CoreQeIntegrityFinding[];
  readonly ok: boolean;
};

async function count(
  db: DatabaseExecutor,
  query: ReturnType<typeof sql>,
): Promise<number> {
  const rows = (await db.execute(query)) as unknown as {
    rows?: Array<{ count?: string | number }>;
  };
  const row =
    rows.rows?.[0] ?? (rows as unknown as Array<{ count?: string | number }>)[0];
  return Number(row?.count ?? 0);
}

export async function auditCoreQeDataIntegrity(
  db: DatabaseExecutor,
): Promise<CoreQeIntegrityReport> {
  const exec = getDatabaseExecutor(db);
  const findings: CoreQeIntegrityFinding[] = [];

  const checks: Array<{
    code: string;
    severity: "error" | "warning";
    message: string;
    query: ReturnType<typeof sql>;
  }> = [
    {
      code: "suite_missing_parent",
      severity: "error",
      message: "Suite parent_suite_id references missing suite",
      query: sql`
        SELECT count(*)::int AS count FROM qep_suite c
        WHERE c.parent_suite_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM qep_suite p
            WHERE p.id = c.parent_suite_id AND p.tenant_id = c.tenant_id
          )`,
    },
    {
      code: "plan_missing_suite_ref",
      severity: "warning",
      message:
        "Execution plan suite_id not found in qep_suite (may be intentional bind)",
      query: sql`
        SELECT count(*)::int AS count FROM qep_execution_plan p
        WHERE p.suite_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM qep_suite s
            WHERE s.id = p.suite_id AND s.tenant_id = p.tenant_id
          )`,
    },
    {
      code: "session_missing_plan",
      severity: "warning",
      message: "Execution session plan_id not found in qep_execution_plan",
      query: sql`
        SELECT count(*)::int AS count FROM qep_execution_session s
        WHERE s.plan_id IS NOT NULL
          AND NOT EXISTS (
            SELECT 1 FROM qep_execution_plan p
            WHERE p.id = s.plan_id AND p.tenant_id = s.tenant_id
          )`,
    },
    {
      code: "duplicate_handoff",
      severity: "error",
      message: "Duplicate non-null handoff_id across execution sessions",
      query: sql`
        SELECT count(*)::int AS count FROM (
          SELECT tenant_id, handoff_id FROM qep_execution_session
          WHERE handoff_id IS NOT NULL
          GROUP BY tenant_id, handoff_id HAVING count(*) > 1
        ) d`,
    },
  ];

  for (const check of checks) {
    const n = await count(exec, check.query);
    if (n > 0) {
      findings.push({
        code: check.code,
        severity: check.severity,
        message: check.message,
        count: n,
      });
    }
  }

  return {
    checkedAt: new Date().toISOString(),
    findings,
    ok: findings.every((f) => f.severity !== "error"),
  };
}
