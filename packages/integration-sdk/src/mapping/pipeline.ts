import {
  mapUnknownToMappingError,
  mappingDefinitionNotFoundError,
  mappingProviderNotFoundError,
  mappingValidationError,
} from "./errors";
import { createFieldMapper } from "./field-mapper";
import type { MappingRegistry } from "./registry";
import type {
  MappingContext,
  MappingDirection,
  MappingPipelineExecuteInput,
  MappingProfile,
  MappingResult,
} from "./types";
import { assertValidMappingDefinition } from "./validation";
import type { ValueTransformerRegistry } from "./value-transformers";

export interface MappingPipelineOptions {
  readonly registry: MappingRegistry;
  readonly transformers?: ValueTransformerRegistry;
  readonly validateBeforeExecute?: boolean;
  readonly now?: () => number;
}

export interface MappingPipeline {
  execute<T = unknown>(input: MappingPipelineExecuteInput): Promise<MappingResult<T>>;
  executeSync<T = unknown>(input: MappingPipelineExecuteInput): MappingResult<T>;
}

function resolveDefinition(
  registry: MappingRegistry,
  providerId: string,
  entityType: string,
  profile: MappingProfile,
  direction: MappingDirection,
  correlationId: string,
) {
  const provider = registry.get(providerId);
  if (!provider) {
    throw mappingProviderNotFoundError({ correlationId }, providerId);
  }
  const definition = provider.getDefinition(entityType, profile, direction);
  if (!definition) {
    throw mappingDefinitionNotFoundError(
      { correlationId },
      entityType,
      profile,
      direction,
    );
  }
  return { provider, definition };
}

async function runMap(
  definition: ReturnType<typeof resolveDefinition>["definition"],
  input: unknown,
  context: MappingContext,
  transformers: ValueTransformerRegistry | undefined,
): Promise<unknown> {
  if (definition.map) {
    return definition.map(input, context);
  }
  if (definition.fieldMaps && definition.fieldMaps.length > 0) {
    const fieldMapper = createFieldMapper({
      fieldMaps: definition.fieldMaps,
      transformers,
    });
    return fieldMapper.map(input, context);
  }
  throw mappingValidationError(
    { correlationId: context.correlationId ?? "mapping-pipeline" },
    "Mapping definition has no executable map",
  );
}

export class DefaultMappingPipeline implements MappingPipeline {
  private readonly registry: MappingRegistry;
  private readonly transformers?: ValueTransformerRegistry;
  private readonly validateBeforeExecute: boolean;
  private readonly now: () => number;

  constructor(options: MappingPipelineOptions) {
    this.registry = options.registry;
    this.transformers = options.transformers;
    this.validateBeforeExecute = options.validateBeforeExecute ?? true;
    this.now = options.now ?? (() => Date.now());
  }

  async execute<T = unknown>(
    input: MappingPipelineExecuteInput,
  ): Promise<MappingResult<T>> {
    const profile = input.profile ?? "default";
    const correlationId = input.context.correlationId ?? "mapping-pipeline";
    const started = this.now();

    try {
      const { provider, definition } = resolveDefinition(
        this.registry,
        input.providerId,
        input.entityType,
        profile,
        input.direction,
        correlationId,
      );

      if (this.validateBeforeExecute) {
        assertValidMappingDefinition(definition, correlationId);
      }

      const value = (await runMap(
        definition,
        input.input,
        input.context,
        this.transformers,
      )) as T;

      const durationMs = this.now() - started;
      this.registry.getMetrics().recordExecution({
        providerId: provider.id,
        entityType: input.entityType,
        profile,
        direction: input.direction,
        success: true,
        durationMs,
      });

      return {
        ok: true,
        value,
        profile,
        direction: input.direction,
        entityType: input.entityType,
        durationMs,
        providerId: provider.id,
      };
    } catch (error) {
      const durationMs = this.now() - started;
      const mappingError = mapUnknownToMappingError(error, correlationId);
      this.registry.getMetrics().recordExecution({
        providerId: input.providerId,
        entityType: input.entityType,
        profile,
        direction: input.direction,
        success: false,
        durationMs,
      });
      return {
        ok: false,
        error: mappingError,
        profile,
        direction: input.direction,
        entityType: input.entityType,
        durationMs,
        providerId: input.providerId,
      };
    }
  }

  executeSync<T = unknown>(input: MappingPipelineExecuteInput): MappingResult<T> {
    const profile = input.profile ?? "default";
    const correlationId = input.context.correlationId ?? "mapping-pipeline";
    const started = this.now();

    try {
      const { provider, definition } = resolveDefinition(
        this.registry,
        input.providerId,
        input.entityType,
        profile,
        input.direction,
        correlationId,
      );

      if (this.validateBeforeExecute) {
        assertValidMappingDefinition(definition, correlationId);
      }

      if (definition.map) {
        const mapped = definition.map(input.input, input.context);
        if (mapped !== null && typeof mapped === "object" && "then" in (mapped as object)) {
          throw mappingValidationError(
            { correlationId },
            "Async mapping definitions must use execute()",
          );
        }
        const durationMs = this.now() - started;
        this.registry.getMetrics().recordExecution({
          providerId: provider.id,
          entityType: input.entityType,
          profile,
          direction: input.direction,
          success: true,
          durationMs,
        });
        return {
          ok: true,
          value: mapped as T,
          profile,
          direction: input.direction,
          entityType: input.entityType,
          durationMs,
          providerId: provider.id,
        };
      }

      if (definition.fieldMaps && definition.fieldMaps.length > 0) {
        const fieldMapper = createFieldMapper({
          fieldMaps: definition.fieldMaps,
          transformers: this.transformers,
        });
        const value = fieldMapper.map(input.input, input.context) as T;
        const durationMs = this.now() - started;
        this.registry.getMetrics().recordExecution({
          providerId: provider.id,
          entityType: input.entityType,
          profile,
          direction: input.direction,
          success: true,
          durationMs,
        });
        return {
          ok: true,
          value,
          profile,
          direction: input.direction,
          entityType: input.entityType,
          durationMs,
          providerId: provider.id,
        };
      }

      throw mappingValidationError(
        { correlationId },
        "Mapping definition has no executable map",
      );
    } catch (error) {
      const durationMs = this.now() - started;
      const mappingError = mapUnknownToMappingError(error, correlationId);
      this.registry.getMetrics().recordExecution({
        providerId: input.providerId,
        entityType: input.entityType,
        profile,
        direction: input.direction,
        success: false,
        durationMs,
      });
      return {
        ok: false,
        error: mappingError,
        profile,
        direction: input.direction,
        entityType: input.entityType,
        durationMs,
        providerId: input.providerId,
      };
    }
  }
}

export function createMappingPipeline(
  options: MappingPipelineOptions,
): DefaultMappingPipeline {
  return new DefaultMappingPipeline(options);
}
