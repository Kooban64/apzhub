import type { IntegrationError, IntegrationErrorCategory } from "../types";

export type IntegrationErrorSeverity = "info" | "warning" | "error" | "critical";

export interface ErrorTranslationContext {
  readonly correlationId: string;
  readonly integrationId: string;
  readonly adapterId?: string;
  readonly operation?: string;
  readonly tenantId?: string;
  readonly requestId?: string;
}

export interface VendorErrorInput {
  readonly statusCode?: number;
  readonly vendorCode?: string;
  readonly vendorMessage?: string;
  readonly body?: unknown;
  readonly context: ErrorTranslationContext;
  readonly timeout?: boolean;
  readonly networkError?: boolean;
}

/** Internal-only vendor error snapshot for operator diagnostics — never user-facing. */
export interface VendorErrorDiagnostics {
  readonly vendorStatusCode?: number;
  readonly vendorCode?: string;
  readonly vendorMessageSummary?: string;
  readonly capturedAt: string;
  readonly correlationId: string;
}

export interface TranslatedIntegrationError {
  readonly error: IntegrationError;
  readonly severity: IntegrationErrorSeverity;
  readonly vendorDiagnostics?: VendorErrorDiagnostics;
}

export interface VendorErrorMapper {
  readonly integrationId: string;
  map(input: VendorErrorInput): TranslatedIntegrationError | null;
}

export interface ErrorTranslator {
  registerMapper(mapper: VendorErrorMapper): void;
  unregisterMapper(integrationId: string): void;
  translate(input: VendorErrorInput): TranslatedIntegrationError;
  translateUnknown(error: unknown, context: ErrorTranslationContext): TranslatedIntegrationError;
}

export type DefaultCategoryMapping = Readonly<
  Partial<Record<number, IntegrationErrorCategory>>
>;
