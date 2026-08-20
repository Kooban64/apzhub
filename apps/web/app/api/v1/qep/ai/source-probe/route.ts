export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { handleAiSourceProbe } from "@/lib/api/v1/handlers/qep-ai";

export const POST = withPlatformApiAuth(handleAiSourceProbe, {
  operation: "qep.ai.source_probe",
});
