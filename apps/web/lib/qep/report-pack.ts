/**
 * Flagship F12 — Professional Quality/Security Report Pack.
 * Builds audit/pentest-style draft packs from governed evidence linked to a change.
 * Humans publish / sign; never auto-certify.
 */

import { createHash } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

import type { AutomationExecutionRecord } from "@apzhub/platform-automation";

import {
  collectEvidenceForChange,
  getCertificationByChange,
  type CertificationEvaluation,
  type CertificationEvidenceLink,
} from "@/lib/qep/certification-runtime";
import { getQepAutomationRuntime } from "@/lib/qep/automation-runtime";
import {
  listVerificationDispatches,
  type VerificationDispatchRecord,
} from "@/lib/qep/verification-dispatch-store";
import {
  buildActionItems,
  buildEngagement,
  buildOverallAssessment,
  extractEngagementFromExecutions,
  extractFindingsFromExecutions,
  findingsToRollup,
  loadFindingsFromArtefactRoot,
  resolveArtefactRoot,
  sortFindings,
  type OverallAssessment,
  type ReportActionItem,
  type ReportEngagement,
  type ReportFinding,
} from "@/lib/qep/report-pack-findings";

export const REPORT_PACK_SECURITY_TOOLS = [
  "trivy",
  "semgrep",
  "nuclei",
  "zap",
  "greenbone",
] as const;

export type ReportPackSecurityToolId = (typeof REPORT_PACK_SECURITY_TOOLS)[number];

export type SeverityRollup = {
  readonly critical: number;
  readonly high: number;
  readonly medium: number;
  readonly low: number;
  readonly info: number;
  readonly unknown: number;
  readonly total: number;
};

export type ReportPackToolStatus =
  "not_run" | "dispatched" | "evidence_present" | "completed" | "failed";

export type ReportPackToolSummary = {
  readonly toolId: ReportPackSecurityToolId;
  readonly label: string;
  readonly status: ReportPackToolStatus;
  readonly executionIds: readonly string[];
  readonly evidenceIds: readonly string[];
  readonly summary?: string;
  readonly findingCounts: SeverityRollup;
};

export type ReportPackEvidenceSummary = {
  readonly evidenceId: string;
  readonly domain: string;
  readonly ref: string;
  readonly note?: string;
  readonly toolId?: ReportPackSecurityToolId;
};

export type ReportPackExecutionSummary = {
  readonly executionId: string;
  readonly providerId: string;
  readonly state: string;
  readonly resultSummary?: string;
  readonly toolId?: ReportPackSecurityToolId;
  readonly findingCounts: SeverityRollup;
};

export type ReportPackSignOff = {
  readonly signed: boolean;
  readonly signerName?: string;
  readonly signerRole?: string;
  readonly signedAt?: string;
  readonly decision?: "accepted_with_residual_risk" | "rejected" | "needs_rework";
  readonly notes?: string;
};

export type ReportPack = {
  readonly packId: string;
  readonly kind: "security_bill_of_health";
  /** Draft until a human publishes — never auto-certified. */
  readonly status: "draft" | "published";
  readonly changeEventId: string;
  readonly tenantId: string;
  readonly generatedAt: string;
  readonly advisory: true;
  readonly autoCertified: false;
  readonly tools: readonly ReportPackToolSummary[];
  readonly severityRollup: SeverityRollup;
  /** What was tested — scope + methodology. */
  readonly engagement: ReportEngagement;
  /** Detailed findings (good or bad). */
  readonly findings: readonly ReportFinding[];
  /** Prioritised remediation backlog. */
  readonly actions: readonly ReportActionItem[];
  readonly assessment: OverallAssessment;
  readonly evidenceSummaries: readonly ReportPackEvidenceSummary[];
  readonly executionSummaries: readonly ReportPackExecutionSummary[];
  readonly dispatchSummaries: readonly {
    readonly dispatchId: string;
    readonly pack?: string;
    readonly status: string;
    readonly domains: readonly string[];
    readonly assistOrigin: string;
  }[];
  readonly residualRisk: {
    readonly placeholder: boolean;
    readonly statement: string;
  };
  readonly signOff: ReportPackSignOff;
  readonly certificationContext?: {
    readonly evaluationId?: string;
    readonly readiness?: string;
    readonly score?: number;
    readonly humanDecision?: string;
  };
};

