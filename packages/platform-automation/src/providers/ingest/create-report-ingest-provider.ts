/**
 * F3 deepen — factory for active report-ingest providers (CI → Evidence).
 * Providers normalize submitted JSON; they do not embed vendor UIs.
 */

import type { AutomationProviderDescriptor } from "../../contracts/execution";
import type {
  AutomationProvider,
  ProviderExecutionContext,
  ProviderExecutionResult,
} from "../../contracts/provider";
import { artifactFromText, resolveReportPayload } from "./report-utils";

export type NormalizedIngestReport = {
  readonly ok: boolean;
  readonly summary: string;
  readonly metrics: Readonly<Record<string, number | string | boolean | null>>;
  readonly raw: unknown;
};

export function createReportIngestProvider(input: {
  readonly providerId: AutomationProviderDescriptor["providerId"];
  readonly name: string;
  readonly domain: string;
  readonly capabilities: readonly string[];
  readonly normalize: (payload: unknown) => NormalizedIngestReport;
}): AutomationProvider {
  const descriptor: AutomationProviderDescriptor = {
    providerId: input.providerId,
    name: input.name,
    version: "1.0.0",
    status: "active",
    capabilities: [
      "report-ingest",
      "report-normalization",
      "evidence-publication",
      "change-link",
      ...input.capabilities,
    ],
  };

  return {
    descriptor,
    async prepare() {
      // Ingest providers prepare nothing — payload arrives on execute.
    },
    async execute(context: ProviderExecutionContext): Promise<ProviderExecutionResult> {
      const startedAt = new Date().toISOString();
      try {
        const payload = resolveReportPayload(context.target);
        const report = input.normalize(payload);
        const summaryArtifact = artifactFromText(
          "metadata",
          `${input.providerId}-summary.json`,
          "application/json",
          JSON.stringify(
            {
              kind: `qep.automation.${input.providerId}.summary`,
              domain: input.domain,
              providerId: input.providerId,
              changeEventId: context.target.metadata?.changeEventId ?? null,
              ok: report.ok,
              summary: report.summary,
              metrics: report.metrics,
            },
            null,
            2,
          ),
        );
        const reportArtifact = artifactFromText(
          "log",
          `${input.providerId}-report.json`,
          "application/json",
          JSON.stringify(report.raw ?? payload, null, 2),
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
          summary: `${input.name} ingest failed: ${message}`,
          artifacts: [
            artifactFromText(
              "log",
              `${input.providerId}-ingest-error.log`,
              "text/plain",
              message,
            ),
          ],
          errorMessage: message,
          timing: {
            startedAt,
            finishedAt,
            durationMs: Math.max(0, Date.parse(finishedAt) - Date.parse(startedAt)),
          },
        };
      }
    },
    async health() {
      return {
        ok: true,
        detail: `${input.providerId} ingest ready (report → evidence)`,
      };
    },
  };
}
