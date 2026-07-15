import type { HarnessCategoryResult, HarnessCheckOutcome } from "../types";
import type { AdapterCertificationReport, AdapterCertificationSubject } from "./types";

export function summariseOutcome(
  outcomes: readonly HarnessCheckOutcome[],
): HarnessCheckOutcome {
  if (outcomes.some((o) => o === "fail")) return "fail";
  if (outcomes.every((o) => o === "skip")) return "skip";
  if (outcomes.some((o) => o === "warn")) return "warn";
  if (outcomes.every((o) => o === "pass" || o === "skip")) return "pass";
  return "warn";
}

export function buildCertificationReport(
  subject: AdapterCertificationSubject,
  categories: readonly HarnessCategoryResult[],
): AdapterCertificationReport {
  const overall = summariseOutcome(categories.map((c) => c.outcome));
  const failed = categories.filter((c) => c.outcome === "fail").map((c) => c.category);
  const warned = categories.filter((c) => c.outcome === "warn").map((c) => c.category);

  let summary: string;
  if (overall === "pass") {
    summary = `${subject.packageName}@${subject.adapterVersion} certified — all categories pass`;
  } else if (overall === "fail") {
    summary = `${subject.packageName}@${subject.adapterVersion} certification failed: ${failed.join(", ")}`;
  } else {
    summary = `${subject.packageName}@${subject.adapterVersion} certification warnings: ${warned.join(", ") || "see categories"}`;
  }

  return {
    vendorId: subject.vendorId,
    adapterVersion: subject.adapterVersion,
    packageName: subject.packageName,
    overall,
    categories,
    certifiedAt: new Date().toISOString(),
    knownLimitations: subject.knownLimitations ?? [],
    summary,
  };
}

export function certificationReportToMarkdown(
  report: AdapterCertificationReport,
): string {
  const lines = [
    `# Certification Report — ${report.packageName}`,
    "",
    `- Vendor: ${report.vendorId}`,
    `- Version: ${report.adapterVersion}`,
    `- Overall: **${report.overall}**`,
    `- Certified at: ${report.certifiedAt}`,
    `- Summary: ${report.summary}`,
    "",
    "## Categories",
    "",
  ];

  for (const category of report.categories) {
    lines.push(`### ${category.category} — ${category.outcome}`);
    lines.push("");
    for (const check of category.checks) {
      lines.push(`- [${check.outcome}] ${check.name}: ${check.message}`);
    }
    lines.push("");
  }

  if (report.knownLimitations.length > 0) {
    lines.push("## Known limitations", "");
    for (const lim of report.knownLimitations) {
      lines.push(`- ${lim}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}