export type ReportPackSourceDeps = {
  readonly listExecutions?: (
    tenantId: string,
  ) => Promise<readonly AutomationExecutionRecord[]>;
  readonly listEvidenceLinks?: (
    tenantId: string,
    changeEventId: string,
  ) => Promise<readonly CertificationEvidenceLink[]>;
  readonly listDispatches?: (
    tenantId: string,
    changeEventId: string,
  ) => readonly VerificationDispatchRecord[];
  readonly getCertification?: (
    tenantId: string,
    changeEventId: string,
  ) => Promise<CertificationEvaluation | undefined>;
  readonly now?: () => Date;
};

const TOOL_LABELS: Record<ReportPackSecurityToolId, string> = {
  trivy: "Trivy (SCA / image)",
  semgrep: "Semgrep (SAST)",
  nuclei: "Nuclei (DAST templates)",
  zap: "OWASP ZAP (DAST)",
  greenbone: "Greenbone (VA)",
};

export function emptySeverityRollup(): SeverityRollup {
  return {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    unknown: 0,
    total: 0,
  };
}

export function sumSeverityRollups(parts: readonly SeverityRollup[]): SeverityRollup {
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let info = 0;
  let unknown = 0;
  let total = 0;
  for (const part of parts) {
    critical += part.critical;
    high += part.high;
    medium += part.medium;
    low += part.low;
    info += part.info;
    unknown += part.unknown;
    total += part.total;
  }
  return { critical, high, medium, low, info, unknown, total };
}

export function detectSecurityTool(
  text: string | undefined,
): ReportPackSecurityToolId | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  for (const tool of REPORT_PACK_SECURITY_TOOLS) {
    if (lower.includes(tool)) return tool;
  }
  return undefined;
}

/**
 * Best-effort severity parse from result summaries / notes.
 * Prefer structured ingest metrics when present in metadata JSON.
 */
export function parseSeverityRollup(input: {
  readonly resultSummary?: string;
  readonly metadata?: Readonly<Record<string, string>>;
}): SeverityRollup {
  const meta = input.metadata ?? {};
  const metricsRaw = meta.metricsJson ?? meta.findingsJson;
  if (metricsRaw) {
    try {
      const parsed = JSON.parse(metricsRaw) as Record<string, unknown>;
      let critical = 0;
      let high = 0;
      let medium = 0;
      let low = 0;
      let info = 0;
      let unknown = 0;
      const num = (key: string): number => {
        const value = parsed[key];
        return typeof value === "number" && Number.isFinite(value) ? value : 0;
      };
      critical = num("critical");
      high = num("high");
      medium = num("medium");
      low = num("low");
      info = num("info");
      unknown = num("unknown");
      const highOrCritical = parsed.highOrCritical;
      if (typeof highOrCritical === "number" && critical === 0 && high === 0) {
        high = highOrCritical;
      }
      const findings = parsed.findings;
      let total = critical + high + medium + low + info + unknown;
      if (typeof findings === "number" && total === 0) {
        unknown = Math.max(0, findings);
        total = unknown;
      } else if (typeof findings === "number" && findings > total) {
        unknown += findings - total;
        total = findings;
      } else {
        total = critical + high + medium + low + info + unknown;
      }
      if (total > 0) {
        return { critical, high, medium, low, info, unknown, total };
      }
    } catch {
      // fall through to summary parse
    }
  }

  const summary = input.resultSummary ?? "";
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;
  let info = 0;
  let unknown = 0;
  const take = (re: RegExp): number => {
    const match = summary.match(re);
    return match ? Number(match[1]) : 0;
  };
  critical = take(/(\d+)\s*critical/i);
  high = take(/(\d+)\s*high(?!\/)/i);
  medium = take(/(\d+)\s*medium/i);
  low = take(/(\d+)\s*low/i);
  info = take(/(\d+)\s*(info|note)/i);
  const hc = summary.match(/(\d+)\s*high\/critical/i);
  if (hc && high === 0 && critical === 0) {
    high = Number(hc[1]);
  }
  let total = critical + high + medium + low + info + unknown;
  const totalMatch = summary.match(/(\d+)\s*total/i);
  if (totalMatch) {
    const declared = Number(totalMatch[1]);
    if (declared > total) {
      unknown += declared - total;
      total = declared;
    }
  }
  return { critical, high, medium, low, info, unknown, total };
}

