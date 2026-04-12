const HEADER = "x-correlation-id";

export function correlationIdFromRequest(request: Request): string {
  return request.headers.get(HEADER) ?? globalThis.crypto?.randomUUID?.() ?? `corr-${Date.now()}`;
}

export function withCorrelationHeaders(correlationId: string): HeadersInit {
  return { [HEADER]: correlationId };
}
