export type GitHubActionsServiceOperation =
  | "get"
  | "list"
  | "listSteps"
  | "listLogsMetadata"
  | "retrieveSummary";

export type GitHubActionsCoreServiceId =
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

export interface GitHubActionsServiceCapability {
  readonly serviceId: GitHubActionsCoreServiceId;
  readonly operations: readonly GitHubActionsServiceOperation[];
  readonly supportsPaging: boolean;
  readonly supportsFiltering: boolean;
  readonly implemented: true;
  readonly notes?: readonly string[];
}

export const GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES: readonly GitHubActionsServiceCapability[] =
  [
    {
      serviceId: "repositories",
      operations: ["get"],
      supportsPaging: false,
      supportsFiltering: false,
      implemented: true,
      notes: ["Read-only repository metadata"],
    },
    {
      serviceId: "workflows",
      operations: ["list", "get"],
      supportsPaging: true,
      supportsFiltering: false,
      implemented: true,
    },
    {
      serviceId: "pipelineRuns",
      operations: ["list", "get"],
      supportsPaging: true,
      supportsFiltering: true,
      implemented: true,
      notes: [
        "Unsupported mutations: dispatch, rerun, cancel",
      ],
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
      notes: ["Steps derived from job payload"],
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
      notes: ["Optional — empty when endpoint returns 404"],
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
      notes: ["Reports configured GitHub REST API version"],
    },
  ];

export const GITHUB_ACTIONS_UNSUPPORTED_OPERATIONS = [
  "dispatch",
  "rerun",
  "cancel",
  "download",
] as const;

export function getGitHubActionsCoreServiceCapability(
  serviceId: GitHubActionsCoreServiceId,
): GitHubActionsServiceCapability | undefined {
  return GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES.find((c) => c.serviceId === serviceId);
}

export function discoverGitHubActionsCoreServiceCapabilities(): readonly GitHubActionsServiceCapability[] {
  return GITHUB_ACTIONS_CORE_SERVICE_CAPABILITIES;
}