function packIdFor(changeEventId: string, generatedAt: string): string {
  const digest = createHash("sha256")
    .update(`${changeEventId}|${generatedAt}|security_bill_of_health`)
    .digest("hex")
    .slice(0, 12);
  return `rpt-pack-${digest}`;
}

function executionMatchesChange(
  record: AutomationExecutionRecord,
  changeEventId: string,
): boolean {
  const meta = record.target.metadata ?? {};
  if (meta.changeEventId === changeEventId) return true;
  if (meta.change === changeEventId) return true;
  const hay = `${record.resultSummary ?? ""} ${JSON.stringify(meta)}`;
  return hay.includes(changeEventId);
}

function toolFromExecution(
  record: AutomationExecutionRecord,
): ReportPackSecurityToolId | undefined {
  const meta = record.target.metadata ?? {};
  return (
    detectSecurityTool(meta.tool) ??
    detectSecurityTool(meta.domain) ??
    detectSecurityTool(meta.providerTool) ??
    detectSecurityTool(record.target.name) ??
    detectSecurityTool(record.resultSummary) ??
    (record.providerId === "security" || record.providerId === "codequality"
      ? (detectSecurityTool(record.target.entry) ??
        detectSecurityTool(Object.values(meta).join(" ")))
      : undefined)
  );
}

function toolFromEvidenceNote(
  note: string | undefined,
): ReportPackSecurityToolId | undefined {
  return detectSecurityTool(note);
}

/**
 * Pure composition — unit-tested; never sets sign-off or auto-certify.
 */
