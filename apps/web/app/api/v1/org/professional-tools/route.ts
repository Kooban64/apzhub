export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleGrantProfessionalTool,
  handleListProfessionalTools,
  handleRevokeProfessionalTool,
} from "@/lib/api/v1/handlers/professional-tools";

export const GET = withPlatformApiAuth(handleListProfessionalTools, {
  operation: "org.professional_tools.list",
});

export const POST = withPlatformApiAuth(
  async (request: NextRequest, context) => {
    const action = request.nextUrl.searchParams.get("action") ?? "grant";
    if (action === "revoke") {
      return handleRevokeProfessionalTool(request, context);
    }
    return handleGrantProfessionalTool(request, context);
  },
  { operation: "org.professional_tools.mutate" },
);
