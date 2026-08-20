/**
 * F12 — extract substantive findings for Security Bill of Health.
 * Parses SARIF / ZAP / Nuclei / Greenbone / simplified findings arrays.
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { AutomationExecutionRecord } from "@apzhub/platform-automation";

import type { ReportPackSecurityToolId, SeverityRollup } from "./report-pack";

import type { EnvVars } from "@/lib/env-vars";
export type FindingSeverity =
  "critical" | "high" | "medium" | "low" | "info" | "unknown";

export type ReportFinding = {
  readonly id: string;
  readonly toolId: ReportPackSecurityToolId | "other";
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly description: string;
  readonly location?: string;
  readonly recommendation: string;
  readonly evidenceRef?: string;
};

export type ReportEngagement = {
  readonly repositoryFullName?: string;
  readonly sha?: string;
  readonly targetUrl?: string;
  readonly hostIp?: string;
  readonly scopeSummary: string;
  readonly methodology: readonly {
    readonly toolId: ReportPackSecurityToolId | string;
    readonly label: string;
    readonly purpose: string;
    readonly status: string;
  }[];
};

export type ReportActionItem = {
  readonly priority: "P0" | "P1" | "P2" | "P3";
  readonly severity: FindingSeverity;
  readonly title: string;
  readonly recommendation: string;
  readonly toolId: string;
  readonly relatedFindingIds: readonly string[];
};

export type OverallAssessmentBand =
  "favourable" | "conditional" | "requires_remediation" | "incomplete";

export type OverallAssessment = {
  readonly band: OverallAssessmentBand;
  readonly headline: string;
  readonly narrative: string;
  readonly strengths: readonly string[];
  readonly concerns: readonly string[];
};

const TOOL_PURPOSE: Record<ReportPackSecurityToolId, string> = {
  trivy:
    "Filesystem / dependency vulnerability & secret scan (SCA) on repository snapshot",
  semgrep: "Static application security testing (SAST) for insecure code patterns",
  nuclei: "Template-based dynamic checks (DAST) against the authorized deployed URL",
  zap: "OWASP ZAP baseline — passive + light active web application scan",
  greenbone: "Network / host vulnerability assessment (OpenVAS) against authorized IP",
};

function severityRank(s: FindingSeverity): number {
  switch (s) {
    case "critical":
      return 5;
    case "high":
      return 4;
    case "medium":
      return 3;
    case "low":
      return 2;
    case "info":
      return 1;
    default:
      return 0;
  }
}

export function normalizeSeverity(raw: string | undefined): FindingSeverity {
  const s = (raw ?? "").toLowerCase().trim();
  if (!s) return "unknown";
  if (s === "critical" || s.startsWith("critical") || s.includes("critical"))
    return "critical";
  // SARIF "error" often maps to high for vulns
  if (s === "high" || s.startsWith("high") || s === "error") return "high";
  if (s === "medium" || s.startsWith("medium") || s === "warning" || s === "warn")
    return "medium";
  if (s === "low" || s.startsWith("low")) return "low";
  if (
    s === "info" ||
    s === "informational" ||
    s.startsWith("info") ||
    s === "note" ||
    s === "none"
  )
    return "info";
  // ZAP "Medium (High)" → take first token
  const first = s.split(/[\s(]/)[0];
  if (first === "critical") return "critical";
  if (first === "high") return "high";
  if (first === "medium") return "medium";
  if (first === "low") return "low";
  if (first === "informational" || first === "info") return "info";
  return "unknown";
}

function defaultRecommendation(
  toolId: string,
  severity: FindingSeverity,
  title: string,
): string {
  const t = title.toLowerCase();
  if (toolId === "trivy" || t.includes("cve-") || t.includes("package:")) {
    return "Upgrade the affected dependency to a fixed version (or apply vendor mitigation); re-run Trivy and confirm the CVE clears.";
  }
  if (toolId === "semgrep") {
    return "Review the flagged code path; apply the Semgrep rule guidance (sanitize input, avoid unsafe sinks); add a regression test.";
  }
  if (t.includes("content security policy") || t.includes("csp")) {
    return "Set a strict Content-Security-Policy header (default-src 'self'; tighten script-src) on all HTML responses.";
  }
  if (t.includes("clickjack") || t.includes("x-frame")) {
    return "Set X-Frame-Options: DENY (or CSP frame-ancestors 'none'/'self') on interactive responses.";
  }
  if (t.includes("strict-transport") || t.includes("hsts")) {
    return "Enable Strict-Transport-Security (e.g. max-age=31536000; includeSubDomains) on HTTPS responses.";
  }
  if (t.includes("permissions policy")) {
    return "Add a Permissions-Policy header limiting unused browser features.";
  }
  if (t.includes("x-powered-by") || t.includes("server leaks")) {
    return "Remove or suppress X-Powered-By / server version headers at the edge or app framework.";
  }
  if (t.includes("x-content-type")) {
    return "Set X-Content-Type-Options: nosniff on all responses.";
  }
  if (t.includes("missing security header")) {
    return "Implement the missing security header(s) at the reverse proxy or application middleware; re-scan with Nuclei/ZAP.";
  }
  if (severity === "info") {
    return "Record for awareness; no mandatory change unless policy requires hardening.";
  }
  return "Triage with the owning team; remediate or accept with documented residual risk before certification.";
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

export function findingsToRollup(findings: readonly ReportFinding[]): SeverityRollup {
  const counts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
    unknown: 0,
  };
  for (const f of findings) {
    counts[f.severity] += 1;
  }
  const total =
    counts.critical +
    counts.high +
    counts.medium +
    counts.low +
    counts.info +
    counts.unknown;
  return { ...counts, total };
}

export function parseSarifFindings(
  payload: unknown,
  toolId: ReportPackSecurityToolId,
  limit = 80,
): ReportFinding[] {
  const obj = asRecord(payload);
  if (!obj || !Array.isArray(obj.runs)) return [];
  const out: ReportFinding[] = [];
  let i = 0;
  for (const run of obj.runs) {
    const runObj = asRecord(run);
    if (!runObj) continue;
    const results = runObj.results;
    if (!Array.isArray(results)) continue;
    for (const result of results) {
      if (out.length >= limit) return out;
      const r = asRecord(result);
      if (!r) continue;
      const msgObj = asRecord(r.message);
      const text =
        (typeof msgObj?.text === "string" ? msgObj.text : undefined) ||
        (typeof r.message === "string" ? r.message : "") ||
        String(r.ruleId ?? "finding");
      const level = normalizeSeverity(
        typeof r.level === "string" ? r.level : undefined,
      );
      // Trivy SARIF uses level error for HIGH — keep as high unless message says CRITICAL
      let severity = level;
      if (text.toUpperCase().includes("SEVERITY: CRITICAL")) severity = "critical";
      else if (text.toUpperCase().includes("SEVERITY: HIGH")) severity = "high";
      else if (text.toUpperCase().includes("SEVERITY: MEDIUM")) severity = "medium";
      else if (text.toUpperCase().includes("SEVERITY: LOW")) severity = "low";
      else if (severity === "high" && toolId === "trivy") severity = "high";

      const locs = Array.isArray(r.locations) ? r.locations : [];
      let location: string | undefined;
      const loc0 = asRecord(locs[0]);
      const phys = asRecord(loc0?.physicalLocation);
      const art = asRecord(phys?.artifactLocation);
      if (typeof art?.uri === "string") {
        const region = asRecord(phys?.region);
        location =
          typeof region?.startLine === "number"
            ? `${art.uri}:${region.startLine}`
            : art.uri;
      }

      const ruleId = typeof r.ruleId === "string" ? r.ruleId : undefined;
      const title =
        ruleId && !text.startsWith(ruleId)
          ? `${ruleId}: ${text.split("\n")[0]!.slice(0, 120)}`
          : text.split("\n")[0]!.slice(0, 160);
      const description = text.slice(0, 1200);
      i += 1;
      out.push({
        id: `${toolId}-${i}`,
        toolId,
        severity,
        title,
        description,
        location,
        recommendation: defaultRecommendation(toolId, severity, title),
      });
    }
  }
  return out;
}

export function parseSimplifiedFindings(
  payload: unknown,
  toolId: ReportPackSecurityToolId,
  limit = 80,
): ReportFinding[] {
  const obj = asRecord(payload);
  if (!obj || !Array.isArray(obj.findings)) return [];
  const out: ReportFinding[] = [];
  let i = 0;
  for (const item of obj.findings) {
    if (out.length >= limit) break;
    const f = asRecord(item);
    if (!f) continue;
    i += 1;
    const severity = normalizeSeverity(
      typeof f.severity === "string"
        ? f.severity
        : typeof f.level === "string"
          ? f.level
          : typeof f.threat === "string"
            ? f.threat
            : undefined,
    );
    const title = String(f.message ?? f.name ?? f.ruleId ?? `Finding ${i}`).slice(
      0,
      160,
    );
    const description = String(f.description ?? f.message ?? f.name ?? title).slice(
      0,
      1200,
    );
    const location =
      typeof f.url === "string"
        ? f.url
        : typeof f.host === "string"
          ? f.host
          : typeof f.path === "string"
            ? f.path
            : undefined;
    out.push({
      id: `${toolId}-${i}`,
      toolId,
      severity,
      title,
      description,
      location,
      recommendation: defaultRecommendation(toolId, severity, title),
      evidenceRef: typeof f.ruleId === "string" ? f.ruleId : undefined,
    });
  }
  return out;
}

export function parseZapJsonFindings(payload: unknown, limit = 80): ReportFinding[] {
  const obj = asRecord(payload);
  if (!obj) return [];
  const alerts: unknown[] = [];
  if (Array.isArray(obj.site)) {
    for (const site of obj.site) {
      const s = asRecord(site);
      if (s && Array.isArray(s.alerts)) alerts.push(...s.alerts);
    }
  } else if (Array.isArray(obj.alerts)) {
    alerts.push(...obj.alerts);
  }
  const out: ReportFinding[] = [];
  let i = 0;
  for (const alert of alerts) {
    if (out.length >= limit) break;
    const a = asRecord(alert);
    if (!a) continue;
    i += 1;
    const severity = normalizeSeverity(
      typeof a.riskdesc === "string"
        ? a.riskdesc
        : typeof a.risk === "string"
          ? String(a.risk)
          : undefined,
    );
    const title = String(a.name ?? a.alert ?? `ZAP alert ${i}`).slice(0, 160);
    const description = String(a.desc ?? a.description ?? title)
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 1200);
    const solution = String(a.solution ?? "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    out.push({
      id: `zap-${i}`,
      toolId: "zap",
      severity,
      title: a.count ? `${title} (×${a.count})` : title,
      description: description || title,
      recommendation:
        solution.slice(0, 400) || defaultRecommendation("zap", severity, title),
      evidenceRef:
        typeof a.pluginid === "string" || typeof a.pluginid === "number"
          ? `zap-plugin-${a.pluginid}`
          : undefined,
    });
  }
  return out;
}

export function parseNucleiJsonl(text: string, limit = 80): ReportFinding[] {
  const out: ReportFinding[] = [];
  let i = 0;
  for (const line of text.split("\n")) {
    if (!line.trim() || out.length >= limit) continue;
    try {
      const o = JSON.parse(line) as Record<string, unknown>;
      const info = asRecord(o.info) ?? {};
      i += 1;
      const severity = normalizeSeverity(
        typeof info.severity === "string" ? info.severity : undefined,
      );
      const title = String(info.name ?? o["template-id"] ?? `Nuclei ${i}`).slice(
        0,
        160,
      );
      const matched = String(o["matched-at"] ?? o.host ?? "");
      const description = [
        title,
        matched ? `Matched: ${matched}` : "",
        typeof info.description === "string" ? info.description : "",
      ]
        .filter(Boolean)
        .join("\n")
        .slice(0, 1200);
      out.push({
        id: `nuclei-${i}`,
        toolId: "nuclei",
        severity,
        title,
        description,
        location: matched || undefined,
        recommendation: defaultRecommendation("nuclei", severity, title),
        evidenceRef:
          typeof o["template-id"] === "string" ? o["template-id"] : undefined,
      });
    } catch {
      // skip bad lines
    }
  }
  return out;
}

function decodePayloadFromExecution(
  record: AutomationExecutionRecord,
): unknown | undefined {
  const meta = record.target.metadata ?? {};
  const b64 = meta.reportBase64?.trim();
  if (b64) {
    try {
      return JSON.parse(Buffer.from(b64, "base64").toString("utf8")) as unknown;
    } catch {
      // ignore
    }
  }
  const entry = record.target.entry?.trim();
  if (entry) {
    try {
      return JSON.parse(entry) as unknown;
    } catch {
      // ignore
    }
  }
  for (const art of record.artifacts ?? []) {
    if (!art.contentBase64) continue;
    if (
      !art.name.includes("report") &&
      !art.name.includes("summary") &&
      art.kind !== "log"
    ) {
      continue;
    }
    try {
      const text = Buffer.from(art.contentBase64, "base64").toString("utf8");
      return JSON.parse(text) as unknown;
    } catch {
      // ignore
    }
  }
  return undefined;
}

function toolIdFromExecution(
  record: AutomationExecutionRecord,
): ReportPackSecurityToolId | undefined {
  const meta = record.target.metadata ?? {};
  const raw = (meta.tool ?? record.target.name ?? "").toLowerCase();
  for (const id of ["trivy", "semgrep", "nuclei", "zap", "greenbone"] as const) {
    if (raw.includes(id)) return id;
  }
  return undefined;
}

export function extractFindingsFromExecutions(
  executions: readonly AutomationExecutionRecord[],
): ReportFinding[] {
  const out: ReportFinding[] = [];
  for (const record of executions) {
    const toolId = toolIdFromExecution(record) ?? "trivy";
    const payload = decodePayloadFromExecution(record);
    if (!payload) continue;
    if (toolId === "zap") {
      out.push(...parseZapJsonFindings(payload));
      continue;
    }
    const obj = asRecord(payload);
    if (obj && Array.isArray(obj.findings)) {
      out.push(...parseSimplifiedFindings(payload, toolId));
      continue;
    }
    if (obj && Array.isArray(obj.runs)) {
      out.push(...parseSarifFindings(payload, toolId));
      continue;
    }
    if (obj && Array.isArray(obj.site)) {
      out.push(...parseZapJsonFindings(payload));
    }
  }
  return out;
}

export function extractEngagementFromExecutions(
  executions: readonly AutomationExecutionRecord[],
): Partial<ReportEngagement> {
  for (const record of executions) {
    const meta = record.target.metadata ?? {};
    if (meta.repositoryFullName || meta.targetUrl || meta.sha) {
      return {
        repositoryFullName: meta.repositoryFullName,
        sha: meta.sha,
        targetUrl: meta.targetUrl,
        hostIp: meta.hostIp,
      };
    }
  }
  return {};
}

/** Load cluster job artefacts from APZTOOLS out directories (optional enrichment). */
export function loadFindingsFromArtefactRoot(root: string): {
  readonly findings: ReportFinding[];
  readonly engagement: Partial<ReportEngagement>;
} {
  if (!existsSync(root)) return { findings: [], engagement: {} };
  const findings: ReportFinding[] = [];
  let engagement: Partial<ReportEngagement> = {};

  const tryFile = (path: string, loader: (text: string) => ReportFinding[]) => {
    if (!existsSync(path)) return;
    try {
      findings.push(...loader(readFileSync(path, "utf8")));
    } catch {
      // ignore
    }
  };

  // Prefer lovebloom folder if present; else first child with reports
  let dir = root;
  const lovebloom = join(root, "lovebloom");
  if (existsSync(lovebloom)) dir = lovebloom;
  else {
    try {
      const kids = readdirSync(root, { withFileTypes: true }).filter((d) =>
        d.isDirectory(),
      );
      for (const kid of kids) {
        const candidate = join(root, kid.name);
        if (existsSync(join(candidate, "trivy.sarif"))) {
          dir = candidate;
          break;
        }
      }
    } catch {
      // ignore
    }
  }

  tryFile(join(dir, "trivy.sarif"), (t) => parseSarifFindings(JSON.parse(t), "trivy"));
  tryFile(join(dir, "semgrep.sarif"), (t) =>
    parseSarifFindings(JSON.parse(t), "semgrep", 40),
  );
  tryFile(join(dir, "nuclei.jsonl"), (t) => parseNucleiJsonl(t));
  tryFile(join(dir, "zap-report.json"), (t) => parseZapJsonFindings(JSON.parse(t)));
  tryFile(join(dir, "greenbone-findings.json"), (t) =>
    parseSimplifiedFindings(JSON.parse(t), "greenbone"),
  );

  if (dir.includes("lovebloom")) {
    engagement = {
      ...engagement,
      repositoryFullName: "kooban-apzor/lovebloom",
      targetUrl: "https://lovebloom.apztdg.com",
      hostIp: "196.216.100.6",
    };
  }

  return { findings, engagement };
}

