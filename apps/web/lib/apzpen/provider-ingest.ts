/**
 * APZPEN provider ingest — parse best-of-breed CE tool output into ImportFindingSeed.
 */

import type { ReportPackSecurityToolId } from "@/lib/qep/report-pack";
import {
  parseNucleiJsonl,
  parseSarifFindings,
  parseSimplifiedFindings,
  parseZapJsonFindings,
  type ReportFinding,
} from "@/lib/qep/report-pack-findings";

import { normalizeSeverity } from "./domain";
import type { FindingSeverity, ImportFindingSeed } from "./types";

export type ProviderIngestFormat =
  "sarif" | "zap" | "nuclei_jsonl" | "simplified" | "gitleaks" | "mobsf" | "auto";

export type ProviderToolId =
  | "trivy"
  | "semgrep"
  | "nuclei"
  | "zap"
  | "greenbone"
  | "gitleaks"
  | "syft"
  | "grype"
  | "osv"
  | "checkov"
  | "nmap"
  | "testssl"
  | "prowler"
  | "kubebench"
  | "schemathesis"
  | "mobsf"
  | "manual"
  | "other";

export type ProviderIngestResult = {
  readonly format: ProviderIngestFormat;
  readonly toolId: ProviderToolId;
  readonly seeds: readonly ImportFindingSeed[];
  readonly parsedCount: number;
};

function mapSeverity(
  severity: ReportFinding["severity"] | string,
): ImportFindingSeed["severity"] {
  if (severity === "unknown") return "info";
  return normalizeSeverity(severity);
}

function toSeeds(
  findings: readonly ReportFinding[],
  providerOverride?: string,
): ImportFindingSeed[] {
  return findings.map((f) => ({
    title: f.title,
    description: f.description,
    severity: mapSeverity(f.severity),
    providerTool:
      providerOverride ?? (f.toolId === "other" ? "other" : String(f.toolId)),
    location: f.location,
    remediation: f.recommendation,
    cwe: f.evidenceRef?.startsWith("CWE") ? f.evidenceRef : undefined,
  }));
}

function asQepToolId(raw: string | undefined): ReportPackSecurityToolId {
  switch (raw) {
    case "trivy":
    case "semgrep":
    case "nuclei":
    case "zap":
    case "greenbone":
      return raw;
    default:
      return "trivy";
  }
}

function severityFromMobSf(raw: unknown): FindingSeverity {
  const s = String(raw ?? "").toLowerCase();
  if (s.includes("high") || s === "dangerous" || s === "severe") return "high";
  if (s.includes("warning") || s.includes("medium")) return "medium";
  if (s.includes("info") || s.includes("good") || s.includes("secure")) return "info";
  if (s.includes("critical")) return "critical";
  return "low";
}

/** Parse MobSF JSON report (static analysis export). */
export function parseMobsfFindings(payload: unknown, limit = 200): ImportFindingSeed[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const seeds: ImportFindingSeed[] = [];

  const appName =
    (typeof root.app_name === "string" && root.app_name) ||
    (typeof root.package_name === "string" && root.package_name) ||
    "mobile-app";

  const push = (input: {
    title: string;
    description: string;
    severity: FindingSeverity;
    location?: string;
    remediation?: string;
  }) => {
    if (seeds.length >= limit) return;
    seeds.push({
      title: input.title,
      description: input.description,
      severity: input.severity,
      providerTool: "mobsf",
      location: input.location ?? appName,
      remediation: input.remediation,
    });
  };

  // Manifest / code findings often under nested maps of { severity, description }
  const walkFindings = (node: unknown, prefix: string) => {
    if (seeds.length >= limit || !node || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const item of node) walkFindings(item, prefix);
      return;
    }
    const obj = node as Record<string, unknown>;
    if (
      typeof obj.description === "string" &&
      (obj.severity !== undefined || obj.stat !== undefined)
    ) {
      push({
        title: `${prefix}: ${String(obj.title ?? obj.name ?? obj.description).slice(0, 120)}`,
        description: String(obj.description),
        severity: severityFromMobSf(obj.severity ?? obj.stat),
        location: typeof obj.file === "string" ? obj.file : appName,
        remediation: typeof obj.remediation === "string" ? obj.remediation : undefined,
      });
      return;
    }
    for (const [key, value] of Object.entries(obj)) {
      if (
        key === "permissions" ||
        key === "certificate_analysis" ||
        key === "manifest_analysis" ||
        key === "code_analysis" ||
        key === "binary_analysis" ||
        key === "niap_analysis" ||
        key === "findings"
      ) {
        walkFindings(value, key);
      } else if (
        value &&
        typeof value === "object" &&
        ("severity" in (value as object) || "stat" in (value as object))
      ) {
        walkFindings(value, key);
      }
    }
  };

  walkFindings(root, "mobsf");

  // Fallback: top-level security_score style summary
  if (seeds.length === 0 && root.security_score !== undefined) {
    push({
      title: `MobSF security score ${String(root.security_score)}`,
      description: `Package ${appName} scored ${String(root.security_score)}. Review full MobSF report for details.`,
      severity: Number(root.security_score) < 40 ? "high" : "medium",
      location: appName,
    });
  }

  return seeds;
}

