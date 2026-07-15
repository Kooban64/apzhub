import type { AdapterCertificationReport } from "../certification/types";
import type { AdapterComplianceResult } from "../compliance/types";
import type { AdapterPackageStructure } from "../types";
import type { AdapterQualityReport } from "../quality/report";
import type { AdapterCompatibilityResult } from "../compatibility/suite";

export interface DocumentationGeneratorInput {
  readonly vendorId: string;
  readonly displayName: string;
  readonly packageName: string;
  readonly adapterVersion: string;
  readonly capabilities?: readonly {
    readonly id: string;
    readonly status: string;
    readonly optional?: boolean;
    readonly notes?: string;
  }[];
  readonly architectureNotes?: readonly string[];
  readonly operations?: readonly string[];
  readonly diagnosticsNotes?: readonly string[];
  readonly compatibility?: AdapterCompatibilityResult;
  readonly knownLimitations?: readonly string[];
  readonly certification?: AdapterCertificationReport;
  readonly compliance?: AdapterComplianceResult;
  readonly quality?: AdapterQualityReport;
  readonly structure?: AdapterPackageStructure;
}

/**
 * Produce markdown documentation artefacts for adapter development / certification.
 */
export class AdapterDocumentationGenerator {
  generateCapabilityMatrix(input: DocumentationGeneratorInput): string {
    const lines = [
      `# ${input.displayName} Capability Matrix`,
      "",
      `| Capability | Status | Optional | Notes |`,
      `| --- | --- | --- | --- |`,
    ];
    for (const cap of input.capabilities ?? []) {
      lines.push(
        `| ${cap.id} | ${cap.status} | ${cap.optional ? "yes" : "no"} | ${cap.notes ?? ""} |`,
      );
    }
    if (!input.capabilities?.length) {
      lines.push("| _(none declared)_ | — | — | — |");
    }
    lines.push("");
    return lines.join("\n");
  }

  generateArchitecture(input: DocumentationGeneratorInput): string {
    return [
      `# ${input.displayName} Architecture`,
      "",
      `Package: \`${input.packageName}@${input.adapterVersion}\``,
      "",
      "```",
      "Platform Services → Adapter → Integration SDK → Vendor REST (internal)",
      "```",
      "",
      "## Notes",
      "",
      ...(
        input.architectureNotes ?? [
          "Extends IntegrationAdapterBase",
          "No Platform Services business logic in the adapter package",
          "EntityMappingStore remains in platform-services",
        ]
      ).map((n) => `- ${n}`),
      "",
    ].join("\n");
  }

  generateOperations(input: DocumentationGeneratorInput): string {
    return [
      `# ${input.displayName} Operations`,
      "",
      ...(
        input.operations ?? [
          "Capability certification",
          "Compatibility matrix",
          "Readiness evaluation",
          "Health classification",
          "Operational report",
        ]
      ).map((o) => `- ${o}`),
      "",
    ].join("\n");
  }

  generateDiagnostics(input: DocumentationGeneratorInput): string {
    return [
      `# ${input.displayName} Diagnostics`,
      "",
      ...(
        input.diagnosticsNotes ?? [
          "Diagnostics snapshots must not include secrets",
          "Use credential refs and booleans only",
          "Correlate via correlationId",
        ]
      ).map((n) => `- ${n}`),
      "",
    ].join("\n");
  }

  generateCompatibility(input: DocumentationGeneratorInput): string {
    const compat = input.compatibility;
    if (!compat) {
      return [
        `# ${input.displayName} Compatibility`,
        "",
        "_Compatibility matrix not supplied._",
        "",
      ].join("\n");
    }
    return [
      `# ${input.displayName} Compatibility`,
      "",
      `- Provider: ${compat.providerId}`,
      `- Detected version: ${compat.detectedVersion ?? "unknown"}`,
      `- Supported range: ${compat.minVersion} – ${compat.maxVersion}`,
      `- Classification: ${compat.classification}`,
      "",
      "## Optional features",
      "",
      ...compat.optionalFeatures.map(
        (f) =>
          `- ${f.id}: ${f.available ? "available" : "unavailable"}${f.degraded ? " (degraded)" : ""}`,
      ),
      "",
    ].join("\n");
  }

  generateKnownLimitations(input: DocumentationGeneratorInput): string {
    const limits =
      input.knownLimitations ?? input.certification?.knownLimitations ?? [];
    return [
      `# ${input.displayName} Known Limitations`,
      "",
      ...(limits.length > 0 ? limits.map((l) => `- ${l}`) : ["- None recorded"]),
      "",
    ].join("\n");
  }

  generateCertificationSummary(input: DocumentationGeneratorInput): string {
    const report = input.certification;
    if (!report) {
      return [
        `# ${input.displayName} Certification Summary`,
        "",
        "_Certification report not supplied._",
        "",
      ].join("\n");
    }
    return [
      `# ${input.displayName} Certification Summary`,
      "",
      `- Overall: **${report.overall}**`,
      `- Package: ${report.packageName}@${report.adapterVersion}`,
      `- Summary: ${report.summary}`,
      "",
      "## Categories",
      "",
      ...report.categories.map((c) => `- ${c.category}: ${c.outcome}`),
      "",
    ].join("\n");
  }

  generateCompletionReportTemplate(input: DocumentationGeneratorInput): string {
    return [
      `# ${input.displayName} Completion Report Template`,
      "",
      `## Package`,
      "",
      `- Name: \`${input.packageName}\``,
      `- Version: \`${input.adapterVersion}\``,
      `- Vendor: \`${input.vendorId}\``,
      "",
      "## Checklist",
      "",
      "- [ ] Architecture compliant with REFERENCE-ADAPTER-STANDARD",
      "- [ ] Dependency / boundary audit pass",
      "- [ ] Capability certification",
      "- [ ] Compatibility matrix",
      "- [ ] Health + diagnostics",
      "- [ ] Documentation complete",
      "- [ ] Quality gates green",
      "- [ ] Performance baseline recorded (measure only)",
      "",
      "## Certification",
      "",
      input.certification
        ? `Overall: ${input.certification.overall} — ${input.certification.summary}`
        : "_Run AdapterCertification and paste summary._",
      "",
      "## Compliance",
      "",
      input.compliance
        ? `Overall: ${input.compliance.overall} — ${input.compliance.summary}`
        : "_Run AdapterCompliance and paste summary._",
      "",
      "## Quality",
      "",
      input.quality
        ? `Overall: ${input.quality.overall} — ${input.quality.summary}`
        : "_Supply AdapterQualityReport inputs from CI._",
      "",
      "## Stop condition",
      "",
      "Do not start the next vendor Wave without owner approval.",
      "",
    ].join("\n");
  }

  generateAll(input: DocumentationGeneratorInput): Readonly<Record<string, string>> {
    return {
      "capability-matrix.md": this.generateCapabilityMatrix(input),
      "architecture.md": this.generateArchitecture(input),
      "operations.md": this.generateOperations(input),
      "diagnostics.md": this.generateDiagnostics(input),
      "compatibility.md": this.generateCompatibility(input),
      "known-limitations.md": this.generateKnownLimitations(input),
      "certification-summary.md": this.generateCertificationSummary(input),
      "completion-report-template.md": this.generateCompletionReportTemplate(input),
    };
  }
}

export function createAdapterDocumentationGenerator(): AdapterDocumentationGenerator {
  return new AdapterDocumentationGenerator();
}
