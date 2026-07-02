/**
 * Capability kinds indexed by the Capability Registry (Document 024–029).
 * Internal architecture uses "Capability" as the primary concept.
 */
export const CAPABILITY_KINDS = [
  "module",
  "service",
  "integration",
  "component",
  "event",
  "theme",
  "command",
  "search-provider",
  "worker",
  "dashboard",
  "widget",
  "report",
  "ai-provider",
  "feature-flag",
] as const;

export type CapabilityKind = (typeof CAPABILITY_KINDS)[number];

export const MANIFEST_SCHEMA_VERSION = "1.0" as const;

export type ManifestSchemaVersion = typeof MANIFEST_SCHEMA_VERSION;
