import type { MappingContext, ValueTransformer, ValueTransformerKind } from "./types";
import { mappingValidationError } from "./errors";

function assertKind(kind: ValueTransformerKind, expected: ValueTransformerKind): void {
  if (kind !== expected) {
    throw mappingValidationError(
      { correlationId: "transformer" },
      `Transformer kind mismatch: expected ${expected}`,
    );
  }
}

export function createDateTransformer(
  name = "date",
): ValueTransformer<string | number | Date | null | undefined, string | undefined> {
  return {
    kind: "date",
    name,
    transform(value) {
      assertKind("date", "date");
      if (value === null || value === undefined || value === "") {
        return undefined;
      }
      if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? undefined : value.toISOString();
      }
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
    },
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function createUuidTransformer(
  name = "uuid",
  options: { readonly strict?: boolean } = {},
): ValueTransformer<string | null | undefined, string | undefined> {
  return {
    kind: "uuid",
    name,
    transform(value) {
      if (value === null || value === undefined || value === "") {
        return undefined;
      }
      const trimmed = String(value).trim();
      if (options.strict !== false && !UUID_RE.test(trimmed)) {
        throw mappingValidationError(
          { correlationId: "transformer" },
          "Value is not a valid UUID",
        );
      }
      return trimmed.toLowerCase();
    },
  };
}

export function createBooleanTransformer(
  name = "boolean",
): ValueTransformer<unknown, boolean | undefined> {
  return {
    kind: "boolean",
    name,
    transform(value) {
      if (value === null || value === undefined) return undefined;
      if (typeof value === "boolean") return value;
      if (typeof value === "number") return value !== 0;
      if (typeof value === "string") {
        const lower = value.trim().toLowerCase();
        if (["true", "1", "yes", "y"].includes(lower)) return true;
        if (["false", "0", "no", "n"].includes(lower)) return false;
      }
      throw mappingValidationError(
        { correlationId: "transformer" },
        "Value could not be coerced to boolean",
      );
    },
  };
}

export function createNumberTransformer(
  name = "number",
): ValueTransformer<unknown, number | undefined> {
  return {
    kind: "number",
    name,
    transform(value) {
      if (value === null || value === undefined || value === "") return undefined;
      if (typeof value === "number") {
        if (Number.isNaN(value)) return undefined;
        return value;
      }
      const parsed = Number(value);
      if (Number.isNaN(parsed)) {
        throw mappingValidationError(
          { correlationId: "transformer" },
          "Value could not be coerced to number",
        );
      }
      return parsed;
    },
  };
}

export function createStringTransformer(
  name = "string",
  options: { readonly trim?: boolean; readonly emptyAsUndefined?: boolean } = {},
): ValueTransformer<unknown, string | undefined> {
  const trim = options.trim ?? true;
  const emptyAsUndefined = options.emptyAsUndefined ?? true;
  return {
    kind: "string",
    name,
    transform(value) {
      if (value === null || value === undefined) return undefined;
      let result = String(value);
      if (trim) result = result.trim();
      if (emptyAsUndefined && result.length === 0) return undefined;
      return result;
    },
  };
}

export function createNullableTransformer<TIn, TOut>(
  inner: ValueTransformer<TIn, TOut>,
  name = `nullable:${inner.name}`,
): ValueTransformer<TIn | null | undefined, TOut | null> {
  return {
    kind: "nullable",
    name,
    transform(value, context) {
      if (value === null || value === undefined) return null;
      return inner.transform(value as TIn, context);
    },
  };
}

export function createArrayTransformer<TIn, TOut>(
  itemTransformer: ValueTransformer<TIn, TOut>,
  name = `array:${itemTransformer.name}`,
): ValueTransformer<readonly TIn[] | null | undefined, TOut[]> {
  return {
    kind: "array",
    name,
    transform(value, context) {
      if (value === null || value === undefined) return [];
      if (!Array.isArray(value)) {
        throw mappingValidationError(
          { correlationId: "transformer" },
          "Value is not an array",
        );
      }
      return value.map((item) => itemTransformer.transform(item, context));
    },
  };
}

export function createCustomTransformer<TIn, TOut>(
  name: string,
  fn: (value: TIn, context?: MappingContext) => TOut,
): ValueTransformer<TIn, TOut> {
  return {
    kind: "custom",
    name,
    transform(value, context) {
      return fn(value, context);
    },
  };
}

export function createEnumValueTransformer<TCanonical extends string>(
  name: string,
  mapFn: (value: unknown, context?: MappingContext) => TCanonical,
): ValueTransformer<unknown, TCanonical> {
  return {
    kind: "enum",
    name,
    transform(value, context) {
      return mapFn(value, context);
    },
  };
}

/** Built-in transformer registry by name. */
export class ValueTransformerRegistry {
  private readonly transformers = new Map<string, ValueTransformer>();

  register(transformer: ValueTransformer): void {
    if (this.transformers.has(transformer.name)) {
      throw mappingValidationError(
        { correlationId: "transformer-registry" },
        `Transformer "${transformer.name}" is already registered`,
      );
    }
    this.transformers.set(transformer.name, transformer);
  }

  get(name: string): ValueTransformer | undefined {
    return this.transformers.get(name);
  }

  require(name: string): ValueTransformer {
    const found = this.transformers.get(name);
    if (!found) {
      throw mappingValidationError(
        { correlationId: "transformer-registry" },
        `Transformer "${name}" was not found`,
      );
    }
    return found;
  }

  list(): readonly ValueTransformer[] {
    return [...this.transformers.values()];
  }

  has(name: string): boolean {
    return this.transformers.has(name);
  }
}

export function createDefaultValueTransformerRegistry(): ValueTransformerRegistry {
  const registry = new ValueTransformerRegistry();
  registry.register(createDateTransformer());
  registry.register(createUuidTransformer());
  registry.register(createBooleanTransformer());
  registry.register(createNumberTransformer());
  registry.register(createStringTransformer());
  return registry;
}
