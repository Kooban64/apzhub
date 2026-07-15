import type {
  FieldMapEntry,
  MappingContext,
  ValueTransformer,
} from "./types";
import { mappingValidationError } from "./errors";
import type { ValueTransformerRegistry } from "./value-transformers";

export interface FieldMapperOptions {
  readonly fieldMaps: readonly FieldMapEntry[];
  readonly transformers?: ValueTransformerRegistry;
  /** When true, omit target keys whose resolved value is undefined. */
  readonly omitUndefined?: boolean;
}

function readPath(source: unknown, path: string): unknown {
  if (source === null || source === undefined) return undefined;
  if (!path.includes(".")) {
    return (source as Record<string, unknown>)[path];
  }
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

function writePath(target: Record<string, unknown>, path: string, value: unknown): void {
  if (!path.includes(".")) {
    target[path] = value;
    return;
  }
  const parts = path.split(".");
  let current: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i]!;
    const next = current[part];
    if (next === undefined || next === null || typeof next !== "object") {
      current[part] = {};
    }
    current = current[part] as Record<string, unknown>;
  }
  current[parts[parts.length - 1]!] = value;
}

export interface FieldMapper {
  map(
    source: unknown,
    context: MappingContext,
  ): Record<string, unknown>;
  readonly fieldMaps: readonly FieldMapEntry[];
}

export function createFieldMapper(options: FieldMapperOptions): FieldMapper {
  const omitUndefined = options.omitUndefined ?? true;

  return {
    fieldMaps: options.fieldMaps,

    map(source, context) {
      const result: Record<string, unknown> = {};

      for (const entry of options.fieldMaps) {
        let value = readPath(source, entry.source);

        if (value === undefined || value === null) {
          if (entry.defaultValue !== undefined) {
            value = entry.defaultValue;
          } else if (entry.required) {
            throw mappingValidationError(
              {
                correlationId: context.correlationId ?? "field-mapper",
                details: { field: entry.source },
              },
              `Required field "${entry.source}" is missing`,
            );
          } else if (omitUndefined) {
            continue;
          }
        }

        if (entry.transformer && options.transformers) {
          const transformer = options.transformers.require(entry.transformer) as ValueTransformer;
          value = transformer.transform(value, context);
        }

        if (value === undefined && omitUndefined) {
          continue;
        }

        writePath(result, entry.target, value);
      }

      return result;
    },
  };
}
