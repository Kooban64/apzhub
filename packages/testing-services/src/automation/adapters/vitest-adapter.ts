import type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationCase,
  CanonicalAutomationResult,
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

function mapVitestStatus(raw: string | undefined): string {
  return raw ?? "unknown";
}

function parseAssertionResult(item: Record<string, unknown>): CanonicalAutomationCase {
  const title =
    readString(item, "fullName", "title", "name", "ancestorTitles") ?? "unnamed";
  const statusRaw = readString(item, "status", "state") ?? mapVitestStatus(undefined);
  const durationMs = readNumber(item, "duration", "durationMs");
  return {
    key: readString(item, "key", "id"),
    title,
    status: statusRaw as CanonicalAutomationCase["status"],
    durationMs,
    message: readString(item, "failureMessage", "message"),
    stack: readString(item, "failureStack", "stack"),
    tags: Array.isArray(item.tags) ? (item.tags as string[]) : undefined,
  };
}

export function createVitestAdapter(): AutomationResultAdapter {
  return {
    kind: "vitest",
    version: "1.0.0",
    canParse(input: AutomationAdapterInput): boolean {
      if (input.fileNameHint?.toLowerCase().includes("vitest")) return true;
      if (input.contentType?.includes("json") || typeof input.payload === "object") {
        try {
          const obj = asObject(input.payload);
          return (
            Array.isArray(obj.testResults) ||
            Array.isArray(obj.tests) ||
            Array.isArray(obj.items) ||
            typeof obj.numPassedTests === "number" ||
            typeof obj.success === "boolean"
          );
        } catch {
          return false;
        }
      }
      return false;
    },
    parse(input: AutomationAdapterInput): CanonicalAutomationResult {
      if (!this.canParse(input)) {
        throw new DomainRuleError("INVALID_PAYLOAD", "Not a Vitest-like JSON report");
      }
      const obj = asObject(input.payload);
      const cases: CanonicalAutomationCase[] = [];

      if (Array.isArray(obj.testResults)) {
        for (const file of obj.testResults) {
          if (!file || typeof file !== "object") continue;
          const fileObj = file as Record<string, unknown>;
          const assertions = Array.isArray(fileObj.assertionResults)
            ? fileObj.assertionResults
            : [];
          for (const assertion of assertions) {
            if (assertion && typeof assertion === "object") {
              cases.push(parseAssertionResult(assertion as Record<string, unknown>));
            }
          }
          if (assertions.length === 0 && readString(fileObj, "name")) {
            cases.push({
              title: readString(fileObj, "name") ?? "file",
              status: (readString(fileObj, "status") ??
                "unknown") as CanonicalAutomationCase["status"],
              durationMs: readNumber(fileObj, "endTime", "duration"),
            });
          }
        }
      } else if (Array.isArray(obj.tests) || Array.isArray(obj.items)) {
        const list = (obj.tests ?? obj.items) as unknown[];
        for (const item of list) {
          if (item && typeof item === "object") {
            cases.push(parseAssertionResult(item as Record<string, unknown>));
          }
        }
      }

      if (cases.length === 0) {
        throw new DomainRuleError(
          "INVALID_PAYLOAD",
          "Vitest report contained no tests",
        );
      }

      const suites = [suiteFromCases("vitest", cases, "vitest")];
      const envSource =
        typeof obj.environment === "object" && obj.environment
          ? (obj.environment as Record<string, unknown>)
          : obj;
      return {
        adapterKind: "vitest",
        externalRunRef: deriveExternalRunRef(input, "vitest"),
        environment: {
          ...environmentFrom(envSource),
          framework: "vitest",
        },
        suites,
        evidence: [],
        coverage:
          typeof obj.coverage === "object" && obj.coverage
            ? {
                covered: readNumber(obj.coverage as Record<string, unknown>, "covered"),
                total: readNumber(obj.coverage as Record<string, unknown>, "total"),
                percentage: readNumber(
                  obj.coverage as Record<string, unknown>,
                  "percentage",
                  "pct",
                ),
                kind: "code_ref",
                raw: obj.coverage as Record<string, unknown>,
              }
            : undefined,
        startedAt: readString(obj, "startTime", "startedAt"),
        completedAt: readString(obj, "endTime", "completedAt"),
        durationMs: readNumber(obj, "duration", "durationMs"),
        overallStatus: aggregateOverall(cases),
        metadata: { success: obj.success, numPassedTests: obj.numPassedTests },
      };
    },
  };
}
