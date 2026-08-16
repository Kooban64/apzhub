/**
 * ADOPT-003 F2 — Support engine health (BetterAuth + adapter posture).
 * Provider-neutral: never expose engine brand names to clients.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformApiGatewayBootstrap } from "../gateway/bootstrap";
import { jsonDataResponse } from "../response";
import { requireSupportPermission } from "./require-support-permission";

export async function handleGetSupportHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireSupportPermission(
    context,
    "support.requests.list",
    "support.groups.list",
    "support.*",
  );
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const engineEnabled = bootstrap.zammadEnabled === true;
  let liveListOk: boolean | null = null;
  let liveListError: string | undefined;
  if (engineEnabled) {
    try {
      const { getPlatformServiceGateway } = await import("../gateway/bootstrap");
      const gateway = await getPlatformServiceGateway();
      await gateway.support.listSupportRequests(context.serviceContext, {
        page: { page: 1, perPage: 1 },
      });
      liveListOk = true;
    } catch (error) {
      liveListOk = false;
      liveListError = error instanceof Error ? error.message : String(error);
    }
  }

  const tokenPresent = Boolean(
    process.env.ZAMMAD_API_TOKEN?.trim() || process.env.SUPPORT_API_TOKEN?.trim(),
  );
  const baseUrlPresent = Boolean(
    process.env.ZAMMAD_BASE_URL?.trim() || process.env.SUPPORT_ENGINE_BASE_URL?.trim(),
  );

  return jsonDataResponse(
    {
      product: "support" as const,
      authN: "betterauth" as const,
      authZ: "apzhub_permission_service" as const,
      engineAuth: "adapter_api_key" as const,
      authentikUsed: false as const,
      sessionUserId: context.serviceContext.userId,
      engine: {
        integrationEnabled: engineEnabled,
        healthStatus: engineEnabled
          ? tokenPresent && baseUrlPresent
            ? "configured"
            : "misconfigured"
          : "disabled",
        apiTokenPresent: tokenPresent,
        connectionConfigured: baseUrlPresent,
        issues: [
          ...(!engineEnabled ? ["Support engine integration disabled"] : []),
          ...(engineEnabled && !tokenPresent
            ? ["Support engine API token missing"]
            : []),
          ...(engineEnabled && !baseUrlPresent
            ? ["Support engine base URL missing"]
            : []),
        ],
      },
      liveListOk,
      ...(liveListError ? { liveListError } : {}),
    },
    context.tracing,
  );
}