export function composeReportPack(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly generatedAt: string;
  readonly executions?: readonly AutomationExecutionRecord[];
  readonly evidenceLinks?: readonly CertificationEvidenceLink[];
  readonly dispatches?: readonly VerificationDispatchRecord[];
  readonly certification?: CertificationEvaluation;
  readonly toolList?: readonly ReportPackSecurityToolId[];
  /** Optional detailed findings (from artefacts / parsers). */
  readonly findings?: readonly ReportFinding[];
  readonly engagementPartial?: Partial<ReportEngagement>;
}): ReportPack {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("report_pack.change_id_required");
  }

  const toolList = input.toolList ?? REPORT_PACK_SECURITY_TOOLS;
  const executions = (input.executions ?? []).filter((row) =>
    executionMatchesChange(row, changeEventId),
  );
  const evidenceLinks = input.evidenceLinks ?? [];
  const dispatches = input.dispatches ?? [];

  const evidenceSummaries: ReportPackEvidenceSummary[] = evidenceLinks.map((link) => ({
    evidenceId: link.evidenceId,
    domain: link.domain,
    ref: link.ref,
    note: link.note,
    toolId: toolFromEvidenceNote(link.note),
  }));

  const executionSummaries: ReportPackExecutionSummary[] = executions.map((row) => {
    const toolId = toolFromExecution(row);
    return {
      executionId: row.executionId,
      providerId: row.providerId,
      state: row.state,
      resultSummary: row.resultSummary,
      toolId,
      findingCounts: parseSeverityRollup({
        resultSummary: row.resultSummary,
        metadata: row.target.metadata,
      }),
    };
  });

  const tools: ReportPackToolSummary[] = toolList.map((toolId) => {
    const toolExecs = executionSummaries.filter((row) => row.toolId === toolId);
    const toolEvidence = evidenceSummaries.filter((row) => row.toolId === toolId);
    const securityDomainEvidence =
      toolId === "trivy" || toolId === "semgrep"
        ? evidenceSummaries.filter(
            (row) =>
              !row.toolId &&
              (row.domain === "security" || row.domain === "codequality"),
          )
        : [];
    const dispatchHit = dispatches.some((row) =>
      row.domains.map((d) => d.toLowerCase()).includes(toolId),
    );
    const findingCounts = sumSeverityRollups(toolExecs.map((row) => row.findingCounts));
    let status: ReportPackToolStatus = "not_run";
    if (toolExecs.some((row) => row.state === "failed")) status = "failed";
    else if (toolExecs.some((row) => row.state === "completed")) status = "completed";
    else if (toolEvidence.length > 0 || securityDomainEvidence.length > 0)
      status = "evidence_present";
    else if (dispatchHit) status = "dispatched";

    const summaryParts = [
      ...toolExecs.map((row) => row.resultSummary).filter(Boolean),
      ...toolEvidence.map((row) => row.note).filter(Boolean),
    ];

    return {
      toolId,
      label: TOOL_LABELS[toolId],
      status,
      executionIds: toolExecs.map((row) => row.executionId),
      evidenceIds: [
        ...toolEvidence.map((row) => row.evidenceId),
        ...securityDomainEvidence.map((row) => row.evidenceId),
      ],
      summary: summaryParts[0],
      findingCounts,
    };
  });

  // Attribute unscoped security-domain evidence findings once (not per tool).
  const unscopedSecurity = evidenceSummaries.filter(
    (row) => !row.toolId && (row.domain === "security" || row.domain === "codequality"),
  );

  const execFindings = extractFindingsFromExecutions(executions);
  const findings = sortFindings(
    input.findings && input.findings.length > 0 ? input.findings : execFindings,
  );
  const findingsRollup = findingsToRollup(findings);

  const severityRollup =
    findingsRollup.total > 0
      ? findingsRollup
      : sumSeverityRollups([
          ...executionSummaries.map((row) => row.findingCounts),
          ...(executionSummaries.length === 0 && unscopedSecurity.length > 0
            ? [
                {
                  ...emptySeverityRollup(),
                  unknown: unscopedSecurity.length,
                  total: unscopedSecurity.length,
                },
              ]
            : []),
        ]);

  // Prefer detailed per-tool counts from findings when present
  const toolsWithDetail: ReportPackToolSummary[] = tools.map((tool) => {
    const toolFindings = findings.filter((f) => f.toolId === tool.toolId);
    if (toolFindings.length === 0) return tool;
    return {
      ...tool,
      findingCounts: findingsToRollup(toolFindings),
      summary:
        tool.summary ??
        `${toolFindings.length} detailed finding(s) — C${findingsToRollup(toolFindings).critical}/H${findingsToRollup(toolFindings).high}/M${findingsToRollup(toolFindings).medium}`,
    };
  });

  const engagement = buildEngagement({
    changeEventId,
    partial: {
      ...extractEngagementFromExecutions(executions),
      ...input.engagementPartial,
    },
    toolStatuses: toolsWithDetail.map((t) => ({
      toolId: t.toolId,
      label: t.label,
      status: t.status,
    })),
  });

  const actions = buildActionItems(findings);
  const assessment = buildOverallAssessment({
    findings,
    toolStatuses: toolsWithDetail.map((t) => ({
      toolId: t.toolId,
      status: t.status,
      label: t.label,
    })),
  });

  const residualStatement =
    assessment.band === "requires_remediation"
      ? `DRAFT residual risk: ${assessment.headline} Clear P0 actions (${actions.filter((a) => a.priority === "P0").length}) or document explicit acceptance before human publish. This pack does not certify the change.`
      : assessment.band === "favourable"
        ? `DRAFT residual risk: posture looks favourable for executed controls; remaining low/info items and any unrun tools remain human judgment. This pack does not certify the change.`
        : `DRAFT residual risk: ${assessment.headline} Human residual-risk statement and sign-off required before publish. This pack does not certify the change.`;

  const cert = input.certification;

  return {
    packId: packIdFor(changeEventId, input.generatedAt),
    kind: "security_bill_of_health",
    status: "draft",
    changeEventId,
    tenantId: input.tenantId,
    generatedAt: input.generatedAt,
    advisory: true,
    autoCertified: false,
    tools: toolsWithDetail,
    severityRollup,
    engagement,
    findings,
    actions,
    assessment,
    evidenceSummaries,
    executionSummaries,
    dispatchSummaries: dispatches.map((row) => ({
      dispatchId: row.dispatchId,
      pack: row.pack,
      status: row.status,
      domains: row.domains,
      assistOrigin: row.assistOrigin,
    })),
    residualRisk: {
      placeholder: true,
      statement: residualStatement,
    },
    signOff: {
      signed: false,
    },
    certificationContext: cert
      ? {
          evaluationId: cert.evaluationId,
          readiness: cert.readiness,
          score: cert.score,
          humanDecision: cert.humanDecision?.outcome,
        }
      : undefined,
  };
}

