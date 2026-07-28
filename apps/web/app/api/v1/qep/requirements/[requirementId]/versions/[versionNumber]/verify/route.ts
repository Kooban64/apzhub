export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleVerifyQepRequirementContentVersionIntegrity } from "@/lib/api/v1/handlers/qep";

export const GET = withPlatformApiAuth(handleVerifyQepRequirementContentVersionIntegrity, {
  operation: "qep.requirements.verifyVersionIntegrity",
});

export const POST = withPlatformApiAuth(handleVerifyQepRequirementContentVersionIntegrity, {
  operation: "qep.requirements.verifyVersionIntegrity",
});
