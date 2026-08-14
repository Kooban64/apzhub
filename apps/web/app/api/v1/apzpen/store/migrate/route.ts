export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess } from "@/lib/apzpen/access";
import { getMetaSnapshotForExport } from "@/lib/apzpen/meta-store";
import { listEngagements as listAllEngagementsFromMemory } from "@/lib/apzpen/store";
import { listFindings } from "@/lib/apzpen/store";
import {
  migrateApzpenSnapshotToPostgres,
  resolveApzpenStoreMode,
} from "@/lib/apzpen/postgres-store";
import { createDb } from "@apzhub/config";

/**
 * Admin migrate: push current memory/file snapshot into PostgreSQL SoR.
 * POST { confirm: true }
 */
async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "manage");
  const body = (await request.json().catch(() => ({}))) as {
    confirm?: boolean;
    tenantId?: string;
  };
  if (!body.confirm) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "confirm:true required to migrate APZPEN snapshot to Postgres",
    });
  }
  if (resolveApzpenStoreMode() !== "postgres" && !process.env.DATABASE_URL) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "DATABASE_URL required for Postgres migration",
    });
  }
  const tenantId = body.tenantId;
  const meta = getMetaSnapshotForExport();
  // Collect from in-process store (file/memory). Tenant filter optional.
  const engagements = tenantId ? [...listAllEngagementsFromMemory(tenantId)] : [];
  // Without tenant, migration is scoped via confirm + explicit tenantId.
  if (!tenantId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "tenantId required for migration",
    });
  }
  const findings = [...listFindings(tenantId)];
  const result = await migrateApzpenSnapshotToPostgres(
    {
      engagements: [...engagements],
      findings,
      certifications: meta.certifications.filter((c) => c.tenantId === tenantId),
      graphNodes: meta.graphNodes.filter((n) => n.tenantId === tenantId),
      graphEdges: meta.graphEdges.filter((e) => e.tenantId === tenantId),
    },
    createDb(),
  );
  return jsonDataResponse(
    { mode: resolveApzpenStoreMode(), ...result },
    context.tracing,
  );
}

export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.store.migrate",
});
