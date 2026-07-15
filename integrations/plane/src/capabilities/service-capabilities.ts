export type PlaneServiceOperation =
  | "list"
  | "get"
  | "create"
  | "update"
  | "archive"
  | "delete"
  | "add"
  | "remove"
  | "transition"
  | "assign"
  | "project"
  | "task"
  | "progress"
  | "velocity"
  | "burndown"
  | "statistics"
  | "validate"
  | "translate"
  | "full"
  | "incremental"
  | "resume"
  | "status";

export type PlaneCoreServiceId =
  | "workspaces"
  | "projects"
  | "project_states"
  | "labels"
  | "cycles"
  | "modules"
  | "members"
  | "tasks"
  | "comments"
  | "activity"
  | "watchers"
  | "analytics"
  | "webhooks"
  | "events"
  | "synchronisation";

export interface PlaneServiceCapability {
  readonly serviceId: PlaneCoreServiceId;
  readonly operations: readonly PlaneServiceOperation[];
  readonly supportsPaging: boolean;
  readonly supportsFiltering: boolean;
  readonly supportsSorting: boolean;
}

export const PLANE_CORE_SERVICE_CAPABILITIES: readonly PlaneServiceCapability[] = [
  {
    serviceId: "workspaces",
    operations: ["list", "get"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "projects",
    operations: ["list", "get", "create", "update", "archive"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "project_states",
    operations: ["list", "get", "create", "update", "delete"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "labels",
    operations: ["list", "get", "create", "update", "delete"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "cycles",
    operations: ["list", "get", "create", "update", "archive"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "modules",
    operations: ["list", "get", "create", "update", "archive"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "members",
    operations: ["list", "get", "add", "update", "remove"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "tasks",
    operations: ["list", "get", "create", "update", "archive", "transition", "assign"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: true,
  },
  {
    serviceId: "comments",
    operations: ["list", "get", "create", "update", "delete"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: false,
  },
  {
    serviceId: "activity",
    operations: ["list", "project", "task"],
    supportsPaging: true,
    supportsFiltering: true,
    supportsSorting: false,
  },
  {
    serviceId: "watchers",
    operations: ["list", "add", "remove"],
    supportsPaging: true,
    supportsFiltering: false,
    supportsSorting: false,
  },
  {
    serviceId: "analytics",
    operations: ["statistics", "progress", "velocity", "burndown"],
    supportsPaging: false,
    supportsFiltering: false,
    supportsSorting: false,
  },
  {
    serviceId: "webhooks",
    operations: ["list", "get", "create", "update", "delete", "validate"],
    supportsPaging: true,
    supportsFiltering: false,
    supportsSorting: false,
  },
  {
    serviceId: "events",
    operations: ["translate"],
    supportsPaging: false,
    supportsFiltering: false,
    supportsSorting: false,
  },
  {
    serviceId: "synchronisation",
    operations: ["full", "incremental", "resume", "status"],
    supportsPaging: false,
    supportsFiltering: true,
    supportsSorting: false,
  },
] as const;

export function discoverPlaneCoreServiceCapabilities(): readonly PlaneServiceCapability[] {
  return PLANE_CORE_SERVICE_CAPABILITIES;
}

export function getPlaneServiceCapability(
  serviceId: PlaneCoreServiceId,
): PlaneServiceCapability | undefined {
  return PLANE_CORE_SERVICE_CAPABILITIES.find((capability) => capability.serviceId === serviceId);
}

export const PLANE_CORE_SERVICE_IDS = PLANE_CORE_SERVICE_CAPABILITIES.map(
  (capability) => capability.serviceId,
);
