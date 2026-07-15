export const runtime = "nodejs";

import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getValidatedSession } from "@apzhub/auth/server";
import { getConfigurationDiagnostics, getEnv } from "@apzhub/config";

export async function GET(): Promise<NextResponse> {
  await getValidatedSession(await headers());
  const env = getEnv();
  const diagnostics = getConfigurationDiagnostics();

  return NextResponse.json({
    data: {
      environment: env.NODE_ENV,
      platformVersion: env.PLATFORM_VERSION,
      buildNumber: env.BUILD_NUMBER,
      repositoryMode: env.LAW_REPOSITORY_MODE,
      lawOutboxEnabled: env.LAW_OUTBOX_ENABLED ?? null,
      configuration: {
        healthy: diagnostics.healthy,
        profile: diagnostics.profile,
        tier: diagnostics.tier,
        missingVariables: diagnostics.missingVariables,
        deprecatedVariables: diagnostics.deprecatedVariables,
        unknownVariables: diagnostics.unknownVariables,
        defaultUsage: diagnostics.defaultUsage,
        secrets: diagnostics.secrets,
        vault: diagnostics.vault,
      },
    },
  });
}
