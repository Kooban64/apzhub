/**
 * Flagship F6 — Quality Intelligence advice for one SCM change.
 * Read-only projector over F2 impact + F3 evidence + F4/F5 cert evaluation.
 * Never mutates certification, approvals, SCM SoR, or evidence catalogue.
 */

import { createHash } from "node:crypto";

import {
  collectEvidenceForChange,
  getCertificationByChange,
  type CertificationEvaluation,
} from "@/lib/qep/certification-runtime";
import { buildChangeImpact, type ChangeImpactView } from "@/lib/qep/scm-impact";

export type QiAdviceKind = "gap" | "risk" | "regression" | "blocker";

export type QiAdvicePriority = "low" | "medium" | "high" | "critical";

export type QiAdviceArtifact = {
  readonly kind: string;
  readonly ref: string;
  readonly label: string;
};

export type QiChangeAdvice = {
  readonly adviceId: string;
  readonly kind: QiAdviceKind;
  readonly priority: QiAdvicePriority;
  readonly summary: string;
  readonly changeEventId: string;
  readonly evidenceRefs: readonly string[];
  readonly graphNodeIds: readonly string[];
  readonly explanation: {
    readonly reason: string;
    readonly decisionPath: readonly string[];
    readonly artifacts: readonly QiAdviceArtifact[];
  };
  readonly advisory: true;
};

export type QiChangeAdviceBundle = {
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly generatedAt: string;
  readonly advisory: true;
  readonly impactSummary?: {
    readonly riskLevel: string;
    readonly requirementCount: number;
    readonly suiteMatchCount: number;
    readonly nodeCount: number;
    readonly repositoryId?: string;
  };
  readonly certificationSummary?: {
    readonly evaluationId: string;
    readonly readiness: string;
    readonly score: number;
    readonly humanDecision?: string;
  };
  readonly advice: readonly QiChangeAdvice[];
};

function adviceId(changeEventId: string, kind: QiAdviceKind, salt: string): string {
  const digest = createHash("sha256")
    .update(`${changeEventId}|${kind}|${salt}`)
    .digest("hex")
    .slice(0, 12);
  return `qiadv-${kind}-${digest}`;
}

function pushAdvice(
  list: QiChangeAdvice[],
  item: Omit<QiChangeAdvice, "adviceId" | "advisory">,
): void {
  list.push({
    ...item,
    adviceId: adviceId(item.changeEventId, item.kind, item.summary),
    advisory: true,
  });
}

function adviseFromImpact(
  changeEventId: string,
  impact: ChangeImpactView,
  list: QiChangeAdvice[],
): void {
  const graphNodeIds = impact.nodes.map((node) => node.nodeId);
  if (impact.riskLevel === "high" || impact.riskLevel === "critical") {
    pushAdvice(list, {
      kind: "risk",
      priority: impact.riskLevel === "critical" ? "critical" : "high",
      summary: `Quality graph residual risk is ${impact.riskLevel}`,
      changeEventId,
      evidenceRefs: [],
      graphNodeIds,
      explanation: {
        reason: impact.summary,
        decisionPath: ["f2.impact.riskLevel", impact.riskLevel],
        artifacts: impact.nodes.slice(0, 8).map((node) => ({
          kind: node.assetType,
          ref: node.nodeId,
          label: node.name,
        })),
      },
    });
  }

  if (
    impact.matchedSuiteIds.length > 0 &&
    !impact.nodes.some((node) => node.assetType === "execution_plan")
  ) {
    pushAdvice(list, {
      kind: "regression",
      priority: "medium",
      summary: `${impact.matchedSuiteIds.length} suite(s) matched changed paths — consider accepting a regression pack`,
      changeEventId,
      evidenceRefs: impact.matchedSuiteIds.map((id) => `suite://${id}`),
      graphNodeIds: impact.matchedSuiteIds.map((id) => `suite:${id}`),
      explanation: {
        reason:
          "Path-matched suites exist without an accepted regression execution plan on this change",
        decisionPath: ["f2.impact.matchedSuiteIds", "f2.regression.not_accepted"],
        artifacts: impact.matchedSuiteIds.slice(0, 5).map((id) => ({
          kind: "test_suite",
          ref: `suite://${id}`,
          label: id,
        })),
      },
    });
  }

  if (
    impact.inferredRequirementIds.length === 0 &&
    impact.nodes.some(
      (node) => node.assetType === "package" || node.assetType === "commit",
    )
  ) {
    pushAdvice(list, {
      kind: "gap",
      priority: "low",
      summary: "No requirement references inferred from change text — traceability gap",
      changeEventId,
      evidenceRefs: [],
      graphNodeIds,
      explanation: {
        reason: impact.summary,
        decisionPath: ["f2.impact.inferredRequirementIds", "empty"],
        artifacts: impact.nodes.slice(0, 4).map((node) => ({
          kind: node.assetType,
          ref: node.nodeId,
          label: node.name,
        })),
      },
    });
  }
}

