import type { TrafficServiceId } from "./types";

export interface FutureTrafficAdapter {
  readonly name: string;
  readonly capabilities: readonly (
    | "gateway-enforcement"
    | "edge-rate-limit"
    | "bot-detection"
    | "waf"
    | "distributed-quota"
  )[];
  evaluate?(input: unknown): Promise<{ allowed: boolean }>;
}

export const DEFERRED_TRAFFIC_ADAPTERS: readonly FutureTrafficAdapter[] = [
  { name: "gateway", capabilities: ["gateway-enforcement"] },
  { name: "cloudflare", capabilities: ["edge-rate-limit", "bot-detection", "waf"] },
  { name: "apisix", capabilities: ["gateway-enforcement", "distributed-quota"] },
  { name: "redis-cluster", capabilities: ["distributed-quota"] },
  { name: "waf", capabilities: ["waf", "bot-detection"] },
];

export function resolveServiceFromPath(pathname: string): TrafficServiceId {
  if (pathname.startsWith("/api/auth")) return "auth";
  if (pathname.startsWith("/api/law/")) return "law";
  if (pathname.startsWith("/api/platform/")) return "platform";
  if (pathname.startsWith("/api/health")) return "public";
  return "platform";
}
