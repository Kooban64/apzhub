import {
  collectDuplicateSourceIssues,
  collectSourceValidationIssues,
} from "../registry/validate-knowledge-source";
import type { KnowledgeRegistrationIssue } from "../types/knowledge-diagnostics";
import type { KnowledgeSource } from "../types/knowledge-source";
import { KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION } from "./knowledge-source-registry-schema-version";
import {
  createEmptyKnowledgeSourceRegistryDto,
  type KnowledgeSourceRegistryDto,
} from "./map-knowledge-source-registry-dto";

export interface KnowledgeSourceRegistryDtoValidationResult {
  readonly ok: boolean;
  readonly dto: KnowledgeSourceRegistryDto;
  readonly errors: readonly KnowledgeRegistrationIssue[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normaliseFrameworkVersion(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

/**
 * Validate an unknown server payload before client hydration.
 * Returns structured errors instead of throwing for invalid DTO shapes.
 */
export function validateKnowledgeSourceRegistryDto(
  dto: unknown,
): KnowledgeSourceRegistryDtoValidationResult {
  const errors: KnowledgeRegistrationIssue[] = [];

  if (!isRecord(dto)) {
    return {
      ok: false,
      dto: createEmptyKnowledgeSourceRegistryDto(),
      errors: Object.freeze([
        {
          code: "VALIDATION",
          message: "KnowledgeSourceRegistryDto must be an object",
        },
      ]),
    };
  }

  if (dto.schemaVersion !== KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION) {
    errors.push({
      code: "VALIDATION",
      message: `KnowledgeSourceRegistryDto.schemaVersion must be ${KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION}`,
      field: "schemaVersion",
    });
  }

  if (!Array.isArray(dto.sources)) {
    errors.push({
      code: "VALIDATION",
      message: "KnowledgeSourceRegistryDto.sources must be an array",
      field: "sources",
    });
    return {
      ok: false,
      dto: createEmptyKnowledgeSourceRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  if (errors.length > 0) {
    return {
      ok: false,
      dto: createEmptyKnowledgeSourceRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  const sources = dto.sources as KnowledgeSource[];
  const validationIssues = collectSourceValidationIssues(sources);
  if (validationIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyKnowledgeSourceRegistryDto(),
      errors: Object.freeze([...validationIssues]),
    };
  }

  const duplicateIssues = collectDuplicateSourceIssues(sources, new Set());
  if (duplicateIssues.length > 0) {
    return {
      ok: false,
      dto: createEmptyKnowledgeSourceRegistryDto(),
      errors: Object.freeze([...duplicateIssues]),
    };
  }

  const frameworkVersion = normaliseFrameworkVersion(dto.frameworkVersion);
  if (dto.frameworkVersion !== undefined && frameworkVersion === undefined) {
    errors.push({
      code: "VALIDATION",
      message: "KnowledgeSourceRegistryDto.frameworkVersion must be a non-empty string",
      field: "frameworkVersion",
    });
    return {
      ok: false,
      dto: createEmptyKnowledgeSourceRegistryDto(),
      errors: Object.freeze([...errors]),
    };
  }

  return {
    ok: true,
    dto: {
      schemaVersion: KNOWLEDGE_SOURCE_REGISTRY_DTO_SCHEMA_VERSION,
      frameworkVersion,
      sources: Object.freeze([...sources]),
    },
    errors: [],
  };
}
