/**
 * APZPEN certification ledger — append-only records (SPR-APZPEN-014).
 * Past rows are never mutated or deleted by the service API.
 */

import { createHash } from "node:crypto";

import type { Engagement, Finding, SecurityPosture } from "./types";
import { newId } from "./store";

export type CertificationLedgerRecord = {
  readonly recordId: string;
  readonly tenantId: string;
  readonly engagementId: string;
  readonly certifiedAt: string;
  readonly certifiedBy: string;
  /** SHA-256 of canonical engagement + posture + finding IDs snapshot. */
  readonly snapshotHash: string;
  readonly engagementTitle: string;
  readonly customerName: string;
  readonly applicationName: string;
  readonly assessmentPosition: Engagement["assessmentPosition"];
  readonly posture: {
    readonly critical: number;
    readonly high: number;
    readonly medium: number;
    readonly low: number;
    readonly openCount: number;
  };
  readonly findingCount: number;
  readonly findingIds: readonly string[];
  readonly reportPackKind?: string;
};

export function hashCertificationSnapshot(input: {
  readonly engagement: Engagement;
  readonly posture: SecurityPosture;
  readonly findings: readonly Finding[];
}): string {
  const payload = JSON.stringify({
    engagementId: input.engagement.engagementId,
    status: input.engagement.status,
    assessmentPosition: input.engagement.assessmentPosition,
    scope: input.engagement.scope.map((s) => s.identifier),
    roe: input.engagement.roe.status,
    posture: {
      critical: input.posture.critical,
      high: input.posture.high,
      medium: input.posture.medium,
      low: input.posture.low,
      openCount: input.posture.openCount,
    },
    findingIds: input.findings.map((f) => f.findingId).sort(),
  });
  return createHash("sha256").update(payload).digest("hex");
}

export function buildCertificationRecord(input: {
  readonly engagement: Engagement;
  readonly posture: SecurityPosture;
  readonly findings: readonly Finding[];
  readonly certifiedBy: string;
  readonly reportPackKind?: string;
}): CertificationLedgerRecord {
  return {
    recordId: newId("cert"),
    tenantId: input.engagement.tenantId,
    engagementId: input.engagement.engagementId,
    certifiedAt: new Date().toISOString(),
    certifiedBy: input.certifiedBy,
    snapshotHash: hashCertificationSnapshot(input),
    engagementTitle: input.engagement.title,
    customerName: input.engagement.customerName,
    applicationName: input.engagement.applicationName,
    assessmentPosition: "complete",
    posture: {
      critical: input.posture.critical,
      high: input.posture.high,
      medium: input.posture.medium,
      low: input.posture.low,
      openCount: input.posture.openCount,
    },
    findingCount: input.findings.length,
    findingIds: input.findings.map((f) => f.findingId),
    reportPackKind: input.reportPackKind,
  };
}
