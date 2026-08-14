/**
 * Flagship F8 — Change Quality Journey.
 * Read-only glue over F1–F7 for one change: Impact → Design → Evidence → RC → GO/NO-GO.
 * Never mutates SoR/cert; deep-links humans to existing mutation surfaces.
 */

import {
  collectEvidenceForChange,
  getCertificationByChange,
  type CertificationEvaluation,
  type RcDomainTile,
  buildRcDomainTiles,
} from "@/lib/qep/certification-runtime";
import { QEP_CERTIFICATION_ROUTES } from "@/lib/qep/certification-routes";
import { QEP_QUALITY_JOURNEY_ROUTES } from "@/lib/qep/quality-journey-routes";
import { buildChangeImpact, type ChangeImpactView } from "@/lib/qep/scm-impact";
import {
  composeTestDesignPack,
  proposeTestDesignPack,
  type TestDesignPack,
} from "@/lib/qep/test-design-assist";

/** Local path helpers — avoid presentation package imports in unit-tested compose. */
const scmHome = "/workspace/qep/scm";
const scmRepository = (repositoryId: string) =>
  `${scmHome}/repositories/${repositoryId}`;
const scmDesignAssist = (repositoryId: string, changeEventId: string) =>
  `${scmRepository(repositoryId)}?designAssist=${encodeURIComponent(changeEventId)}`;
const automationHome = "/workspace/qep/automation";
const qiByChange = (changeEventId: string) =>
  `/workspace/qep/quality-intelligence?changeEventId=${encodeURIComponent(changeEventId)}`;

export type JourneyStepId =
  "impact" | "propose_design" | "evidence_domains" | "rc_evaluate" | "human_go_nogo";

export type JourneyStepStatus =
  "not_started" | "ready" | "attention" | "complete" | "blocked";

export type ChangeQualityJourneyStep = {
  readonly stepId: JourneyStepId;
  readonly order: number;
  readonly title: string;
  readonly summary: string;
  readonly status: JourneyStepStatus;
  readonly href: string;
  readonly actionLabel: string;
  readonly detail?: string;
};

export type ChangeQualityJourney = {
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly generatedAt: string;
  readonly advisory: true;
  readonly headline: string;
  readonly nextStepId: JourneyStepId;
  readonly repositoryId?: string;
  readonly impactSummary: {
    readonly riskLevel: string;
    readonly requirementCount: number;
    readonly suiteMatchCount: number;
  };
  readonly designSummary: {
    readonly draftCount: number;
    readonly domainGapCount: number;
  };
  readonly evidenceSummary: {
    readonly domainCount: number;
    readonly domains: readonly string[];
  };
  readonly certificationSummary?: {
    readonly evaluationId: string;
    readonly readiness: string;
    readonly score: number;
    readonly humanDecision?: string;
  };
  readonly domainTiles: readonly RcDomainTile[];
  readonly steps: readonly ChangeQualityJourneyStep[];
  readonly deepLinks: {
    readonly journey: string;
    readonly scmRepository?: string;
    readonly designAssist?: string;
    readonly automation: string;
    readonly qi: string;
    readonly rc: string;
    readonly rcEvaluation?: string;
  };
};

function evidenceDomainSet(links: readonly { readonly domain: string }[]): Set<string> {
  return new Set(links.map((link) => link.domain));
}

function pickNextStep(steps: readonly ChangeQualityJourneyStep[]): JourneyStepId {
  const human = steps.find((step) => step.stepId === "human_go_nogo");
  if (human?.status === "complete") {
    return "human_go_nogo";
  }
  const incomplete = steps.find((step) => step.status !== "complete");
  return incomplete?.stepId ?? human?.stepId ?? "human_go_nogo";
}

/**
 * Pure composition — used by getChangeQualityJourney and unit tests (no I/O).
 */
