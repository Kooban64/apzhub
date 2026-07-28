export type GitLabCiServiceOperation =
  "get" | "list" | "listSteps" | "listLogsMetadata" | "retrieveSummary";

export type GitLabCiCoreServiceId =
  | "repositories"
  | "workflows"
  | "pipelineRuns"
  | "jobs"
  | "steps"
  | "artifacts"
  | "logs"
  | "approvals"
  | "summary"
  | "version";

export interface GitLabCiServiceCapability {
  readonly serviceId: GitLabCiCoreServiceId;
  readonly operations: readonly GitLabCiServiceOperation[];
  readonly supportsPaging: boolean;
  readonly supportsFiltering: boolean;
  readonly implemented: true;
  readonly notes?: readonly string[];
}

export const GITLAB_CI_CORE_SERVICE_CAPABILITIES: readonly GitLabCiServiceCapability[] =
  [
    {
      serviceId: "repositories",
      operations: ["get"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
      notes: ["Read-only project metadata"],
    },
    {
      serviceId: "workflows",
      operations: ["list", "get"],
      supportsPaging: true,
      supportsFiltering: false,
      implemented: true,
      notes: ["Represents GitLab CI pipeline definitions / .gitlab-ci.yml refs"],
    },
    {
      serviceId: "pipelineRuns",
      operations: ["list", "get"],
      supportsPaging: true,
      supportsFiltering: true,
      implemented: true,
      notes: ["Unsupported mutations: dispatch, rerun, cancel"],
    },
    {
      serviceId: "jobs",
      operations: ["list", "get"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
    },
    {
      serviceId: "steps",
      operations: ["listSteps"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
      notes: ["Steps derived from job payload when available"],
    },
    {
      serviceId: "artifacts",
      operations: ["list"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
      notes: ["Metadata only — no binary download"],
    },
    {
      serviceId: "logs",
      operations: ["listLogsMetadata"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
      notes: ["Log URL metadata only — no log body download"],
    },
    {
      serviceId: "approvals",
      operations: ["list"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
      notes: ["Optional — empty when unavailable"],
    },
    {
      serviceId: "summary",
      operations: ["retrieveSummary"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
    },
    {
      serviceId: "version",
      operations: ["get"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
      notes: ["Reports configured GitLab REST API version"],
    },
  ];

export const GITLAB_CI_UNSUPPORTED_OPERATIONS = [
  "dispatch",
  "rerun",
  "cancel",
  "download",
] as const;

export function getGitLabCiCoreServiceCapability(
  serviceId: GitLabCiCoreServiceId,
): GitLabCiServiceCapability | undefined {
  return GITLAB_CI_CORE_SERVICE_CAPABILITIES.find((c) => c.serviceId === serviceId);
}

export function discoverGitLabCiCoreServiceCapabilities(): readonly GitLabCiServiceCapability[] {
  return GITLAB_CI_CORE_SERVICE_CAPABILITIES;
}
