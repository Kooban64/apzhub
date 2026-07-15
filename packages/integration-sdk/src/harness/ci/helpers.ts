import { certifyAdapter } from "../certification/engine";
import type {
  AdapterCertificationSubject,
  AdapterCertificationReport,
} from "../certification/types";
import { runAdapterContractSuite } from "../contracts/suite";
import type {
  AdapterContractSuiteResult,
  ContractSubjectMetadata,
} from "../contracts/suite";
import { validateAdapterBoundary } from "../boundary/validator";
import type { BoundaryValidationResult } from "../boundary/validator";
import { createAdapterDocumentationGenerator } from "../docs/generator";
import type { DocumentationGeneratorInput } from "../docs/generator";
import {
  buildAdapterQualityReport,
  type AdapterQualityInputs,
  type AdapterQualityReport,
} from "../quality/report";
import type { HarnessCheckOutcome } from "../types";

export interface CiCheckBundle<T> {
  readonly ok: boolean;
  readonly outcome: HarnessCheckOutcome;
  readonly result: T;
  readonly serialisable: Readonly<Record<string, unknown>>;
}

function wrap<T extends { overall: HarnessCheckOutcome }>(
  result: T,
  extra: Readonly<Record<string, unknown>> = {},
): CiCheckBundle<T> {
  return {
    ok: result.overall === "pass" || result.overall === "warn",
    outcome: result.overall,
    result,
    serialisable: {
      outcome: result.overall,
      ok: result.overall === "pass" || result.overall === "warn",
      ...extra,
      result,
    },
  };
}

/** CI helper — certification checks returning serialisable results (no GH Actions rewrite). */
export function runCertificationChecks(
  subject: AdapterCertificationSubject,
): CiCheckBundle<AdapterCertificationReport> {
  const result = certifyAdapter(subject);
  return wrap(result, {
    vendorId: result.vendorId,
    summary: result.summary,
    categories: result.categories.map((c) => ({
      category: c.category,
      outcome: c.outcome,
    })),
  });
}

/** CI helper — contract suite checks. */
export function runContractChecks(
  subject: ContractSubjectMetadata,
): CiCheckBundle<AdapterContractSuiteResult> {
  const result = runAdapterContractSuite(subject);
  return wrap(result, {
    summary: result.summary,
    checkCount: result.checks.length,
  });
}

/** CI helper — boundary validation against a file contents map. */
export function runBoundaryChecks(input: {
  readonly files: Readonly<Record<string, string>>;
}): CiCheckBundle<BoundaryValidationResult> {
  const result = validateAdapterBoundary(input);
  return wrap(result, {
    summary: result.summary,
    violationCount: result.violations.length,
  });
}

/** CI helper — documentation artefact generation + basic completeness signal. */
export function runDocumentationChecks(
  input: DocumentationGeneratorInput,
): CiCheckBundle<{
  overall: HarnessCheckOutcome;
  documents: Readonly<Record<string, string>>;
  summary: string;
}> {
  const docs = createAdapterDocumentationGenerator().generateAll(input);
  const requiredKeys = [
    "capability-matrix.md",
    "architecture.md",
    "operations.md",
    "certification-summary.md",
    "completion-report-template.md",
  ];
  const missing = requiredKeys.filter((k) => !docs[k] || docs[k]!.trim().length === 0);
  const overall: HarnessCheckOutcome = missing.length === 0 ? "pass" : "fail";
  const result = {
    overall,
    documents: docs,
    summary:
      overall === "pass"
        ? `Generated ${Object.keys(docs).length} documentation artefacts`
        : `Missing documentation artefacts: ${missing.join(", ")}`,
  };
  return wrap(result, {
    documentKeys: Object.keys(docs),
    missing,
  });
}

/** CI helper — quality report from caller-supplied gate statuses (no shell-out). */
export function buildQualityReport(
  input: AdapterQualityInputs,
): CiCheckBundle<AdapterQualityReport> {
  const result = buildAdapterQualityReport(input);
  return wrap(result, {
    summary: result.summary,
    gates: result.gates,
    coverage: result.coverage,
  });
}
