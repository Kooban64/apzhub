/**
 * Flagship F13 — AI Fix Pack for Developer Early Check.
 * Structured, Cursor-ready findings from governed evidence (F12 model).
 * Advisory only — never auto-certifies / never implies GO.
 */

import { createHash } from "node:crypto";

import {
  getReportPack,
  type ReportPack,
  type ReportPackSourceDeps,
} from "@/lib/qep/report-pack";
import type {
  FindingSeverity,
  ReportActionItem,
  ReportFinding,
} from "@/lib/qep/report-pack-findings";

export const F13_ASSIST_ORIGIN = "f13_early_check" as const;

export type AiFixItem = {
  readonly id: string;
  readonly priority: "P0" | "P1" | "P2" | "P3";
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly location?: string;
  readonly problem: string;
  readonly recommendedFix: string;
  readonly toolId: string;
  readonly relatedFindingIds: readonly string[];
  /** Stable instruction block for an AI coding agent. */
  readonly agentInstruction: string;
};

export type AiFixPack = {
  readonly packId: string;
  readonly kind: "ai_fix_pack";
  readonly schemaVersion: "1.0";
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly generatedAt: string;
  readonly advisory: true;
  readonly autoCertified: false;
  readonly purpose: "developer_early_check";
  readonly assessmentBand: string;
  readonly assessmentHeadline: string;
  readonly severityRollup: ReportPack["severityRollup"];
  readonly items: readonly AiFixItem[];
  readonly findings: readonly ReportFinding[];
  readonly usage: {
    readonly forAi: string;
    readonly notFor: string;
  };
};

function priorityForSeverity(severity: FindingSeverity): AiFixItem["priority"] {
  switch (severity) {
    case "critical":
      return "P0";
    case "high":
      return "P1";
    case "medium":
      return "P2";
    default:
      return "P3";
  }
}

function agentInstruction(input: {
  readonly title: string;
  readonly location?: string;
  readonly problem: string;
  readonly recommendedFix: string;
  readonly severity: FindingSeverity;
  readonly toolId: string;
}): string {
  const loc = input.location
    ? `Location: ${input.location}`
    : "Location: (see description)";
  return [
    `Fix this ${input.severity} finding from ${input.toolId} (advisory Early Check — not a release GO).`,
    `Title: ${input.title}`,
    loc,
    `Problem: ${input.problem}`,
    `Recommended fix: ${input.recommendedFix}`,
    "Keep the change minimal, add/adjust tests if appropriate, and do not claim certification.",
  ].join("\n");
}

function itemsFromActionsAndFindings(
  actions: readonly ReportActionItem[],
  findings: readonly ReportFinding[],
): AiFixItem[] {
  if (actions.length > 0) {
    return actions.map((action, index) => {
      const related = findings.filter((f) => action.relatedFindingIds.includes(f.id));
      const primary = related[0];
      const problem =
        primary?.description ?? `${action.severity} issue: ${action.title}`;
      const location = primary?.location;
      return {
        id: `fix-${index + 1}-${action.priority}`,
        priority: action.priority,
        severity: action.severity,
        title: action.title,
        location,
        problem,
        recommendedFix: action.recommendation,
        toolId: action.toolId,
        relatedFindingIds: action.relatedFindingIds,
        agentInstruction: agentInstruction({
          title: action.title,
          location,
          problem,
          recommendedFix: action.recommendation,
          severity: action.severity,
          toolId: action.toolId,
        }),
      };
    });
  }

  return findings.slice(0, 40).map((finding, index) => {
    const priority = priorityForSeverity(finding.severity);
    return {
      id: `fix-${index + 1}-${finding.id}`,
      priority,
      severity: finding.severity,
      title: finding.title,
      location: finding.location,
      problem: finding.description,
      recommendedFix: finding.recommendation,
      toolId: finding.toolId,
      relatedFindingIds: [finding.id],
      agentInstruction: agentInstruction({
        title: finding.title,
        location: finding.location,
        problem: finding.description,
        recommendedFix: finding.recommendation,
        severity: finding.severity,
        toolId: finding.toolId,
      }),
    };
  });
}

