/**
 * Flagship F3 — Accessibility (axe) ingest provider (active).
 * Enhances former placeholder: ingest axe summary JSON → evidence.
 * Execute without a report payload remains a clear failure (not silent).
 */

import type { AutomationProviderDescriptor } from "../../contracts/execution";
import type {
  AutomationProvider,
  ProviderExecutionContext,
  ProviderExecutionResult,
} from "../../contracts/provider";
import { artifactFromText, resolveReportPayload } from "../ingest/report-utils";
import { normalizeAxeSummary } from "./normalize-axe";

const DESCRIPTOR: AutomationProviderDescriptor = {
  providerId: "accessibility",
  name: "Accessibility (axe) Provider",
  version: "0.1.0",
  status: "active",
  capabilities: [
    "a11y-ingest",
    "axe-summary",
    "report-normalization",
    "evidence-publication",
    "change-link",
  ],
};

export class AccessibilityAutomationProvider implements AutomationProvider {
  readonly descriptor = DESCRIPTOR;

  async prepare(_context: ProviderExecutionContext): Promise<void> {
    // Ingest-only.
  }

  async execute(context: ProviderExecutionContext): Promise<ProviderExecutionResult> {
    const startedAt = new Date().toISOString();
    try {
      const payload = resolveReportPayload(context.target);
      const report = normalizeAxeSummary(payload);
      const summaryArtifact = artifactFromText(
        "metadata",
        "axe-summary.json",
        "application/json",
        JSON.stringify(
          {
            kind: "qep.automation.accessibility.summary",
            domain: "a11y",
            providerId: "accessibility",
            changeEventId: context.target.metadata?.changeEventId ?? null,
            ok: report.ok,
            violationCount: report.violationCount,
            passCount: report.passCount,
            incompleteCount: report.incompleteCount,
            url: report.url ?? null,
            summary: report.summary,
            violations: report.violations,
          },
          null,
          2,
        ),
      );
      const reportArtifact = artifactFromText(
        "log",
        "axe-report.json",
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
        summary: `Accessibility ingest failed: ${message}`,
        artifacts: [
          artifactFromText("log", "axe-ingest-error.log", "text/plain", message),
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
    return {
      ok: true,
      detail: "accessibility ingest provider ready (axe summary → evidence)",
    };
  }
}

export function createAccessibilityProvider(): AutomationProvider {
  return new AccessibilityAutomationProvider();
}
