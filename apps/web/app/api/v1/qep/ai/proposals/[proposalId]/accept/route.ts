export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiAcceptProposal } from "@/lib/api/v1/handlers/qep-ai";

export const POST = withPlatformApiAuth(handleAiAcceptProposal, {
  operation: "qep.ai.proposals.accept",
});
