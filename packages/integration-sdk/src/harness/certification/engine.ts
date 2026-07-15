import type { HarnessCheckOutcome, HarnessCheckResult } from "../types";
import {
  CERTIFICATION_CATEGORIES,
  type AdapterCertificationReport,
  type AdapterCertificationSubject,
  type CertificationCategory,
} from "./types";
import { buildCertificationReport, summariseOutcome } from "./report";

function check(
  id: string,
  name: string,
  pass: boolean,
  message: string,
  warn = false,
): HarnessCheckResult {
  const outcome: HarnessCheckOutcome = pass ? "pass" : warn ? "warn" : "fail";
  return { id, name, outcome, message };
}

function defaultChecksForCategory(
  category: CertificationCategory,
  subject: AdapterCertificationSubject,
): HarnessCheckResult[] {
  switch (category) {
    case "Architecture":
      return [
        check(
          "arch.extends-base",
          "Extends IntegrationAdapterBase",
          subject.extendsAdapterBase !== false,
          subject.extendsAdapterBase === false
            ? "Adapter must extend IntegrationAdapterBase"
            : "Declared as extending IntegrationAdapterBase",
        ),
        check(
          "arch.no-platform-services",
          "No platform-services import",
          subject.importsPlatformServices !== true,
          subject.importsPlatformServices
            ? "Forbidden: imports @apzhub/platform-services"
            : "No platform-services dependency declared",
        ),
      ];
    case "Dependencies":
      return [
        check(
          "deps.audit",
          "Dependency audit",
          subject.dependencyAuditPassing !== false,
          subject.dependencyAuditPassing === false
            ? "Dependency audit failed"
            : "Dependency audit declared passing",
        ),
        check(
          "deps.no-mapping-store",
          "No EntityMappingStore",
          subject.importsEntityMappingStore !== true,
          subject.importsEntityMappingStore
            ? "Forbidden: EntityMappingStore in adapter"
            : "EntityMappingStore not imported",
        ),
      ];
    case "Capabilities":
      return [
        check(
          "caps.declared",
          "Declared capabilities present",
          (subject.declaredCapabilities?.length ?? 0) > 0,
          (subject.declaredCapabilities?.length ?? 0) > 0
            ? `${subject.declaredCapabilities!.length} capabilities declared`
            : "No capabilities declared",
        ),
        check(
          "caps.certification",
          "Capability certification available",
          subject.hasCapabilityCertification !== false,
          subject.hasCapabilityCertification === false
            ? "Capability certification missing"
            : "Capability certification declared",
          subject.hasCapabilityCertification === undefined,
        ),
      ];
    case "Compatibility":
      return [
        check(
          "compat.matrix",
          "Compatibility matrix",
          subject.hasCompatibilityMatrix !== false,
          subject.hasCompatibilityMatrix === false
            ? "Compatibility matrix missing"
            : "Compatibility matrix declared",
          subject.hasCompatibilityMatrix === undefined,
        ),
      ];
    case "Diagnostics":
      return [
        check(
          "diag.present",
          "Diagnostics provider",
          subject.hasDiagnostics !== false,
          subject.hasDiagnostics === false
            ? "Diagnostics missing"
            : "Diagnostics declared",
          subject.hasDiagnostics === undefined,
        ),
      ];
    case "Health":
      return [
        check(
          "health.present",
          "Health provider",
          subject.hasHealth !== false,
          subject.hasHealth === false ? "Health missing" : "Health declared",
          subject.hasHealth === undefined,
        ),
      ];
    case "Performance":
      return [
        check(
          "perf.baseline",
          "Performance baseline recorded",
          subject.performanceBaselineRecorded !== false,
          subject.performanceBaselineRecorded === false
            ? "Performance baseline not recorded"
            : "Performance baseline declared (measure only)",
          subject.performanceBaselineRecorded === undefined,
        ),
      ];
    case "Coverage": {
      const pct = subject.coverageLinesPct;
      const pass = pct === undefined || pct >= 80;
      return [
        check(
          "coverage.lines",
          "Line coverage gate",
          pass,
          pct === undefined
            ? "Coverage not supplied — skipped as warn"
            : `Line coverage ${pct}% (gate ≥80%)`,
          pct === undefined,
        ),
      ];
    }
    case "Documentation":
      return [
        check(
          "docs.complete",
          "Documentation complete",
          subject.documentationComplete !== false,
          subject.documentationComplete === false
            ? "Documentation incomplete"
            : "Documentation declared complete",
          subject.documentationComplete === undefined,
        ),
      ];
    case "QualityGates":
      return [
        check(
          "qg.passing",
          "Quality gates",
          subject.qualityGatesPassing !== false,
          subject.qualityGatesPassing === false
            ? "Quality gates failing"
            : "Quality gates declared passing",
          subject.qualityGatesPassing === undefined,
        ),
      ];
    default:
      return [];
  }
}

/**
 * Adapter certification engine — evaluates Architecture through QualityGates
 * and returns a structured report with overall outcome.
 */
export class AdapterCertification {
  certify(subject: AdapterCertificationSubject): AdapterCertificationReport {
    const categories = CERTIFICATION_CATEGORIES.map((category) => {
      const override = subject.categories?.find((c) => c.category === category);
      const hasExplicitChecks = override?.checks !== undefined;
      const checks =
        hasExplicitChecks && (override!.checks?.length ?? 0) > 0
          ? override!.checks!
          : !hasExplicitChecks
            ? defaultChecksForCategory(category, subject)
            : [];

      if (checks.length === 0 && (override?.optional || hasExplicitChecks)) {
        return {
          category,
          outcome: "skip" as const,
          checks: [
            {
              id: `${category.toLowerCase()}.skip`,
              name: `${category} skipped`,
              outcome: "skip" as const,
              message: "Optional category with no checks",
            },
          ],
          summary: `${category}: skipped`,
        };
      }

      const outcome = summariseOutcome(checks.map((c) => c.outcome));
      return {
        category,
        outcome,
        checks,
        summary: `${category}: ${outcome} (${checks.filter((c) => c.outcome === "pass").length}/${checks.length} pass)`,
      };
    });

    return buildCertificationReport(subject, categories);
  }
}

export function createAdapterCertification(): AdapterCertification {
  return new AdapterCertification();
}

export function certifyAdapter(
  subject: AdapterCertificationSubject,
): AdapterCertificationReport {
  return createAdapterCertification().certify(subject);
}
