/**
 * SPR-APZQEP-201 — QEP-facing security assurance compose (APZPEN read-only).
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";
import { hasProductAccess } from "@/lib/commercial/product-access";
import { listProjectSourceBindings } from "@/lib/commercial/project-source-bindings";
import { getEngagementPosture, listTenantEngagements } from "@/lib/apzpen/service";
import {
  buildEngagementRows,
  summariseSecurityAssurance,
} from "@/lib/qep/apzpen-security-bridge";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

function organisationId(context: PlatformApiRequestContext): string {
  return (
    context.serviceContext.tenantId?.trim() ||
    context.session.tenantId?.trim() ||
    context.session.user.activeTenantId?.trim() ||
    sessionTenantId(context)
  );
}

export async function handleGetQepSecurityAssurance(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.home.read",
    "qep.release_readiness.read",
    "qep.certification.read",
    "qep.quality_flows.read",
    "qep.scm.read",
  );

  const tenantId = sessionTenantId(context);
  const orgId = organisationId(context);
  const userId = context.session.user.id;
  const entitled = hasProductAccess({
    organisationId: orgId,
    userId,
    productKey: "pentest",
  });

  const url = new URL(request.url);
  let externalRef = url.searchParams.get("externalRef")?.trim() || undefined;
  const changeEventId = url.searchParams.get("changeEventId")?.trim();

  if (!externalRef && changeEventId) {
    const runtime = getQepScmRuntime();
    const changes = await runtime.listChangeEvents({
      tenantId,
      limit: 200,
    });
    const change = changes.find((row) => row.changeEventId === changeEventId);
    if (change?.repositoryId) {
      const repo = await runtime.getRepository(change.repositoryId);
      externalRef = repo?.fullName;
    }
  }

  const engagements = listTenantEngagements(tenantId);
  const bindings = listProjectSourceBindings({
    tenantId,
    productKey: "pentest",
  });
  const rows = buildEngagementRows({
    engagements: engagements.map((e) => ({
      engagementId: e.engagementId,
      title: e.title,
      applicationName: e.applicationName,
      assessmentPosition: e.assessmentPosition,
      posture: getEngagementPosture(tenantId, e.engagementId),
    })),
    bindings,
  });

  const summary = summariseSecurityAssurance({
    entitled,
    engagements: rows,
    externalRef,
  });

  return jsonDataResponse(
    {
      summary,
      externalRef: externalRef ?? null,
      changeEventId: changeEventId ?? null,
      engagementCount: rows.length,
    },
    context.tracing,
  );
}
