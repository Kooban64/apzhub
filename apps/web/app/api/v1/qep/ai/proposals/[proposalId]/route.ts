export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiGetProposal } from "@/lib/api/v1/handlers/qep-ai";

export const GET = withPlatformApiAuth(handleAiGetProposal, {
  operation: "qep.ai.proposals.get",
});
