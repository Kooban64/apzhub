/**
 * SPR-APZQEP-202 — JUnit XML → normalized automation report.
 */

import type { NormalizedIngestReport } from "./create-report-ingest-provider";

function attr(tag: string, name: string): string | undefined {
  const match = tag.match(new RegExp(`(?:^|[\\s])${name}\\s*=\\s*"([^"]*)"`, "i"));
  return match?.[1];
}

function asXml(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const record = payload as Record<string, unknown>;
    if (typeof record.xml === "string") return record.xml;
    if (typeof record.report === "string") return record.report;
    if (typeof record.body === "string") return record.body;
  }
  throw new Error("JUnit ingest expects XML string or { xml }");
}

export function normalizeJunitXml(payload: unknown): NormalizedIngestReport {
  const xml = asXml(payload);
  if (!/<testsuite[\s>]/i.test(xml) && !/<testcase[\s>]/i.test(xml)) {
    throw new Error("Not JUnit XML");
  }

  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const re = /<testcase\b([^>]*)\/>|<testcase\b([^>]*)>([\s\S]*?)<\/testcase>/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(xml)) !== null) {
    const body = match[3] ?? "";
    if (/<failure\b/i.test(body) || /<error\b/i.test(body)) failed += 1;
    else if (/<skipped\b/i.test(body)) skipped += 1;
    else passed += 1;
  }

  const suiteOpen = xml.match(/<testsuite\b[^>]*>/i)?.[0] ?? "";
  const suiteName = attr(suiteOpen, "name") ?? "junit";
  const total = passed + failed + skipped;
  const ok = failed === 0 && total > 0;

  return {
    ok,
    summary: ok
      ? `JUnit ${suiteName}: ${passed} passed (${total} total)`
      : `JUnit ${suiteName}: ${failed} failed / ${passed} passed / ${skipped} skipped`,
    metrics: {
      suite: suiteName,
      passed,
      failed,
      skipped,
      total,
      ok,
    },
    raw: { xml, suiteName, passed, failed, skipped, total },
  };
}