/** Pure compose — injectable for unit tests. */
export function composeAiFixPack(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly generatedAt: string;
  readonly report: Pick<
    ReportPack,
    "assessment" | "severityRollup" | "findings" | "actions" | "packId"
  >;
}): AiFixPack {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("ai_fix_pack.change_id_required");
  }

  const items = itemsFromActionsAndFindings(
    input.report.actions,
    input.report.findings,
  );
  const digest = createHash("sha256")
    .update(`${input.tenantId}|${changeEventId}|${input.generatedAt}|${items.length}`)
    .digest("hex")
    .slice(0, 12);

  return {
    packId: `ai-fix-${digest}`,
    kind: "ai_fix_pack",
    schemaVersion: "1.0",
    changeEventId,
    tenantId: input.tenantId,
    generatedAt: input.generatedAt,
    advisory: true,
    autoCertified: false,
    purpose: "developer_early_check",
    assessmentBand: input.report.assessment.band,
    assessmentHeadline: input.report.assessment.headline,
    severityRollup: input.report.severityRollup,
    items,
    findings: input.report.findings,
    usage: {
      forAi:
        "Paste into Cursor/Chat as structured remediation context for this change. Prefer P0/P1 first.",
      notFor:
        "Not a release certification, GO/NO-GO, or Security Bill of Health sign-off.",
    },
  };
}

export async function getAiFixPack(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly deps?: ReportPackSourceDeps;
  readonly now?: () => Date;
}): Promise<AiFixPack> {
  const report = await getReportPack({
    tenantId: input.tenantId,
    changeEventId: input.changeEventId,
    deps: input.deps,
  });
  return composeAiFixPack({
    tenantId: input.tenantId,
    changeEventId: input.changeEventId,
    generatedAt: (input.now ?? (() => new Date()))().toISOString(),
    report,
  });
}

/** Cursor-ready markdown — actionable, not a certification document. */
export function renderAiFixPackMarkdown(pack: AiFixPack): string {
  const lines: string[] = [
    `# AI Fix Pack (Early Check — advisory)`,
    ``,
    `> **Not certification.** Do not treat as GO/NO-GO. Schema ${pack.schemaVersion}.`,
    ``,
    `| Field | Value |`,
    `| ----- | ----- |`,
    `| Pack ID | \`${pack.packId}\` |`,
    `| Change | \`${pack.changeEventId}\` |`,
    `| Assessment | **${pack.assessmentBand}** — ${pack.assessmentHeadline} |`,
    `| Items | ${pack.items.length} |`,
    `| Auto-certified | ${pack.autoCertified} |`,
    `| Generated | ${pack.generatedAt} |`,
    ``,
    `## How to use with an AI coding agent`,
    ``,
    pack.usage.forAi,
    ``,
    pack.usage.notFor,
    ``,
    `## Severity rollup`,
    ``,
    `| Critical | High | Medium | Low | Info | Unknown | Total |`,
    `| -------- | ---- | ------ | --- | ---- | ------- | ----- |`,
    `| ${pack.severityRollup.critical} | ${pack.severityRollup.high} | ${pack.severityRollup.medium} | ${pack.severityRollup.low} | ${pack.severityRollup.info} | ${pack.severityRollup.unknown} | ${pack.severityRollup.total} |`,
    ``,
    `## Fix items (priority order)`,
    ``,
  ];

  if (pack.items.length === 0) {
    lines.push(
      `_No remediation items yet._ Run Early Check / wait for ingest, then refresh.`,
      ``,
    );
  } else {
    for (const item of pack.items) {
      lines.push(
        `### ${item.priority} · ${item.severity.toUpperCase()} — ${item.title}`,
        ``,
        `- ID: \`${item.id}\``,
        `- Tool: \`${item.toolId}\``,
        item.location ? `- Location: \`${item.location}\`` : `- Location: _(none)_`,
        ``,
        `**Problem**`,
        ``,
        item.problem,
        ``,
        `**Recommended fix**`,
        ``,
        item.recommendedFix,
        ``,
        `**Agent instruction**`,
        ``,
        "```",
        item.agentInstruction,
        "```",
        ``,
      );
    }
  }

  lines.push(
    `## Raw finding ids`,
    ``,
    ...pack.findings
      .slice(0, 50)
      .map((f) => `- \`${f.id}\` · ${f.severity} · ${f.title}`),
    ``,
  );

  return lines.join("\n");
}

/** Policy helper for tests — ensure pack never looks like certification. */
export function assertAiFixPackAdvisory(pack: AiFixPack): void {
  if (pack.autoCertified !== false) {
    throw new Error("ai_fix_pack.must_not_auto_certify");
  }
  if (pack.advisory !== true) {
    throw new Error("ai_fix_pack.must_be_advisory");
  }
  if (pack.kind !== "ai_fix_pack") {
    throw new Error("ai_fix_pack.kind_invalid");
  }
}
