/**
 * Advisory insight helpers (QO-013).
 * Additive commentary only — never corrective of upstream decisions.
 */

import type {
  AdvisoryInsight,
  AdvisoryInsightInput,
  ConfidenceAttribution,
} from "../contracts/enrichment";
import { ADVISORY_INSIGHT_CATEGORIES } from "../contracts/enrichment";
import { OrchestrationError } from "../contracts/errors";

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

export function isAdvisoryInsightCategory(
  value: string,
): value is AdvisoryInsightInput["category"] {
  return (ADVISORY_INSIGHT_CATEGORIES as readonly string[]).includes(value);
}

export function buildAdvisoryInsight(input: AdvisoryInsightInput): AdvisoryInsight {
  if (!isAdvisoryInsightCategory(input.category)) {
    throw new OrchestrationError(
      "validation",
      "INVALID_ADVISORY_INSIGHT",
      `Unknown advisory insight category: ${input.category}`,
      { category: input.category },
    );
  }
  const summary = input.summary.trim();
  if (!summary) {
    throw new OrchestrationError(
      "validation",
      "INVALID_ADVISORY_INSIGHT",
      "advisory insight summary is required",
    );
  }

  const attribution: ConfidenceAttribution[] = [
    ...(input.confidenceAttribution ?? []).map((a) =>
      Object.freeze({
        sourceRef: a.sourceRef.trim(),
        sourceKind: a.sourceKind,
        attributedConfidence: a.attributedConfidence,
        note: a.note.trim(),
      }),
    ),
  ];

  return Object.freeze({
    insightId: createId("ains"),
    category: input.category,
    summary,
    detail: input.detail?.trim() || undefined,
    signalRefs: Object.freeze([...(input.signalRefs ?? [])]),
    recommendationRefs: Object.freeze([...(input.recommendationRefs ?? [])]),
    confidenceAttribution: Object.freeze(attribution),
    advisory: true as const,
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
  });
}

/**
 * Optional additive commentary from already-observed snapshots.
 * Does not recalculate confidence/risk and never contradicts by mutating SoRs.
 */
export function buildObservedCommentary(args: {
  readonly observedConfidence?: number;
  readonly observedResidualRisk?: string;
  readonly observedPlatformConclusion?: string;
  readonly decisionPackageRef?: string;
  readonly confidenceSummaryRef?: string;
}): AdvisoryInsight[] {
  const insights: AdvisoryInsight[] = [];
  const {
    observedConfidence,
    observedResidualRisk,
    observedPlatformConclusion,
    decisionPackageRef,
    confidenceSummaryRef,
  } = args;

  if (observedConfidence !== undefined && !Number.isNaN(observedConfidence)) {
    insights.push(
      buildAdvisoryInsight({
        category: "confidence_commentary",
        summary: `Observed confidence ${observedConfidence.toFixed(3)} referenced for enrichment commentary`,
        detail:
          "Additive commentary only — does not recalculate or alter the Decision Package confidence.",
        confidenceAttribution: [
          {
            sourceRef: confidenceSummaryRef ?? decisionPackageRef ?? "observed",
            sourceKind: confidenceSummaryRef ? "impact" : "decision",
            attributedConfidence: observedConfidence,
            note: "Pass-through observation for enrichment display",
          },
        ],
      }),
    );
  }

  if (observedResidualRisk?.trim()) {
    insights.push(
      buildAdvisoryInsight({
        category: "risk_indicator",
        summary: `Observed residual risk level ${observedResidualRisk.trim()} noted for enrichment`,
        detail:
          "Additive risk commentary only — does not reassess or override governance residual risk.",
        confidenceAttribution: decisionPackageRef
          ? [
              {
                sourceRef: decisionPackageRef,
                sourceKind: "decision",
                note: "Referenced Decision Package residual risk (unchanged)",
              },
            ]
          : [],
      }),
    );
  }

  if (observedPlatformConclusion?.trim()) {
    insights.push(
      buildAdvisoryInsight({
        category: "recommendation",
        summary: `Platform conclusion ${observedPlatformConclusion.trim()} remains authoritative; enrichment does not revise it`,
        detail:
          "If the organisation wishes to revisit the decision, open a new Quality Flow — do not mutate history.",
        recommendationRefs: decisionPackageRef ? [decisionPackageRef] : [],
      }),
    );
  }

  return insights;
}
