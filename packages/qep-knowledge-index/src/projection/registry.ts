import type { ProjectionDefinition } from "../domain/types";
import { QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION } from "../version";

export type ProjectionRegistry = {
  register(definition: ProjectionDefinition): void;
  get(projectionId: string): ProjectionDefinition | undefined;
  list(): readonly ProjectionDefinition[];
  forEventType(eventType: string): readonly ProjectionDefinition[];
};

export function createProjectionRegistry(
  seed: readonly ProjectionDefinition[] = [],
): ProjectionRegistry {
  const byId = new Map<string, ProjectionDefinition>();
  for (const d of seed) byId.set(d.projectionId, d);

  return {
    register(definition) {
      if (byId.has(definition.projectionId)) {
        throw new Error(`Projection already registered: ${definition.projectionId}`);
      }
      byId.set(definition.projectionId, definition);
    },
    get(projectionId) {
      return byId.get(projectionId);
    },
    list() {
      return [...byId.values()];
    },
    forEventType(eventType) {
      return [...byId.values()].filter((d) => d.eventTypes.includes(eventType));
    },
  };
}

export const EVIDENCE_PROJECTION_DEFINITION: ProjectionDefinition = {
  projectionId: "qep.knowledge.evidence.v1",
  entityKind: "evidence",
  version: QEP_KNOWLEDGE_INDEX_PROJECTION_VERSION,
  description: "Evidence Quality Knowledge Index projection",
  eventTypes: [
    "qep.evidence.created",
    "qep.evidence.updated",
    "qep.evidence.lifecycle_changed",
    "qep.evidence.integrity_established",
    "qep.evidence.integrity_verified",
    "qep.evidence.archived",
    "qep.evidence.superseded",
    "qep.evidence.deleted",
  ],
};
