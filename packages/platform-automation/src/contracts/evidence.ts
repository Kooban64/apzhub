import type { AutomationArtifact, AutomationExecutionRecord } from "./execution";

export interface AutomationEvidenceBundle {
  readonly executionId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly providerId: string;
  readonly artifacts: readonly AutomationArtifact[];
  readonly logs: readonly string[];
  readonly timing: AutomationExecutionRecord["timing"];
  readonly metadata: Readonly<Record<string, string>>;
}

export type AutomationEvidenceSink = (
  bundle: AutomationEvidenceBundle,
) => Promise<readonly string[]>;

export async function defaultInMemoryEvidenceSink(
  bundle: AutomationEvidenceBundle,
): Promise<readonly string[]> {
  return bundle.artifacts.map(
    (a) => `evidence://automation/${bundle.executionId}/${a.artifactId}`,
  );
}
