import type { AdapterHealthResult } from "@/lib/adapters/adapter-health-types";
import serviceCatalog from "@/lib/adapters/catalog/service-catalog.json";
import { getLaunchJwtSigningSecret, getLaunchOidcUseInternalStart } from "@/lib/adapters/env";
import type { LaunchMethod } from "@/lib/launch/launch-method";
import type { LaunchTarget } from "@/lib/launch/launch-target";
import type { WorkspaceServiceId } from "@/lib/workspace/workspace-config";

type ServiceCatalogFile = {
  externalLaunchTemplates?: Partial<Record<WorkspaceServiceId, string>>;
};

function resolveExternalLaunchHref(serviceId: WorkspaceServiceId, qs: string): string {
  const templates = (serviceCatalog as ServiceCatalogFile).externalLaunchTemplates;
  const specific = templates?.[serviceId]?.trim();
  if (specific) {
    return specific.replaceAll("{service}", serviceId).replaceAll("{query}", qs);
  }
  const ext =
    (typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APZHUB_LAUNCH_EXTERNAL_URL_TEMPLATE
      : process.env.APZHUB_LAUNCH_EXTERNAL_URL_TEMPLATE) ?? `/workspace/launch/mock-external?${qs}`;
  return ext.replace("{service}", serviceId).replace("{query}", qs);
}

/** Browser: `NEXT_PUBLIC_*`; server: `APZHUB_*` via `lib/adapters/env`. */
function launchOidcInternalStartEnabled(): boolean {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_APZHUB_LAUNCH_OIDC_USE_INTERNAL_START ?? "").toLowerCase().trim() === "true";
  }
  return getLaunchOidcUseInternalStart();
}

/** Client transport uses `NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE`; API mint routes use `APZHUB_LAUNCH_SOURCE`. Keep both aligned in deploy. */
function launchStubsUseMocks(): boolean {
  if (typeof window !== "undefined") {
    return (process.env.NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE ?? "mock") !== "real";
  }
  return (process.env.APZHUB_LAUNCH_SOURCE ?? "mock") !== "real";
}

/**
 * Pure transport mapping: **no** session, workspace UI state, or network I/O — only `serviceId`, `method`, and env templates.
 * Callers own interpretation (e.g. `resolveLaunchDecision`).
 */
export function buildLaunchTransportTarget(serviceId: WorkspaceServiceId, method: LaunchMethod): LaunchTarget {
  const q = new URLSearchParams({ service: serviceId });
  const qs = q.toString();

  if (launchStubsUseMocks()) {
    switch (method) {
      case "oidc":
        return { kind: "oidc_redirect", href: `/workspace/launch/mock-oidc?${qs}` };
      case "jwt":
        return { kind: "jwt_internal", appRoute: `/workspace/launch/mock-jwt?${qs}` };
      case "vault":
        return {
          kind: "vault_delegated",
          delegationRequestId: `mock-delegation-${serviceId}`,
        };
      case "external":
        return { kind: "external_redirect", href: `/workspace/launch/mock-external?${qs}` };
    }
  }

  const oidcTpl =
    (typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APZHUB_LAUNCH_OIDC_URL_TEMPLATE
      : process.env.APZHUB_LAUNCH_OIDC_URL_TEMPLATE) ?? "";
  const jwtTpl =
    (typeof window !== "undefined"
      ? process.env.NEXT_PUBLIC_APZHUB_LAUNCH_JWT_ROUTE_TEMPLATE
      : process.env.APZHUB_LAUNCH_JWT_ROUTE_TEMPLATE) ?? "";

  switch (method) {
    case "oidc":
      if (launchOidcInternalStartEnabled()) {
        return { kind: "oidc_redirect", href: `/api/workspace/launch/oidc-start?${qs}` };
      }
      return {
        kind: "oidc_redirect",
        href: (oidcTpl || "/workspace/launch/mock-oidc?{query}")
          .replace("{service}", serviceId)
          .replace("{query}", qs),
      };
    case "jwt": {
      const secret = typeof window === "undefined" ? getLaunchJwtSigningSecret() : undefined;
      const pubJwtReal = typeof window !== "undefined" && (process.env.NEXT_PUBLIC_APZHUB_LAUNCH_SOURCE ?? "mock") === "real";
      if (secret || pubJwtReal) {
        return { kind: "jwt_internal", appRoute: `/api/workspace/launch/jwt?${qs}` };
      }
      return {
        kind: "jwt_internal",
        appRoute: (jwtTpl || "/workspace/launch/mock-jwt?{query}")
          .replace("{service}", serviceId)
          .replace("{query}", qs),
      };
    }
    case "vault":
      return {
        kind: "vault_delegated",
        delegationRequestId: `delegation-${serviceId}-${Date.now()}`,
      };
    case "external": {
      return {
        kind: "external_redirect",
        href: resolveExternalLaunchHref(serviceId, qs),
      };
    }
  }
}

export function getLaunchAdapterHealth(): AdapterHealthResult {
  if (launchStubsUseMocks()) {
    return { domain: "launch", signal: "healthy", detail: "Mock in-app launch stub routes." };
  }
  const oidc = process.env.APZHUB_LAUNCH_OIDC_URL_TEMPLATE?.trim();
  const jwtSecret = getLaunchJwtSigningSecret();
  if (!jwtSecret) {
    return {
      domain: "launch",
      signal: "degraded",
      detail: "APZHUB_LAUNCH_SOURCE=real but APZHUB_LAUNCH_JWT_SIGNING_SECRET is not set (internal JWT mint disabled).",
    };
  }
  if (!oidc) {
    return {
      domain: "launch",
      signal: "degraded",
      detail: "APZHUB_LAUNCH_SOURCE=real but APZHUB_LAUNCH_OIDC_URL_TEMPLATE is not set (OIDC start cannot build IdP URL).",
    };
  }
  return {
    domain: "launch",
    signal: "healthy",
    detail:
      "Real launch: internal JWT via /api/workspace/launch/jwt (HttpOnly cookie); OIDC via template or /api/workspace/launch/oidc-start when enabled.",
  };
}

