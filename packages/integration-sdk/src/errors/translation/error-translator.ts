import type { Clock } from "../../auth/authentication-provider";
import { systemClock } from "../../auth/authentication-provider";
import {
  buildDefaultTranslatedError,
  normalizeUnknownError,
} from "./default-mapping";
import type {
  ErrorTranslationContext,
  ErrorTranslator,
  TranslatedIntegrationError,
  VendorErrorInput,
  VendorErrorMapper,
} from "./types";

export interface DefaultErrorTranslatorOptions {
  readonly clock?: Clock;
}

export class DefaultErrorTranslator implements ErrorTranslator {
  private readonly mappers = new Map<string, VendorErrorMapper>();
  private readonly clock: Clock;

  constructor(options: DefaultErrorTranslatorOptions = {}) {
    this.clock = options.clock ?? systemClock;
  }

  registerMapper(mapper: VendorErrorMapper): void {
    this.mappers.set(mapper.integrationId, mapper);
  }

  unregisterMapper(integrationId: string): void {
    this.mappers.delete(integrationId);
  }

  translate(input: VendorErrorInput): TranslatedIntegrationError {
    const capturedAt = this.clock.now();
    const mapper = this.mappers.get(input.context.integrationId);
    const mapped = mapper?.map(input);

    if (mapped) {
      return {
        ...mapped,
        error: {
          ...mapped.error,
          correlationId: input.context.correlationId,
        },
        vendorDiagnostics:
          mapped.vendorDiagnostics ??
          buildDefaultTranslatedError(input, capturedAt).vendorDiagnostics,
      };
    }

    return buildDefaultTranslatedError(input, capturedAt);
  }

  translateUnknown(
    error: unknown,
    context: ErrorTranslationContext,
  ): TranslatedIntegrationError {
    return this.translate(normalizeUnknownError(error, context));
  }
}

export function createDefaultErrorTranslator(
  options?: DefaultErrorTranslatorOptions,
): ErrorTranslator {
  return new DefaultErrorTranslator(options);
}