function adviseFromEvidence(
  changeEventId: string,
  evidenceLinks: readonly {
    readonly evidenceId: string;
    readonly domain: string;
    readonly ref: string;
  }[],
  list: QiChangeAdvice[],
): void {
  const domains = new Set(evidenceLinks.map((link) => link.domain));
  const expected = [
    { domain: "automation", label: "Automation", priority: "high" as const },
    { domain: "ci", label: "Coverage (CI)", priority: "medium" as const },
    {
      domain: "accessibility",
      label: "Accessibility",
      priority: "medium" as const,
    },
    { domain: "security", label: "Security", priority: "high" as const },
    {
      domain: "performance",
      label: "Performance",
      priority: "medium" as const,
    },
    {
      domain: "code_quality",
      label: "Code quality",
      priority: "medium" as const,
    },
  ] as const;

  for (const item of expected) {
    const present =
      domains.has(item.domain) ||
      (item.domain === "accessibility" && domains.has("regression"));
    if (present) continue;
    pushAdvice(list, {
      kind: "gap",
      priority: item.priority,
      summary: `Gap: no ${item.label} evidence linked to this change`,
      changeEventId,
      evidenceRefs: evidenceLinks.map((link) => link.ref),
      graphNodeIds: [],
      explanation: {
        reason: `F3 evidence matrix has no domain:${item.domain} items for this change`,
        decisionPath: ["f3.evidence.domains", `missing:${item.domain}`],
        artifacts: [
          {
            kind: "domain",
            ref: `domain://${item.domain}`,
            label: `${item.domain} (missing)`,
          },
          {
            kind: "action",
            ref: `design-assist://propose?changeEventId=${encodeURIComponent(changeEventId)}&domain=${item.domain}`,
            label: "Propose test design pack (F7)",
          },
          ...evidenceLinks.slice(0, 4).map((link) => ({
            kind: "evidence" as const,
            ref: link.ref,
            label: `${link.domain}:${link.evidenceId}`,
          })),
        ],
      },
    });
  }
}

function adviseFromCertification(
  changeEventId: string,
  evaluation: CertificationEvaluation,
  list: QiChangeAdvice[],
): void {
  if (evaluation.readiness === "BLOCKED") {
    const failed = evaluation.gates.filter((gate) => gate.status === "failed");
    pushAdvice(list, {
      kind: "blocker",
      priority: "critical",
      summary: `Certification BLOCKED (${evaluation.score}%) — ${failed.length || evaluation.gates.length} gate issue(s)`,
      changeEventId,
      evidenceRefs: evaluation.evidenceLinks.map((link) => link.ref),
      graphNodeIds: [],
      explanation: {
        reason: evaluation.summary,
        decisionPath: [
          "f4.certification.readiness",
          "BLOCKED",
          ...failed.map((gate) => gate.gateId),
        ],
        artifacts: [
          ...failed.map((gate) => ({
            kind: "gate",
            ref: `gate://${gate.gateId}`,
            label: `${gate.name}: ${gate.reason}`,
          })),
          ...evaluation.explainability.slice(0, 6).map((row) => ({
            kind: "explain",
            ref: `gate://${row.gateId}`,
            label: row.reason,
          })),
        ],
      },
    });
  }

  for (const domain of evaluation.domains ?? []) {
    if (domain.status !== "fail") continue;
    pushAdvice(list, {
      kind: "blocker",
      priority: "high",
      summary: `Domain ${domain.label} failed — ${domain.summary}`,
      changeEventId,
      evidenceRefs: domain.evidenceIds.map((id) =>
        id.startsWith("ev-") ? `evidence://${id}` : id,
      ),
      graphNodeIds: [],
      explanation: {
        reason: domain.summary,
        decisionPath: ["f5.domain", domain.domainId, "fail"],
        artifacts: domain.evidenceIds.map((id) => ({
          kind: "evidence",
          ref: id.startsWith("ev-") ? `evidence://${id}` : id,
          label: id,
        })),
      },
    });
  }

  if (
    evaluation.humanDecision?.outcome === "NO_GO" &&
    evaluation.readiness === "READY"
  ) {
    pushAdvice(list, {
      kind: "blocker",
      priority: "critical",
      summary:
        "Human recorded NO-GO despite advisory READY — release blocked by authority",
      changeEventId,
      evidenceRefs: [],
      graphNodeIds: [],
      explanation: {
        reason: evaluation.humanDecision.rationale,
        decisionPath: ["f4.humanDecision", "NO_GO"],
        artifacts: [
          {
            kind: "certification",
            ref: `cert://${evaluation.evaluationId}`,
            label: "Human NO-GO",
          },
        ],
      },
    });
  }
}

