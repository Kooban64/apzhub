export type N8nServiceOperation =
  | "list"
  | "get"
  | "validate"
  | "metadata"
  | "capabilities"
  | "health"
  | "diagnostics"
  | "compatibility";

export type N8nCoreServiceId =
  | "workflows"
  | "workflowTemplates"
  | "credentialsMetadata"
  | "variablesMetadata"
  | "executionsMetadata"
  | "tags"
  | "users"
  | "projects"
  | "version"
  | "compatibility";

export interface N8nServiceCapability {
  readonly serviceId: N8nCoreServiceId;
  readonly operations: readonly N8nServiceOperation[];
  readonly support: "supported" | "partial" | "not_supported";
  readonly implemented: boolean;
  readonly notes?: readonly string[];
}

/** Mutations and execution are intentionally unsupported. */
export const N8N_UNSUPPORTED_OPERATIONS = [
  "create",
  "update",
  "delete",
  "execute",
  "activate",
  "deactivate",
  "schedule",
  "webhook",
  "credentialSecrets",
] as const;

export const N8N_CORE_SERVICE_CAPABILITIES: readonly N8nServiceCapability[] = [
  {
    serviceId: "workflows",
    operations: ["list", "get", "validate", "metadata"],
    support: "supported",
    implemented: true,
    notes: ["Read-only workflow metadata — no execute/activate"],
  },
  {
    serviceId: "workflowTemplates",
    operations: ["list", "get", "metadata"],
    support: "partial",
    implemented: true,
    notes: ["Derived from workflow catalogue when dedicated template API absent"],
  },
  {
    serviceId: "credentialsMetadata",
    operations: ["list", "get", "metadata"],
    support: "supported",
    implemented: true,
    notes: ["Metadata only — secrets never returned"],
  },
  {
    serviceId: "variablesMetadata",
    operations: ["list", "get", "metadata"],
    support: "partial",
    implemented: true,
    notes: ["Metadata only — values never returned; edition-dependent"],
  },
  {
    serviceId: "executionsMetadata",
    operations: ["list", "get", "metadata"],
    support: "supported",
    implemented: true,
    notes: ["Metadata only — no run payloads or logs"],
  },
  {
    serviceId: "tags",
    operations: ["list", "get", "metadata"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "users",
    operations: ["list", "get", "metadata"],
    support: "partial",
    implemented: true,
    notes: ["Edition-dependent; may return NOT_SUPPORTED"],
  },
  {
    serviceId: "projects",
    operations: ["list", "get", "metadata"],
    support: "partial",
    implemented: true,
    notes: ["Edition-dependent; may return NOT_SUPPORTED"],
  },
  {
    serviceId: "version",
    operations: ["metadata", "compatibility", "diagnostics", "health"],
    support: "supported",
    implemented: true,
  },
  {
    serviceId: "compatibility",
    operations: ["compatibility", "capabilities", "diagnostics"],
    support: "supported",
    implemented: true,
  },
];

export function discoverN8nCoreServiceCapabilities(): readonly N8nServiceCapability[] {
  return N8N_CORE_SERVICE_CAPABILITIES;
}

export function getN8nCoreServiceCapability(
  serviceId: N8nCoreServiceId,
): N8nServiceCapability | undefined {
  return N8N_CORE_SERVICE_CAPABILITIES.find((c) => c.serviceId === serviceId);
}
