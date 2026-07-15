import type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationCase,
  CanonicalAutomationEvidenceMeta,
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
  suiteFromCases,
} from "./types";

export function createGenericJsonAdapter(): AutomationResultAdapter {
  return {
    kind: "generic_json",
    version: "1.0.0",
    canParse(input: AutomationAdapterInput): boolean {
      try {
        const obj = asObject(input.payload);
        return Array.isArray(obj.suites);
      } catch {
        return false;
      }
    },
    parse(input: AutomationAdapterInput): CanonicalAutomationResult {
      if (!this.canParse(input)) {
        throw new DomainRuleError(
          "INVALID_PAYLOAD",
          "Generic JSON requires suites[{ name, cases }]",
        );
      }
      const obj = asObject(input.payload);
      const suites: CanonicalAutomationSuite[] = [];
      for (const suite of obj.suites as unknown[]) {
        if (!suite || typeof suite !== "object") continue;
        const s = suite as Record<string, unknown>;
        const casesRaw = Array.isArray(s.cases) ? s.cases : [];
        const cases: CanonicalAutomationCase[] = [];
        for (const c of casesRaw) {
          if (!c || typeof c !== "object") continue;
          const caseObj = c as Record<string, unknown>;
          const title = readString(caseObj, "title", "name");
          if (!title) continue;
          cases.push({
            key: readString(caseObj, "key", "id"),
            title,
            status: (readString(caseObj, "status") ??
              "unknown") as CanonicalAutomationCase["status"],
            durationMs: readNumber(caseObj, "durationMs", "duration"),
            message: readString(caseObj, "message"),
            stack: readString(caseObj, "stack"),
            tags: Array.isArray(caseObj.tags) ? (caseObj.tags as string[]) : undefined,
            requirementRefs: Array.isArray(caseObj.requirementRefs)
              ? (caseObj.requirementRefs as string[])
              : undefined,
            suiteKey: readString(s, "key", "name"),
            steps: Array.isArray(caseObj.steps)
              ? (caseObj.steps as CanonicalAutomationCase["steps"])
              : undefined,
          });
        }
        suites.push(
          suiteFromCases(
            readString(s, "name") ?? "suite",
            cases,
            readString(s, "key"),
          ),
        );
      }
      const allCases = suites.flatMap((s) => s.cases);
      if (allCases.length === 0) {
        throw new DomainRuleError("INVALID_PAYLOAD", "Generic JSON had no cases");
      }
      const evidence: CanonicalAutomationEvidenceMeta[] = Array.isArray(obj.evidence)
        ? (obj.evidence as CanonicalAutomationEvidenceMeta[])
        : [];
      const coverage =
        typeof obj.coverage === "object" && obj.coverage
          ? {
              covered: readNumber(obj.coverage as Record<string, unknown>, "covered"),
              total: readNumber(obj.coverage as Record<string, unknown>, "total"),
              percentage: readNumber(
                obj.coverage as Record<string, unknown>,
                "percentage",
              ),
              kind: readString(obj.coverage as Record<string, unknown>, "kind"),
              raw: obj.coverage as Record<string, unknown>,
            }
          : undefined;
      return {
        adapterKind: "generic_json",
        externalRunRef:
          readString(obj, "externalRunRef") ?? deriveExternalRunRef(input, "json"),
        correlationId: readString(obj, "correlationId"),
        environment: environmentFrom(
          typeof obj.environment === "object" && obj.environment
            ? (obj.environment as Record<string, unknown>)
            : undefined,
        ),
        suites,
        evidence,
        coverage,
        startedAt: readString(obj, "startedAt"),
        completedAt: readString(obj, "completedAt"),
        durationMs: readNumber(obj, "durationMs"),
        overallStatus: (readString(obj, "overallStatus") as
          | CanonicalAutomationResult["overallStatus"]
          | undefined) ?? aggregateOverall(allCases),
        metadata:
          typeof obj.metadata === "object" && obj.metadata
            ? (obj.metadata as Record<string, unknown>)
            : undefined,
      };
    },
  };
}
