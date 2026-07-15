import type {
  CollectionMappingOptions,
  MappingContext,
  MappingDefinition,
  NestedMappingOptions,
} from "./types";
import { mappingValidationError } from "./errors";

export interface CollectionMapper {
  map<TItem, TOut>(
    items: readonly TItem[] | null | undefined,
    options: CollectionMappingOptions<TItem, TOut>,
    context: MappingContext,
  ): TOut[];
}

export function createCollectionMapper(): CollectionMapper {
  return {
    map(items, options, context) {
      if (items === null || items === undefined) {
        return [];
      }
      if (!Array.isArray(items)) {
        throw mappingValidationError(
          { correlationId: context.correlationId ?? "collection-mapper" },
          "Expected an array for collection mapping",
        );
      }

      const skipNullish = options.skipNullish ?? true;
      const result: unknown[] = [];

      for (let i = 0; i < items.length; i += 1) {
        const item = items[i];
        if (skipNullish && (item === null || item === undefined)) {
          continue;
        }
        if (options.filter && !options.filter(item as never, i)) {
          continue;
        }
        result.push(options.mapItem(item as never, i, context));
      }

      return result as never[];
    },
  };
}

export interface NestedMapper {
  mapNested(
    source: unknown,
    options: NestedMappingOptions,
    context: MappingContext,
  ): Promise<unknown> | unknown;
  readNestedValue(source: unknown, path: string): unknown;
}

function readNestedPath(source: unknown, path: string): unknown {
  if (!path) return source;
  const parts = path.split(".");
  let current: unknown = source;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

export function createNestedMapper(): NestedMapper {
  return {
    readNestedValue: readNestedPath,

    mapNested(source, options, context) {
      const nestedInput = readNestedPath(source, options.path);
      if (nestedInput === undefined) {
        return undefined;
      }
      const definition = options.definition;
      if (!definition.map) {
        throw mappingValidationError(
          {
            correlationId: context.correlationId ?? "nested-mapper",
            details: { path: options.path },
          },
          `Nested mapping definition "${definition.id}" has no map function`,
        );
      }
      return definition.map(nestedInput, context);
    },
  };
}

/** Apply a nested definition map against an already-extracted value. */
export async function executeNestedDefinition(
  definition: MappingDefinition,
  input: unknown,
  context: MappingContext,
): Promise<unknown> {
  if (!definition.map) {
    throw mappingValidationError(
      { correlationId: context.correlationId ?? "nested-mapper" },
      `Mapping definition "${definition.id}" has no map function`,
    );
  }
  return definition.map(input, context);
}
