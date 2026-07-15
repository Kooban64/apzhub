/** Platform HTTP API v1 envelope types (OSS-110-07). */

export interface PlatformApiMeta {
  readonly requestId: string;
  readonly correlationId: string;
}

export interface PlatformApiPage {
  readonly cursor: string | null;
  readonly nextCursor: string | null;
  readonly limit: number;
  readonly hasMore: boolean;
}

export interface PlatformApiSuccessEnvelope<T> {
  readonly data: T;
  readonly meta: PlatformApiMeta;
}

export interface PlatformApiCollectionEnvelope<T> {
  readonly data: readonly T[];
  readonly page: PlatformApiPage;
  readonly meta: PlatformApiMeta;
}

export interface PlatformApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface PlatformApiErrorEnvelope {
  readonly error: PlatformApiErrorBody;
  readonly meta: PlatformApiMeta;
}

/** Tracing identifiers resolved from the HTTP request. */
export interface PlatformApiTracingContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly timestamp: string;
  readonly idempotencyKey?: string;
}
