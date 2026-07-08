import type { KnowledgeSourceManifest } from "@apzhub/platform-runtime/manifest-engine";

import type { KnowledgeSource } from "../types/knowledge-source";
import type { KnowledgeCapabilityRecord } from "./types";

/** Map validated manifest entry to registry descriptor — references only, no registry duplication. */
export function mapKnowledgeManifestToSource(
  manifestSource: KnowledgeSourceManifest,
  capability: KnowledgeCapabilityRecord,
): KnowledgeSource {
  return {
    id: manifestSource.id,
    label: manifestSource.label,
    kind: manifestSource.kind,
    tier: manifestSource.tier,
    priority: manifestSource.priority,
    status: manifestSource.status ?? "active",
    permission: manifestSource.permission,
    provides: manifestSource.provides,
    version: manifestSource.version ?? capability.version,
    capabilityId: capability.id,
    origin: "manifest",
  };
}
