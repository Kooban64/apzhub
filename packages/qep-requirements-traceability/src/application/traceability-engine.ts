/**
 * Traceability Engine — derives relationships and coverage.
 * Traceability is a calculated relationship, not a manually maintained document.
 */

import { calculateCoverage } from "../domain/coverage";
import type {
  CoverageSnapshot,
  RequirementNode,
  TraceabilityMatrixRow,
  TraceLink,
} from "../domain/types";
import type { QualityArtefactPorts } from "./ports";

export type DerivedTraceBundle = {
  readonly links: readonly TraceLink[];
  readonly coverage: CoverageSnapshot;
  readonly planIds: readonly string[];
  readonly sessionIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly defectIds: readonly string[];
};

let linkSeq = 0;
function nextLinkId(): string {
  linkSeq += 1;
  return `trl-${Date.now().toString(36)}-${linkSeq}`;
}

function openDefect(status: string): boolean {
  return ![
    "closed",
    "verified",
    "rejected",
    "duplicate",
    "wont_fix",
    "archived",
  ].includes(status);
}

export async function deriveTraceability(
  requirement: RequirementNode,
  ports: QualityArtefactPorts,
  now: string,
): Promise<DerivedTraceBundle> {
  const links: TraceLink[] = [];
  const planIds = new Set<string>();
  const sessionIds = new Set<string>();
  const evidenceIds = new Set<string>();
  const defectIds = new Set<string>();
  let completedSessionCount = 0;
  let failedSessionCount = 0;
  let passedSessionCount = 0;
  let openDefectCount = 0;

  for (const suiteLink of requirement.suiteLinks) {
    links.push({
      linkId: nextLinkId(),
      fromKind: "requirement",
      fromId: requirement.requirementId,
      toKind: "suite",
      toId: suiteLink.suiteId,
      ...(suiteLink.suiteName ? { label: suiteLink.suiteName } : {}),
      origin: "explicit",
      bidirectional: true,
    });
    links.push({
      linkId: nextLinkId(),
      fromKind: "suite",
      fromId: suiteLink.suiteId,
      toKind: "requirement",
      toId: requirement.requirementId,
      origin: "derived",
      bidirectional: true,
    });

    const plans =
      (await ports.listPlansBySuite?.(requirement.tenantId, suiteLink.suiteId)) ?? [];
    for (const plan of plans) {
      planIds.add(plan.planId);
      links.push({
        linkId: nextLinkId(),
        fromKind: "suite",
        fromId: suiteLink.suiteId,
        toKind: "execution_plan",
        toId: plan.planId,
        label: plan.name,
        origin: "derived",
        bidirectional: true,
      });
      links.push({
        linkId: nextLinkId(),
        fromKind: "requirement",
        fromId: requirement.requirementId,
        toKind: "execution_plan",
        toId: plan.planId,
        origin: "derived",
        bidirectional: false,
      });
    }

    const sessions =
      (await ports.listSessionsBySuite?.(requirement.tenantId, suiteLink.suiteId)) ??
      [];
    for (const session of sessions) {
      sessionIds.add(session.sessionId);
      links.push({
        linkId: nextLinkId(),
        fromKind: "requirement",
        fromId: requirement.requirementId,
        toKind: "execution_session",
        toId: session.sessionId,
        label: session.name,
        origin: "derived",
        bidirectional: false,
      });
      if (session.status === "completed") {
        completedSessionCount += 1;
        const outcomes = session.stepOutcomes;
        if (outcomes.includes("fail") || outcomes.includes("block")) {
          failedSessionCount += 1;
        } else if (outcomes.some((o) => o === "pass")) {
          passedSessionCount += 1;
        }
        for (const outcome of outcomes) {
          links.push({
            linkId: nextLinkId(),
            fromKind: "execution_session",
            fromId: session.sessionId,
            toKind: "execution_result",
            toId: `${session.sessionId}:${outcome}`,
            origin: "derived",
            bidirectional: false,
          });
        }
      }
      for (const evidenceId of session.evidenceIds) {
        evidenceIds.add(evidenceId);
        links.push({
          linkId: nextLinkId(),
          fromKind: "execution_session",
          fromId: session.sessionId,
          toKind: "evidence",
          toId: evidenceId,
          origin: "derived",
          bidirectional: true,
        });
        links.push({
          linkId: nextLinkId(),
          fromKind: "requirement",
          fromId: requirement.requirementId,
          toKind: "evidence",
          toId: evidenceId,
          origin: "derived",
          bidirectional: false,
        });
      }
    }

    const defects =
      (await ports.listDefectsBySuite?.(requirement.tenantId, suiteLink.suiteId)) ?? [];
    for (const defect of defects) {
      defectIds.add(defect.defectId);
      if (openDefect(defect.status)) openDefectCount += 1;
      links.push({
        linkId: nextLinkId(),
        fromKind: "requirement",
        fromId: requirement.requirementId,
        toKind: "defect",
        toId: defect.defectId,
        label: defect.title,
        origin: "derived",
        bidirectional: true,
      });
      for (const evidenceId of defect.evidenceIds) {
        evidenceIds.add(evidenceId);
      }
    }
  }

  const coverage = calculateCoverage({
    requirement,
    planCount: planIds.size,
    sessionCount: sessionIds.size,
    completedSessionCount,
    evidenceCount: evidenceIds.size,
    defectCount: defectIds.size,
    openDefectCount,
    failedSessionCount,
    passedSessionCount,
    now,
  });

  links.push({
    linkId: nextLinkId(),
    fromKind: "requirement",
    fromId: requirement.requirementId,
    toKind: "verification",
    toId: `${requirement.requirementId}:${coverage.verificationStatus}`,
    label: coverage.verificationStatus,
    origin: "derived",
    bidirectional: false,
  });

  return {
    links,
    coverage,
    planIds: [...planIds],
    sessionIds: [...sessionIds],
    evidenceIds: [...evidenceIds],
    defectIds: [...defectIds],
  };
}

export async function buildMatrixRow(
  requirement: RequirementNode,
  ports: QualityArtefactPorts,
  now: string,
): Promise<TraceabilityMatrixRow> {
  const derived = await deriveTraceability(requirement, ports, now);
  return {
    requirementId: requirement.requirementId,
    title: requirement.title,
    status: requirement.status,
    priority: requirement.priority,
    risk: requirement.risk,
    suiteIds: requirement.suiteLinks.map((l) => l.suiteId),
    planIds: derived.planIds,
    sessionIds: derived.sessionIds,
    evidenceIds: derived.evidenceIds,
    defectIds: derived.defectIds,
    coverage: derived.coverage,
  };
}
