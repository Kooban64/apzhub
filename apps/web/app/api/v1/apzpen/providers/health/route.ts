export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { ensureLocalSecretsLoaded } from "@apzhub/config";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess } from "@/lib/apzpen/access";
import { getGithubAuthStatus } from "@/lib/apzpen/github-app-auth";
import { probeApzpenProviderHealth } from "@/lib/apzpen/provider-health";

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  try {
    ensureLocalSecretsLoaded();
  } catch {
    // optional secrets
  }
  const health = await probeApzpenProviderHealth();
  const github = getGithubAuthStatus();
  const merged = health.map((row) => {
    if (row.id !== "github") return row;
    return {
      ...row,
      status: github.mode === "none" ? ("unknown" as const) : ("ok" as const),
      detail: `mode=${github.mode} · app=${String(github.appConfigured)} · pat=${String(github.patConfigured)}`,
    };
  });
  return jsonDataResponse({ health: merged, github }, context.tracing);
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.providers.read",
});
