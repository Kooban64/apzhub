export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  handleAiCreateProposal,
  handleAiListProposals,
} from "@/lib/api/v1/handlers/qep-ai";

export const GET = withPlatformApiAuth(handleAiListProposals, {
  operation: "qep.ai.proposals.list",
});

export const POST = withPlatformApiAuth(handleAiCreateProposal, {
  operation: "qep.ai.proposals.create",
});
