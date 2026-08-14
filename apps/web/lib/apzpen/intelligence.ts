/**
 * APZPEN Security Intelligence — bounded offline assist.
 * Never autonomous attack. Never auto-certify.
 */

import type { Engagement, Finding, FindingSeverity } from "./types";

export type IntelligenceKind =
  "engagement_summary" | "priority_order" | "remediation_hints" | "fp_candidates";

export type IntelligenceSuggestion = {
  readonly id: string;
  readonly kind: IntelligenceKind;
  readonly title: string;
  readonly body: string;
  readonly confidence: number;
  readonly findingIds: readonly string[];
  readonly disclaimer: string;
};

export type IntelligenceAssistResult = {
  readonly engagementId: string;
  readonly generatedAt: string;
  readonly mode: "offline_rules" | "openai";
  readonly autoCertify: false;
  readonly suggestions: readonly IntelligenceSuggestion[];
};

const DISCLAIMER =
  "AI-assisted (offline rules). Advisory only — humans decide. Never auto-certifies.";

function severityRank(s: FindingSeverity): number {
  switch (s) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    case "low":
      return 3;
    default:
      return 4;
  }
}

function openFindings(findings: readonly Finding[]): Finding[] {
  return findings.filter(
    (f) =>
      f.status !== "closed" &&
      f.status !== "risk_accepted" &&
      f.status !== "false_positive" &&
      f.status !== "retest_passed",
  );
}

/**
 * Produce advisory suggestions from engagement + findings.
 * Deterministic offline rules — no network / commercial LLM.
 */
export function assistSecurityIntelligence(input: {
  readonly engagement: Engagement;
  readonly findings: readonly Finding[];
}): IntelligenceAssistResult {
  const open = openFindings(input.findings);
  const critical = open.filter((f) => f.severity === "critical");
  const high = open.filter((f) => f.severity === "high");
  const suggestions: IntelligenceSuggestion[] = [];

  suggestions.push({
    id: "sum_1",
    kind: "engagement_summary",
    title: "Engagement posture summary",
    body: [
      `${input.engagement.title} for ${input.engagement.customerName} / ${input.engagement.applicationName}.`,
      `Status ${input.engagement.status}; assessment ${input.engagement.assessmentPosition}.`,
      `Open findings: ${open.length} (critical ${critical.length}, high ${high.length}).`,
      `RoE ${input.engagement.roe.status}; scope ${input.engagement.scope.length} target(s).`,
      critical.length > 0
        ? "Certification is blocked until criticals are closed or accepted."
        : "No open criticals — human may consider certify when remediation evidence is complete.",
    ].join(" "),
    confidence: 0.82,
    findingIds: open.slice(0, 8).map((f) => f.findingId),
    disclaimer: DISCLAIMER,
  });

  const ordered = open
    .slice()
    .sort((a, b) => severityRank(a.severity) - severityRank(b.severity));
  suggestions.push({
    id: "pri_1",
    kind: "priority_order",
    title: "Suggested remediation priority",
    body:
      ordered.length === 0
        ? "No open findings to prioritise."
        : ordered
            .slice(0, 10)
            .map(
              (f, i) =>
                `${i + 1}. [${f.severity.toUpperCase()}] ${f.title}${
                  f.providerTool ? ` (${f.providerTool})` : ""
                }`,
            )
            .join("\n"),
    confidence: 0.75,
    findingIds: ordered.slice(0, 10).map((f) => f.findingId),
    disclaimer: DISCLAIMER,
  });

  const withRemediation = ordered.filter((f) => f.remediation);
  suggestions.push({
    id: "rem_1",
    kind: "remediation_hints",
    title: "Remediation narrative",
    body:
      withRemediation.length === 0
        ? "Add remediation text on findings to unlock richer assist hints."
        : withRemediation
            .slice(0, 6)
            .map((f) => `• ${f.title}: ${f.remediation}`)
            .join("\n"),
    confidence: withRemediation.length ? 0.7 : 0.4,
    findingIds: withRemediation.slice(0, 6).map((f) => f.findingId),
    disclaimer: DISCLAIMER,
  });

  const fpCandidates = input.findings.filter(
    (f) =>
      f.status === "open" &&
      (f.severity === "info" || f.severity === "low") &&
      (f.title.toLowerCase().includes("header") ||
        f.description.toLowerCase().includes("informational")),
  );
  suggestions.push({
    id: "fp_1",
    kind: "fp_candidates",
    title: "Possible false-positive / low-signal items",
    body:
      fpCandidates.length === 0
        ? "No low-signal open items flagged for FP review."
        : `Review before closing as false_positive:\n${fpCandidates
            .slice(0, 5)
            .map((f) => `• ${f.title}`)
            .join("\n")}`,
    confidence: 0.55,
    findingIds: fpCandidates.slice(0, 5).map((f) => f.findingId),
    disclaimer: DISCLAIMER,
  });

  return {
    engagementId: input.engagement.engagementId,
    generatedAt: new Date().toISOString(),
    mode: "offline_rules",
    autoCertify: false,
    suggestions,
  };
}