export function buildActionItems(
  findings: readonly ReportFinding[],
): ReportActionItem[] {
  // Group by title+tool for remediation list
  const groups = new Map<string, ReportFinding[]>();
  for (const f of findings) {
    if (f.severity === "info" && findings.length > 30) continue;
    const key = `${f.toolId}|${f.title.replace(/\s*\(×\d+\)\s*$/, "")}`;
    const list = groups.get(key) ?? [];
    list.push(f);
    groups.set(key, list);
  }
  const items: ReportActionItem[] = [];
  for (const [, group] of groups) {
    const top = [...group].sort(
      (a, b) => severityRank(b.severity) - severityRank(a.severity),
    )[0]!;
    if (top.severity === "info") continue;
    const priority: ReportActionItem["priority"] =
      top.severity === "critical" || top.severity === "high"
        ? "P0"
        : top.severity === "medium"
          ? "P1"
          : top.severity === "low"
            ? "P2"
            : "P3";
    items.push({
      priority,
      severity: top.severity,
      title: top.title.replace(/\s*\(×\d+\)\s*$/, ""),
      recommendation: top.recommendation,
      toolId: top.toolId,
      relatedFindingIds: group.map((g) => g.id),
    });
  }
  return items.sort((a, b) => {
    const p =
      { P0: 0, P1: 1, P2: 2, P3: 3 }[a.priority] -
      { P0: 0, P1: 1, P2: 2, P3: 3 }[b.priority];
    if (p !== 0) return p;
    return severityRank(b.severity) - severityRank(a.severity);
  });
}

