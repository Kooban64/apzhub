export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiCompanion } from "@/lib/api/v1/handlers/qep-ai";

export const GET = withPlatformApiAuth(handleAiCompanion, {
  operation: "qep.ai.companion",
});
