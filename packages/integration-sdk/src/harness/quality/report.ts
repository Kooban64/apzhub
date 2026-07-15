import type { HarnessCheckOutcome } from "../types";
import { summariseOutcome } from "../certification/report";

export type QualityGateStatus = "pass" | "fail" | "warn" | "skip" | "unknown";

export interface AdapterQualityInputs {
  readonly vendorId: string;
  readonly packageName: string;
  readonly adapterVersion: string;
  readonly coverage?: {
    readonly linesPct?: number;
    readonly branchesPct?: number;
    readonly functionsPct?: number;
    readonly statementsPct?: number;
  };
  readonly lint?: QualityGateStatus;
  readonly typecheck?: QualityGateStatus;
  readonly tests?: QualityGateStatus;
  readonly docs?: QualityGateStatus;
  readonly architecture?: QualityGateStatus;
  readonly dependencies?: QualityGateStatus;
  readonly coverageGatePct?: number;
}

export interface AdapterQualityReport {
  readonly vendorId: string;
  readonly packageName: string;
  readonly adapterVersion: string;
  readonly overall: HarnessCheckOutcome;
  readonly coverage: {
    readonly linesPct?: number;
    readonly branchesPct?: number;
    readonly functionsPct?: number;
    readonly statementsPct?: number;
    readonly gatePct: number;
    readonly status: QualityGateStatus;
  };
  readonly gates: {
    readonly lint: QualityGateStatus;
    readonly typecheck: QualityGateStatus;
    readonly tests: QualityGateStatus;
    readonly docs: QualityGateStatus;
    readonly architecture: QualityGateStatus;
    readonly dependencies: QualityGateStatus;
  };
  readonly summary: string;
  readonly generatedAt: string;
}

function coverageStatus(
  linesPct: number | undefined,
  gatePct: number,
): QualityGateStatus {
  if (linesPct === undefined) return "unknown";
  if (linesPct >= gatePct) return "pass";
  if (linesPct >= gatePct - 5) return "warn";
  return "fail";
}

function toOutcome(status: QualityGateStatus): HarnessCheckOutcome {
  if (status === "pass") return "pass";
  if (status === "fail") return "fail";
  if (status === "skip" || status === "unknown") return "skip";
  return "warn";
}

/**
 * Structured quality report from caller-supplied CI / coverage inputs.
 * Does not shell out to CI tools.
 */
export class AdapterQualityReportBuilder {
  build(input: AdapterQualityInputs): AdapterQualityReport {
    const gatePct = input.coverageGatePct ?? 80;
    const covStatus = coverageStatus(input.coverage?.linesPct, gatePct);
    const gates = {
      lint: input.lint ?? "unknown",
      typecheck: input.typecheck ?? "unknown",
      tests: input.tests ?? "unknown",
      docs: input.docs ?? "unknown",
      architecture: input.architecture ?? "unknown",
      dependencies: input.dependencies ?? "unknown",
    };

    const overall = summariseOutcome([
      toOutcome(covStatus),
      ...Object.values(gates).map(toOutcome),
    ]);

    const failing = Object.entries(gates)
      .filter(([, s]) => s === "fail")
      .map(([k]) => k);
    if (covStatus === "fail") failing.push("coverage");

    const summary =
      overall === "pass"
        ? `${input.packageName} quality gates pass`
        : `${input.packageName} quality ${overall}${failing.length ? `: ${failing.join(", ")}` : ""}`;

    return {
      vendorId: input.vendorId,
      packageName: input.packageName,
      adapterVersion: input.adapterVersion,
      overall,
      coverage: {
        linesPct: input.coverage?.linesPct,
        branchesPct: input.coverage?.branchesPct,
        functionsPct: input.coverage?.functionsPct,
        statementsPct: input.coverage?.statementsPct,
        gatePct,
        status: covStatus,
      },
      gates,
      summary,
      generatedAt: new Date().toISOString(),
    };
  }
}

export function buildAdapterQualityReport(
  input: AdapterQualityInputs,
): AdapterQualityReport {
  return new AdapterQualityReportBuilder().build(input);
}

export function createAdapterQualityReportBuilder(): AdapterQualityReportBuilder {
  return new AdapterQualityReportBuilder();
}
