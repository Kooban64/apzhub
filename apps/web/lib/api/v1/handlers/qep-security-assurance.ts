/**
 * SPR-APZQEP-201 / SPR-BRIDGE-001 — QEP-facing security assurance compose (APZPEN read-only).
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";
import { hasProductAccess } from "@/lib/commercial/product-access";
import { listProjectSourceBindings } from "@/lib/commercial/project-source-bindings";
import { tenantHasProductSubscriptions } from "@/lib/commercial/resolve-entitlements";
import { getEngagementPosture, listTenantEngagements } from "@/lib/apzpen/service";
import {
  buildEngagementRows,
  summariseSecurityAssurance,
} from "@/lib/qep/apzpen-security-bridge";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
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

  // BR-001-D — dual product entitlement when org has commercial subscriptions;
  // bootstrap (no subs) stays open for local CE (APZPEN soft-gate pattern).
  const hasSubs = Boolean(orgId) && tenantHasProductSubscriptions(orgId);
  const qepEntitled = hasProductAccess({
    organisationId: orgId,
    userId,
    productKey: "qep",
  });
  const penEntitled = hasProductAccess({
    organisationId: orgId,
    userId,
    productKey: "pentest",
  });
  const entitled = hasSubs ? qepEntitled && penEntitled : true;

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

  const engagements = entitled ? listTenantEngagements(tenantId) : [];
  const bindings = entitled
    ? listProjectSourceBindings({
        tenantId,
        productKey: "pentest",
      })
    : [];
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

  // Soft honesty when only one product is missing.
  const detailOverride =
    !entitled && qepEntitled && !penEntitled
      ? "APZPEN (Security Assurance) is not entitled — bridge cannot show linked posture."
      : !entitled && penEntitled && !qepEntitled
        ? "Quality (APZQEP) entitlement required to consume the assurance bridge."
        : undefined;

  const payloadSummary = detailOverride
    ? { ...summary, detail: detailOverride, status: "not_entitled" as const }
    : summary;

  appendQepAuditEvent({
    action: "bridge.security_assurance.read",
    actor: userId,
    correlationId: context.tracing.correlationId,
    detail: `${payloadSummary.status}:${payloadSummary.engagementId ?? "none"}`,
  });

  return jsonDataResponse(
    {
      summary: payloadSummary,
      externalRef: externalRef ?? null,
      changeEventId: changeEventId ?? null,
      engagementCount: rows.length,
      bridge: {
        dualEntitlement: true,
        qepEntitled,
        penEntitled,
      },
    },
    context.tracing,
  );
}
