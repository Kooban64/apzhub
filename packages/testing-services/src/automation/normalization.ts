import type {
  AutomationNormalizationService,
  CanonicalAutomationCase,
  CanonicalAutomationResult,
  CanonicalAutomationStep,
  CanonicalAutomationSuite,
  NormalizedResultStatus,
} from "@apzhub/testing-contracts";
import { NORMALIZED_RESULT_STATUSES, isNormalizedResultStatus } from "@apzhub/testing-contracts";

const STATUS_ALIASES: Readonly<Record<string, NormalizedResultStatus>> = {
  pass: "pass",
  passed: "pass",
  success: "pass",
  successful: "pass",
  ok: "pass",
  expected: "pass",
  fail: "fail",
  failed: "fail",
  failure: "fail",
  unexpected: "fail",
  skip: "skipped",
  skipped: "skipped",
  pending: "skipped",
  todo: "skipped",
  xfail: "skipped",
  blocked: "blocked",
  blocked_on: "blocked",
  timedout: "timed_out",
  timed_out: "timed_out",
  timeout: "timed_out",
  cancelled: "cancelled",
  canceled: "cancelled",
  aborted: "cancelled",
  interrupted: "cancelled",
  error: "errored",
  errored: "errored",
  broken: "errored",
};

export function createAutomationNormalizationService(): AutomationNormalizationService {
  function normalizeStatus(raw: string | undefined | null): NormalizedResultStatus {
    if (raw == null || String(raw).trim() === "") return "unknown";
    const key = String(raw).trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (isNormalizedResultStatus(key)) return key;
    return STATUS_ALIASES[key] ?? "unknown";
  }

  function normalizeStep(step: CanonicalAutomationStep): CanonicalAutomationStep {
    return {
      ...step,
      status: normalizeStatus(step.status),
    };
  }

  function normalizeCase(c: CanonicalAutomationCase): CanonicalAutomationCase {
    return {
      ...c,
      status: normalizeStatus(c.status),
      steps: c.steps?.map(normalizeStep),
    };
  }

  function normalizeSuite(suite: CanonicalAutomationSuite): CanonicalAutomationSuite {
    const cases = suite.cases.map(normalizeCase);
    return {
      ...suite,
      cases,
      status: suite.status ? normalizeStatus(suite.status) : undefined,
    };
  }

  return {
    normalizeStatus,
    normalizeResult(partial) {
      const suites = partial.suites.map(normalizeSuite);
      const overall =
        typeof partial.overallStatus === "string"
          ? normalizeStatus(partial.overallStatus)
          : "unknown";
      const result: CanonicalAutomationResult = {
        ...partial,
        suites,
        overallStatus: overall,
        evidence: partial.evidence ?? [],
        environment: partial.environment ?? {},
      };
      return result;
    },
  };
}

export { NORMALIZED_RESULT_STATUSES };
