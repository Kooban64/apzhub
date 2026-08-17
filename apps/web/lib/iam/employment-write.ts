/**
 * Durable employment metadata writes (descriptive — not authorisation).
 */

import { and, eq } from "drizzle-orm";

import { getDb, platformIamEmployment } from "@apzhub/config/db";

export async function upsertEmploymentMetadata(input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly staffFunctionKey?: string | null;
  readonly jobTitle?: string | null;
  readonly departmentId?: string | null;
  readonly managerUserId?: string | null;
  readonly status?: string;
}): Promise<void> {
  if (!process.env.DATABASE_URL?.trim()) return;
  const db = getDb();
  const now = new Date();
  const id = `emp_${input.tenantId}_${input.userId}`;
  const [existing] = await db
    .select()
    .from(platformIamEmployment)
    .where(
      and(
        eq(platformIamEmployment.tenantId, input.tenantId),
        eq(platformIamEmployment.userId, input.userId),
      ),
    )
    .limit(1);

  if (existing) {
    await db
      .update(platformIamEmployment)
      .set({
        staffFunctionKey:
          input.staffFunctionKey !== undefined
            ? input.staffFunctionKey
            : existing.staffFunctionKey,
        jobTitle: input.jobTitle !== undefined ? input.jobTitle : existing.jobTitle,
        departmentId:
          input.departmentId !== undefined ? input.departmentId : existing.departmentId,
        managerUserId:
          input.managerUserId !== undefined
            ? input.managerUserId
            : existing.managerUserId,
        status: input.status ?? existing.status,
        updatedAt: now,
      })
      .where(eq(platformIamEmployment.id, existing.id));
    return;
  }

  await db.insert(platformIamEmployment).values({
    id,
    tenantId: input.tenantId,
    userId: input.userId,
    organisationId: input.tenantId,
    staffFunctionKey: input.staffFunctionKey ?? null,
    jobTitle: input.jobTitle ?? null,
    departmentId: input.departmentId ?? null,
    managerUserId: input.managerUserId ?? null,
    status: input.status ?? "active",
    createdAt: now,
    updatedAt: now,
  });
}
