import type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationCase,
  CanonicalAutomationResult,
  CanonicalAutomationSuite,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../../services/errors";
import {
  aggregateOverall,
  asObject,
  deriveExternalRunRef,
  environmentFrom,
  readNumber,
  readString,
} from "./types";

function walkSuites(
  suites: unknown[],
  acc: CanonicalAutomationSuite[],
  parentKey?: string,
): void {
  for (const suite of suites) {
    if (!suite || typeof suite !== "object") continue;
    const s = suite as Record<string, unknown>;
    const name = readString(s, "title", "name") ?? "suite";
    const key = readString(s, "id", "key") ?? parentKey;
    const cases: CanonicalAutomationCase[] = [];
    const specs = Array.isArray(s.specs) ? s.specs : Array.isArray(s.tests) ? s.tests : [];
    for (const spec of specs) {
      if (!spec || typeof spec !== "object") continue;
      const sp = spec as Record<string, unknown>;
      const tests = Array.isArray(sp.tests) ? sp.tests : [sp];
      for (const test of tests) {
        if (!test || typeof test !== "object") continue;
        const t = test as Record<string, unknown>;
        const results = Array.isArray(t.results) ? t.results : [t];
        const result = (results[0] ?? t) as Record<string, unknown>;
        cases.push({
          key: readString(t, "id", "key"),
          title: readString(t, "title", "name") ?? readString(sp, "title") ?? "test",
          status: (readString(result, "status", "outcome") ??
            readString(t, "status") ??
            "unknown") as CanonicalAutomationCase["status"],
          durationMs: readNumber(result, "duration", "durationMs"),
          message: readString(result, "error", "message"),
          stack:
            typeof result.error === "object" && result.error
              ? readString(result.error as Record<string, unknown>, "stack")
              : undefined,
          suiteKey: key,
        });
      }
    }
    if (cases.length > 0) {
      acc.push({
        key,
        name,
        cases,
        status: aggregateOverall(cases),
        durationMs: cases.reduce((sum, c) => sum + (c.durationMs ?? 0), 0),
      });
    }
    if (Array.isArray(s.suites)) {
      walkSuites(s.suites as unknown[], acc, key);
    }
  }
}

export function createPlaywrightReportAdapter(): AutomationResultAdapter {
  return {
    kind: "playwright",
    version: "1.0.0",
    canParse(input: AutomationAdapterInput): boolean {
      const hint = input.fileNameHint?.toLowerCase() ?? "";
      if (hint.includes("playwright") || hint.includes("pw-report")) return true;
      try {
        const obj = asObject(input.payload);
        return Array.isArray(obj.suites) || Array.isArray(obj.errors);
      } catch {
        return false;
      }
    },
    parse(input: AutomationAdapterInput): CanonicalAutomationResult {
      if (!this.canParse(input)) {
        throw new DomainRuleError(
          "INVALID_PAYLOAD",
          "Not a Playwright-like JSON report",
        );
      }
      const obj = asObject(input.payload);
      const suites: CanonicalAutomationSuite[] = [];
      if (Array.isArray(obj.suites)) {
        walkSuites(obj.suites as unknown[], suites);
      }
      const cases = suites.flatMap((s) => s.cases);
      if (cases.length === 0) {
        throw new DomainRuleError(
          "INVALID_PAYLOAD",
          "Playwright report contained no tests",
        );
      }
      const config =
        typeof obj.config === "object" && obj.config
          ? (obj.config as Record<string, unknown>)
          : undefined;
      return {
        adapterKind: "playwright",
        externalRunRef: deriveExternalRunRef(input, "playwright"),
        environment: {
          ...environmentFrom(config),
          framework: "playwright",
        },
        suites,
        evidence: [],
        startedAt: readString(obj, "startedAt", "startTime"),
        completedAt: readString(obj, "completedAt", "endTime"),
        durationMs: readNumber(obj, "duration", "durationMs"),
        overallStatus: aggregateOverall(cases),
        metadata: {
          errors: obj.errors,
        },
      };
    },
  };
}
