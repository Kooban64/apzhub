import type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationCase,
  CanonicalAutomationEvidenceMeta,
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

/**
 * Allure metadata adapter — accepts result metadata only.
 * Binary attachments are ignored beyond metadata refs (no Allure server).
 */
export function createAllureMetadataAdapter(): AutomationResultAdapter {
  return {
    kind: "allure_metadata",
    version: "1.0.0",
    canParse(input: AutomationAdapterInput): boolean {
      const hint = input.fileNameHint?.toLowerCase() ?? "";
      if (hint.includes("allure")) return true;
      try {
        const obj = asObject(input.payload);
        return Array.isArray(obj.results);
      } catch {
        return false;
      }
    },
    parse(input: AutomationAdapterInput): CanonicalAutomationResult {
      if (!this.canParse(input)) {
        throw new DomainRuleError(
          "INVALID_PAYLOAD",
          "Allure metadata requires results[]",
        );
      }
      const obj = asObject(input.payload);
      const cases: CanonicalAutomationCase[] = [];
      const evidence: CanonicalAutomationEvidenceMeta[] = [];
      for (const item of obj.results as unknown[]) {
        if (!item || typeof item !== "object") continue;
        const r = item as Record<string, unknown>;
        cases.push({
          key: readString(r, "uuid", "id", "key"),
          title: readString(r, "name", "title") ?? "allure-result",
          status: (readString(r, "status") ??
            "unknown") as CanonicalAutomationCase["status"],
          durationMs: readNumber(r, "duration", "durationMs", "stop"),
          message:
            typeof r.statusDetails === "object" && r.statusDetails
              ? readString(r.statusDetails as Record<string, unknown>, "message")
              : readString(r, "message"),
          stack:
            typeof r.statusDetails === "object" && r.statusDetails
              ? readString(r.statusDetails as Record<string, unknown>, "trace")
              : undefined,
          tags: Array.isArray(r.labels)
            ? (r.labels as Array<Record<string, unknown>>)
                .map((l) => readString(l, "value") ?? "")
                .filter(Boolean)
            : undefined,
        });
        if (Array.isArray(r.attachments)) {
          for (const att of r.attachments as unknown[]) {
            if (!att || typeof att !== "object") continue;
            const a = att as Record<string, unknown>;
            evidence.push({
              type: readString(a, "type") ?? "attachment",
              title: readString(a, "name", "title") ?? "attachment",
              storageRef: readString(a, "source", "storageRef"),
              mimeType: readString(a, "type", "mimeType"),
              pathHint: readString(a, "source", "path"),
            });
          }
        }
      }
      if (cases.length === 0) {
        throw new DomainRuleError("INVALID_PAYLOAD", "Allure results were empty");
      }
      return {
        adapterKind: "allure_metadata",
        externalRunRef: deriveExternalRunRef(input, "allure"),
        environment: {
          ...environmentFrom(
            typeof obj.environment === "object" && obj.environment
              ? (obj.environment as Record<string, unknown>)
              : undefined,
          ),
          framework: "allure",
        },
        suites: [suiteFromCases("allure", cases, "allure")],
        evidence,
        overallStatus: aggregateOverall(cases),
      };
    },
  };
}
