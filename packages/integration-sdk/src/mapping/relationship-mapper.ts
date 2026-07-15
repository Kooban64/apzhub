import { extractNativeId, toProvisionalId } from "./identity-mapper";
import type { MappingContext, RelationshipMapping } from "./types";
import { mappingValidationError } from "./errors";

export interface RelationshipMapper {
  mapIds(
    source: unknown,
    mapping: RelationshipMapping,
    context: MappingContext,
  ): string | readonly string[] | undefined;
  mapToProvisional(
    nativeId: string | number | null | undefined,
    mapping: RelationshipMapping,
  ): string | undefined;
  mapToNative(
    canonicalId: string | null | undefined,
    mapping: RelationshipMapping,
  ): string | undefined;
}

function readField(source: unknown, field: string): unknown {
  if (source === null || source === undefined || typeof source !== "object") {
    return undefined;
  }
  return (source as Record<string, unknown>)[field];
}

export function createRelationshipMapper(
  defaultIntegrationSlug?: string,
): RelationshipMapper {
  return {
    mapIds(source, mapping, context) {
      const raw = readField(source, mapping.sourceField);
      if (raw === null || raw === undefined) {
        return undefined;
      }

      const slug = mapping.integrationSlug ?? defaultIntegrationSlug;
      const prefix = mapping.idPrefix;

      const toId = (value: unknown): string => {
        if (typeof value === "object" && value !== null && "id" in value) {
          const id = (value as { id: unknown }).id;
          return String(id);
        }
        return String(value);
      };

      if (mapping.many || Array.isArray(raw)) {
        if (!Array.isArray(raw)) {
          throw mappingValidationError(
            {
              correlationId: context.correlationId ?? "relationship-mapper",
              details: { relation: mapping.relationName },
            },
            `Expected collection for relationship "${mapping.relationName}"`,
          );
        }
        return raw.map((item) => {
          const native = toId(item);
          if (prefix && slug) {
            return toProvisionalId(prefix, slug, native);
          }
          return native;
        });
      }

      const native = toId(raw);
      if (prefix && slug) {
        return toProvisionalId(prefix, slug, native);
      }
      return native;
    },

    mapToProvisional(nativeId, mapping) {
      if (nativeId === null || nativeId === undefined) return undefined;
      const slug = mapping.integrationSlug ?? defaultIntegrationSlug;
      const prefix = mapping.idPrefix;
      if (!prefix || !slug) {
        return String(nativeId);
      }
      return toProvisionalId(prefix, slug, nativeId);
    },

    mapToNative(canonicalId, mapping) {
      if (canonicalId === null || canonicalId === undefined) return undefined;
      const slug = mapping.integrationSlug ?? defaultIntegrationSlug;
      const prefix = mapping.idPrefix;
      if (!prefix || !slug) {
        return canonicalId;
      }
      return extractNativeId(canonicalId, prefix, slug);
    },
  };
}
