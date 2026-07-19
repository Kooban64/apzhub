export type KimaiServiceOperation =
  | "health"
  | "diagnostics"
  | "compatibility"
  | "capabilities"
  | "metadata"
  | "validate"
  | "readiness"
  | "feature_detection"
  | "certification"
  | "list"
  | "get"
  | "create"
  | "update"
  | "archive"
  | "stop"
  | "search";

export type KimaiCoreServiceId =
  | "authentication"
  | "version"
  | "health"
  | "diagnostics"
  | "compatibility"
  | "readiness"
  | "feature_detection"
  | "capability_certification"
  | "timesheets"
  | "activities"
  | "customers"
  | "projects"
  | "tags";

export interface KimaiServiceCapability {
  readonly serviceId: KimaiCoreServiceId;
  readonly operations: readonly KimaiServiceOperation[];
  readonly support: "supported" | "partial" | "not_supported";
  readonly implemented: boolean;
  readonly notes?: readonly string[];
}

/**
 * Product / UI surfaces remain unsupported. Domain CE APIs are implemented (KIMAI-002).
 */
export const KIMAI_UNSUPPORTED_OPERATIONS = [
  "approvals",
  "reporting",
  "analytics",
  "workbench",
  "timeTrackingService",
  "timeHttpApi",
  "apzTimeProduct",
] as const;

export const KIMAI_CORE_SERVICE_CAPABILITIES: readonly KimaiServiceCapability[] = [
  {
    serviceId: "authentication",
    operations: ["validate", "health", "diagnostics"],
    support: "supported",
    implemented: true,
    notes: ["Bearer API token preferred; legacy X-AUTH headers optional"],
  },
  {
    serviceId: "version",
    operations: ["metadata", "compatibility", "diagnostics", "health"],
    support: "supported",
    implemented: true,
    notes: ["Uses Kimai CE GET /api/version"],
  },
  {
    serviceId: "health",
    operations: ["health", "diagnostics"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "diagnostics",
    operations: ["diagnostics", "metadata"],
    support: "supported",
    implemented: true,
    notes: ["Secrets never included in diagnostics"],
  },
  {
    serviceId: "compatibility",
    operations: ["compatibility", "capabilities", "diagnostics"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "readiness",
    operations: ["readiness", "diagnostics", "validate"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "feature_detection",
    operations: ["feature_detection", "diagnostics", "capabilities"],
    support: "supported",
    implemented: true,
    notes: ["Probes foundation + domain list endpoints"],
  },
  {
    serviceId: "capability_certification",
    operations: ["certification", "capabilities", "diagnostics"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "timesheets",
    operations: ["list", "get", "create", "update", "stop", "archive", "search"],
    support: "supported",
    implemented: true,
    notes: ["Kimai CE /api/timesheets — Time Entries alias at platform layer"],
  },
  {
    serviceId: "activities",
    operations: ["list", "get", "create", "update", "archive", "search"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "customers",
    operations: ["list", "get", "create", "update", "archive", "search"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "projects",
    operations: ["list", "get", "create", "update", "archive", "search"],
    support: "supported",
    implemented: true,
    notes: ["Time-domain projects — not APZ Projects / Plane"],
  },
  {
    serviceId: "tags",
    operations: ["list", "get", "create", "update", "archive", "search"],
    support: "partial",
    implemented: true,
    notes: [
      "Some CE versions return string arrays for list; search is client-side filter",
    ],
  },
];

export function discoverKimaiCoreServiceCapabilities(): readonly KimaiServiceCapability[] {
  return KIMAI_CORE_SERVICE_CAPABILITIES;
}

export function getKimaiCoreServiceCapability(
  serviceId: KimaiCoreServiceId,
): KimaiServiceCapability | undefined {
  return KIMAI_CORE_SERVICE_CAPABILITIES.find((c) => c.serviceId === serviceId);
}
