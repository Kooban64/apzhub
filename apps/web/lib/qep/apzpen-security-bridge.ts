/**
 * SPR-APZQEP-201 / SPR-BRIDGE-001 / SPR-FULL-002-A — QEP ↔ APZPEN assurance compose.
 * Pure summarise/types live in `@apzhub/platform-services`; this module re-exports
 * and adapts APZPEN/commercial shapes for apps/web callers.
 */

import type { AssessmentPosition, SecurityPosture } from "@/lib/apzpen/types";
import type { ProjectSourceBinding } from "@/lib/commercial/project-source-bindings";
import {
  buildEngagementRows as buildRows,
  isSecurityReadinessClear,
  summariseSecurityAssurance,
  type AssuranceStatus,
  type SecurityAssuranceEngagementRow,
  type SecurityAssuranceSummary,
} from "@apzhub/platform-services";

export type {
  AssuranceStatus,
  SecurityAssuranceEngagementRow,
  SecurityAssuranceSummary,
};
export { isSecurityReadinessClear, summariseSecurityAssurance };

export function buildEngagementRows(input: {
  readonly engagements: readonly {
    readonly engagementId: string;
    readonly title?: string;
    readonly applicationName?: string;
    readonly assessmentPosition: AssessmentPosition;
    readonly posture: SecurityPosture;
  }[];
  readonly bindings: readonly ProjectSourceBinding[];
}): SecurityAssuranceEngagementRow[] {
  return buildRows({
    engagements: input.engagements.map((e) => ({
      engagementId: e.engagementId,
      title: e.title,
      applicationName: e.applicationName,
      assessmentPosition: e.assessmentPosition,
      posture: {
        critical: e.posture.critical,
        high: e.posture.high,
        openCount: e.posture.openCount,
      },
    })),
    bindings: input.bindings.map((b) => ({
      productKey: b.productKey,
      projectId: b.projectId,
      status: b.status,
      externalRef: b.externalRef,
    })),
  });
}