export async function getReportPack(input: {
  readonly tenantId: string;
  readonly changeEventId: string;
  readonly deps?: ReportPackSourceDeps;
}): Promise<ReportPack> {
  const changeEventId = input.changeEventId.trim();
  if (!changeEventId) {
    throw new Error("report_pack.change_id_required");
  }

  const deps = input.deps ?? {};
  const now = deps.now ?? (() => new Date());

  const listExecutions =
    deps.listExecutions ??
    ((tenantId: string) => getQepAutomationRuntime().listExecutions(tenantId));

  const listEvidenceLinks =
    deps.listEvidenceLinks ??
    (async (tenantId: string, id: string) => {
      const collected = await collectEvidenceForChange(tenantId, id);
      return collected.evidenceLinks;
    });

  const listDispatches =
    deps.listDispatches ??
    ((tenantId: string, id: string) =>
      listVerificationDispatches({ tenantId, changeEventId: id, limit: 100 }));

  const getCertification =
    deps.getCertification ??
    ((tenantId: string, id: string) => getCertificationByChange(tenantId, id));

  let evidenceLinks: readonly CertificationEvidenceLink[] = [];
  try {
    evidenceLinks = await listEvidenceLinks(input.tenantId, changeEventId);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("change_not_found")) {
      throw new Error("report_pack.change_not_found");
    }
    throw error;
  }

  const [executions, certification] = await Promise.all([
    listExecutions(input.tenantId),
    getCertification(input.tenantId, changeEventId),
  ]);
  const dispatches = listDispatches(input.tenantId, changeEventId);

  const matched = executions.filter((row) =>
    executionMatchesChange(row, changeEventId),
  );
  let findings = extractFindingsFromExecutions(matched);
  let engagementPartial = extractEngagementFromExecutions(matched);
  // Enrich from APZTOOLS cluster artefacts when execution payloads were truncated
  if (findings.length < 5) {
    const fromDisk = loadFindingsFromArtefactRoot(resolveArtefactRoot());
    if (fromDisk.findings.length > findings.length) {
      findings = fromDisk.findings;
      engagementPartial = { ...engagementPartial, ...fromDisk.engagement };
    }
  }

  return composeReportPack({
    tenantId: input.tenantId,
    changeEventId,
    generatedAt: now().toISOString(),
    executions,
    evidenceLinks,
    dispatches,
    certification,
    findings,
    engagementPartial,
  });
}

