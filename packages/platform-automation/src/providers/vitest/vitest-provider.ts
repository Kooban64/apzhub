/**
 * Flagship F3 — Vitest CI/unit result ingestion (active).
 * Does not run Vitest; normalizes a submitted JSON report into evidence artifacts.
 */

import type { AutomationProviderDescriptor } from "../../contracts/execution";
import type {
  AutomationProvider,
  ProviderExecutionContext,
  ProviderExecutionResult,
} from "../../contracts/provider";
import { artifactFromText, resolveReportPayload } from "../ingest/report-utils";
import { normalizeVitestReport } from "./normalize-vitest";

const DESCRIPTOR: AutomationProviderDescriptor = {
  providerId: "vitest",
  name: "Vitest CI Provider",
  version: "0.1.0",
  status: "active",
  capabilities: [
    "ci-ingest",
    "unit-results",
    "report-normalization",
    "evidence-publication",
    "change-link",
  ],
};

export class VitestAutomationProvider implements AutomationProvider {
  readonly descriptor = DESCRIPTOR;

  async prepare(_context: ProviderExecutionContext): Promise<void> {
    // Ingest providers prepare nothing — payload arrives on execute.
  }

  async execute(context: ProviderExecutionContext): Promise<ProviderExecutionResult> {
    const startedAt = new Date().toISOString();
    try {
      const payload = resolveReportPayload(context.target);
      const report = normalizeVitestReport(payload);
      const summaryArtifact = artifactFromText(
        "metadata",
        "vitest-summary.json",
        "application/json",
        JSON.stringify(
          {
            kind: "qep.automation.vitest.summary",
            domain: "ci",
            providerId: "vitest",
            changeEventId: context.target.metadata?.changeEventId ?? null,
            ok: report.ok,
            total: report.total,
            passed: report.passed,
            failed: report.failed,
            skipped: report.skipped,
            summary: report.summary,
            cases: report.cases.slice(0, 200),
          },
          null,
          2,
        ),
      );
      const reportArtifact = artifactFromText(
        "log",
        "vitest-report.json",
        "application/json",
        JSON.stringify(report.raw, null, 2),
      );
      const finishedAt = new Date().toISOString();
      return {
        ok: report.ok,
        summary: report.summary,
        artifacts: [summaryArtifact, reportArtifact],
        errorMessage: report.ok ? undefined : report.summary,
        timing: {
          startedAt,
          finishedAt,
          durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt)),
        },
      };
    } catch (error) {
      const finishedAt = new Date().toISOString();
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        summary: `Vitest ingest failed: ${message}`,
        artifacts: [
          artifactFromText("log", "vitest-ingest-error.log", "text/plain", message),
        ],
        errorMessage: message,
        timing: {
          startedAt,
          finishedAt,
          durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt)),
        },
      };
    }
  }

  async health(): Promise<{ readonly ok: boolean; readonly detail?: string }> {
    return { ok: true, detail: "vitest ingest provider ready (report → evidence)" };
  }
}

export function createVitestProvider(): AutomationProvider {
  return new VitestAutomationProvider();
}
