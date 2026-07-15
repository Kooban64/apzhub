import { NextResponse } from "next/server";

import { HttpSecurityHeaderService } from "@apzhub/platform-security/headers";

import {
  PLATFORM_API_CACHE_CONTROL,
  PLATFORM_API_CORRELATION_ID_HEADER,
  PLATFORM_API_REQUEST_ID_HEADER,
} from "../constants";
import {
  getPlatformApiGatewayBootstrap,
  resetPlatformApiGatewayBootstrap,
} from "../gateway/bootstrap";
import { createPlatformApiTracing } from "../request-context";
import { jsonDataResponse, jsonErrorResponse } from "../response";

const securityHeaders = new HttpSecurityHeaderService().getApiResponseHeaders("web");

export interface PlatformApiHealthStatus {
  readonly status: "ok" | "degraded" | "error";
  readonly version: string;
  readonly checks: {
    readonly process: "up";
    readonly gateway: "ready" | "unavailable";
    readonly mappingStore: "ready" | "unavailable" | "unknown";
    readonly providers: "ready" | "unregistered" | "unknown";
    readonly configuration: "valid" | "invalid";
  };
}

export interface PlatformApiReadinessStatus {
  readonly ready: boolean;
  readonly status: "ready" | "not_ready";
  readonly checks: PlatformApiHealthStatus["checks"];
  readonly details?: Readonly<Record<string, string>>;
}

async function evaluateChecks(): Promise<{
  checks: PlatformApiHealthStatus["checks"];
  details: Record<string, string>;
  configurationValid: boolean;
}> {
  const details: Record<string, string> = {};
  let configurationValid = true;

  try {
    const authMode = process.env.AUTHORIZATION_PROVIDER_MODE;
    if (
      process.env.NODE_ENV === "production" &&
      authMode === "allow-all" &&
      process.env.AUTHORIZATION_ALLOW_ALL_IN_PRODUCTION !== "true"
    ) {
      configurationValid = false;
      details.authorization = "allow-all forbidden in production";
    }

    if (
      process.env.NODE_ENV === "production" &&
      (process.env.ENTITY_MAPPING_STORE_MODE === "memory" ||
        !process.env.ENTITY_MAPPING_STORE_MODE) &&
      process.env.ENTITY_MAPPING_ALLOW_MEMORY_IN_PRODUCTION !== "true" &&
      process.env.ENTITY_MAPPING_STORE_MODE === "memory"
    ) {
      configurationValid = false;
      details.mappingStore = "memory forbidden in production without escape hatch";
    }

    const bootstrap = await getPlatformApiGatewayBootstrap();
    return {
      checks: {
        process: "up",
        gateway: "ready",
        mappingStore: "ready",
        providers: bootstrap.providersRegistered ? "ready" : "unregistered",
        configuration: configurationValid ? "valid" : "invalid",
      },
      details: {
        ...details,
        authorizationMode: bootstrap.authorizationMode,
        mappingStoreMode: bootstrap.mappingStoreMode,
        planeEnabled: String(bootstrap.planeEnabled),
        zammadEnabled: String(bootstrap.zammadEnabled),
        testingEnabled: String(bootstrap.testingEnabled),
        ...(bootstrap.testingReadiness
          ? {
              testingPersistence: bootstrap.testingReadiness.persistence,
              testingDomain: bootstrap.testingReadiness.domain,
              testingEventBus: bootstrap.testingReadiness.eventBus,
              testingHttpRoutes: bootstrap.testingReadiness.httpRoutes,
            }
          : {}),
        platformServicesVersion: bootstrap.platformServicesVersion,
      },
      configurationValid,
    };
  } catch (error) {
    details.gateway =
      error instanceof Error ? error.message.slice(0, 200) : "bootstrap failed";
    return {
      checks: {
        process: "up",
        gateway: "unavailable",
        mappingStore: "unknown",
        providers: "unknown",
        configuration: configurationValid ? "valid" : "invalid",
      },
      details,
      configurationValid: false,
    };
  }
}

/** Liveness-oriented health — process is up; may be degraded. */
export async function handlePlatformApiHealth(): Promise<NextResponse> {
  const tracing = createPlatformApiTracing();
  const { checks } = await evaluateChecks();
  const degraded =
    checks.gateway === "unavailable" ||
    checks.configuration === "invalid" ||
    checks.providers === "unregistered";

  const body: PlatformApiHealthStatus = {
    status: checks.gateway === "unavailable" ? "error" : degraded ? "degraded" : "ok",
    version: "v1",
    checks,
  };

  return jsonDataResponse(body, tracing, {
    status: checks.gateway === "unavailable" ? 503 : 200,
    headers: {
      ...securityHeaders,
      "cache-control": PLATFORM_API_CACHE_CONTROL,
      [PLATFORM_API_REQUEST_ID_HEADER]: tracing.requestId,
      [PLATFORM_API_CORRELATION_ID_HEADER]: tracing.correlationId,
    },
  });
}

/** Readiness — gateway + configuration must be valid for traffic. */
export async function handlePlatformApiReadiness(): Promise<NextResponse> {
  const tracing = createPlatformApiTracing();
  const { checks, details, configurationValid } = await evaluateChecks();
  const ready =
    checks.gateway === "ready" &&
    configurationValid &&
    checks.mappingStore !== "unavailable";

  const body: PlatformApiReadinessStatus = {
    ready,
    status: ready ? "ready" : "not_ready",
    checks,
    details,
  };

  if (!ready) {
    return jsonErrorResponse(
      503,
      {
        code: "SERVICE_UNAVAILABLE",
        message: "Platform API is not ready.",
        details,
      },
      tracing,
    );
  }

  return jsonDataResponse(body, tracing);
}

/** Test helper — force re-bootstrap on next request. */
export { resetPlatformApiGatewayBootstrap };