/** Pure composition — used by adviseChange and unit tests (no I/O). */
export function composeChangeAdvice(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly impact: ChangeImpactView;
  readonly evidenceLinks: readonly {
    readonly evidenceId: string;
    readonly domain: string;
    readonly ref: string;
  }[];
  readonly latestEvaluation?: CertificationEvaluation;
}): QiChangeAdviceBundle {
  const { changeEventId, impact, evidenceLinks, latestEvaluation } = input;
  const advice: QiChangeAdvice[] = [];
  adviseFromImpact(changeEventId, impact, advice);
  adviseFromEvidence(changeEventId, evidenceLinks, advice);
  if (latestEvaluation) {
    adviseFromCertification(changeEventId, latestEvaluation, advice);
  } else if (evidenceLinks.length === 0) {
    pushAdvice(advice, {
      kind: "gap",
      priority: "high",
      summary:
        "No certification evaluation yet — open RC and evaluate after attaching evidence",
      changeEventId,
      evidenceRefs: [],
      graphNodeIds: impact.nodes.map((node) => node.nodeId),
      explanation: {
        reason: "F4/F5 evaluation missing for this change",
        decisionPath: ["f4.evaluation.missing"],
        artifacts: [
          {
            kind: "change",
            ref: `change://${changeEventId}`,
            label: changeEventId,
          },
        ],
      },
    });
  }

  const rank: Record<QiAdviceKind, number> = {
    blocker: 0,
    risk: 1,
    regression: 2,
    gap: 3,
  };
  advice.sort(
    (a, b) =>
      rank[a.kind] - rank[b.kind] ||
      a.priority.localeCompare(b.priority) ||
      a.summary.localeCompare(b.summary),
  );

  return {
    changeEventId,
    tenantId: input.tenantId,
    generatedAt: new Date().toISOString(),
    advisory: true,
    impactSummary: {
      riskLevel: impact.riskLevel,
      requirementCount: impact.inferredRequirementIds.length,
      suiteMatchCount: impact.matchedSuiteIds.length,
      nodeCount: impact.nodes.length,
      repositoryId: impact.repositoryId,
    },
    certificationSummary: latestEvaluation
      ? {
          evaluationId: latestEvaluation.evaluationId,
          readiness: latestEvaluation.readiness,
          score: latestEvaluation.score,
          humanDecision: latestEvaluation.humanDecision?.outcome,
        }
      : undefined,
    advice,
  };
}

/**
 * Produce advisory QI for a change. Pure read path — must not write cert/SoR.
 */
export async function adviseChange(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
}): Promise<QiChangeAdviceBundle> {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("qi.change_id_required");
  }

  let impact: ChangeImpactView;
  try {
    impact = await buildChangeImpact(input.tenantId, changeEventId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "scm.impact.change_not_found") {
      throw new Error("qi.change_not_found");
    }
    throw error;
  }

  let evidenceLinks: Awaited<
    ReturnType<typeof collectEvidenceForChange>
  >["evidenceLinks"] = [];
  try {
    evidenceLinks = (await collectEvidenceForChange(input.tenantId, changeEventId))
      .evidenceLinks;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message !== "certification.change_not_found") throw error;
  }

  const certBundle = await getCertificationByChange(input.tenantId, changeEventId);
  const latest = certBundle.evaluations[0];
  const humanFromHistory = certBundle.evaluations.find(
    (evaluation) => evaluation.humanDecision,
  )?.humanDecision;
  const latestEvaluation =
    latest === undefined
      ? undefined
      : {
          ...latest,
          humanDecision: latest.humanDecision ?? humanFromHistory,
        };

  return composeChangeAdvice({
    tenantId: input.tenantId,
    changeEventId,
    impact,
    evidenceLinks,
    latestEvaluation,
  });
}
