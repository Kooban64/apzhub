import { NextResponse } from "next/server";

import { correlationIdFromRequest } from "@/lib/observability/correlation";

export type ApiCorrelationContext = {
  correlationId: string;
  /** Attach `x-correlation-id` to any Response (including NextResponse). */
  attach: <T extends Response>(res: T) => T;
};

/** Read or mint correlation id and helpers for consistent API route responses + logs. */
export function apiCorrelationFromRequest(request: Request): ApiCorrelationContext {
  const correlationId = correlationIdFromRequest(request);
  return {
    correlationId,
    attach<T extends Response>(res: T): T {
      res.headers.set("x-correlation-id", correlationId);
      return res;
    },
  };
}

export function jsonWithCorrelation<T>(
  correlationId: string,
  body: T,
  init?: number | ResponseInit,
): NextResponse {
  const res = NextResponse.json(body, typeof init === "number" ? { status: init } : init);
  res.headers.set("x-correlation-id", correlationId);
  return res;
}
