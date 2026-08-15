/**
 * SPR-BRIDGE-001 — Platform Service compose for QEP ↔ APZPEN security assurance.
 * Handler stays thin: auth + URL parse; business logic lives here.
 */

import { hasProductAccess } from "@/lib/commercial/product-access";
import { listProjectSourceBindings } from "@/lib/commercial/project-source-bindings";
import { tenantHasProductSubscriptions } from "@/lib/commercial/resolve-entitlements";
import { getEngagementPosture, listTenantEngagements } from "@/lib/apzpen/service";
import {
  buildEngagementRows,
  summariseSecurityAssurance,
  type SecurityAssuranceSummary,
} from "@/lib/qep/apzpen-security-bridge";
import { appendQepAuditEvent } from "@/lib/qep/qep-audit-store";
import { getQepScmRuntime } from "@/lib/qep/scm-runtime";

export type SecurityAssuranceBridgeResult = {
  readonly summary: SecurityAssuranceSummary;
  readonly externalRef: string | null;
  readonly changeEventId: string | null;
  readonly engagementCount: number;
  readonly bridge: {
    readonly dualEntitlement: true;
    readonly qepEntitled: boolean;
    readonly penEntitled: boolean;
  };
};

export async function getSecurityAssuranceSummary(input: {
  readonly tenantId: string;
  readonly organisationId: string;
  readonly userId: string;
  readonly externalRef?: string;
  readonly changeEventId?: string;
  readonly correlationId?: string;
}): Promise<SecurityAssuranceBridgeResult> {
  const orgId = input.organisationId.trim();
  const userId = input.userId.trim();
  const tenantId = input.tenantId.trim();

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

  let externalRef = input.externalRef?.trim() || undefined;
  const changeEventId = input.changeEventId?.trim() || undefined;

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
    correlationId: input.correlationId,
    detail: `${payloadSummary.status}:${payloadSummary.engagementId ?? "none"}`,
  });

  return {
    summary: payloadSummary,
    externalRef: externalRef ?? null,
    changeEventId: changeEventId ?? null,
    engagementCount: rows.length,
    bridge: {
      dualEntitlement: true,
      qepEntitled,
      penEntitled,
    },
  };
}