/** Markdown draft for auditors / first proof (`?format=markdown`). */
export function renderReportPackMarkdown(pack: ReportPack): string {
  const statusLabel = pack.status === "published" ? "PUBLISHED" : "DRAFT";
  const lines: string[] = [
    `# Security Bill of Health (${statusLabel})`,
    ``,
    pack.status === "published"
      ? `> Human-published evidence pack — still not an automatic GO/NO-GO. Certification remains a separate human decision.`
      : `> Advisory only — humans publish. Never auto-certified. Covers both favourable and adverse outcomes.`,
    ``,
    `| Field | Value |`,
    `| ----- | ----- |`,
    `| Pack ID | \`${pack.packId}\` |`,
    `| Change | \`${pack.changeEventId}\` |`,
    `| Assessment | **${pack.assessment.band}** — ${pack.assessment.headline} |`,
    `| Status | **${pack.status}** |`,
    `| Generated | ${pack.generatedAt} |`,
    `| Auto-certified | ${pack.autoCertified} |`,
    `| Sign-off | ${pack.signOff.signed ? "signed" : "unsigned"} |`,
    pack.signOff.decision ? `| Decision | ${pack.signOff.decision} |` : undefined,
    ``,
    `## 1. Executive summary`,
    ``,
    pack.assessment.narrative,
    ``,
    `### What went well`,
    ``,
    ...pack.assessment.strengths.map((s) => `- ${s}`),
    ``,
    `### What needs attention`,
    ``,
    ...pack.assessment.concerns.map((c) => `- ${c}`),
    ``,
    `## 2. Engagement scope — what was tested`,
    ``,
    pack.engagement.scopeSummary,
    ``,
    `| Tool | Purpose | Status |`,
    `| ---- | ------- | ------ |`,
    ...pack.engagement.methodology.map(
      (m) => `| ${m.label} | ${m.purpose} | **${m.status}** |`,
    ),
    ``,
    `## 3. Severity rollup`,
    ``,
    `| Critical | High | Medium | Low | Info | Unknown | Total |`,
    `| -------- | ---- | ------ | --- | ---- | ------- | ----- |`,
    `| ${pack.severityRollup.critical} | ${pack.severityRollup.high} | ${pack.severityRollup.medium} | ${pack.severityRollup.low} | ${pack.severityRollup.info} | ${pack.severityRollup.unknown} | ${pack.severityRollup.total} |`,
    ``,
    `## 4. Tool results`,
    ``,
  ];

  for (const tool of pack.tools) {
    lines.push(
      `### ${tool.label} (\`${tool.toolId}\`)`,
      ``,
      `- Status: **${tool.status}**`,
      `- Findings: C${tool.findingCounts.critical}/H${tool.findingCounts.high}/M${tool.findingCounts.medium}/L${tool.findingCounts.low}/I${tool.findingCounts.info}`,
      tool.summary ? `- Summary: ${tool.summary}` : `- Summary: _(none)_`,
      tool.executionIds.length
        ? `- Executions: ${tool.executionIds.map((id) => `\`${id}\``).join(", ")}`
        : `- Executions: _(none)_`,
      ``,
    );
  }

  lines.push(`## 5. Detailed findings (what was found)`, ``);
  if (pack.findings.length === 0) {
    lines.push(
      `_No detailed findings parsed._ If tools completed cleanly, this may be a favourable result — still confirm coverage in §2.`,
      ``,
    );
  } else {
    const show = pack.findings.slice(0, 60);
    for (const f of show) {
      lines.push(
        `### [${f.severity.toUpperCase()}] ${f.title}`,
        ``,
        `- Tool: \`${f.toolId}\` · ID: \`${f.id}\``,
        f.location ? `- Location: \`${f.location}\`` : undefined,
        ``,
        f.description,
        ``,
        `**Recommended action:** ${f.recommendation}`,
        ``,
      );
    }
    if (pack.findings.length > show.length) {
      lines.push(
        `_…and ${pack.findings.length - show.length} additional finding(s) omitted from markdown; see JSON pack._`,
        ``,
      );
    }
  }

  lines.push(`## 6. Remediation plan — what needs to happen`, ``);
  if (pack.actions.length === 0) {
    lines.push(
      `_No prioritised remediation items._ Maintain monitoring; human may still require hygiene fixes.`,
      ``,
    );
  } else {
    lines.push(
      `| Priority | Severity | Tool | Action |`,
      `| -------- | -------- | ---- | ------ |`,
    );
    for (const a of pack.actions.slice(0, 40)) {
      lines.push(
        `| ${a.priority} | ${a.severity} | ${a.toolId} | **${a.title}** — ${a.recommendation} |`,
      );
    }
    lines.push(``);
  }

  lines.push(`## 7. Dispatches (F10/F11)`, ``);
  if (pack.dispatchSummaries.length === 0) {
    lines.push(`_No verification dispatches recorded._`, ``);
  } else {
    for (const row of pack.dispatchSummaries) {
      lines.push(
        `- \`${row.dispatchId}\` · ${row.status} · ${row.pack ?? "pack?"} · ${row.domains.join(", ")} · ${row.assistOrigin}`,
      );
    }
    lines.push(``);
  }

  if (pack.certificationContext) {
    lines.push(
      `## 8. Certification context (read-only)`,
      ``,
      `- Evaluation: \`${pack.certificationContext.evaluationId ?? "—"}\``,
      `- Readiness: ${pack.certificationContext.readiness ?? "—"}`,
      `- Score: ${pack.certificationContext.score ?? "—"}`,
      `- Human decision: ${pack.certificationContext.humanDecision ?? "none"}`,
      ``,
    );
  }

  lines.push(
    `## Residual risk (human)`,
    ``,
    pack.residualRisk.statement,
    ``,
    `## Sign-off`,
    ``,
    pack.signOff.signed
      ? `Signed by ${pack.signOff.signerName ?? "?"} (${pack.signOff.signerRole ?? "?"}) at ${pack.signOff.signedAt ?? "?"}${pack.signOff.decision ? ` · decision: **${pack.signOff.decision}**` : ""}${pack.signOff.notes ? `\n\nNotes: ${pack.signOff.notes}` : ""}`
      : `**Unsigned** — required before publish. This pack must not be treated as a certification decision.`,
    ``,
  );

  return lines.filter((line) => line !== undefined).join("\n");
}

