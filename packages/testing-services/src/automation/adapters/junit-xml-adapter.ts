import type {
  AutomationAdapterInput,
  AutomationResultAdapter,
  CanonicalAutomationCase,
  CanonicalAutomationResult,
  CanonicalAutomationSuite,
} from "@apzhub/testing-contracts";

import { DomainRuleError } from "../../services/errors";
import { aggregateOverall, asText, deriveExternalRunRef } from "./types";

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`(?:^|[\\s])${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match?.[1];
}

function mapJunitStatus(body: string): CanonicalAutomationCase["status"] {
  if (/<failure\b/i.test(body) || /<error\b/i.test(body)) return "fail";
  if (/<skipped\b/i.test(body)) return "skipped";
  return "pass";
}

function extractTestCases(xml: string): CanonicalAutomationCase[] {
  const cases: CanonicalAutomationCase[] = [];
  const re = /<testcase\b([^>]*)\/>|<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const attrs = match[1] ?? match[2] ?? "";
    const body = match[3] ?? "";
    const title = attr(attrs, "name") ?? "testcase";
    const classname = attr(attrs, "classname");
    const time = attr(attrs, "time");
    const failure =
      body.match(/<failure\b[^>]*>([\s\S]*?)<\/failure>/i)?.[1] ??
      body.match(/<error\b[^>]*>([\s\S]*?)<\/error>/i)?.[1];
    cases.push({
      key: classname ? `${classname}.${title}` : title,
      title,
      status: mapJunitStatus(body || match[0]),
      durationMs: time ? Math.round(Number(time) * 1000) : undefined,
      message: failure?.trim() || undefined,
      suiteKey: classname,
    });
  }
  return cases;
}

export function createJunitXmlAdapter(): AutomationResultAdapter {
  return {
    kind: "junit_xml",
    version: "1.0.0",
    canParse(input: AutomationAdapterInput): boolean {
      const hint = input.fileNameHint?.toLowerCase() ?? "";
      if (hint.endsWith(".xml") || hint.includes("junit")) return true;
      if (input.contentType?.includes("xml")) return true;
      try {
        const text = asText(input.payload);
        return /<testsuite[\s>]/i.test(text) || /<testcase[\s>]/i.test(text);
      } catch {
        return false;
      }
    },
    parse(input: AutomationAdapterInput): CanonicalAutomationResult {
      if (!this.canParse(input)) {
        throw new DomainRuleError("INVALID_PAYLOAD", "Not JUnit XML");
      }
      const xml = asText(input.payload);
      const suites: CanonicalAutomationSuite[] = [];
      const suiteBlocks = xml.match(/<testsuite\b[^>]*>[\s\S]*?<\/testsuite>/gi) ?? [];
      const blocks = suiteBlocks.length > 0 ? suiteBlocks : [xml];

      for (const block of blocks) {
        const open = block.match(/<testsuite\b[^>]*>/i)?.[0] ?? "";
        const suiteName = attr(open, "name") ?? "junit";
        const suiteKey = attr(open, "id") ?? suiteName;
        const cases = extractTestCases(block).map((c) => ({
          ...c,
          suiteKey: c.suiteKey ?? suiteKey,
        }));
        if (cases.length > 0) {
          suites.push({
            key: suiteKey,
            name: suiteName,
            cases,
            status: aggregateOverall(cases),
            durationMs: cases.reduce((sum, c) => sum + (c.durationMs ?? 0), 0),
          });
        }
      }

      const allCases = suites.flatMap((s) => s.cases);
      if (allCases.length === 0) {
        throw new DomainRuleError(
          "INVALID_PAYLOAD",
          "JUnit XML contained no testcases",
        );
      }

      return {
        adapterKind: "junit_xml",
        externalRunRef: deriveExternalRunRef(input, "junit"),
        environment: { framework: "junit" },
        suites,
        evidence: [],
        durationMs: allCases.reduce((sum, c) => sum + (c.durationMs ?? 0), 0),
        overallStatus: aggregateOverall(allCases),
      };
    },
  };
}
