/** Law Platform API envelope types (LAW-014-01). */

export interface LawApiMeta {
  readonly requestId: string;
  readonly correlationId: string;
  readonly timestamp: string;
}

export interface LawApiSuccessEnvelope<T> {
  readonly ok: true;
  readonly data: T;
  readonly meta: LawApiMeta;
}

export interface LawApiListSuccessEnvelope<T> {
  readonly ok: true;
  readonly data: readonly T[];
  readonly pagination: {
    readonly limit: number;
    readonly nextCursor: string | null;
    readonly prevCursor: string | null;
    readonly hasMore: boolean;
    readonly totalCount?: number | null;
  };
  readonly meta: LawApiMeta;
}

export interface LawApiErrorBody {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown> | readonly unknown[];
}

export interface LawApiErrorEnvelope {
  readonly ok: false;
  readonly error: LawApiErrorBody;
  readonly meta: LawApiMeta;
}

export type LawApiEnvelope<T> = LawApiSuccessEnvelope<T> | LawApiErrorEnvelope;

export interface LawApiRequestContext {
  readonly requestId: string;
  readonly correlationId: string;
  readonly timestamp: string;
}
