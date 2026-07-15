/**
 * GitHub Actions mapping provider registration — wraps mapper functions.
 */

import {
  createDefinition,
  createMappingPipeline,
  createMappingProvider,
  createMappingRegistry,
  type MappingPipeline,
  type MappingProvider,
  type MappingRegistry,
} from "@apzhub/integration-sdk/mapping";

import { mapGitHubApproval } from "./approval-mapper";
import { mapGitHubArtifact } from "./artifact-mapper";
import { mapGitHubEnvironment } from "./environment-mapper";
import { mapGitHubJob, mapGitHubStep } from "./job-mapper";
import { mapGitHubRepository } from "./repository-mapper";
import {
  mapGitHubRunEnvironment,
  mapGitHubRunSource,
  mapGitHubWorkflowRun,
} from "./run-mapper";
import { mapGitHubActionsStatus } from "./status-mapper";
import { mapGitHubRunSummary, mapGitHubJobLogsMetadata } from "./summary-mapper";
import { mapGitHubWorkflow } from "./workflow-mapper";

export const GITHUB_ACTIONS_MAPPING_PROVIDER_ID = "github-actions.entity-mapping";

export function createGitHubActionsMappingProvider(): MappingProvider {
  return createMappingProvider({
    id: GITHUB_ACTIONS_MAPPING_PROVIDER_ID,
    integrationSlug: "github-actions",
    definitions: [
      createDefinition({
        id: "github-actions.status.default.read",
        entityType: "pipeline_run_status",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly status?: string | null;
            readonly conclusion?: string | null;
          };
          return mapGitHubActionsStatus(payload.status, payload.conclusion);
        },
      }),
      createDefinition({
        id: "github-actions.repository.default.read",
        entityType: "repository",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubRepository(input as Parameters<typeof mapGitHubRepository>[0]),
      }),
      createDefinition({
        id: "github-actions.workflow.default.read",
        entityType: "pipeline",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubWorkflow(input as Parameters<typeof mapGitHubWorkflow>[0]),
      }),
      createDefinition({
        id: "github-actions.run.default.read",
        entityType: "pipeline_run",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubWorkflowRun(input as Parameters<typeof mapGitHubWorkflowRun>[0]),
      }),
      createDefinition({
        id: "github-actions.job.default.read",
        entityType: "pipeline_job",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => mapGitHubJob(input as Parameters<typeof mapGitHubJob>[0]),
      }),
      createDefinition({
        id: "github-actions.step.default.read",
        entityType: "pipeline_step",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => mapGitHubStep(input as Parameters<typeof mapGitHubStep>[0]),
      }),
      createDefinition({
        id: "github-actions.artifact.default.read",
        entityType: "artifact_reference",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubArtifact(input as Parameters<typeof mapGitHubArtifact>[0]),
      }),
      createDefinition({
        id: "github-actions.environment.default.read",
        entityType: "pipeline_environment",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubEnvironment(input as Parameters<typeof mapGitHubEnvironment>[0]),
      }),
      createDefinition({
        id: "github-actions.approval.default.read",
        entityType: "pipeline_approval",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubApproval(input as Parameters<typeof mapGitHubApproval>[0]),
      }),
      createDefinition({
        id: "github-actions.summary.default.read",
        entityType: "pipeline_summary",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) => {
          const payload = input as {
            readonly run: Parameters<typeof mapGitHubRunSummary>[0];
            readonly jobs?: Parameters<typeof mapGitHubRunSummary>[1];
          };
          return mapGitHubRunSummary(payload.run, payload.jobs);
        },
      }),
      createDefinition({
        id: "github-actions.run.environment.read",
        entityType: "pipeline_environment",
        direction: "provider_to_canonical",
        profile: "from_run",
        map: (input) =>
          mapGitHubRunEnvironment(
            input as Parameters<typeof mapGitHubRunEnvironment>[0],
          ),
      }),
      createDefinition({
        id: "github-actions.run.source.read",
        entityType: "pipeline_source",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubRunSource(input as Parameters<typeof mapGitHubRunSource>[0]),
      }),
      createDefinition({
        id: "github-actions.logs.metadata.read",
        entityType: "pipeline_log_reference",
        direction: "provider_to_canonical",
        profile: "default",
        map: (input) =>
          mapGitHubJobLogsMetadata(
            input as Parameters<typeof mapGitHubJobLogsMetadata>[0],
          ),
      }),
    ],
    capabilities: {
      supportsPartialUpdate: false,
      supportsRelationships: true,
      supportsCollections: true,
      supportsNested: true,
    },
  });
}

export function createGitHubActionsMappingRegistry(): MappingRegistry {
  const registry = createMappingRegistry();
  registry.register(createGitHubActionsMappingProvider());
  return registry;
}

export function createGitHubActionsMappingPipeline(
  registry: MappingRegistry = createGitHubActionsMappingRegistry(),
): MappingPipeline {
  return createMappingPipeline({ registry });
}
