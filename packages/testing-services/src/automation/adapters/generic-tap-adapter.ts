import type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationCase,
  CanonicalAutomationResult,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../../services/errors";
import {
  aggregateOverall,
  asText,
  deriveExternalRunRef,
  suiteFromCases,
} from "./types";

export function createGenericTapAdapter(): AutomationResultAdapter {
  return {
    kind: "generic_tap",
    version: "1.0.0",
    canParse(input: AutomationAdapterInput): boolean {
      const hint = input.fileNameHint?.toLowerCase() ?? "";
      if (hint.endsWith(".tap") || hint.includes("tap")) return true;
      try {
        const text = asText(input.payload);
        return /^TAP version/i.test(text) || /^(ok|not ok)\b/m.test(text);
      } catch {
        return false;
      }
    },
    parse(input: AutomationAdapterInput): CanonicalAutomationResult {
      if (!this.canParse(input)) {
        throw new DomainRuleError("INVALID_PAYLOAD", "Not TAP output");
      }
      const text = asText(input.payload);
      const cases: CanonicalAutomationCase[] = [];
      for (const line of text.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const okMatch = /^(ok|not ok)\s+(\d+)?\s*-?\s*(.*)$/i.exec(trimmed);
        if (!okMatch) continue;
        const passed = okMatch[1]!.toLowerCase() === "ok";
        const rest = okMatch[3] ?? "";
        const skip = /#\s*skip/i.test(rest) || /\bTODO\b/i.test(rest);
        const title = rest.replace(/#\s*(skip|todo).*$/i, "").trim() || `test-${okMatch[2] ?? cases.length + 1}`;
        cases.push({
          key: okMatch[2],
          title,
          status: skip ? "skipped" : passed ? "pass" : "fail",
        });
      }
      if (cases.length === 0) {
        throw new DomainRuleError("INVALID_PAYLOAD", "TAP contained no results");
      }
      return {
        adapterKind: "generic_tap",
        externalRunRef: deriveExternalRunRef(input, "tap"),
        environment: { framework: "tap" },
        suites: [suiteFromCases("tap", cases, "tap")],
        evidence: [],
        overallStatus: aggregateOverall(cases),
      };
    },
  };
}
