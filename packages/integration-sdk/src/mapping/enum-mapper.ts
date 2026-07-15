import { mappingEnumUnknownError } from "./errors";
import type { EnumMapperOptions, EnumUnknownPolicy } from "./types";

export interface EnumMapper<TCanonical extends string = string> {
  readonly unknownPolicy: EnumUnknownPolicy;
  map(value: string | number | null | undefined): TCanonical;
  mapOrThrow(value: string | number | null | undefined, correlationId?: string): TCanonical;
  reverse(canonical: TCanonical): string | undefined;
  has(value: string | number | null | undefined): boolean;
  keys(): readonly string[];
  values(): readonly TCanonical[];
}

function defaultNormalizeKey(raw: string): string {
  return raw.trim().toLowerCase();
}

/**
 * Explicit enum maps. Unknown values never invent silent canonical values
 * without an explicit policy (`fail` | `fallback` | `passthrough`).
 */
export function createEnumMapper<TCanonical extends string>(
  options: EnumMapperOptions<TCanonical>,
): EnumMapper<TCanonical> {
  const normalize = options.normalizeKey ?? defaultNormalizeKey;
  const forward = new Map<string, TCanonical>();
  for (const [key, value] of Object.entries(options.map)) {
    forward.set(normalize(key), value as TCanonical);
  }

  if (options.unknownPolicy === "fallback" && options.fallback === undefined) {
    throw new Error('EnumMapper "fallback" policy requires a fallback value');
  }

  const reverse = new Map<TCanonical, string>();
  for (const [key, value] of Object.entries(options.map)) {
    const canonical = value as TCanonical;
    if (!reverse.has(canonical)) {
      reverse.set(canonical, key);
    }
  }

  function resolve(value: string | number | null | undefined): TCanonical | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    const key = normalize(String(value));
    return forward.get(key);
  }

  return {
    unknownPolicy: options.unknownPolicy,

    map(value) {
      const mapped = resolve(value);
      if (mapped !== undefined) {
        return mapped;
      }

      switch (options.unknownPolicy) {
        case "fail":
          throw mappingEnumUnknownError(
            { correlationId: "enum-mapper", details: { value: String(value ?? "") } },
            String(value ?? ""),
          );
        case "fallback":
          return options.fallback as TCanonical;
        case "passthrough":
          return String(value ?? "") as TCanonical;
        default: {
          const _exhaustive: never = options.unknownPolicy;
          return _exhaustive;
        }
      }
    },

    mapOrThrow(value, correlationId = "enum-mapper") {
      const mapped = resolve(value);
      if (mapped !== undefined) {
        return mapped;
      }
      throw mappingEnumUnknownError(
        { correlationId, details: { value: String(value ?? "") } },
        String(value ?? ""),
      );
    },

    reverse(canonical) {
      return reverse.get(canonical);
    },

    has(value) {
      return resolve(value) !== undefined;
    },

    keys() {
      return [...forward.keys()];
    },

    values() {
      return [...new Set(forward.values())];
    },
  };
}

/** Bidirectional enum mapper with separate forward and reverse tables. */
export function createBidirectionalEnumMapper<TCanonical extends string>(input: {
  readonly toCanonical: Readonly<Record<string, TCanonical>>;
  readonly toProvider: Readonly<Record<TCanonical, string>>;
  readonly unknownPolicy: EnumUnknownPolicy;
  readonly fallback?: TCanonical;
  readonly normalizeKey?: (raw: string) => string;
}): {
  readonly toCanonical: EnumMapper<TCanonical>;
  toProvider(canonical: TCanonical): string;
} {
  const toCanonical = createEnumMapper({
    map: input.toCanonical,
    unknownPolicy: input.unknownPolicy,
    fallback: input.fallback,
    normalizeKey: input.normalizeKey,
  });

  return {
    toCanonical,
    toProvider(canonical: TCanonical): string {
      const mapped = input.toProvider[canonical];
      if (mapped === undefined) {
        throw mappingEnumUnknownError(
          { correlationId: "enum-mapper", details: { value: canonical } },
          canonical,
        );
      }
      return mapped;
    },
  };
}