function escapeTypstText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/</g, "\\<")
    .replace(/>/g, "\\>")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]")
    .replace(/\r?\n/g, " \\ ");
}

function typstBulletList(items: readonly string[]): string {
  if (items.length === 0) return "_None recorded._";
  return items.map((item) => `- ${escapeTypstText(item)}`).join("\n");
}

const DEFAULT_TYPST_TEMPLATE = `// fallback — prefer apps/web/lib/qep/report-templates/security-bill-of-health.typ
#set document(title: "Security Bill of Health (DRAFT)")
#set page(margin: 1.8cm)
#set text(size: 9.5pt)
#align(center)[#text(16pt, weight: "bold")[Security Bill of Health (DRAFT)]]
= Summary
{{assessmentNarrative}}
= Scope
{{scopeSummary}}
= Findings
{{findingsBlock}}
= Actions
{{actionsBlock}}
= Sign-off
{{signOffLine}}
`;

export function resolveTypstTemplatePath(): string {
  const fromCwd = join(
    process.cwd(),
    "apps/web/lib/qep/report-templates/security-bill-of-health.typ",
  );
  if (existsSync(fromCwd)) return fromCwd;
  // Next.js may run with cwd = apps/web
  const fromApp = join(
    process.cwd(),
    "lib/qep/report-templates/security-bill-of-health.typ",
  );
  return fromApp;
}

export function renderReportPackTypst(
  pack: ReportPack,
  templateSource?: string,
): string {
  const template = templateSource ?? DEFAULT_TYPST_TEMPLATE;
  const severityLine = `Critical ${pack.severityRollup.critical} · High ${pack.severityRollup.high} · Medium ${pack.severityRollup.medium} · Low ${pack.severityRollup.low} · Info ${pack.severityRollup.info} · Unknown ${pack.severityRollup.unknown}`;

  const methodologyBlock = pack.engagement.methodology
    .map(
      (m) =>
        `- *${escapeTypstText(m.label)}* (${escapeTypstText(m.status)}): ${escapeTypstText(m.purpose)}`,
    )
    .join("\n");

  const toolsBlock = pack.tools
    .map((tool) => {
      const counts = `C${tool.findingCounts.critical}/H${tool.findingCounts.high}/M${tool.findingCounts.medium}/L${tool.findingCounts.low}`;
      return (
        `- *${escapeTypstText(tool.label)}*: ${escapeTypstText(tool.status)} · ${counts}` +
        (tool.summary ? ` \\ ${escapeTypstText(tool.summary.slice(0, 180))}` : "")
      );
    })
    .join("\n");

  const findingLines = pack.findings.slice(0, 45).map((f) => {
    const loc = f.location ? ` \\ Location: ${escapeTypstText(f.location)}` : "";
    return (
      `*${f.severity.toUpperCase()}* — ${escapeTypstText(f.title.slice(0, 120))} \\\n` +
      `Tool: ${f.toolId} · ${f.id}${loc} \\\n` +
      `${escapeTypstText(f.description.slice(0, 400))} \\\n` +
      `*Action:* ${escapeTypstText(f.recommendation.slice(0, 280))}\n\n`
    );
  });
  const findingsBlock =
    findingLines.length > 0
      ? findingLines.join("\n") +
        (pack.findings.length > 45
          ? `\n_…${pack.findings.length - 45} more finding(s) in JSON export._\n`
          : "")
      : "_No detailed findings parsed — confirm tool coverage; may indicate a clean run or incomplete ingest._";

  const actionsBlock =
    pack.actions.length === 0
      ? "_No prioritised remediation items from detailed findings._"
      : pack.actions
          .slice(0, 35)
          .map(
            (a) =>
              `- *${a.priority}* / ${a.severity} / ${a.toolId}: ${escapeTypstText(a.title.slice(0, 100))} — ${escapeTypstText(a.recommendation.slice(0, 220))}`,
          )
          .join("\n");

  const replacements: Record<string, string> = {
    changeEventId: pack.changeEventId,
    packId: pack.packId,
    generatedAt: pack.generatedAt,
    assessmentBand: pack.assessment.band,
    assessmentHeadline: escapeTypstText(pack.assessment.headline),
    assessmentNarrative: escapeTypstText(pack.assessment.narrative),
    strengthsBlock: typstBulletList(pack.assessment.strengths),
    concernsBlock: typstBulletList(pack.assessment.concerns),
    scopeSummary: escapeTypstText(pack.engagement.scopeSummary),
    methodologyBlock: methodologyBlock || "- _(none)_",
    severityTotal: String(pack.severityRollup.total),
    severityLine,
    toolsBlock: toolsBlock || "- _(no tools)_",
    findingsBlock,
    actionsBlock,
    residualRisk: escapeTypstText(pack.residualRisk.statement),
    signOffLine: pack.signOff.signed
      ? escapeTypstText(
          `Signed by ${pack.signOff.signerName ?? "?"}${pack.signOff.signerRole ? ` (${pack.signOff.signerRole})` : ""}${pack.signOff.signedAt ? ` at ${pack.signOff.signedAt}` : ""}${pack.signOff.decision ? ` · ${pack.signOff.decision}` : ""}`,
        )
      : "Unsigned — human sign-off required before publish. Not a certification decision.",
    docSubtitle:
      pack.status === "published"
        ? "PUBLISHED — human-signed evidence pack"
        : "DRAFT — advisory evidence pack",
    statusLine:
      pack.status === "published"
        ? `published · autoCertified=false · signed · ${pack.signOff.decision ?? "decision_recorded"}`
        : "draft · autoCertified=false · unsigned",
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_m, key: string) => {
    return replacements[key] ?? "";
  });
}

