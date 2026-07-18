/**
 * Platform Document permissions (APZDOCS-001 / APZDOCS-002).
 * Additive keys — existing keys remain stable.
 */
export const PLATFORM_DOCUMENT_PERMISSIONS = [
  "document.read",
  "document.write",
  "document.manage",
  "document.classify",
  "document.retention",
  "document.audit",
  "document.create",
  "document.version.create",
  "document.version.read",
  "document.archive",
  "document.restore",
  "document.delete",
  "document.storage.write",
  "document.storage.read",
  "document.storage.delete",
  "document.storage.verify",
  "document.reconciliation.read",
  "document.reconciliation.repair",
  "document.tag.read",
  "document.tag.write",
  "document.relationship.read",
  "document.relationship.write",
  "document.collection.read",
  "document.collection.write",
  "document.folder.read",
  "document.folder.write",
  "document.metadata.read",
  "document.metadata.write",
] as const;

export type PlatformDocumentPermission = (typeof PLATFORM_DOCUMENT_PERMISSIONS)[number];

/** Wildcard namespace for role grants (not a bypass). */
export const PLATFORM_DOCUMENT_PERMISSION_WILDCARD = "document.*" as const;
