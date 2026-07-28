export type MetabaseServiceOperation =
  | "list"
  | "get"
  | "metadata"
  | "health"
  | "diagnostics"
  | "compatibility"
  | "capabilities";

export type MetabaseCoreServiceId =
  | "health"
  | "version"
  | "compatibility"
  | "readiness"
  | "featureDetection"
  | "capabilityDetection"
  | "collectionsMetadata"
  | "dashboardEmbed";

export interface MetabaseServiceCapability {
  readonly serviceId: MetabaseCoreServiceId;
  readonly operations: readonly MetabaseServiceOperation[];
  readonly support: "supported" | "partial" | "not_supported" | "planned";
  readonly implemented: boolean;
  readonly notes?: readonly string[];
}

/** Mutations / SQL / embed issuance deferred beyond foundation. */
export const METABASE_UNSUPPORTED_OPERATIONS = [
  "createDashboard",
  "updateDashboard",
  "deleteDashboard",
  "customSql",
  "reportDesigner",
  "issueEmbedToken",
  "writeCollection",
] as const;

export const METABASE_CORE_SERVICE_CAPABILITIES: readonly MetabaseServiceCapability[] =
  [
    {
      serviceId: "health",
      operations: ["health", "diagnostics"],
      support: "supported",
      implemented: true,
    },
    {
      serviceId: "version",
      operations: ["get", "metadata"],
      support: "supported",
      implemented: true,
      notes: ["Detected via /api/session/properties"],
    },
    {
      serviceId: "compatibility",
      operations: ["compatibility", "metadata"],
      support: "supported",
      implemented: true,
    },
    {
      serviceId: "readiness",
      operations: ["health", "diagnostics"],
      support: "supported",
      implemented: true,
    },
    {
      serviceId: "featureDetection",
      operations: ["capabilities", "metadata"],
      support: "supported",
      implemented: true,
    },
    {
      serviceId: "capabilityDetection",
      operations: ["capabilities", "metadata"],
      support: "supported",
      implemented: true,
    },
    {
      serviceId: "collectionsMetadata",
      operations: ["list", "metadata"],
      support: "supported",
      implemented: true,
      notes: ["Read-only collection catalogue"],
    },
    {
      serviceId: "dashboardEmbed",
      operations: ["metadata"],
      support: "planned",
      implemented: false,
      notes: ["Embed token issuance reserved for Analytics Platform Services"],
    },
  ];

export function discoverMetabaseCoreServiceCapabilities(): readonly MetabaseServiceCapability[] {
  return METABASE_CORE_SERVICE_CAPABILITIES;
}

export function getMetabaseCoreServiceCapability(
  serviceId: string,
): MetabaseServiceCapability | undefined {
  return METABASE_CORE_SERVICE_CAPABILITIES.find((c) => c.serviceId === serviceId);
}
