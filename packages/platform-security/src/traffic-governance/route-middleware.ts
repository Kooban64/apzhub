import {
  getSharedTrafficGovernanceService,
  TRAFFIC_LIMIT_HEADERS,
} from "./traffic-governance-service";
import { resolveServiceFromPath } from "./adapters";
import type { TrafficGovernanceDecision, TrafficRequestContext } from "./types";

const LAW_TENANT_HEADER = "x-tenant-id";

export interface TrafficMiddlewareRequest {
  readonly nextUrl: { readonly pathname: string };
  readonly method: string;
  readonly headers: {
    get(name: string): string | null;
  };
}

export interface TrafficMiddlewareResponse {
  readonly headers: {
    set(name: string, value: string): void;
  };
}

export function buildTrafficRequestContext(
  request: TrafficMiddlewareRequest,
  input?: {
    readonly userId?: string;
    readonly tenantId?: string;
  },
): TrafficRequestContext {
  const { pathname } = request.nextUrl;
  return {
    pathname,
    method: request.method,
    ip:
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown",
    userId: input?.userId,
    tenantId: input?.tenantId ?? request.headers.get(LAW_TENANT_HEADER) ?? undefined,
    service: resolveServiceFromPath(pathname),
  };
}

export { shouldApplyLawTrafficGovernance, shouldApplyTrafficGovernance } from "./paths";

export async function evaluateRequestTraffic(
  request: TrafficMiddlewareRequest,
  input?: {
    readonly userId?: string;
    readonly tenantId?: string;
  },
): Promise<TrafficGovernanceDecision> {
  const service = getSharedTrafficGovernanceService();
  const context = buildTrafficRequestContext(request, input);
  return service.evaluate(context);
}

export function applyTrafficHeaders<T extends TrafficMiddlewareResponse>(
  response: T,
  decision: TrafficGovernanceDecision,
): T {
  for (const [key, value] of Object.entries(decision.headers)) {
    response.headers.set(key, String(value));
  }
  return response;
}

export function createTrafficDeniedBody() {
  return {
    error: {
      code: "RATE_LIMITED",
      message: "Too many requests. Please retry later.",
    },
  };
}

export function buildTrafficDeniedInit(decision: TrafficGovernanceDecision): {
  readonly status: number;
  readonly headers: Record<string, string>;
} {
  return {
    status: 429,
    headers: {
      ...decision.headers,
      "Retry-After": String(
        Math.max(
          1,
          Math.ceil(
            ((decision.blockingResult?.resetAt ?? Date.now()) - Date.now()) / 1000,
          ),
        ),
      ),
    },
  };
}

export async function enforceTrafficGovernanceForHandler(
  request: TrafficMiddlewareRequest,
  input?: {
    readonly userId?: string;
    readonly tenantId?: string;
  },
): Promise<
  | { readonly allowed: true; readonly decision: TrafficGovernanceDecision }
  | {
      readonly allowed: false;
      readonly init: ReturnType<typeof buildTrafficDeniedInit>;
    }
> {
  const decision = await evaluateRequestTraffic(request, input);
  if (!decision.allowed) {
    return { allowed: false, init: buildTrafficDeniedInit(decision) };
  }
  return { allowed: true, decision };
}

export { TRAFFIC_LIMIT_HEADERS };
