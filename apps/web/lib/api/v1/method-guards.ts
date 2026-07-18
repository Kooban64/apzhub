import type { NextRequest } from "next/server";

import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";

export function disallowedMethods(
  allowed: readonly string[],
): Record<
  "POST" | "PATCH" | "PUT" | "DELETE" | "GET",
  (request: NextRequest) => Promise<Response>
> {
  const handler = async (request: NextRequest) =>
    methodNotAllowedResponse(allowed, createPlatformApiTracing(), request.method);
  return {
    GET: handler,
    POST: handler,
    PATCH: handler,
    PUT: handler,
    DELETE: handler,
  };
}
