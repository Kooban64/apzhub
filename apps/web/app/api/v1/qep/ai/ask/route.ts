export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiAsk } from "@/lib/api/v1/handlers/qep-ai";

export const POST = withPlatformApiAuth(handleAiAsk, {
  operation: "qep.ai.ask",
});
