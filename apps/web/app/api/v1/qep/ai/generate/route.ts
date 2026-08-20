export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiGenerate } from "@/lib/api/v1/handlers/qep-ai";

export const POST = withPlatformApiAuth(handleAiGenerate, {
  operation: "qep.ai.generate",
});