export function buildOverallAssessment(input: {
  readonly findings: readonly ReportFinding[];
  readonly toolStatuses: readonly { toolId: string; status: string; label: string }[];
}): OverallAssessment {
  const rollup = findingsToRollup(input.findings);
  const runTools = input.toolStatuses.filter((t) =>
    ["completed", "failed", "evidence_present"].includes(t.status),
  );
  const missing = input.toolStatuses.filter((t) => t.status === "not_run");
  const strengths: string[] = [];
  const concerns: string[] = [];

  for (const t of runTools) {
    if (t.status === "completed" || t.status === "failed") {
      strengths.push(`${t.label} executed and evidence ingested for this change.`);
    }
  }
  if (rollup.critical === 0 && rollup.high === 0 && runTools.length > 0) {
    strengths.push(
      "No critical/high findings in the detailed finding set from completed DAST tools (verify SCA separately).",
    );
  }
  if (rollup.critical > 0) {
    concerns.push(
      `${rollup.critical} critical finding(s) require immediate remediation.`,
    );
  }
  if (rollup.high > 0) {
    concerns.push(
      `${rollup.high} high finding(s) should be fixed or formally risk-accepted before GO.`,
    );
  }
  if (rollup.medium > 0) {
    concerns.push(
      `${rollup.medium} medium finding(s) — plan fixes in the current release cycle.`,
    );
  }
  for (const t of runTools.filter((x) => x.status === "failed")) {
    concerns.push(
      `${t.label} completed with a failing security gate (findings present) — treat as remediation backlog.`,
    );
  }
  for (const t of missing) {
    concerns.push(
      `${t.label} not yet run — evidence pack incomplete for that control.`,
    );
  }

  let band: OverallAssessmentBand = "favourable";
  // Adverse findings always win over "incomplete coverage"
  if (rollup.critical > 0 || rollup.high > 0) band = "requires_remediation";
  else if (runTools.length === 0 && input.findings.length === 0) band = "incomplete";
  else if (missing.length >= 3 && runTools.length < 2 && input.findings.length === 0)
    band = "incomplete";
  else if (rollup.medium > 0 || missing.length > 0) band = "conditional";
  else if (runTools.length === 0) band = "incomplete";

  const headline =
    band === "favourable"
      ? "Favourable draft posture — no critical/high issues in the detailed set; residual hygiene only."
      : band === "conditional"
        ? "Conditional — medium issues and/or incomplete tool coverage; address before production claim."
        : band === "requires_remediation"
          ? "Requires remediation — critical/high findings present; do not treat as a clean bill of health."
          : "Incomplete — insufficient tool evidence to claim a security bill of health.";

  const narrative = [
    `This draft Security Bill of Health summarises ${input.findings.length} detailed finding(s) across ${runTools.length} tool result(s).`,
    band === "requires_remediation"
      ? "Outcome leans negative until P0 items are cleared or explicitly accepted with residual risk."
      : band === "favourable"
        ? "Outcome leans positive for the controls executed; keep monitoring and close remaining low/info items per policy."
        : band === "conditional"
          ? "Outcome is mixed: some controls look acceptable, but open medium findings or gaps block an unqualified clean report."
          : "Outcome cannot be asserted — run the missing security pack tools and regenerate this report.",
    "APZQEP never auto-certifies; a human must sign before this pack is published to stakeholders.",
  ].join(" ");

  return {
    band,
    headline,
    narrative,
    strengths: strengths.length
      ? strengths
      : ["No completed security tools recorded for this change yet."],
    concerns: concerns.length
      ? concerns
      : ["No material concerns parsed — confirm tool coverage is complete."],
  };
}

