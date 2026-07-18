import type {
  MappingCapabilities,
  MappingDefinition,
  MappingDirection,
  MappingError,
  MappingProfile,
  MappingProvider,
} from "./types";
import { mappingValidationError } from "./errors";

const VALID_DIRECTIONS: ReadonlySet<string> = new Set<MappingDirection>([
  "provider_to_canonical",
  "canonical_to_provider",
  "read_only",
  "write",
  "partial_update",
  "relationship",
  "collection",
  "nested",
]);

export interface MappingDefinitionValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
}

export function validateMappingDefinition(
  definition: MappingDefinition,
): MappingDefinitionValidationResult {
  const errors: string[] = [];

  if (!definition.id || typeof definition.id !== "string") {
    errors.push("Definition id is required");
  }
  if (!definition.entityType || typeof definition.entityType !== "string") {
    errors.push("Definition entityType is required");
  }
  if (!definition.profile || typeof definition.profile !== "string") {
    errors.push("Definition profile is required");
  }
  if (!VALID_DIRECTIONS.has(definition.direction)) {
    errors.push(`Unsupported mapping direction "${String(definition.direction)}"`);
  }
  if (!definition.map && (!definition.fieldMaps || definition.fieldMaps.length === 0)) {
    errors.push("Definition must provide map function or fieldMaps");
  }
  if (definition.fieldMaps) {
    const seen = new Set<string>();
    for (const entry of definition.fieldMaps) {
      if (!entry.source || !entry.target) {
        errors.push("Field map entries require source and target");
      }
      const key = `${entry.source}->${entry.target}`;
      if (seen.has(key)) {
        errors.push(`Duplicate field map "${key}"`);
      }
      seen.add(key);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidMappingDefinition(
  definition: MappingDefinition,
  correlationId = "mapping-validation",
): void {
  const result = validateMappingDefinition(definition);
  if (!result.valid) {
    throw mappingValidationError(
      { correlationId, details: { errors: result.errors.join("; ") } },
      result.errors[0] ?? "Invalid mapping definition",
    );
  }
}

export function validateMappingProvider(
  provider: MappingProvider,
): MappingDefinitionValidationResult {
  const errors: string[] = [];

  if (!provider.id || typeof provider.id !== "string") {
    errors.push("Provider id is required");
  }
  if (!provider.integrationSlug || typeof provider.integrationSlug !== "string") {
    errors.push("Provider integrationSlug is required");
  }
  if (!provider.capabilities) {
    errors.push("Provider capabilities are required");
  } else {
    validateCapabilities(provider.capabilities, errors);
  }

  const definitions = provider.listDefinitions();
  const keys = new Set<string>();
  for (const definition of definitions) {
    const validation = validateMappingDefinition(definition);
    if (!validation.valid) {
      errors.push(...validation.errors.map((e) => `${definition.id}: ${e}`));
    }
    const key = definitionKey(
      definition.entityType,
      definition.profile,
      definition.direction,
    );
    if (keys.has(key)) {
      errors.push(`Duplicate definition "${key}"`);
    }
    keys.add(key);
  }

  return { valid: errors.length === 0, errors };
}

function validateCapabilities(
  capabilities: MappingCapabilities,
  errors: string[],
): void {
  if (
    !Array.isArray(capabilities.entityTypes) ||
    capabilities.entityTypes.length === 0
  ) {
    errors.push("Capabilities must declare at least one entityType");
  }
  if (!Array.isArray(capabilities.profiles) || capabilities.profiles.length === 0) {
    errors.push("Capabilities must declare at least one profile");
  }
  if (!Array.isArray(capabilities.directions) || capabilities.directions.length === 0) {
    errors.push("Capabilities must declare at least one direction");
  }
  for (const direction of capabilities.directions ?? []) {
    if (!VALID_DIRECTIONS.has(direction)) {
      errors.push(`Unsupported capability direction "${direction}"`);
    }
  }
}

export function definitionKey(
  entityType: string,
  profile: MappingProfile,
  direction: MappingDirection,
): string {
  return `${entityType}::${profile}::${direction}`;
}

export function validationResultToError(
  result: MappingDefinitionValidationResult,
  correlationId: string,
): MappingError | undefined {
  if (result.valid) return undefined;
  return mappingValidationError(
    { correlationId, details: { errors: result.errors.join("; ") } },
    result.errors[0] ?? "Validation failed",
  );
}
