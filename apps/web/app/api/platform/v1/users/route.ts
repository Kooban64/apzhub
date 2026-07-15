export const runtime = "nodejs";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { getDb, user } from "@apzhub/config/db";
import { getSharedAuthorizationService } from "@apzhub/platform-authorization";

export async function GET(): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const service = getSharedAuthorizationService();

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({
      data: [],
      meta: { source: "none", message: "Database not configured." },
    });
  }

  const rows = await getDb().select().from(user);
  const summaries = rows.map((row) => {
    const effective = service.getEffectivePermissions({
      userId: row.id,
      tenantId: row.activeTenantId ?? undefined,
      productKey: "law-platform",
    });
    const assignments = service.listAssignmentsForUser(row.id);

    return {
      id: row.id,
      email: row.email,
      name: row.name,
      emailVerified: row.emailVerified,
      activeTenantId: row.activeTenantId ?? null,
      createdAt: row.createdAt.toISOString(),
      roles: effective.roleSlugs,
      effectivePermissions: effective.effectivePermissions,
      assignmentCount: assignments.length,
    };
  });

  return NextResponse.json({
    data: summaries,
    meta: { count: summaries.length },
  });
}