export function resolveTypstBinary(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const configured = env.APZHUB_TYPST_BIN?.trim();
  if (configured && existsSync(configured)) return configured;
  const local = join(process.cwd(), "tooling/bin/typst");
  if (existsSync(local)) return local;
  return undefined;
}

function runTypstCompile(input: {
  readonly binary: string;
  readonly sourcePath: string;
  readonly outputPath: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  return new Promise((resolve) => {
    const child = spawn(input.binary, ["compile", input.sourcePath, input.outputPath], {
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString("utf8");
    });
    child.on("error", (error) => {
      resolve({ ok: false, reason: error.message });
    });
    child.on("close", (code) => {
      if (code === 0) resolve({ ok: true });
      else
        resolve({
          ok: false,
          reason: stderr.trim() || `typst exited ${code ?? "unknown"}`,
        });
    });
  });
}

export type ReportPackPdfResult =
  | {
      readonly ok: true;
      readonly pdfPath: string;
      readonly bytes: Buffer;
      readonly typstBinary: string;
    }
  | {
      readonly ok: false;
      readonly reason: string;
      /** Clear scaffold TODO when typst is missing. */
      readonly todo?: string;
    };

/**
 * Compile draft PDF via Typst when a binary is available.
 * TODO(F12): wire durable storage + audited publish workflow (human-only).
 */
export async function tryCompileReportPackPdf(
  pack: ReportPack,
  options?: {
    readonly typstBinary?: string;
    readonly workDir?: string;
    readonly templatePath?: string;
    readonly env?: NodeJS.ProcessEnv;
  },
): Promise<ReportPackPdfResult> {
  const env = options?.env ?? process.env;
  const binary = options?.typstBinary ?? resolveTypstBinary(env);
  if (!binary) {
    return {
      ok: false,
      reason: "typst_binary_not_found",
      todo: "Install Typst (https://typst.app) or set APZHUB_TYPST_BIN / tooling/bin/typst",
    };
  }

  let templateSource = DEFAULT_TYPST_TEMPLATE;
  const templatePath = options?.templatePath ?? resolveTypstTemplatePath();
  if (existsSync(templatePath)) {
    templateSource = await readFile(templatePath, "utf8");
  }

  const workDir =
    options?.workDir ??
    join(process.cwd(), "apps/web/.data/qep-report-packs", pack.packId);
  await mkdir(workDir, { recursive: true });
  const sourcePath = join(workDir, "security-bill-of-health.typ");
  const pdfPath = join(workDir, "security-bill-of-health.pdf");
  const typstSource = renderReportPackTypst(pack, templateSource);
  await writeFile(sourcePath, typstSource, "utf8");

  const compiled = await runTypstCompile({ binary, sourcePath, outputPath: pdfPath });
  if (!compiled.ok) {
    return { ok: false, reason: compiled.reason };
  }
  const bytes = await readFile(pdfPath);
  return { ok: true, pdfPath, bytes, typstBinary: binary };
}
