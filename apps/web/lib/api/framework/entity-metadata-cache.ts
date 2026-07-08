/** In-memory version/timestamp cache for API ETag support in memory repository mode (LAW-014-06). */

export interface EntityApiMetadata {
  readonly version: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface EntityMetadataCache {
  reset(): void;
  seed(entityId: string, metadata: EntityApiMetadata): void;
  touch(entityId: string, created?: boolean): EntityApiMetadata;
  get(entityId: string): EntityApiMetadata;
}

export function createEntityMetadataCache(): EntityMetadataCache {
  const memoryMetadata = new Map<string, EntityApiMetadata>();

  return {
    reset() {
      memoryMetadata.clear();
    },
    seed(entityId, metadata) {
      memoryMetadata.set(entityId, metadata);
    },
    touch(entityId, created = false) {
      const now = new Date().toISOString();
      const existing = memoryMetadata.get(entityId);
      if (!existing || created) {
        const next = { version: 1, createdAt: now, updatedAt: now };
        memoryMetadata.set(entityId, next);
        return next;
      }

      const next = { ...existing, version: existing.version + 1, updatedAt: now };
      memoryMetadata.set(entityId, next);
      return next;
    },
    get(entityId) {
      return (
        memoryMetadata.get(entityId) ?? {
          version: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    },
  };
}
