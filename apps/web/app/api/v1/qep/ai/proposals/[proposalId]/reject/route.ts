export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiRejectProposal } from "@/lib/api/v1/handlers/qep-ai";

export const POST = withPlatformApiAuth(handleAiRejectProposal, {
  operation: "qep.ai.proposals.reject",
});
