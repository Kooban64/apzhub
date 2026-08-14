/**
 * APZPEN assessment report packs — executive / technical / compliance.
 * Markdown + JSON from the same engagement SoR (not a PDF factory).
 */

import type { Engagement, Finding, SecurityPosture } from "./types";

export type ReportPackKind = "executive" | "technical" | "compliance";

export type ReportPack = {
  readonly kind: ReportPackKind;
  readonly engagementId: string;
  readonly generatedAt: string;
  readonly title: string;
  readonly markdown: string;
  readonly json: Record<string, unknown>;
};

function openFindings(findings: readonly Finding[]): Finding[] {
  return findings.filter(
    (f) =>
      f.status !== "closed" &&
      f.status !== "risk_accepted" &&
      f.status !== "false_positive" &&
      f.status !== "retest_passed",
  );
}

function bySeverity(findings: readonly Finding[]): string {
  const order = ["critical", "high", "medium", "low", "info"] as const;
  return order
    .map((s) => `${s}: ${findings.filter((f) => f.severity === s).length}`)
    .join(" · ");
}

export function buildReportPack(input: {
  readonly kind: ReportPackKind;
  readonly engagement: Engagement;
  readonly findings: readonly Finding[];
  readonly posture: SecurityPosture;
}): ReportPack {
  const ts = new Date().toISOString();
  const eng = input.engagement;
  const open = openFindings(input.findings);
  const titleBase = `${eng.customerName} — ${eng.applicationName}`;

  if (input.kind === "executive") {
    const markdown = [
      `# Executive Security Assurance Summary`,
      ``,
      `**Customer:** ${eng.customerName}`,
      `**Application:** ${eng.applicationName}`,
      `**Engagement:** ${eng.title}`,
      `**Environment:** ${eng.environment}`,
      `**Assessment position:** ${input.posture.assessmentPosition.toUpperCase()}`,
      `**Engagement status:** ${eng.status}`,
      `**Generated:** ${ts}`,
      ``,
      `## Position`,
      ``,
      `Open findings: **${input.posture.openCount}** (critical ${input.posture.critical} / high ${input.posture.high}).`,
      `RoE approved: **${input.posture.roeApproved ? "yes" : "no"}**. Scope targets: **${input.posture.scopeCount}**.`,
      ``,
      `## Severity rollup`,
      ``,
      bySeverity(input.findings),
      ``,
      `## Top open risks`,
      ``,
      ...(open.length === 0
        ? ["_No open findings._"]
        : open
            .slice()
            .sort((a, b) => {
              const rank = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
              return rank[a.severity] - rank[b.severity];
            })
            .slice(0, 8)
            .map(
              (f) =>
                `- **${f.severity.toUpperCase()}** — ${f.title}${f.remediation ? ` _(remediate: ${f.remediation})_` : ""}`,
            )),
      ``,
      `## Certification`,
      ``,
      eng.status === "certified"
        ? "Assessment **certified** — humans certified; tools did not auto-certify."
        : "Not certified. Resolve open critical findings and run certify.",
      ``,
      `_APZPEN Security Assurance — CE/OSS providers underneath._`,
    ].join("\n");

    return {
      kind: "executive",
      engagementId: eng.engagementId,
      generatedAt: ts,
      title: `Executive — ${titleBase}`,
      markdown,
      json: {
        kind: "executive",
        engagementId: eng.engagementId,
        customerName: eng.customerName,
        applicationName: eng.applicationName,
        assessmentPosition: input.posture.assessmentPosition,
        status: eng.status,
        posture: input.posture,
        openTitles: open.slice(0, 20).map((f) => ({
          severity: f.severity,
          title: f.title,
          status: f.status,
        })),
        generatedAt: ts,
      },
    };
  }

  if (input.kind === "technical") {
    const markdown = [
      `# Technical Security Assessment Report`,
      ``,
      `**Engagement:** ${eng.title}`,
      `**Methodology:** ${eng.methodology.join(", ") || "—"}`,
      `**Schedule:** ${eng.scheduleMode}`,
      `**Generated:** ${ts}`,
      ``,
      `## Rules of Engagement`,
      ``,
      `- Status: ${eng.roe.status}`,
      `- Allowed: ${eng.roe.allowedTechniques.join("; ") || "—"}`,
      `- Restricted: ${eng.roe.restrictedTechniques.join("; ") || "—"}`,
      `- Emergency: ${eng.roe.emergencyContact ?? "—"}`,
      ``,
      `## Scope`,
      ``,
      ...eng.scope.map(
        (s) =>
          `- \`${s.kind}\` **${s.label}** — \`${s.identifier}\` (${s.environment})`,
      ),
      ``,
      `## Findings`,
      ``,
      ...input.findings.map((f) =>
        [
          `### [${f.severity.toUpperCase()}] ${f.title}`,
          ``,
          `- Status: ${f.status}`,
          `- Provider: ${f.providerTool ?? "manual"}`,
          `- Location: ${f.location ?? "—"}`,
          `- CWE: ${f.cwe ?? "—"} · OWASP: ${f.owaspCategory ?? "—"}`,
          ``,
          f.description,
          ``,
          f.remediation ? `**Remediation:** ${f.remediation}` : "",
          ``,
        ].join("\n"),
      ),
    ].join("\n");

    return {
      kind: "technical",
      engagementId: eng.engagementId,
      generatedAt: ts,
      title: `Technical — ${titleBase}`,
      markdown,
      json: {
        kind: "technical",
        engagement: eng,
        findings: input.findings,
        posture: input.posture,
        generatedAt: ts,
      },
    };
  }

  // compliance
  const markdown = [
    `# Compliance Evidence Pack`,
    ``,
    `**Customer:** ${eng.customerName}`,
    `**Application:** ${eng.applicationName}`,
    `**Engagement ID:** ${eng.engagementId}`,
    `**Generated:** ${ts}`,
    ``,
    `## Control narrative`,
    ``,
    `This pack evidences a governed security assurance engagement under APZPEN.`,
    `Automated CE/OSS providers and human testing feed a single finding lifecycle.`,
    ``,
    `## Gate checks`,
    ``,
    `| Check | Result |`,
    `| ----- | ------ |`,
    `| RoE approved | ${input.posture.roeApproved ? "PASS" : "FAIL"} |`,
    `| Scope defined | ${input.posture.scopeCount > 0 ? "PASS" : "FAIL"} |`,
    `| Open critical | ${input.posture.critical === 0 ? "PASS" : "FAIL"} |`,
    `| Assessment position | ${input.posture.assessmentPosition} |`,
    `| Certified | ${eng.status === "certified" ? "YES" : "NO"} |`,
    ``,
    `## Finding inventory (audit)`,
    ``,
    ...input.findings.map(
      (f) =>
        `- \`${f.findingId}\` [${f.severity}/${f.status}] ${f.title} _(provider: ${f.providerTool ?? "manual"})_`,
    ),
    ``,
    `## Attestation`,
    ``,
    `Scanners never auto-certify. Certification is a human assessment decision.`,
  ].join("\n");

  return {
    kind: "compliance",
    engagementId: eng.engagementId,
    generatedAt: ts,
    title: `Compliance — ${titleBase}`,
    markdown,
    json: {
      kind: "compliance",
      engagementId: eng.engagementId,
      gates: {
        roeApproved: input.posture.roeApproved,
        scopeDefined: input.posture.scopeCount > 0,
        noOpenCritical: input.posture.critical === 0,
        assessmentPosition: input.posture.assessmentPosition,
        certified: eng.status === "certified",
      },
      findings: input.findings.map((f) => ({
        findingId: f.findingId,
        severity: f.severity,
        status: f.status,
        title: f.title,
        providerTool: f.providerTool,
      })),
      generatedAt: ts,
    },
  };
}