/** Parse Gitleaks JSON report (array or { findings: [] }). */
export function parseGitleaksFindings(
  payload: unknown,
  limit = 200,
): ImportFindingSeed[] {
  const rows: unknown[] = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as { findings?: unknown }).findings)
      ? (payload as { findings: unknown[] }).findings
      : [];

  return rows.slice(0, limit).map((row) => {
    const r = (row ?? {}) as Record<string, unknown>;
    const rule = String(r.RuleID ?? r.rule_id ?? r.Description ?? "secret");
    const file = String(r.File ?? r.file ?? "");
    const line = r.StartLine ?? r.start_line ?? "";
    return {
      title: `Secret detected: ${rule}`,
      description: String(r.Description ?? r.description ?? rule),
      severity: "high" as const,
      providerTool: "gitleaks",
      location: file ? `${file}:${line}` : undefined,
      remediation: "Rotate the credential and remove it from history/source.",
    };
  });
}

function detectFormat(
  payload: unknown,
  text: string | undefined,
  toolId?: ProviderToolId,
): ProviderIngestFormat {
  if (toolId === "mobsf") return "mobsf";
  if (toolId === "gitleaks") return "gitleaks";

  if (text && text.trim().startsWith("{") === false && text.includes("\n")) {
    const first = text.trim().split("\n")[0] ?? "";
    if (first.startsWith("{") && first.includes('"template-id"')) {
      return "nuclei_jsonl";
    }
  }
  if (!payload || typeof payload !== "object") {
    if (text?.includes('"template-id"')) return "nuclei_jsonl";
    return "simplified";
  }
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.runs)) return "sarif";
  if (Array.isArray(obj.site) || Array.isArray(obj.alerts)) return "zap";
  if (
    obj.app_name !== undefined ||
    obj.package_name !== undefined ||
    obj.security_score !== undefined ||
    obj.manifest_analysis !== undefined
  ) {
    return "mobsf";
  }
  if (
    Array.isArray(payload) &&
    payload[0] &&
    typeof payload[0] === "object" &&
    ("RuleID" in (payload[0] as object) || "Secret" in (payload[0] as object))
  ) {
    return "gitleaks";
  }
  if (Array.isArray(obj.findings)) return "simplified";
  return "simplified";
}

/**
 * Parse provider artefact into APZPEN import seeds.
 * `payload` may be a parsed object; for nuclei_jsonl pass raw text via `rawText`.
 */
export function ingestProviderPayload(input: {
  readonly format?: ProviderIngestFormat;
  readonly toolId?: ProviderToolId;
  readonly payload?: unknown;
  readonly rawText?: string;
  readonly limit?: number;
}): ProviderIngestResult {
  const limit = input.limit ?? 200;
  const rawText = input.rawText;
  let payload = input.payload;

  if (payload === undefined && rawText) {
    const trimmed = rawText.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        payload = JSON.parse(trimmed) as unknown;
      } catch {
        payload = undefined;
      }
    }
  }

  const format =
    input.format && input.format !== "auto"
      ? input.format
      : detectFormat(payload, rawText, input.toolId);

  let findings: ReportFinding[] = [];
  let toolId: ProviderToolId = input.toolId ?? "other";
  let seeds: ImportFindingSeed[] = [];

  switch (format) {
    case "sarif": {
      const tid = asQepToolId(input.toolId);
      toolId = (input.toolId as ProviderToolId | undefined) ?? tid;
      findings = parseSarifFindings(payload, tid, limit);
      seeds = toSeeds(findings, toolId);
      break;
    }
    case "zap": {
      toolId = "zap";
      findings = parseZapJsonFindings(payload, limit);
      seeds = toSeeds(findings, "zap");
      break;
    }
    case "nuclei_jsonl": {
      toolId = "nuclei";
      findings = parseNucleiJsonl(rawText ?? "", limit);
      seeds = toSeeds(findings, "nuclei");
      break;
    }
    case "gitleaks": {
      toolId = "gitleaks";
      seeds = parseGitleaksFindings(payload, limit);
      break;
    }
    case "mobsf": {
      toolId = "mobsf";
      seeds = parseMobsfFindings(payload, limit);
      break;
    }
    case "simplified":
    default: {
      toolId = input.toolId ?? "greenbone";
      const qepTid = asQepToolId(
        toolId === "greenbone" ||
          toolId === "trivy" ||
          toolId === "semgrep" ||
          toolId === "nuclei" ||
          toolId === "zap"
          ? toolId
          : "greenbone",
      );
      findings = parseSimplifiedFindings(payload, qepTid, limit);
      seeds = toSeeds(findings, toolId);
      break;
    }
  }

  return {
    format,
    toolId,
    seeds,
    parsedCount: seeds.length,
  };
}

/** Stable fingerprint for cross-tool / re-import deduplication. */
export function findingFingerprint(seed: {
  readonly title: string;
  readonly location?: string;
  readonly providerTool?: string;
}): string {
  return [
    (seed.providerTool ?? "unknown").toLowerCase(),
    seed.title.trim().toLowerCase(),
    (seed.location ?? "").trim().toLowerCase(),
  ].join("|");
}