export function buildEngagement(input: {
  readonly changeEventId: string;
  readonly partial?: Partial<ReportEngagement>;
  readonly toolStatuses: readonly {
    toolId: ReportPackSecurityToolId;
    label: string;
    status: string;
  }[];
}): ReportEngagement {
  const repo = input.partial?.repositoryFullName;
  const url = input.partial?.targetUrl;
  const sha = input.partial?.sha;
  const hostIp = input.partial?.hostIp;
  const scopeParts = [
    repo ? `Repository: ${repo}` : undefined,
    sha ? `Revision: ${sha.slice(0, 12)}` : undefined,
    url ? `Authorized URL: ${url}` : undefined,
    hostIp ? `Host IP: ${hostIp}` : undefined,
    `Change: ${input.changeEventId}`,
  ].filter(Boolean);
  return {
    repositoryFullName: repo,
    sha,
    targetUrl: url,
    hostIp,
    scopeSummary:
      scopeParts.join(" · ") ||
      `Change ${input.changeEventId} — scope inferred from linked security executions only.`,
    methodology: input.toolStatuses.map((t) => ({
      toolId: t.toolId,
      label: t.label,
      purpose: TOOL_PURPOSE[t.toolId] ?? "Security verification control",
      status: t.status,
    })),
  };
}

export function sortFindings(findings: readonly ReportFinding[]): ReportFinding[] {
  return [...findings].sort((a, b) => {
    const d = severityRank(b.severity) - severityRank(a.severity);
    if (d !== 0) return d;
    return a.toolId.localeCompare(b.toolId);
  });
}

export function resolveArtefactRoot(env: EnvVars = process.env): string {
  const configured = env.APZTOOLS_ROOT?.trim();
  if (configured) return join(configured, "pentest", "out");
  return join("/home/ubuntu/apztools", "pentest", "out");
}