export function composeChangeQualityJourney(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly impact: ChangeImpactView;
  readonly designPack: TestDesignPack;
  readonly evidenceLinks: readonly {
    readonly evidenceId: string;
    readonly domain: string;
    readonly ref: string;
  }[];
  readonly latestEvaluation?: CertificationEvaluation;
}): ChangeQualityJourney {
  const { changeEventId, impact, designPack, evidenceLinks, latestEvaluation } = input;
  const domains = evidenceDomainSet(evidenceLinks);
  const domainTiles = latestEvaluation ? buildRcDomainTiles(latestEvaluation) : [];

  const scmRepoHref = impact.repositoryId
    ? scmRepository(impact.repositoryId)
    : scmHome;
  const designHref = impact.repositoryId
    ? scmDesignAssist(impact.repositoryId, changeEventId)
    : scmHome;
  const rcHref = QEP_CERTIFICATION_ROUTES.byChange(changeEventId);
  const rcEvalHref = latestEvaluation
    ? QEP_CERTIFICATION_ROUTES.rcEvaluation(latestEvaluation.evaluationId)
    : undefined;

  const failingDomains = domainTiles.filter(
    (tile) => tile.status === "fail" || tile.status === "not_present",
  );

  const steps: ChangeQualityJourneyStep[] = [
    {
      stepId: "impact",
      order: 1,
      title: "Impact",
      summary: `Risk ${impact.riskLevel} · ${impact.inferredRequirementIds.length} REQ · ${impact.matchedSuiteIds.length} suite match(es)`,
      status:
        impact.nodes.length > 1 || impact.matchedSuiteIds.length > 0
          ? "complete"
          : "attention",
      href: scmRepoHref,
      actionLabel: "Open Source Control",
      detail: impact.summary,
    },
    {
      stepId: "propose_design",
      order: 2,
      title: "Propose test design",
      summary:
        designPack.drafts.length > 0
          ? `${designPack.drafts.length} advisory draft spec(s) · ${designPack.domainGaps.length} domain gap(s)`
          : "No design drafts suggested yet",
      status:
        designPack.drafts.length > 0
          ? "ready"
          : designPack.domainGaps.length > 0
            ? "attention"
            : "complete",
      href: designHref,
      actionLabel: "Propose / accept drafts",
      detail: designPack.note,
    },
    {
      stepId: "evidence_domains",
      order: 3,
      title: "Evidence domains",
      summary:
        domains.size > 0
          ? `${domains.size} domain(s) with evidence: ${[...domains].join(", ")}`
          : "No evidence linked to this change yet",
      status:
        domains.size === 0
          ? "attention"
          : failingDomains.length > 0
            ? "attention"
            : "complete",
      href: automationHome,
      actionLabel: "Open Automation / ingest",
      detail:
        "F9: Playwright smoke on change. F10: dispatches external runners (GHA/webhook) for Vitest/a11y/security/…. Reports return via ingest. Humans still certify.",
    },
    {
      stepId: "rc_evaluate",
      order: 4,
      title: "RC evaluate",
      summary: latestEvaluation
        ? `${latestEvaluation.readiness} ${latestEvaluation.score}%`
        : "No certification evaluation yet",
      status: latestEvaluation
        ? latestEvaluation.readiness === "BLOCKED"
          ? "attention"
          : "complete"
        : "ready",
      href: rcHref,
      actionLabel: latestEvaluation ? "Open RC" : "Evaluate on RC",
      detail: latestEvaluation?.summary,
    },
    {
      stepId: "human_go_nogo",
      order: 5,
      title: "Human GO / NO-GO",
      summary: latestEvaluation?.humanDecision
        ? `Recorded ${latestEvaluation.humanDecision.outcome}`
        : latestEvaluation
          ? "Awaiting human certification decision"
          : "Evaluate first — then a human records GO or NO-GO",
      status: latestEvaluation?.humanDecision
        ? "complete"
        : latestEvaluation
          ? "ready"
          : "blocked",
      href: rcEvalHref ?? rcHref,
      actionLabel: "Record decision",
      detail:
        "AI and journey glue never auto-certify. Only a human may record GO/NO-GO.",
    },
  ];

  const nextStepId = pickNextStep(steps);
  const human = latestEvaluation?.humanDecision?.outcome;
  const headline = human
    ? `Change journey complete for certification — human ${human}`
    : `Next: ${steps.find((step) => step.stepId === nextStepId)?.title ?? "continue"}`;

  return {
    changeEventId,
    tenantId: input.tenantId,
    generatedAt: new Date().toISOString(),
    advisory: true,
    headline,
    nextStepId,
    repositoryId: impact.repositoryId,
    impactSummary: {
      riskLevel: impact.riskLevel,
      requirementCount: impact.inferredRequirementIds.length,
      suiteMatchCount: impact.matchedSuiteIds.length,
    },
    designSummary: {
      draftCount: designPack.drafts.length,
      domainGapCount: designPack.domainGaps.length,
    },
    evidenceSummary: {
      domainCount: domains.size,
      domains: [...domains].sort(),
    },
    certificationSummary: latestEvaluation
      ? {
          evaluationId: latestEvaluation.evaluationId,
          readiness: latestEvaluation.readiness,
          score: latestEvaluation.score,
          humanDecision: latestEvaluation.humanDecision?.outcome,
        }
      : undefined,
    domainTiles,
    steps,
    deepLinks: {
      journey: QEP_QUALITY_JOURNEY_ROUTES.byChange(changeEventId),
      scmRepository: impact.repositoryId
        ? scmRepository(impact.repositoryId)
        : undefined,
      designAssist: impact.repositoryId
        ? scmDesignAssist(impact.repositoryId, changeEventId)
        : undefined,
      automation: automationHome,
      qi: qiByChange(changeEventId),
      rc: rcHref,
      rcEvaluation: rcEvalHref,
    },
  };
}

/** Read-only journey for a durable change — must not write cert/SoR. */
export async function getChangeQualityJourney(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
}): Promise<ChangeQualityJourney> {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("journey.change_id_required");
  }

  let impact: ChangeImpactView;
  try {
    impact = await buildChangeImpact(input.tenantId, changeEventId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "scm.impact.change_not_found") {
      throw new Error("journey.change_not_found");
    }
    throw error;
  }

  let designPack: TestDesignPack;
  try {
    designPack = await proposeTestDesignPack(input.tenantId, changeEventId);
  } catch {
    designPack = composeTestDesignPack({
      changeEventId,
      impact,
      evidenceDomains: [],
    });
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

  return composeChangeQualityJourney({
    tenantId: input.tenantId,
    changeEventId,
    impact,
    designPack,
    evidenceLinks,
    latestEvaluation,
  });
}
