import type { DeadLetterMarker } from "../types";
import type { PublicationAdminMarkerStore } from "./port";

export function createInMemoryPublicationAdminMarkerStore(): PublicationAdminMarkerStore {
  const store = new Map<string, DeadLetterMarker>();

  return {
    async mark(input) {
      const marker: DeadLetterMarker = {
        publicationId: input.publicationId,
        kind: input.kind,
        actorUserId: input.actorUserId,
        reason: input.reason,
        markedAt: input.now ?? new Date().toISOString(),
      };
      store.set(marker.publicationId, marker);
      return marker;
    },
    async get(publicationId) {
      return store.get(publicationId) ?? null;
    },
    async list(kind) {
      const all = [...store.values()];
      return kind ? all.filter((m) => m.kind === kind) : all;
    },
  };
}
