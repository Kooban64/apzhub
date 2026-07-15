import { definitionKey } from "./validation";
import type {
  MappingCapabilities,
  MappingDefinition,
  MappingDirection,
  MappingProfile,
  MappingProvider,
} from "./types";

export interface CreateMappingProviderInput {
  readonly id: string;
  readonly integrationSlug: string;
  readonly definitions: readonly MappingDefinition[];
  readonly capabilities?: Partial<MappingCapabilities>;
}

function deriveCapabilities(
  definitions: readonly MappingDefinition[],
  overrides?: Partial<MappingCapabilities>,
): MappingCapabilities {
  const entityTypes = [...new Set(definitions.map((d) => d.entityType))];
  const profiles = [...new Set(definitions.map((d) => d.profile))];
  const directions = [...new Set(definitions.map((d) => d.direction))];

  return {
    entityTypes: overrides?.entityTypes ?? entityTypes,
    profiles: overrides?.profiles ?? profiles,
    directions: overrides?.directions ?? directions,
    supportsRelationships:
      overrides?.supportsRelationships ??
      directions.includes("relationship"),
    supportsCollections:
      overrides?.supportsCollections ?? directions.includes("collection"),
    supportsNested: overrides?.supportsNested ?? directions.includes("nested"),
    supportsPartialUpdate:
      overrides?.supportsPartialUpdate ?? directions.includes("partial_update"),
  };
}

/** Build a MappingProvider from a static list of definitions. */
export function createMappingProvider(
  input: CreateMappingProviderInput,
): MappingProvider {
  const definitions = [...input.definitions];
  const byKey = new Map<string, MappingDefinition>();
  for (const definition of definitions) {
    byKey.set(
      definitionKey(definition.entityType, definition.profile, definition.direction),
      definition,
    );
  }

  const capabilities = deriveCapabilities(definitions, input.capabilities);

  return {
    id: input.id,
    integrationSlug: input.integrationSlug,
    capabilities,
    getDefinition(entityType, profile, direction) {
      return byKey.get(definitionKey(entityType, profile, direction));
    },
    listDefinitions() {
      return definitions;
    },
  };
}

export function createDefinition<TInput = unknown, TOutput = unknown>(input: {
  readonly id: string;
  readonly entityType: string;
  readonly direction: MappingDirection;
  readonly profile?: MappingProfile;
  readonly map: (input: TInput, context: import("./types").MappingContext) => TOutput | Promise<TOutput>;
  readonly description?: string;
}): MappingDefinition<TInput, TOutput> {
  return {
    id: input.id,
    entityType: input.entityType,
    direction: input.direction,
    profile: input.profile ?? "default",
    map: input.map,
    description: input.description,
  };
}
