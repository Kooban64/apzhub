export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiModifyProposal } from "@/lib/api/v1/handlers/qep-ai";

export const POST = withPlatformApiAuth(handleAiModifyProposal, {
  operation: "qep.ai.proposals.modify",
});
