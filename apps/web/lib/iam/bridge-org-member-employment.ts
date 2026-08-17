/**
 * Bridge file org-member ledger → Postgres IAM employment (Stream 6 SoR unify).
 * Does not delete the file ledger yet — stops treating it as authority for Inspector.
 */

import { and, eq } from "drizzle-orm";

import { getDb, platformIamEmployment } from "@apzhub/config/db";
import { listOrgMembers } from "@/lib/iam/org-member-store";

export async function bridgeOrgMembersToEmployment(
  tenantId: string,
): Promise<{ readonly upserted: number }> {
  if (!process.env.DATABASE_URL?.trim()) return { upserted: 0 };
  const members = listOrgMembers({ organisationId: tenantId, limit: 500 }).filter(
    (m) => !m.userId.startsWith("pending:") && m.status !== "removed",
  );
  if (members.length === 0) return { upserted: 0 };

  const db = getDb();
  let upserted = 0;
  for (const m of members) {
    try {
      const existing = await db
        .select()
        .from(platformIamEmployment)
        .where(
          and(
            eq(platformIamEmployment.tenantId, tenantId),
            eq(platformIamEmployment.userId, m.userId),
          ),
        )
        .limit(1);
      const now = new Date();
      if (existing[0]) {
        if (!existing[0].staffFunctionKey && m.personaRoleId) {
          await db
            .update(platformIamEmployment)
            .set({
              staffFunctionKey: m.personaRoleId,
              updatedAt: now,
              status: m.status === "active" ? "active" : existing[0].status,
            })
            .where(eq(platformIamEmployment.id, existing[0].id));
          upserted += 1;
        }
        continue;
      }
      await db.insert(platformIamEmployment).values({
        id: `emp_${tenantId}_${m.userId}`,
        tenantId,
        userId: m.userId,
        organisationId: tenantId,
        staffFunctionKey: m.personaRoleId,
        status: m.status === "active" ? "active" : "draft",
        createdAt: now,
        updatedAt: now,
      });
      upserted += 1;
    } catch {
      // Ignore per-row failures (missing columns mid-migrate).
    }
  }
  return { upserted };
}

export async function loadEmploymentForUser(input: {
  readonly tenantId: string;
  readonly userId: string;
}): Promise<{
  readonly staffFunctionKey?: string;
  readonly jobTitle?: string;
  readonly managerUserId?: string;
  readonly departmentId?: string;
  readonly positionId?: string;
} | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;
  try {
    const rows = await getDb()
      .select()
      .from(platformIamEmployment)
      .where(
        and(
          eq(platformIamEmployment.tenantId, input.tenantId),
          eq(platformIamEmployment.userId, input.userId),
        ),
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      staffFunctionKey: row.staffFunctionKey ?? undefined,
      jobTitle: row.jobTitle ?? undefined,
      managerUserId: row.managerUserId ?? undefined,
      departmentId: row.departmentId ?? undefined,
      positionId: row.positionId ?? undefined,
    };
  } catch {
    return null;
  }
}
